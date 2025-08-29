#!/usr/bin/env node

/**
 * CLI Help System
 * Provides comprehensive help and usage information for all development tools
 */

const commands = {
  'generate:component': {
    description: 'Generate a new component with boilerplate code',
    usage: 'npm run generate:component <category> <name>',
    examples: [
      'npm run generate:component modern GlassModal',
      'npm run generate:component layout FlexGrid',
      'npm run generate:component content ImageCarousel'
    ],
    categories: [
      'modern - Modern UI components with glassmorphism',
      'layout - Layout and structure components',
      'content - Content display components',
      'gestures - Gesture and interaction components',
      'smart - Smart content and personalization',
      'accessibility - Accessibility-focused components',
      'performance - Performance-optimized components'
    ],
    files: [
      'ComponentName.tsx - Main component file',
      'ComponentName.module.css - Component styles',
      'ComponentName.test.tsx - Unit tests',
      'ComponentName.stories.tsx - Storybook stories',
      'index.ts - Export declarations',
      'README.md - Component documentation'
    ]
  },

  'generate:docs': {
    description: 'Generate comprehensive component documentation',
    usage: 'npm run generate:docs',
    examples: [
      'npm run generate:docs'
    ],
    output: [
      'docs/components.md - Complete component documentation',
      'src/components/index.ts - Auto-generated component index'
    ]
  },

  'validate:components': {
    description: 'Validate components against coding standards',
    usage: 'npm run validate:components',
    examples: [
      'npm run validate:components'
    ],
    checks: [
      'TypeScript interface definitions',
      'JSDoc documentation',
      'Test file presence',
      'Storybook stories',
      'Accessibility support',
      'Naming conventions',
      'Proper exports'
    ],
    output: [
      'docs/validation-report.md - Detailed validation report'
    ]
  }
};

function showHelp(commandName = null) {
  if (commandName && commands[commandName]) {
    const cmd = commands[commandName];
    
    console.log(`
🚀 ${commandName}

${cmd.description}

📋 Usage:
  ${cmd.usage}

💡 Examples:
${cmd.examples.map(ex => `  ${ex}`).join('\n')}
`);

    if (cmd.categories) {
      console.log(`📂 Categories:
${cmd.categories.map(cat => `  ${cat}`).join('\n')}
`);
    }

    if (cmd.files) {
      console.log(`📄 Generated Files:
${cmd.files.map(file => `  ${file}`).join('\n')}
`);
    }

    if (cmd.checks) {
      console.log(`✅ Validation Checks:
${cmd.checks.map(check => `  • ${check}`).join('\n')}
`);
    }

    if (cmd.output) {
      console.log(`📤 Output:
${cmd.output.map(out => `  ${out}`).join('\n')}
`);
    }

    return;
  }

  // Show general help
  console.log(`
🛠️  Development CLI Tools

Available commands:

${Object.entries(commands).map(([name, cmd]) => 
  `  📦 ${name}\n     ${cmd.description}\n     Usage: ${cmd.usage}\n`
).join('\n')}

💡 For detailed help on a specific command:
  node scripts/cli-help.js <command-name>

📚 Quick Start:
  1. Generate a component: npm run generate:component modern MyComponent
  2. Generate documentation: npm run generate:docs
  3. Validate components: npm run validate:components

🔗 Related Scripts:
  • npm run dev - Start development server
  • npm run build - Build for production
  • npm run lint - Run ESLint
  • npm run test:functions - Test Netlify functions

📖 Documentation:
  • Component docs: docs/components.md
  • Validation report: docs/validation-report.md
  • Project README: README.md
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const commandName = args[0];

showHelp(commandName);