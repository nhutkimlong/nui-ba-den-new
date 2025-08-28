import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, GridLayout, useDevice } from '../layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMountain, faBook, faMapMarkerAlt, faChartLine, faUsers, faCog, faSpinner, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyWYJtTjYvSFT--TPpV6bk4-o6jKtqXBhe5di-h6ozC2sKscM_i8_PCJxzPpL_bEDNT/exec',
    COMBINED_API_URL: '/.netlify/functions/combined-data',
    POI_API_URL: '/.netlify/functions/data-blobs?file=POI.json',
    TOURS_API_URL: '/.netlify/functions/data-blobs?file=Tours.json',
    ACCOMMODATIONS_API_URL: '/.netlify/functions/data-blobs?file=Accommodations.json',
    RESTAURANTS_API_URL: '/.netlify/functions/data-blobs?file=Restaurants.json',
    SPECIALTIES_API_URL: '/.netlify/functions/data-blobs?file=Specialties.json'
};

const AdminPage: React.FC = () => {
  const { isMobile } = useDevice();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalPOIs: 0,
    totalTours: 0,
    totalAccommodations: 0,
    totalRestaurants: 0,
    totalSpecialties: 0,
    activeNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const adminModules = [
    {
      title: 'Quản lý Leo núi',
      description: 'Quản lý đăng ký, chứng nhận và thống kê leo núi',
      icon: faMountain,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/admin/climb',
      count: stats.totalRegistrations
    },
    {
      title: 'Quản lý Cẩm nang',
      description: 'Quản lý tours, nhà hàng, khách sạn và đặc sản',
      icon: faBook,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      link: '/admin/guide',
      count: stats.totalTours + stats.totalAccommodations + stats.totalRestaurants + stats.totalSpecialties
    },
    {
      title: 'Quản lý POI',
      description: 'Quản lý điểm quan tâm và giờ hoạt động',
      icon: faMapMarkerAlt,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      link: '/admin/poi',
      count: stats.totalPOIs
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load climb registration stats
      const climbStatsResponse = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getInitialStats`);
      const climbStats = climbStatsResponse.ok ? await climbStatsResponse.json() : { success: false };
      
      // Load POI data
      const poiResponse = await fetch(CONFIG.POI_API_URL);
      const poiData = poiResponse.ok ? await poiResponse.json() : [];
      
      // Load guide data
      const [toursResponse, accommodationsResponse, restaurantsResponse, specialtiesResponse] = await Promise.all([
        fetch(CONFIG.TOURS_API_URL),
        fetch(CONFIG.ACCOMMODATIONS_API_URL),
        fetch(CONFIG.RESTAURANTS_API_URL),
        fetch(CONFIG.SPECIALTIES_API_URL)
      ]);
      
      const toursData = toursResponse.ok ? await toursResponse.json() : [];
      const accommodationsData = accommodationsResponse.ok ? await accommodationsResponse.json() : [];
      const restaurantsData = restaurantsResponse.ok ? await restaurantsResponse.json() : [];
      const specialtiesData = specialtiesResponse.ok ? await specialtiesResponse.json() : [];
      
      // Load notifications
      const notificationsResponse = await fetch(CONFIG.COMBINED_API_URL);
      const notificationsData = notificationsResponse.ok ? await notificationsResponse.json() : { notifications: { data: [] } };
      
      setStats({
        totalRegistrations: climbStats.success ? (climbStats.data?.yearlyCount || 0) : 0,
        totalPOIs: Array.isArray(poiData) ? poiData.length : 0,
        totalTours: Array.isArray(toursData) ? toursData.length : 0,
        totalAccommodations: Array.isArray(accommodationsData) ? accommodationsData.length : 0,
        totalRestaurants: Array.isArray(restaurantsData) ? restaurantsData.length : 0,
        totalSpecialties: Array.isArray(specialtiesData) ? specialtiesData.length : 0,
        activeNotifications: Array.isArray(notificationsData.notifications?.data) ? 
          notificationsData.notifications.data.filter((n: any) => n.active).length : 0
      });
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };
  
  return (
    <ResponsiveContainer maxWidth="7xl" padding="lg">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FontAwesomeIcon icon={faCog} className="text-2xl text-slate-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Bảng điều khiển Admin</h1>
                <p className="text-slate-600 mt-1">Quản lý toàn bộ hệ thống Baden App</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/admin-login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tổng đăng ký</p>
                {isLoading ? (
                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 mr-2" />
                    <span className="text-slate-400">Đang tải...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{formatNumber(stats.totalRegistrations)}</p>
                )}
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FontAwesomeIcon icon={faUsers} className="text-xl text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Điểm quan tâm</p>
                {isLoading ? (
                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-emerald-600 mr-2" />
                    <span className="text-slate-400">Đang tải...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{formatNumber(stats.totalPOIs)}</p>
                )}
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tổng cẩm nang</p>
                {isLoading ? (
                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-amber-600 mr-2" />
                    <span className="text-slate-400">Đang tải...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{formatNumber(stats.totalTours + stats.totalAccommodations + stats.totalRestaurants + stats.totalSpecialties)}</p>
                )}
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <FontAwesomeIcon icon={faChartLine} className="text-xl text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-600 mb-1">Tours</p>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-sm" />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-800">{formatNumber(stats.totalTours)}</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-600 mb-1">Khách sạn</p>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-emerald-600 text-sm" />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-800">{formatNumber(stats.totalAccommodations)}</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-600 mb-1">Nhà hàng</p>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-amber-600 text-sm" />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-800">{formatNumber(stats.totalRestaurants)}</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-600 mb-1">Đặc sản</p>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-purple-600 text-sm" />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-800">{formatNumber(stats.totalSpecialties)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Link 
              key={index}
              to={module.link} 
              className="group block"
            >
              <div className={`${module.bgColor} rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-slate-200`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                    <FontAwesomeIcon icon={module.icon} className={`text-2xl ${module.iconColor}`} />
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                  {module.title}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {module.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center text-sm font-medium bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                    Truy cập ngay
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Tổng số</p>
                    {isLoading ? (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-slate-400 text-xs" />
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-slate-800">{formatNumber(module.count)}</p>
                    )}
                  </div>
                </div>
              </div>
        </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Thao tác nhanh</h3>
            <button 
              onClick={loadDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSpinner} className={`${isLoading ? 'animate-spin' : 'hidden'}`} />
              Làm mới dữ liệu
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/admin/climb" 
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              Xem đăng ký leo núi
        </Link>
            <Link 
              to="/admin/poi" 
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
          Quản lý POI
        </Link>
            <Link 
              to="/admin/guide" 
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
            >
              Quản lý cẩm nang
            </Link>
            <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
              Thông báo đang hoạt động: {isLoading ? '...' : stats.activeNotifications}
            </div>
          </div>
      </div>
      </div>
    </ResponsiveContainer>
  );
};

export default AdminPage;