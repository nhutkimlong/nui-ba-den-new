import { lazy } from 'react';
import { createLazyComponent } from '../components/performance/LazyRoute';

// Lazy load page components with enhanced error handling
export const HomePage = createLazyComponent(
  () => import('../components/pages/HomePage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading home page...</p>
        </div>
      </div>
    )
  }
);

export const MapPage = createLazyComponent(
  () => import('../components/pages/MapPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    ),
    maxRetries: 5,
    retryDelay: 2000
  }
);

export const GuidePage = createLazyComponent(
  () => import('../components/pages/GuidePage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading travel guide...</p>
        </div>
      </div>
    )
  }
);

export const ClimbPage = createLazyComponent(
  () => import('../components/pages/ClimbPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading climbing registration...</p>
        </div>
      </div>
    )
  }
);

// Admin pages with higher retry counts due to potential network issues
export const AdminLoginPage = createLazyComponent(
  () => import('../components/pages/AdminLoginPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading admin login...</p>
        </div>
      </div>
    )
  }
);

export const AdminPage = createLazyComponent(
  () => import('../components/pages/AdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    ),
    maxRetries: 3
  }
);

export const DataEditorPage = createLazyComponent(
  () => import('../components/pages/DataEditorPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading data editor...</p>
        </div>
      </div>
    )
  }
);

// Admin sub-pages
export const ClimbAdminPage = createLazyComponent(
  () => import('../components/pages/admin/ClimbAdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading climb admin...</p>
        </div>
      </div>
    )
  }
);

export const GuideAdminPage = createLazyComponent(
  () => import('../components/pages/admin/GuideAdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading guide admin...</p>
        </div>
      </div>
    )
  }
);

export const PoiAdminPage = createLazyComponent(
  () => import('../components/pages/admin/PoiAdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading POI admin...</p>
        </div>
      </div>
    )
  }
);


// Preload functions for better UX
export const preloadRoutes = {
  home: () => import('../components/pages/HomePage'),
  map: () => import('../components/pages/MapPage'),
  guide: () => import('../components/pages/GuidePage'),
  climb: () => import('../components/pages/ClimbPage'),
  admin: () => import('../components/pages/AdminPage'),
  adminLogin: () => import('../components/pages/AdminLoginPage'),
  dataEditor: () => import('../components/pages/DataEditorPage'),
  climbAdmin: () => import('../components/pages/admin/ClimbAdminPage'),
  guideAdmin: () => import('../components/pages/admin/GuideAdminPage'),
  poiAdmin: () => import('../components/pages/admin/PoiAdminPage'),
  // demo routes removed from production build
};

// Route preloading utility
export function preloadRoute(routeName: keyof typeof preloadRoutes) {
  return preloadRoutes[routeName]();
}