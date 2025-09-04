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
  LoginPage,
  RegisterPage,
  ProfilePage,
  PersonalPage,
  AdminPage,
  ClimbAdminPage,
  GuideAdminPage,
  PoiAdminPage,
  UserAdminPage,
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
              <Route path="personal" element={<PersonalPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="profile" element={
                <ProtectedRoute redirectTo="/login">
                  <ProfilePage />
                </ProtectedRoute>
              } />
              {/* AdminLoginPage removed; using /login */}
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/climb" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <ClimbAdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/guide" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <GuideAdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/poi" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <PoiAdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <UserAdminPage />
                </ProtectedRoute>
              } />
              {/* DataEditorPage removed */}
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;