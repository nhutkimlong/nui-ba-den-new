#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Component templates
const templates = {
  component: (name, category) => `import React from 'react';
import { cn } from '../../utils/cn';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * ${name} Component
 * 
 * @description A modern ${category} component following 2025 design trends
 * @example
 * \`\`\`tsx
 * <${name}>
 *   Content here
 * </${name}>
 * \`\`\`
 */
export const ${name}: React.FC<${name}Props> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'relative',
        // Add your component styles here
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

${name}.displayName = '${name}';
`,

  styles: (name) => `/* ${name} Component Styles */
.${name.toLowerCase()} {
  /* Component-specific styles */
}

.${name.toLowerCase()}--variant {
  /* Variant styles */
}

.${name.toLowerCase()}__element {
  /* Element styles */
}

/* Responsive styles */
@media (min-width: 768px) {
  .${name.toLowerCase()} {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .${name.toLowerCase()} {
    /* Desktop styles */
  }
}
`,

  test: (name, category) => `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name}>Test content</${name}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <${name} className="custom-class">Test</${name}>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('forwards props correctly', () => {
    render(<${name} data-testid="test-component">Test</${name}>);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  // Add more specific tests based on component functionality
});
`,

  story: (name, category) => `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: '${category}/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern ${category.toLowerCase()} component following 2025 design trends.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default ${name}',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom styled ${name}',
    className: 'bg-primary-100 p-4 rounded-lg',
  },
};
`,

  index: (name) => `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`,

  readme: (name, category) => `# ${name}

A modern ${category.toLowerCase()} component following 2025 design trends.

## Usage

\`\`\`tsx
import { ${name} } from '@/components/${category.toLowerCase()}/${name}';

function MyComponent() {
  return (
    <${name}>
      Your content here
    </${name}>
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | - | Additional CSS classes |
| children | ReactNode | - | Component content |

## Examples

### Basic Usage
\`\`\`tsx
<${name}>
  Basic content
</${name}>
\`\`\`

### With Custom Styling
\`\`\`tsx
<${name} className="custom-styles">
  Styled content
</${name}>
\`\`\`

## Accessibility

- Follows WCAG 2.1 guidelines
- Supports keyboard navigation
- Includes proper ARIA attributes
- Compatible with screen readers

## Design System

This component follows our design system principles:
- Uses design tokens for consistent spacing and colors
- Implements responsive design patterns
- Supports dark/light theme modes
- Includes hover and focus states
`
};

// Utility functions
function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created file: ${filePath}`);
}

// Main CLI function
function generateComponent() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`
❌ Usage: npm run generate:component <category> <name>

Categories:
  - modern     (Modern UI components with glassmorphism)
  - layout     (Layout and structure components)
  - content    (Content display components)
  - gestures   (Gesture and interaction components)
  - smart      (Smart content and personalization)
  - accessibility (Accessibility-focused components)
  - performance   (Performance-optimized components)

Example:
  npm run generate:component modern GlassModal
  npm run generate:component layout FlexGrid
    `);
    process.exit(1);
  }

  const [category, rawName] = args;
  const name = toPascalCase(rawName);
  const kebabName = toKebabCase(name);

  // Validate category
  const validCategories = ['modern', 'layout', 'content', 'gestures', 'smart', 'accessibility', 'performance'];
  if (!validCategories.includes(category)) {
    console.error(`❌ Invalid category: ${category}`);
    console.error(`Valid categories: ${validCategories.join(', ')}`);
    process.exit(1);
  }

  console.log(`🚀 Generating ${name} component in ${category} category...`);

  // Create component directory structure
  const componentDir = path.join(process.cwd(), 'src', 'components', category, name);
  createDirectory(componentDir);

  // Generate files
  const files = [
    { name: `${name}.tsx`, content: templates.component(name, category) },
    { name: `${name}.module.css`, content: templates.styles(name) },
    { name: `${name}.test.tsx`, content: templates.test(name, category) },
    { name: `${name}.stories.tsx`, content: templates.story(name, category) },
    { name: 'index.ts', content: templates.index(name) },
    { name: 'README.md', content: templates.readme(name, category) }
  ];

  files.forEach(file => {
    const filePath = path.join(componentDir, file.name);
    writeFile(filePath, file.content);
  });

  // Update category index file
  const categoryIndexPath = path.join(process.cwd(), 'src', 'components', category, 'index.ts');
  let categoryIndexContent = '';
  
  if (fs.existsSync(categoryIndexPath)) {
    categoryIndexContent = fs.readFileSync(categoryIndexPath, 'utf8');
  }

  const exportLine = `export * from './${name}';`;
  if (!categoryIndexContent.includes(exportLine)) {
    categoryIndexContent += `${exportLine}\n`;
    writeFile(categoryIndexPath, categoryIndexContent);
  }

  // Update main components index
  const mainIndexPath = path.join(process.cwd(), 'src', 'components', 'index.ts');
  let mainIndexContent = '';
  
  if (fs.existsSync(mainIndexPath)) {
    mainIndexContent = fs.readFileSync(mainIndexPath, 'utf8');
  }

  const categoryExportLine = `export * from './${category}';`;
  if (!mainIndexContent.includes(categoryExportLine)) {
    mainIndexContent += `${categoryExportLine}\n`;
    writeFile(mainIndexPath, mainIndexContent);
  }

  console.log(`
✅ Component ${name} generated successfully!

Files created:
  📁 src/components/${category}/${name}/
  ├── 📄 ${name}.tsx (Component)
  ├── 🎨 ${name}.module.css (Styles)
  ├── 🧪 ${name}.test.tsx (Tests)
  ├── 📚 ${name}.stories.tsx (Storybook)
  ├── 📦 index.ts (Exports)
  └── 📖 README.md (Documentation)

Next steps:
  1. Implement your component logic in ${name}.tsx
  2. Add styles in ${name}.module.css
  3. Write tests in ${name}.test.tsx
  4. Update Storybook stories
  5. Import and use: import { ${name} } from '@/components/${category}/${name}';
  `);
}

// Run the CLI
generateComponent();