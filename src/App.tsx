import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { usePerformance } from './hooks/usePerformance';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useAppVoiceCommands } from './hooks/useVoiceNavigation';

// Lazy loaded routes for better performance
import {
  HomePage,
  MapPage,
  GuidePage,
  ClimbPage,
  AdminLoginPage,
  AdminPage,
  DataEditorPage,
  ClimbAdminPage,
  GuideAdminPage,
  PoiAdminPage,
  preloadRoute
} from './routes/LazyRoutes';

// Performance monitoring
import { logBundleAnalysis, performanceMonitor } from './utils/bundleAnalyzer';

function App() {
  // Setup voice commands
  const { setupAppCommands } = useAppVoiceCommands();
  
  useEffect(() => {
    const cleanup = setupAppCommands();
    return cleanup;
  }, [setupAppCommands]);

  // Initialize performance monitoring
  useEffect(() => {
    // Log bundle analysis in development
    if (process.env.NODE_ENV === 'development') {
      logBundleAnalysis();
    }

    // Preload critical routes on idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        preloadRoute('map');
        preloadRoute('guide');
      });
    }

    // Cleanup performance monitor on unmount
    return () => {
      performanceMonitor.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <OfflineIndicator />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="climb" element={<ClimbPage />} />
              <Route path="guide" element={<GuidePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="admin-login" element={<AdminLoginPage />} />
              <Route path="admin" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/climb" element={
                <ProtectedRoute>
                  <ClimbAdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/guide" element={
                <ProtectedRoute>
                  <GuideAdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/poi" element={
                <ProtectedRoute>
                  <PoiAdminPage />
                </ProtectedRoute>
              } />
              <Route path="data-editor" element={<DataEditorPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;