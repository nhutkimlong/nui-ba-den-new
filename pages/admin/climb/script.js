// Admin Climb Management Script
// Quản lý thông báo, tra cứu người leo núi và cài đặt GPS

// Configuration
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyWYJtTjYvSFT--TPpV6bk4-o6jKtqXBhe5di-h6ozC2sKscM_i8_PCJxzPpL_bEDNT/exec',
    COMBINED_API_URL: '/.netlify/functions/combined-data',
    NOTIFICATION_CHECK_INTERVAL: 30000, // 30 seconds
    NOTIFICATION_DISPLAY_DURATION: 10000, // 10 seconds
    MAX_NOTIFICATIONS: 5,
    DEFAULT_REGISTRATION_RADIUS: 50,
    DEFAULT_CERTIFICATE_RADIUS: 150
};

// Notification types and their styling
const NOTIFICATION_TYPES = {
    weather: { 
        name: 'Cảnh báo thời tiết', 
        icon: 'fa-cloud-rain', 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200', 
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600'
    },
    maintenance: { 
        name: 'Bảo trì', 
        icon: 'fa-tools', 
        bgColor: 'bg-yellow-50', 
        borderColor: 'border-yellow-200', 
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600'
    },
    announcement: { 
        name: 'Thông báo chung', 
        icon: 'fa-bullhorn', 
        bgColor: 'bg-green-50', 
        borderColor: 'border-green-200', 
        textColor: 'text-green-800',
        iconColor: 'text-green-600'
    },
    emergency: { 
        name: 'Khẩn cấp', 
        icon: 'fa-exclamation-triangle', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200', 
        textColor: 'text-red-800',
        iconColor: 'text-red-600'
    }
};

// Global variables
let notifications = [];
let gpsSettings = {
    registrationRadius: CONFIG.DEFAULT_REGISTRATION_RADIUS,
    certificateRadius: CONFIG.DEFAULT_CERTIFICATE_RADIUS,
    requireGpsRegistration: true,
    requireGpsCertificate: true,
    registrationTimeEnabled: false,
    registrationStartTime: '06:00',
    registrationEndTime: '18:00'
};

// Loading state
let isLoading = false;

// Chart instances
let dailyChart = null;
let monthlyChart = null;
let visitorTypeChart = null;
let growthTrendChart = null;

// DOM Elements
let elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadInitialData();
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000); // Update every minute
    
    // Auto-refresh data when tab becomes visible (user switches back to tab)
    // Commented out - only refresh when admin makes changes
    /*
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Refresh data when user comes back to the tab
            refreshAllData(true); // Silent refresh
        }
    });
    
    // Auto-refresh data every 30 seconds to keep it fresh
    setInterval(function() {
        // Only refresh if tab is visible and not in loading state
        if (!document.hidden && !isLoading) {
            refreshAllData(true); // Silent refresh
        }
    }, 30000); // 30 seconds
    */
});

// Initialize DOM elements
function initializeElements() {
    elements = {
        // Stats
        totalRegistrations: document.getElementById('totalRegistrations'),
        activeNotifications: document.getElementById('activeNotifications'),
        totalCertificates: document.getElementById('totalCertificates'),
        gpsStatus: document.getElementById('gpsStatus'),
        
        // Notification form
        notificationForm: document.getElementById('notificationForm'),
        notificationType: document.getElementById('notificationType'),
        notificationTitle: document.getElementById('notificationTitle'),
        notificationMessage: document.getElementById('notificationMessage'),
        
        // Registration time settings
        registrationTimeEnabled: document.getElementById('registrationTimeEnabled'),
        registrationStartTime: document.getElementById('registrationStartTime'),
        registrationEndTime: document.getElementById('registrationEndTime'),
        registrationTimeSettings: document.getElementById('registrationTimeSettings'),
        activeNotificationsList: document.getElementById('activeNotificationsList'),
        
        // Search
        searchPhone: document.getElementById('searchPhone'),
        searchResults: document.getElementById('searchResults'),
        
        // GPS Settings
        gpsSettingsForm: document.getElementById('gpsSettingsForm'),
        registrationRadius: document.getElementById('registrationRadius'),
        certificateRadius: document.getElementById('certificateRadius'),
        requireGpsRegistration: document.getElementById('requireGpsRegistration'),
        requireGpsCertificate: document.getElementById('requireGpsCertificate'),
        
        // Recent registrations
        recentRegistrationsTable: document.getElementById('recentRegistrationsTable'),
        
        // Date
        currentDate: document.getElementById('currentDate'),
        currentYear: document.getElementById('currentYear')
    };
}

// Setup event listeners
function setupEventListeners() {
    // Notification form
    if (elements.notificationForm) {
        elements.notificationForm.addEventListener('submit', handleCreateNotification);
    }
    
    // Search
    if (elements.searchPhone) {
        elements.searchPhone.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchUser();
            }
        });
    }
    
    // GPS Settings form
    if (elements.gpsSettingsForm) {
        elements.gpsSettingsForm.addEventListener('submit', handleSaveGpsSettings);
    }
    
    // Registration time settings
    if (elements.registrationTimeEnabled) {
        elements.registrationTimeEnabled.addEventListener('change', toggleRegistrationTimeSettings);
        // Also call toggleRegistrationTimeSettings initially to set the correct state
        toggleRegistrationTimeSettings();
    }
    
    // QR Settings
    initQRSettings();
    
    // Manual Certificate Generation
    initializeManualCertificateForm();
}

// Load initial data
async function loadInitialData() {
    try {
        // Show loading state first
        updateStats({
            totalRegistrations: 'Đang tải...',
            activeNotifications: 0,
            totalCertificates: 'Đang tải...',
            gpsEnabled: false
        });
        
        await Promise.all([
            loadStats(),
            loadAllDataFromAPI(),
            loadRecentRegistrations(),
            loadDetailedStats()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Có lỗi khi tải dữ liệu ban đầu', 'error');
    }
}

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    if (elements.currentDate) {
        elements.currentDate.textContent = now.toLocaleDateString('vi-VN', options);
    }
    
    if (elements.currentYear) {
        elements.currentYear.textContent = now.getFullYear();
    }
}

// ===== DETAILED STATISTICS =====

// Load detailed statistics
async function loadDetailedStats() {
    try {
    
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getAllDashboardData`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        
        if (result.success) {
            const data = result.data;

            
            // Create charts
            createDailyChart(data.dailyChart);
            createMonthlyChart(data.monthlyChart);
            createVisitorTypeChart(data.visitorTypeData);
            createGrowthTrendChart(data.growthTrendData);
            updateExecutiveSummary(data.executiveSummary);
        } else {
            throw new Error(result.message || 'Không thể tải thống kê chi tiết');
        }
        
    } catch (error) {
        console.error('Error loading detailed stats:', error);
        // Show error message instead of fallback
        showMessage('Không thể tải thống kê chi tiết. Vui lòng thử lại sau.', 'error');
    }
}

// Create daily chart
function createDailyChart(data) {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    // Calculate appropriate step size based on data range
    const values = data.values || [];
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue;
    
    let stepSize = 1;
    if (range > 0) {
        if (range <= 10) {
            stepSize = 1;
        } else if (range <= 50) {
            stepSize = 5;
        } else if (range <= 100) {
            stepSize = 10;
        } else if (range <= 500) {
            stepSize = 50;
        } else {
            stepSize = Math.ceil(range / 10);
        }
    }
    
    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Số lượng đăng ký',
                data: values,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: stepSize,
                        maxTicksLimit: 8,
                        callback: function(value) {
                            return value + ' người';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Create monthly chart
function createMonthlyChart(data) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    // Calculate appropriate step size based on data range
    const values = data.values || [];
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue;
    
    let stepSize = 1;
    if (range > 0) {
        if (range <= 10) {
            stepSize = 1;
        } else if (range <= 50) {
            stepSize = 5;
        } else if (range <= 100) {
            stepSize = 10;
        } else if (range <= 500) {
            stepSize = 50;
        } else {
            stepSize = Math.ceil(range / 10);
        }
    }
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Số lượng đăng ký',
                data: values,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: stepSize,
                        maxTicksLimit: 8,
                        callback: function(value) {
                            return value + ' người';
                        }
                    }
                }
            }
        }
    });
}

// Create visitor type chart
function createVisitorTypeChart(data) {
    const ctx = document.getElementById('visitorTypeChart');
    if (!ctx) return;
    
    if (visitorTypeChart) {
        visitorTypeChart.destroy();
    }
    
    const colors = [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
    ];
    
    visitorTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels || [],
            datasets: [{
                data: data.values || [],
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Create growth trend chart
function createGrowthTrendChart(data) {
    const ctx = document.getElementById('growthTrendChart');
    if (!ctx) return;
    
    if (growthTrendChart) {
        growthTrendChart.destroy();
    }
    
    growthTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Tăng trưởng (%)',
                data: data.values || [],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(34, 197, 94)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 8,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Update executive summary
function updateExecutiveSummary(data) {
    const container = document.getElementById('executiveSummary');
    if (!container) return;
    
    container.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">Tháng này:</span>
                <span class="font-semibold text-slate-800">${data.monthlyCount || 0} người</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">Năm nay:</span>
                <span class="font-semibold text-slate-800">${data.yearlyCount || 0} người</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">Tăng trưởng tháng:</span>
                <span class="font-semibold ${data.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${data.monthlyGrowth !== null ? (data.monthlyGrowth >= 0 ? '+' : '') + data.monthlyGrowth + '%' : 'N/A'}
                </span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">TB/ngày tháng này:</span>
                <span class="font-semibold text-slate-800">${data.dailyAverage || 0} người</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">Tăng trưởng TB/ngày:</span>
                <span class="font-semibold ${data.dailyAverageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${data.dailyAverageGrowth !== null ? (data.dailyAverageGrowth >= 0 ? '+' : '') + data.dailyAverageGrowth + '%' : 'N/A'}
                </span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600">Xu hướng tuần:</span>
                <span class="font-semibold ${data.trend >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${data.trend !== null ? (data.trend >= 0 ? '+' : '') + data.trend + '%' : 'N/A'}
                </span>
            </div>
        </div>
    `;
}

// Create mock charts for fallback
function createMockCharts() {
    // Generate 30 days of data
    const dailyLabels = [];
    const dailyValues = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyLabels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
        dailyValues.push(Math.floor(Math.random() * 50) + 5); // Random 5-55
    }
    
    const mockDailyData = {
        labels: dailyLabels,
        values: dailyValues
    };
    
    // Generate 12 months of data
    const monthlyLabels = [];
    const monthlyValues = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        monthlyLabels.push(date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }));
        monthlyValues.push(Math.floor(Math.random() * 200) + 50); // Random 50-250
    }
    
    const mockMonthlyData = {
        labels: monthlyLabels,
        values: monthlyValues
    };
    
    const mockVisitorData = {
        labels: ['Đoàn nhỏ (1-5)', 'Đoàn vừa (6-10)', 'Đoàn lớn (11-20)', 'Đoàn rất lớn (>20)'],
        values: [25, 18, 8, 3] // Số lượng đoàn, không phải số người
    };
    
    // Generate 6 months growth data
    const growthLabels = [];
    const growthValues = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        growthLabels.push(date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }));
        growthValues.push(i === 0 ? 0 : Math.floor(Math.random() * 100) - 50); // Random -50 to 50
    }
    
    const mockGrowthData = {
        labels: growthLabels,
        values: growthValues
    };
    
    const mockExecutiveData = {
        monthlyCount: 48,
        yearlyCount: 262,
        monthlyGrowth: 25.0,
        dailyAverage: 1.6,
        dailyAverageGrowth: 15.4,
        trend: 12.5
    };
    

    
    createDailyChart(mockDailyData);
    createMonthlyChart(mockMonthlyData);
    createVisitorTypeChart(mockVisitorData);
    createGrowthTrendChart(mockGrowthData);
    updateExecutiveSummary(mockExecutiveData);
}

// ===== NOTIFICATION MANAGEMENT =====

// Handle create notification
async function handleCreateNotification(e) {
    e.preventDefault();
    
    const type = elements.notificationType.value;
    const title = elements.notificationTitle.value.trim();
    const message = elements.notificationMessage.value.trim();
    
    if (!title || !message) {
        showMessage('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    // Prevent duplicate submission
    if (isLoading) {
        showMessage('Đang xử lý, vui lòng đợi...', 'warning');
        return;
    }
    
    try {
        isLoading = true;
        setLoadingState(true);
        
        const notification = {
            id: Date.now().toString(),
            type: type,
            title: title,
            message: message,
            createdAt: new Date().toISOString(),
            active: true
        };
        
        // Send to Netlify Function API
        try {
            const response = await fetch(CONFIG.COMBINED_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'createNotification',
                    data: notification
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create notification');
            }
            
            // Refresh notifications from server
            await loadNotifications();
            
            // Trigger storage event for other tabs/windows
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'climbNotifications',
                newValue: JSON.stringify(notifications)
            }));
        } catch (error) {
            console.error('Error creating notification:', error);
            // Fallback to localStorage for development
            notifications.push(notification);
            localStorage.setItem('climbNotifications', JSON.stringify(notifications));
            
            // Update UI
            updateNotificationsList();
            updateStats();
            
            // Trigger storage event for other tabs/windows
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'climbNotifications',
                newValue: JSON.stringify(notifications)
            }));
        }
        
        // Update UI
        updateNotificationsList();
        updateStats();
        
        // Clear form
        clearNotificationForm();
        
        // Trigger notification refresh on climb page
        try {
            // Try to refresh notifications on the climb page if it's open
            if (window.opener && window.opener.refreshNotifications) {
                window.opener.refreshNotifications();
            }
            
            // Also send message event for cross-window communication
            if (window.opener) {
                window.opener.postMessage({
                    type: 'NEW_NOTIFICATION',
                    data: notification
                }, '*');
            }
            
            // Trigger storage event for other tabs/windows
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'climbNotifications',
                newValue: JSON.stringify(notifications)
            }));
        } catch (error) {
            console.error('Could not refresh climb page notifications:', error);
        }
        
        showMessage('Thông báo đã được tạo thành công', 'success');
        
        // Refresh all data to show latest information
        await refreshAllData();
        
    } catch (error) {
        console.error('Error creating notification:', error);
        showMessage('Có lỗi khi tạo thông báo', 'error');
    } finally {
        isLoading = false;
        setLoadingState(false);
    }
}

// Clear notification form
function clearNotificationForm() {
    if (elements.notificationForm) {
        elements.notificationForm.reset();
    }
}

// Load all data from combined API
async function loadAllDataFromAPI() {
    try {
        // console.log('Loading all data from combined API...', new Date().toISOString());
        // console.trace('loadAllDataFromAPI called from:');
        
        const response = await fetch(CONFIG.COMBINED_API_URL);
        if (response.ok) {
            const result = await response.json();
            console.log('Combined API result:', result);
            
            // Process notifications
            notifications = result.notifications.data || [];
            localStorage.setItem('climbNotifications', JSON.stringify(notifications));
            
            // Process GPS settings
            gpsSettings = result.gpsSettings.data || {
                registrationRadius: CONFIG.DEFAULT_REGISTRATION_RADIUS,
                certificateRadius: CONFIG.DEFAULT_CERTIFICATE_RADIUS,
                requireGpsRegistration: true,
                requireGpsCertificate: true,
                registrationTimeEnabled: false,
                registrationStartTime: '06:00',
                registrationEndTime: '18:00'
            };
            localStorage.setItem('gpsSettings', JSON.stringify(gpsSettings));
            
            // Process QR settings
            const qrSettings = result.qrSettings.data || {
                expirationHours: 12,
                targetUrl: "https://nuibaden.netlify.app/pages/climb.html",
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('qrSettings', JSON.stringify(qrSettings));
            
            // Update UI
            updateNotificationsList();
            updateGpsSettingsForm();
            updateQRSettingsForm();
            updateGpsStatus();
            updateStats();
            
        } else {
            throw new Error('Failed to fetch combined data');
        }
    } catch (error) {
        console.error('Error loading combined data:', error);
        // Fallback to individual APIs
        await loadNotifications();
        await loadGpsSettings();
    }
}

// Load notifications (legacy - now using combined API)
async function loadNotifications() {
    try {
        // Fetch from Combined API
        const response = await fetch(CONFIG.COMBINED_API_URL);
        if (response.ok) {
            const result = await response.json();
            notifications = result.notifications.data || [];
            // Sync with localStorage to ensure climb page can read
            localStorage.setItem('climbNotifications', JSON.stringify(notifications));
        } else {
            // Fallback to localStorage for development
            const stored = localStorage.getItem('climbNotifications');
            notifications = stored ? JSON.parse(stored) : [];
        }
        
        updateNotificationsList();
        updateStats();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback to localStorage for development
        const stored = localStorage.getItem('climbNotifications');
        notifications = stored ? JSON.parse(stored) : [];
        updateNotificationsList();
        updateStats();
    }
}

// Update notifications list
function updateNotificationsList() {
    if (!elements.activeNotificationsList) {
        return;
    }
    
    const activeNotifications = notifications.filter(n => n.active);
    
    if (activeNotifications.length === 0) {
        elements.activeNotificationsList.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <i class="fas fa-bell-slash text-4xl mb-4"></i>
                <p>Không có thông báo nào đang hoạt động</p>
            </div>
        `;
        return;
    }
    
    elements.activeNotificationsList.innerHTML = activeNotifications.map(notification => 
        createNotificationHTML(notification)
    ).join('');
}

// Create notification HTML
function createNotificationHTML(notification) {
    const typeInfo = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.announcement;
    const createdAt = new Date(notification.createdAt).toLocaleString('vi-VN');
    
    return `
        <div class="notification-item ${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-lg p-4" data-notification-id="${notification.id}">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3 flex-1">
                    <div class="flex-shrink-0">
                        <i class="fas ${typeInfo.icon} ${typeInfo.iconColor} text-xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-1">
                            <h4 class="font-semibold ${typeInfo.textColor} text-sm">${notification.title}</h4>
                            <span class="px-2 py-1 text-xs ${typeInfo.bgColor} ${typeInfo.textColor} rounded-full border ${typeInfo.borderColor}">
                                ${typeInfo.name}
                            </span>
                        </div>
                        <p class="text-sm ${typeInfo.textColor} opacity-90 mb-2">${notification.message}</p>
                        <p class="text-xs text-slate-500">Tạo lúc: ${createdAt}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="toggleNotification('${notification.id}')" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                    <button onclick="deleteNotification('${notification.id}')" class="text-red-400 hover:text-red-600 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle notification active status
async function toggleNotification(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        try {
            setLoadingState(true);
            
            // Update notification status
            notification.active = !notification.active;
            
            // Send PUT request to Netlify Function API
            try {
                const response = await fetch(CONFIG.COMBINED_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'updateNotification',
                        data: {
                            id: notificationId,
                            active: notification.active
                        }
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update notification');
                }
                
                // Refresh notifications from server
                await loadNotifications();
                
            } catch (error) {
                console.error('Error updating notification:', error);
                // Fallback to localStorage for development
                localStorage.setItem('climbNotifications', JSON.stringify(notifications));
                
                // Update UI
                updateNotificationsList();
                updateStats();
            }
            
            // Update UI
            updateNotificationsList();
            updateStats();
            
            // Trigger storage event for other tabs/windows
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'climbNotifications',
                newValue: JSON.stringify(notifications)
            }));
            
            // Trigger notification refresh on climb page
            try {
                if (window.opener && window.opener.refreshNotifications) {
                    window.opener.refreshNotifications();
                }
                
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'NEW_NOTIFICATION',
                        data: notification
                    }, '*');
                }
            } catch (error) {
                console.error('Could not refresh climb page notifications:', error);
            }
            
            const status = notification.active ? 'kích hoạt' : 'ẩn';
            showMessage(`Thông báo đã được ${status}`, 'success');
            
            // Refresh all data to show latest information
            await refreshAllData();
            
        } catch (error) {
            console.error('Error toggling notification:', error);
            showMessage('Có lỗi khi cập nhật thông báo', 'error');
        } finally {
            setLoadingState(false);
        }
    }
}

// Delete notification
async function deleteNotification(notificationId) {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
        try {
            setLoadingState(true);
            
            // Send DELETE request to Netlify Function API
            try {
                const response = await fetch(CONFIG.COMBINED_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'deleteNotification',
                        data: { id: notificationId }
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete notification');
                }
                
                // Refresh notifications from server
                await loadNotifications();
                
            } catch (error) {
                console.error('Error deleting notification:', error);
                // Fallback to localStorage for development
                notifications = notifications.filter(n => n.id !== notificationId);
                localStorage.setItem('climbNotifications', JSON.stringify(notifications));
                
                // Update UI
                updateNotificationsList();
                updateStats();
            }
            
            // Update UI
            updateNotificationsList();
            updateStats();
            
            // Trigger storage event for other tabs/windows
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'climbNotifications',
                newValue: JSON.stringify(notifications)
            }));
            
            // Trigger notification refresh on climb page
            try {
                if (window.opener && window.opener.refreshNotifications) {
                    window.opener.refreshNotifications();
                }
                
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'NEW_NOTIFICATION',
                        data: { deleted: true, id: notificationId }
                    }, '*');
                }
            } catch (error) {
                console.error('Could not refresh climb page notifications:', error);
            }
            
            showMessage('Thông báo đã được xóa', 'success');
            
            // Refresh all data to show latest information
            await refreshAllData();
            
        } catch (error) {
            console.error('Error deleting notification:', error);
            showMessage('Có lỗi khi xóa thông báo', 'error');
        } finally {
            setLoadingState(false);
        }
    }
}

// ===== USER SEARCH =====

// Search user by phone number
async function searchUser() {
    const phoneNumber = elements.searchPhone.value.trim();
    
    if (!phoneNumber) {
        showMessage('Vui lòng nhập số điện thoại để tìm kiếm', 'warning');
        return;
    }
    
    try {
        setLoadingState(true);
        
        // Call Google Apps Script API
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=searchPhone&phone=${encodeURIComponent(phoneNumber)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Kiểm tra và xử lý dữ liệu trước khi hiển thị
            if (Array.isArray(result.data)) {
                displaySearchResults(result.data);
            } else {
                throw new Error('Dữ liệu trả về không đúng định dạng');
            }
        } else {
            throw new Error(result.message || 'Không thể tìm kiếm người dùng');
        }
        
    } catch (error) {
        console.error('Error searching user:', error);
        
        // Hiển thị thông báo lỗi cụ thể hơn
        let errorMessage = 'Có lỗi khi tìm kiếm người dùng';
        if (error.message.includes('HTTP error')) {
            errorMessage = 'Không thể kết nối đến Google Apps Script';
        } else {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
        
        // Xóa kết quả tìm kiếm cũ
        if (elements.searchResults) {
            elements.searchResults.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>Không thể tìm kiếm. Vui lòng thử lại sau.</p>
                </div>
            `;
        }
    } finally {
        setLoadingState(false);
    }
}

// Display search results
function displaySearchResults(results) {
    if (!elements.searchResults) return;
    
    if (results.length === 0) {
        elements.searchResults.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <i class="fas fa-search text-4xl mb-4"></i>
                <p>Không tìm thấy thông tin người leo núi</p>
            </div>
        `;
        return;
    }
    
    // Giới hạn hiển thị 5 kết quả gần nhất
    const limitedResults = results.slice(0, 5);
    const totalCount = results.length;
    
    let html = `
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-blue-800">
                    <i class="fas fa-info-circle mr-2"></i>
                    Tìm thấy ${totalCount} lần đăng ký
                </span>
                ${totalCount > 5 ? `<span class="text-xs text-blue-600">Hiển thị 5 lần gần nhất</span>` : ''}
            </div>
        </div>
    `;
    
    html += limitedResults.map((user, index) => {
        // Đảm bảo tất cả các trường đều có giá trị mặc định
        const safeUser = {
            leaderName: user.leaderName || 'Không có tên',
            phone: user.phone || 'Không có',
            memberCount: user.memberCount || user.groupSize || 0,
            timestamp: user.timestamp || 'Không có',
            trekDate: user.trekDate || 'Không có',
            address: user.address || 'Không có'
        };
        
        return `
        <div class="search-result-item bg-white border border-slate-200 rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                    <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full mr-3">
                        ${index + 1}
                    </span>
                    <h4 class="font-semibold text-slate-800">${safeUser.leaderName}</h4>
                </div>
                <span class="status-badge status-active">
                    Hoạt động
                </span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-slate-600">SĐT:</span>
                    <span class="font-medium">${safeUser.phone}</span>
                </div>
                <div>
                    <span class="text-slate-600">Số thành viên:</span>
                    <span class="font-medium">${safeUser.memberCount}</span>
                </div>
                <div>
                    <span class="text-slate-600">Ngày đăng ký:</span>
                    <span class="font-medium">${safeUser.timestamp}</span>
                </div>
                <div>
                    <span class="text-slate-600">Ngày leo núi:</span>
                    <span class="font-medium">${safeUser.trekDate}</span>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-200">
                <div class="flex items-center justify-between">
                    <span class="text-slate-600">Địa chỉ:</span>
                    <span class="font-medium text-slate-800">${safeUser.address}</span>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    elements.searchResults.innerHTML = html;
}

// ===== GPS SETTINGS =====

// Load GPS settings (legacy - now using combined API)
async function loadGpsSettings() {
    try {
        // Fetch from Netlify Function API
        const response = await fetch(CONFIG.GPS_SETTINGS_API_URL);
        if (response.ok) {
            const result = await response.json();
            gpsSettings = result.data || {
                registrationRadius: CONFIG.DEFAULT_REGISTRATION_RADIUS,
                certificateRadius: CONFIG.DEFAULT_CERTIFICATE_RADIUS,
                requireGpsRegistration: true,
                requireGpsCertificate: true,
                registrationTimeEnabled: false,
                registrationStartTime: '06:00',
                registrationEndTime: '18:00'
            };
        } else {
            // Fallback to localStorage for development
            const stored = localStorage.getItem('climbGpsSettings');
            if (stored) {
                gpsSettings = { ...gpsSettings, ...JSON.parse(stored) };
            }
        }
        
        updateGpsSettingsForm();
        updateGpsStatus();
        
    } catch (error) {
        console.error('Error loading GPS settings:', error);
        // Fallback to localStorage for development
        const stored = localStorage.getItem('climbGpsSettings');
        if (stored) {
            gpsSettings = { ...gpsSettings, ...JSON.parse(stored) };
        }
        updateGpsSettingsForm();
        updateGpsStatus();
    }
}

// Update GPS settings form
function updateGpsSettingsForm() {
    if (elements.registrationRadius) {
        elements.registrationRadius.value = gpsSettings.registrationRadius;
    }
    if (elements.certificateRadius) {
        elements.certificateRadius.value = gpsSettings.certificateRadius;
    }
    if (elements.requireGpsRegistration) {
        elements.requireGpsRegistration.checked = gpsSettings.requireGpsRegistration;
    }
    if (elements.requireGpsCertificate) {
        elements.requireGpsCertificate.checked = gpsSettings.requireGpsCertificate;
    }
    
    // Update registration time settings
    if (elements.registrationTimeEnabled) {
        elements.registrationTimeEnabled.checked = gpsSettings.registrationTimeEnabled;
        toggleRegistrationTimeSettings();
    }
    if (elements.registrationStartTime) {
        elements.registrationStartTime.value = gpsSettings.registrationStartTime;
    }
    if (elements.registrationEndTime) {
        elements.registrationEndTime.value = gpsSettings.registrationEndTime;
    }
}

// Toggle registration time settings visibility
function toggleRegistrationTimeSettings() {
    const isEnabled = elements.registrationTimeEnabled.checked;
    const settingsDiv = elements.registrationTimeSettings;
    
    if (settingsDiv) {
        if (isEnabled) {
            settingsDiv.style.display = 'grid';
            settingsDiv.style.opacity = '1';
        } else {
            settingsDiv.style.display = 'none';
            settingsDiv.style.opacity = '0.5';
        }
    }
}

// Handle save GPS settings
async function handleSaveGpsSettings(e) {
    e.preventDefault();
    
    const newSettings = {
        registrationRadius: parseInt(elements.registrationRadius.value) || CONFIG.DEFAULT_REGISTRATION_RADIUS,
        certificateRadius: parseInt(elements.certificateRadius.value) || CONFIG.DEFAULT_CERTIFICATE_RADIUS,
        requireGpsRegistration: elements.requireGpsRegistration.checked,
        requireGpsCertificate: elements.requireGpsCertificate.checked,
        registrationTimeEnabled: elements.registrationTimeEnabled.checked,
        registrationStartTime: elements.registrationStartTime.value,
        registrationEndTime: elements.registrationEndTime.value
    };
    
    try {
        setLoadingState(true);
        
        // Send to Netlify Function API
        try {
            const response = await fetch(CONFIG.COMBINED_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateGpsSettings',
                    data: newSettings
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save GPS settings');
            }
            
            gpsSettings = newSettings;
            updateGpsStatus();
            
            // Trigger GPS settings refresh on climb page
            try {
                if (window.opener && window.opener.refreshGpsSettings) {
                    window.opener.refreshGpsSettings();
                }
                
                // Also trigger localStorage event for other tabs/windows
                localStorage.setItem('gpsSettings', JSON.stringify(newSettings));
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'gpsSettings',
                    newValue: JSON.stringify(newSettings)
                }));
            } catch (error) {
                console.error('Could not refresh climb page GPS settings:', error);
            }
            
            showMessage('Cài đặt GPS đã được lưu thành công và đồng bộ với hệ thống', 'success');
            
            // Refresh all data to show latest information
            await refreshAllData();
            
        } catch (error) {
            console.error('Error saving GPS settings to server:', error);
            // Fallback to localStorage for development
            gpsSettings = newSettings;
            localStorage.setItem('climbGpsSettings', JSON.stringify(gpsSettings));
            updateGpsStatus();
            showMessage('Cài đặt GPS đã được lưu thành công (chế độ offline)', 'success');
            
            // Refresh all data to show latest information
            await refreshAllData();
        }
        
    } catch (error) {
        console.error('Error saving GPS settings:', error);
        showMessage('Có lỗi khi lưu cài đặt GPS', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Reset GPS settings
function resetGpsSettings() {
    if (confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định?')) {
        gpsSettings = {
            registrationRadius: CONFIG.DEFAULT_REGISTRATION_RADIUS,
            certificateRadius: CONFIG.DEFAULT_CERTIFICATE_RADIUS,
            requireGpsRegistration: true,
            requireGpsCertificate: true,
            registrationTimeEnabled: false,
            registrationStartTime: '06:00',
            registrationEndTime: '18:00'
        };
        
        updateGpsSettingsForm();
        localStorage.setItem('climbGpsSettings', JSON.stringify(gpsSettings));
        updateGpsStatus();
        showMessage('Đã khôi phục cài đặt mặc định', 'success');
    }
}

// Update GPS status
function updateGpsStatus() {
    if (elements.gpsStatus) {
        const isEnabled = gpsSettings.requireGpsRegistration || gpsSettings.requireGpsCertificate;
        elements.gpsStatus.textContent = isEnabled ? 'Bật' : 'Tắt';
        elements.gpsStatus.className = isEnabled ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
    }
}

// ===== STATS AND DATA =====

// Load stats
async function loadStats() {
    try {
        // Fetch from Google Apps Script API
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getInitialStats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            const stats = {
                totalRegistrations: result.data.yearlyCount || 0,
                activeNotifications: notifications.filter(n => n.active).length,
                totalCertificates: result.data.totalCertificates || 0, // Use actual certificate count
                gpsEnabled: gpsSettings.requireGpsRegistration || gpsSettings.requireGpsCertificate
            };
            
            updateStats(stats);
        } else {
            throw new Error(result.message || 'Không thể tải thống kê');
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
        // Show error state instead of old data
        const stats = {
            totalRegistrations: 'Lỗi',
            activeNotifications: notifications.filter(n => n.active).length,
            totalCertificates: 'Lỗi',
            gpsEnabled: gpsSettings.requireGpsRegistration || gpsSettings.requireGpsCertificate
        };
        updateStats(stats);
        showMessage('Không thể tải thống kê. Vui lòng thử lại.', 'error');
    }
}

// Update stats
function updateStats(stats = null) {
    if (!stats) {
        stats = {
            totalRegistrations: '-',  // Show loading indicator instead of old data
            activeNotifications: notifications.filter(n => n.active).length,
            totalCertificates: '-',   // Show loading indicator instead of old data
            gpsEnabled: gpsSettings.requireGpsRegistration || gpsSettings.requireGpsCertificate
        };
    }
    
    if (elements.totalRegistrations) {
        elements.totalRegistrations.textContent = stats.totalRegistrations;
    }
    if (elements.activeNotifications) {
        elements.activeNotifications.textContent = stats.activeNotifications;
    }
    if (elements.totalCertificates) {
        elements.totalCertificates.textContent = stats.totalCertificates;
    }
    if (elements.gpsStatus) {
        elements.gpsStatus.textContent = stats.gpsEnabled ? 'Bật' : 'Tắt';
        elements.gpsStatus.className = stats.gpsEnabled ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
    }
}

// Load recent registrations
async function loadRecentRegistrations() {
    try {
        // Fetch recent registrations from Google Apps Script - limit to 5
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getRecentRegistrations&limit=5`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayRecentRegistrations(result.data);
        } else {
            throw new Error(result.message || 'Không thể tải dữ liệu đăng ký gần đây');
        }
        
    } catch (error) {
        console.error('Error loading recent registrations:', error);
        // Fallback to mock data
        const recentRegistrations = [
            {
                leaderName: 'Nguyễn Văn A',
                phoneNumber: '0123456789',
                birthday: '01/01/1990',
                registrationDate: '15/01/2024',
                registrationTime: '09:30',
                status: 'active'
            },
            {
                leaderName: 'Trần Thị B',
                phoneNumber: '0987654321',
                birthday: '15/05/1985',
                registrationDate: '14/01/2024',
                registrationTime: '14:15',
                status: 'active'
            },
            {
                leaderName: 'Lê Văn C',
                phoneNumber: '0369852147',
                birthday: '20/12/1992',
                registrationDate: '13/01/2024',
                registrationTime: '16:45',
                status: 'pending'
            }
        ];
        
        displayRecentRegistrations(recentRegistrations);
    }
}

// Display recent registrations
function displayRecentRegistrations(registrations) {
    if (!elements.recentRegistrationsTable) return;
    
    if (registrations.length === 0) {
        elements.recentRegistrationsTable.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-slate-500">
                    Không có đăng ký gần đây
                </td>
            </tr>
        `;
        return;
    }
    
    elements.recentRegistrationsTable.innerHTML = registrations.map(registration => `
        <tr class="table-row">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                ${registration.leaderName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                ${registration.phoneNumber}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                ${registration.birthday}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                ${registration.registrationDate}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                ${registration.registrationTime || 'N/A'}
            </td>
        </tr>
    `).join('');
}

// ===== UTILITY FUNCTIONS =====

// Refresh all data
async function refreshAllData(silent = false) {
    try {
        if (!silent) {
            setLoadingState(true);
        }
        
        // Update auto-refresh status
        updateAutoRefreshStatus(true);
        
        // Refresh all data from combined API
        await loadAllDataFromAPI();
        
        // Refresh stats
        await loadStats();
        
        // Refresh recent registrations
        await loadRecentRegistrations();
        
        // Refresh detailed stats
        await loadDetailedStats();
        
        if (!silent) {
            showMessage('Đã làm mới tất cả dữ liệu', 'success');
        }
        
        // Update auto-refresh status
        updateAutoRefreshStatus(false);
        
    } catch (error) {
        console.error('Error refreshing data:', error);
        if (!silent) {
            showMessage('Có lỗi khi làm mới dữ liệu', 'error');
        }
        updateAutoRefreshStatus(false);
    } finally {
        if (!silent) {
            setLoadingState(false);
        }
    }
}

// Update auto-refresh status
function updateAutoRefreshStatus(isRefreshing) {
    const statusElement = document.getElementById('autoRefreshStatus');
    if (statusElement) {
        if (isRefreshing) {
            statusElement.innerHTML = '<i class="fas fa-sync-alt fa-spin mr-1"></i>Đang cập nhật...';
            statusElement.className = 'text-white text-xs opacity-100';
        } else {
            const now = new Date();
            const timeString = now.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            statusElement.innerHTML = `<i class="fas fa-sync-alt mr-1"></i>Cập nhật lúc ${timeString}`;
            statusElement.className = 'text-white text-xs opacity-75';
        }
    }
}

// Show message
function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    messageDiv.className += ` ${bgColor} text-white`;
    
    messageDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => {
        messageDiv.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('translate-x-full');
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.parentElement.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Set loading state
function setLoadingState(loading) {
    const refreshButton = document.getElementById('refreshButton');
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    
    if (refreshButton) {
        if (loading) {
            refreshButton.disabled = true;
            refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Đang tải...';
        } else {
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<i class="fas fa-sync-alt mr-1"></i>Làm mới';
        }
    }
    
    submitButtons.forEach(button => {
        if (loading) {
            button.disabled = true;
            const originalText = button.getAttribute('data-original-text') || button.innerHTML;
            button.setAttribute('data-original-text', originalText);
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
        }
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Get status class
function getStatusClass(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        case 'pending': return 'status-pending';
        default: return 'status-inactive';
    }
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case 'active': return 'Hoạt động';
        case 'inactive': return 'Không hoạt động';
        case 'pending': return 'Chờ xử lý';
        default: return 'Không xác định';
    }
}



// QR Settings Functions
async function loadQRSettings() {
    try {
        // First try to get from localStorage (faster)
        const stored = localStorage.getItem('qrSettings');
        if (stored) {
            const settings = JSON.parse(stored);
            updateQRSettingsForm();
            showMessage('Tải cài đặt QR thành công', 'success');
            return;
        }
        
        // Fallback to API call
        const response = await fetch('/.netlify/functions/combined-data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải cài đặt QR');
        }
        
        const result = await response.json();
        const settings = result.qrSettings.data;
        
        // Store in localStorage for future use
        localStorage.setItem('qrSettings', JSON.stringify(settings));
        
        // Update form
        updateQRSettingsForm();
        
        showMessage('Tải cài đặt QR thành công', 'success');
    } catch (error) {
        console.error('Error loading QR settings:', error);
        showMessage('Lỗi khi tải cài đặt QR: ' + error.message, 'error');
    }
}

async function saveQRSettings(event) {
    event.preventDefault();
    
    const expirationHours = parseInt(document.getElementById('expirationHours').value);
    const targetUrl = document.getElementById('targetUrl').value;
    
    // Validation
    if (!expirationHours || expirationHours < 1 || expirationHours > 168) {
        showMessage('Thời gian hiệu lực phải từ 1 đến 168 giờ', 'error');
        return;
    }
    
    if (!targetUrl || !targetUrl.startsWith('http')) {
        showMessage('URL trang đích không hợp lệ', 'error');
        return;
    }
    
    try {
        setLoadingState(true);
        
        const response = await fetch('/.netlify/functions/combined-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'updateQrSettings',
                data: {
                    expirationHours: expirationHours,
                    targetUrl: targetUrl
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi lưu cài đặt');
        }
        
        const result = await response.json();
        
        // Store updated settings in localStorage
        const updatedSettings = {
            expirationHours: expirationHours,
            targetUrl: targetUrl,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('qrSettings', JSON.stringify(updatedSettings));
        
        // Update form display
        updateQRSettingsForm();
        
        showMessage('Lưu cài đặt QR thành công', 'success');
    } catch (error) {
        console.error('Error saving QR settings:', error);
        showMessage('Lỗi khi lưu cài đặt QR: ' + error.message, 'error');
    } finally {
        setLoadingState(false);
    }
}

// Initialize QR settings form
function initQRSettings() {
    const form = document.getElementById('qrSettingsForm');
    if (form) {
        form.addEventListener('submit', saveQRSettings);
        // Don't load here, will be loaded by loadAllDataFromAPI
    }
}

// Update QR settings form with current data
function updateQRSettingsForm() {
    const stored = localStorage.getItem('qrSettings');
    if (stored) {
        const settings = JSON.parse(stored);
        
        // Populate form fields
        const expirationHoursInput = document.getElementById('expirationHours');
        const targetUrlInput = document.getElementById('targetUrl');
        
        if (expirationHoursInput) {
            expirationHoursInput.value = settings.expirationHours;
        }
        if (targetUrlInput) {
            targetUrlInput.value = settings.targetUrl;
        }
        
        // Update info display
        const currentExpiration = document.getElementById('currentExpiration');
        const currentTargetUrl = document.getElementById('currentTargetUrl');
        const lastUpdated = document.getElementById('lastUpdated');
        
        if (currentExpiration) {
            currentExpiration.textContent = `${settings.expirationHours} giờ`;
        }
        if (currentTargetUrl) {
            currentTargetUrl.textContent = settings.targetUrl;
        }
        if (lastUpdated) {
            lastUpdated.textContent = new Date(settings.lastUpdated).toLocaleString('vi-VN');
        }
    }
}

// ===== MANUAL CERTIFICATE GENERATION =====

// Initialize manual certificate form
function initializeManualCertificateForm() {
    const form = document.getElementById('manualCertificateForm');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const resetFormBtn = document.getElementById('resetManualFormBtn');
    const loadDataBtn = document.getElementById('loadDataBtn');
    
    if (form) {
        form.addEventListener('submit', handleManualCertificateGeneration);
    }
    
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', addManualMember);
    }
    
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetManualForm);
    }
    
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', loadRegistrationDataByPhone);
    }
    
    // Add event listener for phone number input to auto-load data on Enter
    const phoneInput = document.getElementById('manualPhone');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadRegistrationDataByPhone();
            }
        });
    }
}

// Add new member to manual certificate form
function addManualMember() {
    const memberList = document.getElementById('manualMemberList');
    if (!memberList) return;
    
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item flex items-center space-x-3 p-3 border border-slate-200 rounded-lg';
    memberItem.innerHTML = `
        <input type="checkbox" class="member-checkbox h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded" checked>
        <input type="text" class="member-name flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Họ tên thành viên" required>
        <button type="button" class="remove-member text-red-600 hover:text-red-800">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    memberList.appendChild(memberItem);
    
    // Add event listeners
    const removeBtn = memberItem.querySelector('.remove-member');
    const nameInput = memberItem.querySelector('.member-name');
    
    removeBtn.addEventListener('click', () => {
        memberItem.remove();
        updateManualPhotoUploads();
    });
    
    nameInput.addEventListener('input', () => {
        updateManualPhotoUploads();
    });
    
    updateManualPhotoUploads();
}

// Update photo upload sections based on member list
function updateManualPhotoUploads() {
    const memberList = document.getElementById('manualMemberList');
    const photoUploads = document.getElementById('manualPhotoUploads');
    
    if (!memberList || !photoUploads) return;
    
    const memberItems = memberList.querySelectorAll('.member-item');
    photoUploads.innerHTML = '';
    
    memberItems.forEach((item, index) => {
        const memberName = item.querySelector('.member-name').value || `Thành viên ${index + 1}`;
        
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-upload-item flex items-center space-x-3 p-3 border border-slate-200 rounded-lg';
        photoItem.innerHTML = `
            <input type="text" class="photo-name flex-1 px-3 py-2 border border-slate-300 rounded-lg" value="${memberName}" readonly>
            <input type="file" class="photo-file" accept="image/*" style="display: none;">
            <button type="button" class="select-photo bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                <i class="fas fa-image mr-1"></i>Chọn ảnh
            </button>
            <span class="photo-status text-sm text-gray-500">Chưa chọn ảnh</span>
        `;
        
        photoUploads.appendChild(photoItem);
        
        // Add event listeners
        const selectBtn = photoItem.querySelector('.select-photo');
        const fileInput = photoItem.querySelector('.photo-file');
        const status = photoItem.querySelector('.photo-status');
        
        selectBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                status.textContent = e.target.files[0].name;
                status.className = 'photo-status text-sm text-green-600';
            }
        });
    });
}

// Reset manual certificate form
function resetManualForm() {
    const form = document.getElementById('manualCertificateForm');
    const result = document.getElementById('manualCertResult');
    
    // Hide all sections
    const loadedDataSection = document.getElementById('loadedDataSection');
    const loadingData = document.getElementById('loadingData');
    const errorData = document.getElementById('errorData');
    
    if (loadedDataSection) loadedDataSection.classList.add('hidden');
    if (loadingData) loadingData.classList.add('hidden');
    if (errorData) errorData.classList.add('hidden');
    
    if (form) {
        form.reset();
    }
    
    if (result) {
        result.classList.add('hidden');
    }
    
    // Clear member list
    const memberList = document.getElementById('manualMemberList');
    if (memberList) {
        memberList.innerHTML = '';
    }
    
    // Clear photo uploads
    const photoUploads = document.getElementById('manualPhotoUploads');
    if (photoUploads) {
        photoUploads.innerHTML = '';
    }
    
    showMessage('Đã làm mới form', 'success');
}

// Load registration data by phone number
async function loadRegistrationDataByPhone() {
    const phoneInput = document.getElementById('manualPhone');
    const emailInput = document.getElementById('manualEmail');
    const dateInput = document.getElementById('manualClimbDate');
    const timeInput = document.getElementById('manualClimbTime');
    const durationInput = document.getElementById('manualDuration');
    
    // Show/hide sections
    const loadedDataSection = document.getElementById('loadedDataSection');
    const loadingData = document.getElementById('loadingData');
    const errorData = document.getElementById('errorData');
    
    if (!phoneInput || !phoneInput.value.trim()) {
        showMessage('Vui lòng nhập số điện thoại', 'error');
        return;
    }
    
    const phoneNumber = phoneInput.value.trim();
    if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
        showMessage('Số điện thoại không hợp lệ', 'error');
        return;
    }
    
    // Show loading state
    if (loadedDataSection) loadedDataSection.classList.add('hidden');
    if (errorData) errorData.classList.add('hidden');
    if (loadingData) loadingData.classList.remove('hidden');
    
    try {
        // Get members list
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getMembersByPhone&phone=${encodeURIComponent(phoneNumber)}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('getMembersByPhone response:', result);
            
            // Check if we have valid data structure
            if (result.success && result.data && result.data.success && result.data.data && result.data.data.members && result.data.data.members.length > 0) {
                // Update member list
                const memberList = document.getElementById('manualMemberList');
                if (memberList) {
                    memberList.innerHTML = '';
                    
                    result.data.data.members.forEach((memberName, index) => {
                        const memberItem = document.createElement('div');
                        memberItem.className = 'member-item flex items-center space-x-3 p-3 border border-slate-200 rounded-lg';
                        memberItem.innerHTML = `
                            <input type="checkbox" class="member-checkbox h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded" checked>
                            <input type="text" class="member-name flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" value="${memberName}" required>
                            <button type="button" class="remove-member text-red-600 hover:text-red-800">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                        
                        memberList.appendChild(memberItem);
                        
                        // Add event listeners
                        const removeBtn = memberItem.querySelector('.remove-member');
                        const nameInput = memberItem.querySelector('.member-name');
                        
                        removeBtn.addEventListener('click', () => {
                            memberItem.remove();
                            updateManualPhotoUploads();
                        });
                        
                        nameInput.addEventListener('input', () => {
                            updateManualPhotoUploads();
                        });
                    });
                    
                    updateManualPhotoUploads();
                }
                
                // Get registration details for email and date
                const regResponse = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=searchPhone&phone=${encodeURIComponent(phoneNumber)}`);
                
                if (regResponse.ok) {
                    const regResult = await regResponse.json();
                    
                    if (regResult.success && regResult.data && regResult.data.length > 0) {
                        const registration = regResult.data[0]; // Get most recent
                        
                        // Map data from searchPhone response to form fields
                        // searchPhone returns: timestamp, registrationTime, leaderName, email, phone, memberCount, trekDate, address, certificateCount
                        if (emailInput) {
                            // Use email from searchPhone response
                            emailInput.value = registration.email && registration.email !== '(không có)' ? registration.email : '';
                        }
                        
                        if (dateInput && registration.trekDate && registration.trekDate !== '(không có)') {
                            // Convert DD/MM/YYYY to YYYY-MM-DD for date input
                            const dateParts = registration.trekDate.split('/');
                            if (dateParts.length === 3) {
                                const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
                                dateInput.value = formattedDate;
                            }
                        }
                        
                        // Populate climb time with registration time from searchPhone response
                        if (timeInput && registration.registrationTime && registration.registrationTime !== '(không có)') {
                            timeInput.value = registration.registrationTime;
                        }
                        
                        // Duration is not available in searchPhone response, so leave empty
                        if (durationInput) {
                            durationInput.value = '';
                        }
                    }
                }
                
                // Show success state
                if (loadingData) loadingData.classList.add('hidden');
                if (loadedDataSection) loadedDataSection.classList.remove('hidden');
                
                showMessage(`Đã tải ${result.data.data.members.length} thành viên từ đăng ký gốc`, 'success');
                
            } else {
                // No data found
                console.log('Data structure check failed:', {
                    resultSuccess: result.success,
                    hasData: !!result.data,
                    dataSuccess: result.data?.success,
                    hasDataData: !!result.data?.data,
                    hasMembers: !!result.data?.data?.members,
                    membersLength: result.data?.data?.members?.length
                });
                
                if (loadingData) loadingData.classList.add('hidden');
                if (errorData) {
                    errorData.classList.remove('hidden');
                    const errorMessage = document.getElementById('errorMessage');
                    if (errorMessage) {
                        errorMessage.textContent = result.message || 'Không tìm thấy thông tin đăng ký cho số điện thoại này';
                    }
                }
            }
        } else {
            throw new Error(`Network error: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error loading registration data:', error);
        
        // Show error state
        if (loadingData) loadingData.classList.add('hidden');
        if (errorData) {
            errorData.classList.remove('hidden');
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = `Không thể tải dữ liệu đăng ký: ${error.message}. Vui lòng thử lại.`;
            }
        }
    }
}

// Handle manual certificate generation
async function handleManualCertificateGeneration(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('generateManualCertBtn');
    const spinner = document.getElementById('manualCertSpinner');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const phoneNumber = document.getElementById('manualPhone').value.trim();
    const email = document.getElementById('manualEmail').value.trim();
    const climbDate = document.getElementById('manualClimbDate').value;
    const climbTime = document.getElementById('manualClimbTime').value;
    const duration = document.getElementById('manualDuration').value;
    const notes = document.getElementById('manualNotes').value.trim();
    
    // Collect selected members
    const memberItems = document.querySelectorAll('#manualMemberList .member-item');
    const selectedMembers = [];
    
    // Process members and photos asynchronously
    const memberPromises = memberItems.map(async (item, index) => {
        const checkbox = item.querySelector('.member-checkbox');
        const nameInput = item.querySelector('.member-name');
        
        if (checkbox.checked && nameInput.value.trim()) {
            const memberName = nameInput.value.trim();
            const photoFile = document.querySelector(`#manualPhotoUploads .photo-upload-item:nth-child(${index + 1}) .photo-file`);
            
            const memberData = {
                name: memberName,
                photoData: null
            };
            
            // Convert photo to base64 if exists
            if (photoFile && photoFile.files[0]) {
                const file = photoFile.files[0];
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        memberData.photoData = e.target.result;
                        resolve(memberData);
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                return memberData;
            }
        }
        return null;
    });
    
    const resolvedMembers = await Promise.all(memberPromises);
    selectedMembers.push(...resolvedMembers.filter(member => member !== null));
    
    if (selectedMembers.length === 0) {
        showMessage('Vui lòng chọn ít nhất một thành viên', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    
    try {
        // Call Google Apps Script API
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'generateCertificatesWithPhotos',
                phone: phoneNumber,
                members: selectedMembers,
                manualData: {
                    email: email,
                    climbDate: climbDate,
                    climbTime: climbTime,
                    duration: duration,
                    notes: notes
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Lỗi kết nối server');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Show success result
            const resultDiv = document.getElementById('manualCertResult');
            const detailsDiv = document.getElementById('manualCertDetails');
            
            if (resultDiv && detailsDiv) {
                detailsDiv.innerHTML = `
                    <p><strong>Thành công:</strong> ${result.message}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Số chứng chỉ:</strong> ${result.stats?.success || 0}</p>
                    <p><strong>Thời gian:</strong> ${result.stats?.timeSeconds || 0} giây</p>
                    ${result.pdfLinks && result.pdfLinks.length > 0 ? `
                        <div class="mt-3">
                            <p class="font-semibold">Link chứng chỉ:</p>
                            <ul class="list-disc list-inside space-y-1">
                                ${result.pdfLinks.map(link => `
                                    <li><a href="${link.url}" target="_blank" class="text-blue-600 hover:underline">${link.name}</a></li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `;
                
                resultDiv.classList.remove('hidden');
                resultDiv.scrollIntoView({ behavior: 'smooth' });
            }
            
            showMessage('Tạo chứng chỉ thành công!', 'success');
        } else {
            showMessage(result.message || 'Có lỗi khi tạo chứng chỉ', 'error');
        }
        
    } catch (error) {
        console.error('Error generating manual certificate:', error);
        showMessage('Lỗi khi tạo chứng chỉ: ' + error.message, 'error');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
    }
}

// Export functions for global access
window.searchUser = searchUser;
window.clearNotificationForm = clearNotificationForm;
window.toggleNotification = toggleNotification;
window.deleteNotification = deleteNotification;
window.resetGpsSettings = resetGpsSettings;
window.refreshAllData = refreshAllData;
window.loadQRSettings = loadQRSettings;
window.saveQRSettings = saveQRSettings;
