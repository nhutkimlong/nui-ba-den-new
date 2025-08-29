#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Testing Setup Script
 * Sets up comprehensive testing infrastructure including unit tests, integration tests, and visual regression testing
 */

function createTestingConfig() {
  console.log('🧪 Setting up testing configuration...');

  // Vitest configuration
  const vitestConfig = `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
`;

  fs.writeFileSync('vitest.config.ts', vitestConfig);
  console.log('✅ Created vitest.config.ts');

  // Test setup file
  const testSetup = `import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  });
});
`;

  const testDir = path.join(process.cwd(), 'src', 'test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  fs.writeFileSync(path.join(testDir, 'setup.ts'), testSetup);
  console.log('✅ Created test setup file');

  // Test utilities
  const testUtils = `import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Custom matchers
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

// Mock data generators
export const mockPOI = (overrides = {}) => ({
  id: '1',
  name: 'Test POI',
  description: 'Test description',
  latitude: 11.3333,
  longitude: 106.6667,
  category: 'attraction',
  images: [],
  ...overrides
});

export const mockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  preferences: {
    language: 'vi',
    theme: 'light'
  },
  ...overrides
});

// Test helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockGeolocation = (coords = { latitude: 11.3333, longitude: 106.6667 }) => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementationOnce((success) =>
      Promise.resolve(success({
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: 1
        }
      }))
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  };

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation
  });

  return mockGeolocation;
};
`;

  fs.writeFileSync(path.join(testDir, 'utils.tsx'), testUtils);
  console.log('✅ Created test utilities');
}

function createVisualRegressionSetup() {
  console.log('📸 Setting up visual regression testing...');

  // Playwright configuration for visual testing
  const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`;

  fs.writeFileSync('playwright.config.ts', playwrightConfig);
  console.log('✅ Created Playwright configuration');

  // Create visual test directory and sample test
  const visualTestDir = path.join(process.cwd(), 'tests', 'visual');
  if (!fs.existsSync(visualTestDir)) {
    fs.mkdirSync(visualTestDir, { recursive: true });
  }

  const sampleVisualTest = `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('mobile navigation renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of mobile view
    await expect(page).toHaveScreenshot('mobile-homepage.png');
  });

  test('component library renders correctly', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Test individual components
    const components = [
      'modern-button',
      'glass-card',
      'smart-input',
      'responsive-grid'
    ];

    for (const component of components) {
      const element = page.locator(\`[data-testid="\${component}"]\`);
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(\`\${component}.png\`);
      }
    }
  });

  test('dark mode renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Enable dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-dark.png');
  });

  test('responsive breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'large', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(\`homepage-\${breakpoint.name}.png\`);
    }
  });
});
`;

  fs.writeFileSync(path.join(visualTestDir, 'components.spec.ts'), sampleVisualTest);
  console.log('✅ Created sample visual regression tests');
}

function createCIConfiguration() {
  console.log('🔄 Setting up CI/CD configuration...');

  // GitHub Actions workflow
  const githubWorkflow = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npx tsc --noEmit
    
    - name: Run component validation
      run: npm run validate:components
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Run visual regression tests
      run: npm run test:visual
    
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30

  build:
    runs-on: ubuntu-latest
    needs: [test, visual-tests]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Optimize images
      run: npm run optimize:images
    
    - name: Build application
      run: npm run build:optimize
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v3.0
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: \${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}
`;

  const githubDir = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(githubDir)) {
    fs.mkdirSync(githubDir, { recursive: true });
  }

  fs.writeFileSync(path.join(githubDir, 'ci.yml'), githubWorkflow);
  console.log('✅ Created GitHub Actions workflow');
}

function updatePackageJsonScripts() {
  console.log('📦 Updating package.json scripts...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add testing scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'test': 'vitest',
    'test:ui': 'vitest --ui',
    'test:run': 'vitest run',
    'test:coverage': 'vitest run --coverage',
    'test:visual': 'playwright test',
    'test:visual:ui': 'playwright test --ui',
    'prepare': 'husky install'
  };

  // Add testing dependencies
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    '@commitlint/cli': '^18.4.3',
    '@commitlint/config-conventional': '^18.4.3',
    '@playwright/test': '^1.40.1',
    '@testing-library/jest-dom': '^6.1.5',
    '@testing-library/react': '^14.1.2',
    '@testing-library/user-event': '^14.5.1',
    '@vitest/ui': '^1.0.4',
    'husky': '^8.0.3',
    'jsdom': '^23.0.1',
    'vitest': '^1.0.4',
    '@vitest/coverage-v8': '^1.0.4'
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with testing dependencies and scripts');
}

function setupQualityTools() {
  console.log('🛠️  Setting up development quality tools...');

  createTestingConfig();
  createVisualRegressionSetup();
  createCIConfiguration();
  updatePackageJsonScripts();

  // Create quality assurance documentation
  const qaDoc = `# Quality Assurance Guide

## Overview

This project includes comprehensive quality assurance tools to ensure code quality, performance, and reliability.

## Tools Included

### 1. Pre-commit Hooks
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript compiler
- **Component Validation**: Custom component standards validation
- **Commit Message**: Conventional commit format validation

### 2. Testing Framework
- **Unit Tests**: Vitest with React Testing Library
- **Coverage**: V8 coverage with thresholds
- **Visual Regression**: Playwright for cross-browser testing
- **Component Testing**: Isolated component testing

### 3. Build Optimization
- **Bundle Analysis**: Rollup visualizer
- **Image Optimization**: Automated image processing
- **Compression**: Gzip and Brotli compression
- **Performance Monitoring**: Build size tracking

### 4. CI/CD Pipeline
- **Automated Testing**: Run on every PR
- **Cross-browser Testing**: Multiple browser support
- **Deployment**: Automated deployment to Netlify
- **Quality Gates**: Prevent deployment of failing builds

## Usage

### Running Tests
\`\`\`bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run visual regression tests
npm run test:visual
\`\`\`

### Quality Checks
\`\`\`bash
# Validate components
npm run validate:components

# Generate documentation
npm run generate:docs

# Lint code
npm run lint

# Type check
npx tsc --noEmit
\`\`\`

### Build Optimization
\`\`\`bash
# Optimize images
npm run optimize:images

# Build with optimization
npm run build:optimize

# Analyze bundle
npm run build:analyze
\`\`\`

## Quality Standards

### Component Standards
- TypeScript interfaces for all props
- JSDoc documentation
- Unit tests with >80% coverage
- Storybook stories
- Accessibility compliance
- Performance optimization

### Code Standards
- ESLint configuration
- Prettier formatting
- Conventional commit messages
- Type safety
- Error handling

### Performance Standards
- Bundle size < 1MB
- First Contentful Paint < 1.5s
- Lighthouse score > 90
- Core Web Vitals compliance

## Continuous Integration

The CI pipeline runs:
1. Code quality checks
2. Unit tests
3. Visual regression tests
4. Build optimization
5. Deployment (on main branch)

## Monitoring

- **Build Reports**: Generated in \`docs/build-report.md\`
- **Component Documentation**: Generated in \`docs/components.md\`
- **Validation Reports**: Generated in \`docs/validation-report.md\`
- **Coverage Reports**: Available in \`coverage/\` directory

## Best Practices

1. **Write Tests First**: Follow TDD approach
2. **Component Isolation**: Test components in isolation
3. **Accessibility**: Include accessibility tests
4. **Performance**: Monitor bundle size and performance
5. **Documentation**: Keep documentation up to date
6. **Code Review**: Use PR reviews for quality assurance
`;

  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(docsDir, 'quality-assurance.md'), qaDoc);
  console.log('✅ Created quality assurance documentation');

  console.log(`
✅ Development quality tools setup complete!

🛠️  Tools configured:
- Pre-commit hooks with Husky
- Vitest for unit testing
- Playwright for visual regression testing
- GitHub Actions CI/CD pipeline
- Component validation
- Build optimization

📚 Documentation created:
- docs/quality-assurance.md
- .github/workflows/ci.yml
- vitest.config.ts
- playwright.config.ts

🚀 Next steps:
1. Install dependencies: npm install
2. Setup Husky: npm run prepare
3. Run tests: npm test
4. Commit with conventional format: feat: add new feature

💡 All quality checks will run automatically on commit and in CI/CD pipeline.
  `);
}

// Run setup
setupQualityTools();