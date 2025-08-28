
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMountain, faCalendarAlt, faSyncAlt, faHome, faUsers, faBell, faCertificate, faMapMarkerAlt, faSearch, faPlus, faTimes, faSave, faUndo, faInfoCircle, faList, faCheckCircle, faExclamationTriangle, faHistory, faChartLine, faSpinner, faEyeSlash, faTrash, faTools, faBullhorn, faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveContainer, useDevice } from '../../layout';
import { useAuth } from '../../../contexts/AuthContext';
import './AdminStyles.css';

Chart.register(...registerables);

// Default chart options
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
        },
        x: {
            ticks: {
                maxTicksLimit: 10, // Giới hạn số lượng nhãn hiển thị
                maxRotation: 45, // Xoay nhãn để dễ đọc
                minRotation: 0,
            },
        },
    },
};

// Chart options cho biểu đồ đường (Line charts)
const lineChartOptions = {
    ...defaultChartOptions,
    scales: {
        ...defaultChartOptions.scales,
        x: {
            ...defaultChartOptions.scales.x,
            maxTicksLimit: 8, // Ít nhãn hơn cho biểu đồ đường
        },
    },
};

// Chart options cho biểu đồ cột (Bar charts)
const barChartOptions = {
    ...defaultChartOptions,
    scales: {
        ...defaultChartOptions.scales,
        x: {
            ...defaultChartOptions.scales.x,
            maxTicksLimit: 6, // Ít nhãn hơn cho biểu đồ cột
        },
    },
};

// Chart options cho biểu đồ tròn (Doughnut charts)
const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'right' as const, // Đặt legend bên phải cho biểu đồ tròn
        },
    },
};

const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyWYJtTjYvSFT--TPpV6bk4-o6jKtqXBhe5di-h6ozC2sKscM_i8_PCJxzPpL_bEDNT/exec',
    COMBINED_API_URL: '/.netlify/functions/combined-data',
};

const NOTIFICATION_TYPES: any = {
    weather: { name: 'Cảnh báo thời tiết', icon: faCloudRain, color: 'blue' },
    maintenance: { name: 'Bảo trì', icon: faTools, color: 'yellow' },
    announcement: { name: 'Thông báo chung', icon: faBullhorn, color: 'green' },
    emergency: { name: 'Khẩn cấp', icon: faExclamationTriangle, color: 'red' }
};

const ClimbAdminPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [gpsSettings, setGpsSettings] = useState<any>({});
    const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
    const [detailedStats, setDetailedStats] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const notificationFormRef = useRef<HTMLFormElement>(null);
    const gpsSettingsFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        loadInitialData();
        const dateInterval = setInterval(() => {
            const now = new Date();
            setCurrentDate(now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
        }, 60000);
        return () => clearInterval(dateInterval);
    }, []);

    const loadInitialData = async () => {
        setIsLoading(true);
        await Promise.all([
            loadAllDataFromAPI(),
            loadStats(),
            loadRecentRegistrations(),
            loadDetailedStats()
        ]);
        setIsLoading(false);
    };

    const loadAllDataFromAPI = async () => {
        try {
            const response = await fetch(CONFIG.COMBINED_API_URL);
            if (response.ok) {
                const result = await response.json();
                setNotifications(result.notifications.data || []);
                setGpsSettings(result.gpsSettings.data || {});
            }
        } catch (error) {
            console.error('Error loading combined data:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getInitialStats`);
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadRecentRegistrations = async () => {
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getRecentRegistrations&limit=5`);
            const result = await response.json();
            if (result.success) {
                setRecentRegistrations(result.data);
            }
        } catch (error) {
            console.error('Error loading recent registrations:', error);
        }
    };

    const loadDetailedStats = async () => {
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getAllDashboardData`);
            const result = await response.json();
            if (result.success) {
                // Transform the data to Chart.js format
                const transformedData = {
                    dailyChart: result.data.dailyChart && result.data.dailyChart.labels && result.data.dailyChart.values ? {
                        labels: result.data.dailyChart.labels,
                        datasets: [{
                            label: 'Số người đăng ký',
                            data: result.data.dailyChart.values,
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.1
                        }]
                    } : null,
                    monthlyChart: result.data.monthlyChart && result.data.monthlyChart.labels && result.data.monthlyChart.values ? {
                        labels: result.data.monthlyChart.labels,
                        datasets: [{
                            label: 'Số người đăng ký',
                            data: result.data.monthlyChart.values,
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1
                        }]
                    } : null,
                    visitorTypeData: result.data.visitorTypeData && result.data.visitorTypeData.labels && result.data.visitorTypeData.values ? {
                        labels: result.data.visitorTypeData.labels,
                        datasets: [{
                            data: result.data.visitorTypeData.values,
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderColor: [
                                'rgb(59, 130, 246)',
                                'rgb(16, 185, 129)',
                                'rgb(245, 158, 11)',
                                'rgb(239, 68, 68)'
                            ],
                            borderWidth: 1
                        }]
                    } : null,
                    growthTrendData: result.data.growthTrendData && result.data.growthTrendData.labels && result.data.growthTrendData.values ? {
                        labels: result.data.growthTrendData.labels,
                        datasets: [{
                            label: 'Tỷ lệ tăng trưởng (%)',
                            data: result.data.growthTrendData.values,
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.1
                        }]
                    } : null
                };
                setDetailedStats(transformedData);
            }
        } catch (error) {
            console.error('Error loading detailed stats:', error);
        }
    };

    const handleCreateNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notificationFormRef.current) return;

        const formData = new FormData(notificationFormRef.current);
        const notification = {
            id: Date.now().toString(),
            type: formData.get('notificationType'),
            title: formData.get('notificationTitle'),
            message: formData.get('notificationMessage'),
            createdAt: new Date().toISOString(),
            active: true
        };

        await fetch(CONFIG.COMBINED_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createNotification', data: notification })
        });
        loadAllDataFromAPI();
        notificationFormRef.current.reset();
    };
    
    const handleSaveGpsSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gpsSettingsFormRef.current) return;
        const formData = new FormData(gpsSettingsFormRef.current);
        const newSettings: any = {};
        formData.forEach((value, key) => {
            newSettings[key] = value;
        });

        await fetch(CONFIG.COMBINED_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateGpsSettings', data: newSettings })
        });
        loadAllDataFromAPI();
    };

    const deleteNotification = async (notificationId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
        
        try {
            await fetch(CONFIG.COMBINED_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'deleteNotification', 
                    data: { id: notificationId } 
                })
            });
            loadAllDataFromAPI();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Có lỗi xảy ra khi xóa thông báo. Vui lòng thử lại.');
        }
    };

    const searchUser = async () => {
        const searchPhone = (document.getElementById('searchPhone') as HTMLInputElement)?.value?.trim();
        
        if (!searchPhone) {
            alert('Vui lòng nhập số điện thoại để tìm kiếm');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=searchPhone&phone=${encodeURIComponent(searchPhone)}`);
            const result = await response.json();
            
            if (result.success) {
                setSearchResults(result.data || []);
                if (result.data && result.data.length === 0) {
                    alert('Không tìm thấy người leo núi với số điện thoại này');
                }
            } else {
                alert('Có lỗi xảy ra khi tìm kiếm: ' + (result.message || 'Lỗi không xác định'));
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching user:', error);
            alert('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };



    const { isMobile } = useDevice();

    return (
        <ResponsiveContainer maxWidth="7xl" padding="lg">
            <div className="admin-layout">
                {/* Header Section */}
                <div className="admin-card mb-8">
                    <div className="admin-card-header">
                                                 <div className="flex items-center justify-between flex-col lg:flex-row gap-4">
                             <div className="flex items-center gap-4 w-full lg:w-auto">
                                 <Link to="/admin" className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 flex-shrink-0">
                                     <FontAwesomeIcon icon={faArrowLeft} className="text-slate-600 text-xl" />
                                 </Link>
                                 <div className="flex items-center gap-3 min-w-0">
                                     <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                                         <FontAwesomeIcon icon={faMountain} className="text-blue-600 text-2xl" />
                                     </div>
                                     <div className="min-w-0">
                                         <h1 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">Quản lý Đăng ký Leo núi</h1>
                                         <p className="text-slate-600 text-sm lg:text-base truncate">Quản lý thông báo, tra cứu người leo núi và cài đặt hệ thống</p>
                                     </div>
                                 </div>
                             </div>
                                                         <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                                 <div className="text-right hidden sm:block">
                                     <p className="text-sm text-slate-500 flex items-center gap-2">
                                         <FontAwesomeIcon icon={faCalendarAlt} />
                                         {currentDate}
                                     </p>
                                 </div>
                                 <button 
                                     onClick={loadInitialData} 
                                     className="btn-modern btn-modern-secondary text-sm px-3 py-2"
                                     title="Làm mới dữ liệu"
                                 >
                                     <FontAwesomeIcon icon={faSyncAlt} className="mr-1" />
                                     <span className="hidden sm:inline">Làm mới</span>
                                 </button>
                                 <button 
                                     onClick={() => {
                                         logout();
                                         navigate('/admin-login');
                                     }} 
                                     className="btn-modern btn-modern-danger text-sm px-3 py-2"
                                     title="Đăng xuất"
                                 >
                                     <FontAwesomeIcon icon={faHome} className="mr-1" />
                                     <span className="hidden sm:inline">Đăng xuất</span>
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>

                                 {/* Quick Stats */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                     <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200">
                         <p className="text-sm font-medium text-slate-600">Tổng đăng ký</p>
                         <p className="text-xl lg:text-2xl font-bold text-slate-900">{stats.yearlyCount || '-'}</p>
                     </div>
                     <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200">
                         <p className="text-sm font-medium text-slate-600">Thông báo đang hoạt động</p>
                         <p className="text-xl lg:text-2xl font-bold text-slate-900">{notifications.filter(n => n.active).length}</p>
                     </div>
                     <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200">
                         <p className="text-sm font-medium text-slate-600">Chứng chỉ đã tạo</p>
                         <p className="text-xl lg:text-2xl font-bold text-slate-900">{stats.totalCertificates || '-'}</p>
                     </div>
                     <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200">
                         <p className="text-sm font-medium text-slate-600">GPS đang bật</p>
                         <p className="text-xl lg:text-2xl font-bold text-slate-900">{gpsSettings.requireGpsRegistration || gpsSettings.requireGpsCertificate ? 'Bật' : 'Tắt'}</p>
                     </div>
                 </div>

                                 {/* Main Content Grid */}
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Notification Management */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                            <h3 className="text-xl font-bold text-white">Quản lý Thông báo</h3>
                        </div>
                        <div className="p-6 bg-white/80 backdrop-blur-sm">
                            <form ref={notificationFormRef} onSubmit={handleCreateNotification} className="space-y-4 mb-6">
                                <select name="notificationType" className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <option value="weather">Cảnh báo thời tiết</option>
                                    <option value="maintenance">Bảo trì</option>
                                    <option value="announcement">Thông báo chung</option>
                                    <option value="emergency">Khẩn cấp</option>
                                </select>
                                <input type="text" name="notificationTitle" placeholder="Tiêu đề" className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                                <textarea name="notificationMessage" placeholder="Nội dung" rows={3} className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"></textarea>
                                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md">Tạo thông báo</button>
                            </form>
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Thông báo đang hoạt động</h4>
                                <div className="space-y-3">
                                    {notifications.filter(n => n.active).map(n => (
                                        <div key={n.id} className="bg-white p-4 border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <p className="font-medium text-slate-800">{n.title}</p>
                                            <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                                            <div className="mt-3 flex justify-end">
                                                <button 
                                                    onClick={async () => {
                                                        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
                                                        try {
                                                            await fetch(CONFIG.COMBINED_API_URL, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ 
                                                                    action: 'deleteNotification', 
                                                                    data: { id: n.id } 
                                                                })
                                                            });
                                                            loadAllDataFromAPI();
                                                        } catch (error) {
                                                            console.error('Error deleting notification:', error);
                                                            alert('Có lỗi xảy ra khi xóa thông báo. Vui lòng thử lại.');
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GPS Settings Management */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                            <h3 className="text-xl font-bold text-white">Cài đặt GPS</h3>
                        </div>
                        <div className="p-6">
                            <form ref={gpsSettingsFormRef} onSubmit={handleSaveGpsSettings} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <input 
                                                type="checkbox" 
                                                name="requireGpsRegistration" 
                                                defaultChecked={gpsSettings.requireGpsRegistration}
                                                className="mr-2"
                                            />
                                            Yêu cầu GPS khi đăng ký
                                        </label>
                                        <div className="ml-6">
                                            <label className="block text-sm text-slate-600 mb-1">Bán kính đăng ký (mét)</label>
                                            <input 
                                                type="number" 
                                                name="registrationRadius" 
                                                defaultValue={gpsSettings.registrationRadius || 100}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="100"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <input 
                                                type="checkbox" 
                                                name="requireGpsCertificate" 
                                                defaultChecked={gpsSettings.requireGpsCertificate}
                                                className="mr-2"
                                            />
                                            Yêu cầu GPS khi nhận chứng nhận
                                        </label>
                                        <div className="ml-6">
                                            <label className="block text-sm text-slate-600 mb-1">Bán kính chứng nhận (mét)</label>
                                            <input 
                                                type="number" 
                                                name="certificateRadius" 
                                                defaultValue={gpsSettings.certificateRadius || 50}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <input 
                                            type="checkbox" 
                                            name="registrationTimeEnabled" 
                                            defaultChecked={gpsSettings.registrationTimeEnabled}
                                            className="mr-2"
                                        />
                                        Giới hạn thời gian đăng ký
                                    </label>
                                    <div className="ml-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1">Giờ bắt đầu</label>
                                            <input 
                                                type="time" 
                                                name="registrationStartTime" 
                                                defaultValue={gpsSettings.registrationStartTime || "06:00"}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1">Giờ kết thúc</label>
                                            <input 
                                                type="time" 
                                                name="registrationEndTime" 
                                                defaultValue={gpsSettings.registrationEndTime || "18:00"}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-slate-700 mb-3">Tọa độ điểm đăng ký</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1">Vĩ độ (Latitude)</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                name="registrationLatitude" 
                                                defaultValue={gpsSettings.registrationLatitude || 11.374232}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="11.374232"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1">Kinh độ (Longitude)</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                name="registrationLongitude" 
                                                defaultValue={gpsSettings.registrationLongitude || 106.175094}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="106.175094"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-slate-700 mb-3">Tọa độ đỉnh núi</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1">Vĩ độ (Latitude)</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                name="summitLatitude" 
                                                defaultValue={gpsSettings.summitLatitude || 11.374232}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="11.374232"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1">Kinh độ (Longitude)</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                name="summitLongitude" 
                                                defaultValue={gpsSettings.summitLongitude || 106.175094}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="106.175094"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    Lưu cài đặt GPS
                                </button>
                            </form>
                        </div>
                    </div>

                                         {/* User Search */}
                     <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                         <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative overflow-hidden">
                             <div className="absolute inset-0 bg-black/10"></div>
                             <div className="relative z-10 flex items-center">
                                 <div className="bg-white/20 rounded-full p-3 mr-4">
                                     <FontAwesomeIcon icon={faSearch} className="text-white text-xl" />
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold text-white">Tra cứu Người leo núi</h3>
                                     <p className="text-white/80 text-sm mt-1">Tìm kiếm thông tin đăng ký theo số điện thoại</p>
                                 </div>
                             </div>
                         </div>
                         <div className="p-6">
                             <div className="relative mb-6">
                                 <div className="flex space-x-3">
                                     <div className="flex-1 relative">
                                         <FontAwesomeIcon 
                                             icon={faSearch} 
                                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" 
                                         />
                                         <input 
                                             type="tel" 
                                             id="searchPhone" 
                                             className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-slate-50 hover:bg-white" 
                                             placeholder="Nhập số điện thoại để tìm kiếm..." 
                                             onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                                         />
                                     </div>
                                     <button 
                                         onClick={searchUser} 
                                         disabled={isSearching}
                                         className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                     >
                                         {isSearching ? (
                                             <>
                                                 <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                                 Đang tìm...
                                             </>
                                         ) : (
                                             <>
                                                 <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                                 Tìm kiếm
                                             </>
                                         )}
                                     </button>
                                 </div>
                             </div>
                             
                             <div>
                                 <div className="flex items-center justify-between mb-4">
                                     <h4 className="text-lg font-semibold text-slate-800">Kết quả tìm kiếm</h4>
                                     {searchResults.length > 0 && (
                                         <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                             {searchResults.length} kết quả
                                         </span>
                                     )}
                                 </div>
                                 
                                 <div className="space-y-4">
                                     {isSearching ? (
                                         <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                             <div className="bg-blue-100 rounded-full p-4 mb-4">
                                                 <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-2xl" />
                                             </div>
                                             <p className="text-lg font-medium">Đang tìm kiếm...</p>
                                             <p className="text-sm text-slate-400">Vui lòng chờ trong giây lát</p>
                                         </div>
                                     ) : searchResults.length > 0 ? (
                                         searchResults.map((user, index) => (
                                             <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                                                 <div className="flex items-start justify-between mb-4">
                                                     <div className="flex items-center">
                                                         <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 mr-4">
                                                             <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
                                                         </div>
                                                         <div>
                                                             <h5 className="text-xl font-bold text-slate-800">{user.leaderName || 'N/A'}</h5>
                                                             <p className="text-slate-500 text-sm">Người dẫn đoàn</p>
                                                         </div>
                                                     </div>
                                                     <div className="text-right">
                                                         <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                             {user.certificateCount || '0'} chứng chỉ
                                                         </div>
                                                     </div>
                                                 </div>
                                                 
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                     <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                         <div className="flex items-center mb-2">
                                                             <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 mr-2" />
                                                             <span className="text-sm font-medium text-slate-600">Thông tin liên hệ</span>
                                                         </div>
                                                         <p className="text-lg font-semibold text-slate-800">{user.phone || 'N/A'}</p>
                                                         <p className="text-sm text-slate-500">{user.email || 'N/A'}</p>
                                                     </div>
                                                     
                                                     <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                         <div className="flex items-center mb-2">
                                                             <FontAwesomeIcon icon={faUsers} className="text-green-500 mr-2" />
                                                             <span className="text-sm font-medium text-slate-600">Thông tin đoàn</span>
                                                         </div>
                                                         <p className="text-lg font-semibold text-slate-800">{user.memberCount || 'N/A'} người</p>
                                                         <p className="text-sm text-slate-500">{user.address || 'N/A'}</p>
                                                     </div>
                                                 </div>
                                                 
                                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                     <div className="bg-blue-50 rounded-xl p-3 text-center">
                                                         <p className="text-xs font-medium text-blue-600 mb-1">Ngày đăng ký</p>
                                                         <p className="text-sm font-semibold text-slate-800">{user.timestamp || 'N/A'}</p>
                                                         <p className="text-xs text-slate-500">{user.registrationTime || 'N/A'}</p>
                                                     </div>
                                                     
                                                     <div className="bg-green-50 rounded-xl p-3 text-center">
                                                         <p className="text-xs font-medium text-green-600 mb-1">Ngày leo núi</p>
                                                         <p className="text-sm font-semibold text-slate-800">{user.trekDate || 'N/A'}</p>
                                                     </div>
                                                     
                                                     <div className="bg-purple-50 rounded-xl p-3 text-center">
                                                         <p className="text-xs font-medium text-purple-600 mb-1">Chứng chỉ</p>
                                                         <p className="text-sm font-semibold text-slate-800">{user.certificateCount || '0'}</p>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))
                                     ) : (
                                         <div className="text-center py-12">
                                             <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                                 <FontAwesomeIcon icon={faSearch} className="text-blue-500 text-3xl" />
                                             </div>
                                             <h5 className="text-lg font-semibold text-slate-700 mb-2">Chưa có kết quả tìm kiếm</h5>
                                             <p className="text-slate-500 mb-4">Nhập số điện thoại và nhấn tìm kiếm để xem thông tin đăng ký</p>
                                             <div className="bg-slate-50 rounded-xl p-4 max-w-sm mx-auto">
                                                 <p className="text-sm text-slate-600">
                                                     <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-500" />
                                                     Ví dụ: 0961563915, 0987654321
                                                 </p>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Detailed Statistics */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Thống kê Chi tiết</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Thêm container với chiều cao cố định cho biểu đồ */}
                        <div className="bg-slate-50 rounded-lg p-4 h-80">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Thống kê 30 ngày gần đây</h4>
                            <div className="h-64">
                                {detailedStats.dailyChart && detailedStats.dailyChart.datasets ? (
                                    <Line data={detailedStats.dailyChart} options={lineChartOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        Đang tải dữ liệu...
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 h-80">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Thống kê 12 tháng gần đây</h4>
                            <div className="h-64">
                                {detailedStats.monthlyChart && detailedStats.monthlyChart.datasets ? (
                                    <Bar data={detailedStats.monthlyChart} options={barChartOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        Đang tải dữ liệu...
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 h-80">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Phân loại đoàn</h4>
                            <div className="h-64">
                                {detailedStats.visitorTypeData && detailedStats.visitorTypeData.datasets ? (
                                    <Doughnut data={detailedStats.visitorTypeData} options={doughnutChartOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        Đang tải dữ liệu...
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 h-80">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Tăng trưởng 6 tháng</h4>
                            <div className="h-64">
                                {detailedStats.growthTrendData && detailedStats.growthTrendData.datasets ? (
                                    <Line data={detailedStats.growthTrendData} options={lineChartOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        Đang tải dữ liệu...
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Recent Registrations */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Đăng ký gần đây</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SĐT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày sinh</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày đăng ký</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {recentRegistrations.map((reg, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">{reg.leaderName}</td>
                                        <td className="px-6 py-4">{reg.phoneNumber}</td>
                                        <td className="px-6 py-4">{reg.birthday}</td>
                                        <td className="px-6 py-4">{reg.registrationDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ResponsiveContainer>
    );
};

export default ClimbAdminPage;
