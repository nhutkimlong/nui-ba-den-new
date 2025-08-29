#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Component Documentation Generator
 * Scans components and generates comprehensive documentation
 */

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
        // Check if this is a component directory (contains .tsx file with same name)
        const componentFile = path.join(itemPath, `${item}.tsx`);
        if (fs.existsSync(componentFile)) {
          components.push({
            name: item,
            category: category || path.basename(dir),
            path: itemPath,
            componentFile,
            hasTests: fs.existsSync(path.join(itemPath, `${item}.test.tsx`)),
            hasStories: fs.existsSync(path.join(itemPath, `${item}.stories.tsx`)),
            hasReadme: fs.existsSync(path.join(itemPath, 'README.md')),
            hasStyles: fs.existsSync(path.join(itemPath, `${item}.module.css`))
          });
        } else {
          // Scan subdirectory
          scanDirectory(itemPath, item);
        }
      }
    }
  }

  scanDirectory(componentsDir);
  return components;
}

function extractComponentInfo(componentFile) {
  const content = fs.readFileSync(componentFile, 'utf8');
  
  // Extract interface/props
  const interfaceMatch = content.match(/export interface (\w+Props)\s*{([^}]*)}/s);
  const props = [];
  
  if (interfaceMatch) {
    const propsContent = interfaceMatch[2];
    const propMatches = propsContent.matchAll(/(\w+)\??\s*:\s*([^;]+);/g);
    
    for (const match of propMatches) {
      props.push({
        name: match[1],
        type: match[2].trim(),
        optional: match[0].includes('?')
      });
    }
  }

  // Extract JSDoc description
  const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
  const description = descriptionMatch ? descriptionMatch[1] : '';

  // Extract examples
  const exampleMatches = content.matchAll(/\* @example\s*\n\s*\* ```tsx\s*\n([\s\S]*?)\* ```/g);
  const examples = Array.from(exampleMatches).map(match => 
    match[1].replace(/\s*\* /g, '').trim()
  );

  return {
    description,
    props,
    examples
  };
}

function generateComponentDocs() {
  console.log('📚 Generating component documentation...');
  
  const components = scanComponents();
  
  if (components.length === 0) {
    console.log('❌ No components found');
    return;
  }

  // Group components by category
  const componentsByCategory = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {});

  // Generate main documentation
  let docsContent = `# Component Library Documentation

Generated on: ${new Date().toISOString()}

## Overview

This documentation provides a comprehensive overview of all components in our design system.

## Categories

`;

  // Add category links
  Object.keys(componentsByCategory).forEach(category => {
    docsContent += `- [${category}](#${category.toLowerCase()})\n`;
  });

  docsContent += '\n---\n\n';

  // Generate documentation for each category
  Object.entries(componentsByCategory).forEach(([category, categoryComponents]) => {
    docsContent += `## ${category}\n\n`;
    
    categoryComponents.forEach(component => {
      const info = extractComponentInfo(component.componentFile);
      
      docsContent += `### ${component.name}\n\n`;
      
      if (info.description) {
        docsContent += `${info.description}\n\n`;
      }

      // Component status
      docsContent += '**Status:**\n';
      docsContent += `- Tests: ${component.hasTests ? '✅' : '❌'}\n`;
      docsContent += `- Stories: ${component.hasStories ? '✅' : '❌'}\n`;
      docsContent += `- Documentation: ${component.hasReadme ? '✅' : '❌'}\n`;
      docsContent += `- Styles: ${component.hasStyles ? '✅' : '❌'}\n\n`;

      // Props table
      if (info.props.length > 0) {
        docsContent += '**Props:**\n\n';
        docsContent += '| Prop | Type | Required | Description |\n';
        docsContent += '|------|------|----------|-------------|\n';
        
        info.props.forEach(prop => {
          docsContent += `| ${prop.name} | \`${prop.type}\` | ${prop.optional ? 'No' : 'Yes'} | - |\n`;
        });
        docsContent += '\n';
      }

      // Examples
      if (info.examples.length > 0) {
        docsContent += '**Examples:**\n\n';
        info.examples.forEach((example, index) => {
          docsContent += `\`\`\`tsx\n${example}\n\`\`\`\n\n`;
        });
      }

      // File location
      docsContent += `**Location:** \`${component.path.replace(process.cwd(), '.')}\`\n\n`;
      docsContent += '---\n\n';
    });
  });

  // Generate summary statistics
  const totalComponents = components.length;
  const withTests = components.filter(c => c.hasTests).length;
  const withStories = components.filter(c => c.hasStories).length;
  const withReadme = components.filter(c => c.hasReadme).length;
  const withStyles = components.filter(c => c.hasStyles).length;

  docsContent += `## Summary

- **Total Components:** ${totalComponents}
- **With Tests:** ${withTests}/${totalComponents} (${Math.round(withTests/totalComponents*100)}%)
- **With Stories:** ${withStories}/${totalComponents} (${Math.round(withStories/totalComponents*100)}%)
- **With Documentation:** ${withReadme}/${totalComponents} (${Math.round(withReadme/totalComponents*100)}%)
- **With Styles:** ${withStyles}/${totalComponents} (${Math.round(withStyles/totalComponents*100)}%)

## Component Coverage by Category

`;

  Object.entries(componentsByCategory).forEach(([category, categoryComponents]) => {
    docsContent += `### ${category}
- Components: ${categoryComponents.length}
- Test Coverage: ${categoryComponents.filter(c => c.hasTests).length}/${categoryComponents.length}
- Story Coverage: ${categoryComponents.filter(c => c.hasStories).length}/${categoryComponents.length}

`;
  });

  // Write documentation file
  const docsPath = path.join(process.cwd(), 'docs', 'components.md');
  const docsDir = path.dirname(docsPath);
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(docsPath, docsContent);
  
  console.log(`✅ Documentation generated: ${docsPath}`);
  console.log(`📊 Found ${totalComponents} components across ${Object.keys(componentsByCategory).length} categories`);
  
  // Generate component index for easy importing
  generateComponentIndex(componentsByCategory);
}

function generateComponentIndex(componentsByCategory) {
  let indexContent = `// Auto-generated component index
// Generated on: ${new Date().toISOString()}

`;

  Object.entries(componentsByCategory).forEach(([category, components]) => {
    indexContent += `// ${category} components\n`;
    components.forEach(component => {
      indexContent += `export { ${component.name} } from './${category}/${component.name}';\n`;
      indexContent += `export type { ${component.name}Props } from './${category}/${component.name}';\n`;
    });
    indexContent += '\n';
  });

  const indexPath = path.join(process.cwd(), 'src', 'components', 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  
  console.log(`✅ Component index generated: ${indexPath}`);
}

// Run the documentation generator
generateComponentDocs();