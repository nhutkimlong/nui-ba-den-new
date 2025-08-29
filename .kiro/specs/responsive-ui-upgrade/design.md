# Design Document - Responsive UI Upgrade

## Overview

Thiết kế hệ thống giao diện hiện đại cho ứng dụng du lịch Núi Bà Đen, áp dụng các xu hướng design 2025 với focus vào responsive design, performance và user experience. Hệ thống sẽ sử dụng design system nhất quán, component-based architecture và progressive enhancement.

## Architecture

### Design System Foundation

**Color Palette 2025:**
```css
/* Primary Colors - Nature-inspired */
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-500: #10b981; /* Main brand color */
--primary-600: #047857;
--primary-900: #064e3b;

/* Neutral Colors - Sophisticated grays */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-500: #737373;
--neutral-900: #171717;

/* Accent Colors - Modern gradients */
--accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--glass-gradient: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
```

**Typography System:**
```css
/* Variable Font - Inter */
--font-family: 'Inter Variable', system-ui, sans-serif;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

**Spacing System (8px Grid):**
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

## Components and Interfaces

### 1. Layout Components

#### AdaptiveLayout Component
```typescript
interface AdaptiveLayoutProps {
  children: ReactNode;
  variant: 'mobile' | 'tablet' | 'desktop';
  sidebar?: ReactNode;
  bottomNav?: ReactNode;
  className?: string;
}
```

**Features:**
- Automatic device detection
- Smooth transitions between layouts
- Safe area handling for mobile devices
- Gesture-based navigation

#### ResponsiveGrid Component
```typescript
interface ResponsiveGridProps {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap: number;
  children: ReactNode;
  variant: 'masonry' | 'bento' | 'standard';
}
```

### 2. Modern UI Components

#### GlassCard Component
```typescript
interface GlassCardProps {
  children: ReactNode;
  blur?: 'sm' | 'md' | 'lg';
  opacity?: number;
  hover?: boolean;
  className?: string;
}
```

**Styling:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### ModernButton Component
```typescript
interface ModernButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'glass';
  size: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}
```

**Variants:**
- Primary: Gradient background với subtle shadow
- Secondary: Outline với hover fill
- Ghost: Transparent với hover background
- Glass: Glassmorphism effect

#### SmartInput Component
```typescript
interface SmartInputProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'search';
  validation?: ValidationRule[];
  suggestions?: string[];
  icon?: ReactNode;
  floating?: boolean;
}
```

### 3. Navigation Components

#### BottomNavigation Component
```typescript
interface BottomNavigationProps {
  items: NavItem[];
  activeIndex: number;
  onItemClick: (index: number) => void;
  variant: 'pills' | 'floating' | 'standard';
}
```

**Features:**
- Haptic feedback on tap
- Smooth indicator animation
- Safe area padding
- Gesture recognition

#### TabletSidebar Component
```typescript
interface TabletSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  collapsible?: boolean;
}
```

### 4. Content Components

#### HeroSection Component
```typescript
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  actions: ActionButton[];
  parallax?: boolean;
}
```

#### BentoGrid Component
```typescript
interface BentoGridProps {
  items: BentoItem[];
  columns: number;
  gap: number;
  autoResize?: boolean;
}

interface BentoItem {
  id: string;
  size: 'small' | 'medium' | 'large';
  content: ReactNode;
  priority: number;
}
```

## Data Models

### Theme Configuration
```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animations: boolean;
  reducedMotion: boolean;
}
```

### Device Context
```typescript
interface DeviceContext {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchCapable: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
```

### User Preferences
```typescript
interface UserPreferences {
  theme: ThemeConfig;
  language: string;
  location?: {
    lat: number;
    lng: number;
  };
  interests: string[];
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
  };
}
```

## Error Handling

### Error Boundary Strategy
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}
```

**Error Types:**
1. **Component Errors:** Graceful fallback UI
2. **Network Errors:** Retry mechanism với exponential backoff
3. **Validation Errors:** Inline feedback với suggestions
4. **Performance Errors:** Automatic optimization adjustments

### Offline Handling
```typescript
interface OfflineStrategy {
  cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  fallbackContent: ReactNode;
  syncStrategy: 'immediate' | 'background' | 'manual';
}
```

## Testing Strategy

### Component Testing
```typescript
// Example test structure
describe('ModernButton', () => {
  it('should render with correct variant styles', () => {});
  it('should handle loading state', () => {});
  it('should support keyboard navigation', () => {});
  it('should have proper ARIA attributes', () => {});
});
```

### Visual Regression Testing
- Chromatic integration cho component library
- Cross-browser testing trên major browsers
- Device-specific testing cho responsive layouts

### Performance Testing
```typescript
interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}
```

### Accessibility Testing
- Automated testing với axe-core
- Manual testing với screen readers
- Keyboard navigation testing
- Color contrast validation

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Setup design system với CSS custom properties
- Implement base components (Button, Card, Input)
- Create responsive grid system
- Setup testing infrastructure

### Phase 2: Layout System (Week 3-4)
- Implement AdaptiveLayout component
- Create navigation components
- Setup device detection
- Implement safe area handling

### Phase 3: Content Components (Week 5-6)
- Build HeroSection và BentoGrid
- Implement image optimization
- Create content layout templates
- Add animation system

### Phase 4: Advanced Features (Week 7-8)
- Implement gesture recognition
- Add personalization features
- Setup offline capabilities
- Performance optimization

### Phase 5: Polish & Testing (Week 9-10)
- Comprehensive testing
- Accessibility improvements
- Performance tuning
- Documentation completion

## Technical Considerations

### Bundle Optimization
```typescript
// Code splitting strategy
const LazyComponent = lazy(() => import('./Component'));

// Tree shaking optimization
export { Button, Card, Input } from './components';
```

### CSS-in-JS vs CSS Modules
- Sử dụng CSS custom properties cho theming
- CSS Modules cho component-specific styles
- Tailwind CSS cho utility classes
- CSS-in-JS cho dynamic styling

### Animation Performance
```css
/* Use transform and opacity for smooth animations */
.smooth-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}
```

### Memory Management
- Lazy loading cho images và components
- Virtual scrolling cho long lists
- Proper cleanup trong useEffect hooks
- Memoization cho expensive calculations