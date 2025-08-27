import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="climb" element={<ClimbPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="admin-login" element={<AdminLoginPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/climb" element={<ClimbAdminPage />} />
          <Route path="admin/guide" element={<GuideAdminPage />} />
          <Route path="admin/poi" element={<PoiAdminPage />} />
          <Route path="data-editor" element={<DataEditorPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;