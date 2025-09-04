import { lazy } from 'react';
import { createLazyComponent } from '../components/performance/LazyRoute';

// Tải lười các component trang với xử lý lỗi nâng cao
export const HomePage = createLazyComponent(
  () => import('../components/pages/HomePage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải trang chủ...</p>
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
          <p className="text-gray-600">Đang tải bản đồ tương tác...</p>
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
          <p className="text-gray-600">Đang tải cẩm nang du lịch...</p>
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
          <p className="text-gray-600">Đang tải đăng ký leo núi...</p>
        </div>
      </div>
    )
  }
);

export const LoginPage = createLazyComponent(
  () => import('../components/pages/LoginPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải đăng nhập...</p>
        </div>
      </div>
    )
  }
);

export const RegisterPage = createLazyComponent(
  () => import('../components/pages/RegisterPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải đăng ký...</p>
        </div>
      </div>
    )
  }
);

export const ProfilePage = createLazyComponent(
  () => import('../components/pages/ProfilePage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }
);

export const PersonalPage = createLazyComponent(
  () => import('../components/pages/PersonalPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải trang cá nhân...</p>
        </div>
      </div>
    )
  }
);

// Trang quản trị với số lần thử lại cao hơn do sự cố mạng tiềm ẩn
// Đã bỏ AdminLoginPage; dùng trang đăng nhập hợp nhất

export const AdminPage = createLazyComponent(
  () => import('../components/pages/AdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải bảng điều khiển quản trị...</p>
        </div>
      </div>
    ),
    maxRetries: 3
  }
);

// Đã bỏ DataEditorPage trong bản build này

// Admin sub-pages
export const ClimbAdminPage = createLazyComponent(
  () => import('../components/pages/admin/ClimbAdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải quản trị leo núi...</p>
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
          <p className="text-gray-600">Đang tải quản trị hướng dẫn...</p>
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
          <p className="text-gray-600">Đang tải quản trị POI...</p>
        </div>
      </div>
    )
  }
);

export const UserAdminPage = createLazyComponent(
  () => import('../components/pages/admin/UserAdminPage'),
  {
    fallback: (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải quản trị người dùng...</p>
        </div>
      </div>
    )
  }
);


// Hàm preload để cải thiện trải nghiệm người dùng
export const preloadRoutes = {
  home: () => import('../components/pages/HomePage'),
  map: () => import('../components/pages/MapPage'),
  guide: () => import('../components/pages/GuidePage'),
  climb: () => import('../components/pages/ClimbPage'),
  login: () => import('../components/pages/LoginPage'),
  register: () => import('../components/pages/RegisterPage'),
  profile: () => import('../components/pages/ProfilePage'),
  personal: () => import('../components/pages/PersonalPage'),
  admin: () => import('../components/pages/AdminPage'),
  // Đã bỏ adminLogin
  // Đã bỏ dataEditor
  climbAdmin: () => import('../components/pages/admin/ClimbAdminPage'),
  guideAdmin: () => import('../components/pages/admin/GuideAdminPage'),
  poiAdmin: () => import('../components/pages/admin/PoiAdminPage'),
  userAdmin: () => import('../components/pages/admin/UserAdminPage'),
  // Đã bỏ các route demo khỏi bản build production
};

// Tiện ích preload route
export function preloadRoute(routeName: keyof typeof preloadRoutes) {
  return preloadRoutes[routeName]();
}