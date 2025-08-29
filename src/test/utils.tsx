import { vi, expect } from 'vitest';
import { render, RenderOptions } from '@testing-library/react';
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
