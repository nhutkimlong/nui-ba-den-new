#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Component Validator
 * Validates that components follow our standards and conventions
 */

const validationRules = {
  // Component file must exist
  hasComponentFile: (component) => {
    return fs.existsSync(component.componentFile);
  },

  // Component must have proper TypeScript interface
  hasPropsInterface: (component) => {
    const content = fs.readFileSync(component.componentFile, 'utf8');
    return content.includes(`export interface ${component.name}Props`);
  },

  // Component must have JSDoc documentation
  hasJSDocComment: (component) => {
    const content = fs.readFileSync(component.componentFile, 'utf8');
    return content.includes('/**') && content.includes('* @description');
  },

  // Component must use forwardRef for DOM components
  usesForwardRef: (component) => {
    const content = fs.readFileSync(component.componentFile, 'utf8');
    // Check if component renders DOM elements and uses forwardRef
    const hasDOMElements = /return\s*\(\s*<(div|span|button|input|form|section|article|header|footer|nav|main|aside)/.test(content);
    if (hasDOMElements) {
      return content.includes('forwardRef') || content.includes('React.forwardRef');
    }
    return true; // Not required for non-DOM components
  },

  // Component must have displayName
  hasDisplayName: (component) => {
    const content = fs.readFileSync(component.componentFile, 'utf8');
    return content.includes(`${component.name}.displayName`);
  },

  // Component must use cn utility for className merging
  usesClassNameUtility: (component) => {
    const content = fs.readFileSync(component.componentFile, 'utf8');
    if (content.includes('className')) {
      return content.includes('cn(') || content.includes('clsx(') || content.includes('twMerge(');
    }
    return true; // Not required if no className prop
  },

  // Component must have test file
  hasTestFile: (component) => {
    return fs.existsSync(path.join(component.path, `${component.name}.test.tsx`));
  },

  // Component must have Storybook stories
  hasStoriesFile: (component) => {
    return fs.existsSync(path.join(component.path, `${component.name}.stories.tsx`));
  },

  // Component must have README documentation
  hasReadmeFile: (component) => {
    return fs.existsSync(path.join(component.path, 'README.md'));
  },

  // Component must have proper exports in index.ts
  hasProperExports: (component) => {
    const indexPath = path.join(component.path, 'index.ts');
    if (!fs.existsSync(indexPath)) return false;
    
    const content = fs.readFileSync(indexPath, 'utf8');
    return content.includes(`export { ${component.name} }`) && 
           content.includes(`export type { ${component.name}Props }`);
  },

  // Component must follow naming conventions
  followsNamingConvention: (component) => {
    // PascalCase for component name
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(component.name);
    // File name matches component name
    const fileNameMatches = path.basename(component.componentFile, '.tsx') === component.name;
    return isPascalCase && fileNameMatches;
  },

  // Component must have proper accessibility attributes
  hasAccessibilitySupport: (component) => {
    const content = fs.readFileSync(component.componentFile, 'utf8');
    // Check for common accessibility patterns
    const hasAriaAttributes = /aria-\w+/.test(content);
    const hasRoleAttribute = /role=/.test(content);
    const hasKeyboardSupport = /onKeyDown|onKeyUp|onKeyPress/.test(content);
    
    // Interactive components should have accessibility support
    const isInteractive = /onClick|onFocus|onBlur|button|input|select|textarea/.test(content);
    if (isInteractive) {
      return hasAriaAttributes || hasRoleAttribute || hasKeyboardSupport;
    }
    return true; // Not required for non-interactive components
  }
};

function scanComponents() {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const components = [];

  function scanDirectory(dir, category = '') {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const componentFile = path.join(itemPath, `${item}.tsx`);
        if (fs.existsSync(componentFile)) {
          components.push({
            name: item,
            category: category || path.basename(dir),
            path: itemPath,
            componentFile
          });
        } else {
          scanDirectory(itemPath, item);
        }
      }
    }
  }

  scanDirectory(componentsDir);
  return components;
}

function validateComponent(component) {
  const results = {};
  let passed = 0;
  let total = 0;

  for (const [ruleName, ruleFunction] of Object.entries(validationRules)) {
    total++;
    try {
      const result = ruleFunction(component);
      results[ruleName] = result;
      if (result) passed++;
    } catch (error) {
      results[ruleName] = false;
      console.warn(`⚠️  Error validating ${ruleName} for ${component.name}: ${error.message}`);
    }
  }

  return {
    component: component.name,
    category: component.category,
    passed,
    total,
    score: Math.round((passed / total) * 100),
    results
  };
}

function generateValidationReport(validationResults) {
  const totalComponents = validationResults.length;
  const averageScore = Math.round(
    validationResults.reduce((sum, result) => sum + result.score, 0) / totalComponents
  );

  let report = `# Component Validation Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Components:** ${totalComponents}
- **Average Score:** ${averageScore}%
- **Components with 100% Score:** ${validationResults.filter(r => r.score === 100).length}
- **Components with < 80% Score:** ${validationResults.filter(r => r.score < 80).length}

## Validation Rules

`;

  // List all validation rules
  Object.keys(validationRules).forEach(rule => {
    const ruleDescription = rule.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    report += `- **${rule}:** ${ruleDescription}\n`;
  });

  report += '\n## Component Results\n\n';

  // Sort by score (lowest first to highlight issues)
  validationResults.sort((a, b) => a.score - b.score);

  validationResults.forEach(result => {
    const statusEmoji = result.score === 100 ? '✅' : result.score >= 80 ? '⚠️' : '❌';
    
    report += `### ${statusEmoji} ${result.component} (${result.category})\n\n`;
    report += `**Score:** ${result.score}% (${result.passed}/${result.total})\n\n`;

    // Show failed rules
    const failedRules = Object.entries(result.results)
      .filter(([_, passed]) => !passed)
      .map(([rule, _]) => rule);

    if (failedRules.length > 0) {
      report += '**Failed Rules:**\n';
      failedRules.forEach(rule => {
        report += `- ${rule}\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  // Category breakdown
  const categoryStats = validationResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = { components: 0, totalScore: 0 };
    }
    acc[result.category].components++;
    acc[result.category].totalScore += result.score;
    return acc;
  }, {});

  report += '## Category Breakdown\n\n';
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const avgScore = Math.round(stats.totalScore / stats.components);
    report += `- **${category}:** ${stats.components} components, ${avgScore}% average score\n`;
  });

  return report;
}

function validateComponents() {
  console.log('🔍 Validating components...');
  
  const components = scanComponents();
  
  if (components.length === 0) {
    console.log('❌ No components found');
    return;
  }

  console.log(`📊 Found ${components.length} components to validate`);

  const validationResults = components.map(validateComponent);
  
  // Generate report
  const report = generateValidationReport(validationResults);
  
  // Write report file
  const reportPath = path.join(process.cwd(), 'docs', 'validation-report.md');
  const docsDir = path.dirname(reportPath);
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ Validation report generated: ${reportPath}`);
  
  // Console summary
  const averageScore = Math.round(
    validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length
  );
  
  console.log(`📈 Average component score: ${averageScore}%`);
  console.log(`✅ Components with 100% score: ${validationResults.filter(r => r.score === 100).length}`);
  console.log(`⚠️  Components needing attention: ${validationResults.filter(r => r.score < 80).length}`);

  // Exit with error code if average score is too low
  if (averageScore < 80) {
    console.log('❌ Component quality below threshold (80%)');
    process.exit(1);
  }
}

// Run validation
validateComponents();