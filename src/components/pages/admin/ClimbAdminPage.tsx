
import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMountain, faCalendarAlt, faSyncAlt, faHome, faUsers, faBell, faCertificate, faMapMarkerAlt, faSearch, faPlus, faTimes, faSave, faUndo, faInfoCircle, faList, faCheckCircle, faExclamationTriangle, faHistory, faChartLine, faSpinner, faEyeSlash, faTrash, faTools, faBullhorn, faCloudRain } from '@fortawesome/free-solid-svg-icons';
import './ClimbAdminPage.css';

Chart.register(...registerables);

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
    const [stats, setStats] = useState<any>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [gpsSettings, setGpsSettings] = useState<any>({});
    const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
    const [detailedStats, setDetailedStats] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

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
                setDetailedStats(result.data);
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

    const searchUser = async () => {
        // Implement search user logic
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminLoginTime');
        window.location.href = '../../admin-login.html';
    };

    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="gradient-bg shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <a href="../../admin.html" className="text-white hover:text-blue-200 transition-colors mr-4" title="Về trang Admin">
                                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                            </a>
                            <FontAwesomeIcon icon={faMountain} className="text-white text-2xl mr-3" />
                            <h1 className="text-xl font-bold text-white">Quản lý Đăng ký Leo núi</h1>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <span className="text-white text-xs md:text-sm hidden sm:block">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 md:mr-2" />
                                <span>{currentDate}</span>
                            </span>
                            <button onClick={loadInitialData} className="text-white hover:text-blue-200 transition-colors px-2 md:px-3 py-1 rounded-lg hover:bg-white/10 text-xs md:text-sm" title="Làm mới dữ liệu">
                                <FontAwesomeIcon icon={faSyncAlt} className="mr-1" />
                                <span className="hidden sm:inline">Làm mới</span>
                            </button>
                            <button onClick={logout} className="text-white hover:text-blue-200 transition-colors px-2 md:px-3 py-1 rounded-lg hover:bg-white/10 text-xs md:text-sm" title="Về trang chủ">
                                <FontAwesomeIcon icon={faHome} className="mr-1" />
                                <span className="hidden sm:inline">Về trang chủ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Quản lý Đăng ký Leo núi</h2>
                    <p className="text-slate-600">Quản lý thông báo, tra cứu người leo núi và cài đặt hệ thống</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <p className="text-sm font-medium text-slate-600">Tổng đăng ký</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.yearlyCount || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <p className="text-sm font-medium text-slate-600">Thông báo đang hoạt động</p>
                        <p className="text-2xl font-bold text-slate-900">{notifications.filter(n => n.active).length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <p className="text-sm font-medium text-slate-600">Chứng chỉ đã tạo</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalCertificates || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <p className="text-sm font-medium text-slate-600">GPS đang bật</p>
                        <p className="text-2xl font-bold text-slate-900">{gpsSettings.requireGpsRegistration || gpsSettings.requireGpsCertificate ? 'Bật' : 'Tắt'}</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Notification Management */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="gradient-bg-success p-6">
                            <h3 className="text-xl font-bold text-white">Quản lý Thông báo</h3>
                        </div>
                        <div className="p-6">
                            <form ref={notificationFormRef} onSubmit={handleCreateNotification} className="space-y-4 mb-6">
                                <select name="notificationType" className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                    <option value="weather">Cảnh báo thời tiết</option>
                                    <option value="maintenance">Bảo trì</option>
                                    <option value="announcement">Thông báo chung</option>
                                    <option value="emergency">Khẩn cấp</option>
                                </select>
                                <input type="text" name="notificationTitle" placeholder="Tiêu đề" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                <textarea name="notificationMessage" placeholder="Nội dung" rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg"></textarea>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tạo thông báo</button>
                            </form>
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Thông báo đang hoạt động</h4>
                                <div className="space-y-3">
                                    {notifications.filter(n => n.active).map(n => (
                                        <div key={n.id} className="notification-item p-4 border rounded-lg">
                                            <p>{n.title}</p>
                                            <p>{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="gradient-bg-warning p-6">
                            <h3 className="text-xl font-bold text-white">Tra cứu Người leo núi</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex space-x-3 mb-6">
                                <input type="tel" id="searchPhone" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg" placeholder="Nhập số điện thoại" />
                                <button onClick={searchUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tìm kiếm</button>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Kết quả tìm kiếm</h4>
                                <div id="searchResults" className="space-y-3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Statistics */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Thống kê Chi tiết</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Thống kê 30 ngày gần đây</h4>
                            {detailedStats.dailyChart && <Line data={detailedStats.dailyChart} />}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Thống kê 12 tháng gần đây</h4>
                            {detailedStats.monthlyChart && <Bar data={detailedStats.monthlyChart} />}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Phân loại đoàn</h4>
                            {detailedStats.visitorTypeData && <Doughnut data={detailedStats.visitorTypeData} />}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-slate-700 mb-4">Tăng trưởng 6 tháng</h4>
                            {detailedStats.growthTrendData && <Line data={detailedStats.growthTrendData} />}
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
            </main>
        </div>
    );
};

export default ClimbAdminPage;
