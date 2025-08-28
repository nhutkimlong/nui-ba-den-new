import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import ClimbPage from './components/pages/ClimbPage';
import GuidePage from './components/pages/GuidePage';
import MapPage from './components/pages/MapPage';
import AdminLoginPage from './components/pages/AdminLoginPage';
import AdminPage from './components/pages/AdminPage';
import DataEditorPage from './components/pages/DataEditorPage';
import ScrollToTop from './components/common/ScrollToTop';
import ClimbAdminPage from './components/pages/admin/ClimbAdminPage';
import GuideAdminPage from './components/pages/admin/GuideAdminPage';
import PoiAdminPage from './components/pages/admin/PoiAdminPage';
import LayoutDemo from './components/layout/LayoutDemo';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { usePerformance } from './hooks/usePerformance';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useAppVoiceCommands } from './hooks/useVoiceNavigation';

function App() {
  // Setup voice commands
  const { setupAppCommands } = useAppVoiceCommands();
  useEffect(() => {
    const cleanup = setupAppCommands();
    return cleanup;
  }, [setupAppCommands]);

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
              <Route path="layout-demo" element={<LayoutDemo />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;