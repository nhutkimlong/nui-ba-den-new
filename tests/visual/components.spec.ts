import { test, expect } from '@playwright/test';

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
      const element = page.locator(`[data-testid="${component}"]`);
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`${component}.png`);
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
      
      await expect(page).toHaveScreenshot(`homepage-${breakpoint.name}.png`);
    }
  });
});
