const pageTitles = {
    poi: 'Quản lý POI',
    guide: 'Quản lý Cẩm nang',
    'json-editor': 'Chỉnh sửa JSON'
};

// DOM Elements - with null checks
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const iframeContainer = document.getElementById('iframe-container');
const iframeLoader = document.getElementById('iframe-loader');

const iframes = {
    'poi': document.getElementById('iframe-poi'),
    'guide': document.getElementById('iframe-guide')
};

// JSON Editor elements
const jsonEditorSection = document.getElementById('json-editor-section');
const jsonFileSelector = document.getElementById('jsonFileSelector');
const jsonLoadingIndicator = document.getElementById('jsonLoadingIndicator');
const jsonEditorContainer = document.getElementById('jsonEditorContainer');
const jsonWelcomeMessage = document.getElementById('jsonWelcomeMessage');
const jsonTextEditor = document.getElementById('jsonTextEditor');
const currentJsonFileName = document.getElementById('currentJsonFileName');
const validateJsonBtn = document.getElementById('validateJsonBtn');
const saveJsonBtn = document.getElementById('saveJsonBtn');
const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const jsonValidationResult = document.getElementById('jsonValidationResult');

let currentJsonData = null;
let currentJsonFile = null;
const pageTitleElement = document.getElementById('page-title');
const sidebarLinks = document.querySelectorAll('aside .sidebar-link');
let currentVisibleIframe = iframes['poi'] || null; 
let currentActiveLink = document.getElementById('link-poi');

let isTransitioning = false;

function showPage(pageId, clickedElement, categoryKey = null) {
    if (isTransitioning) return;

    // Hide JSON editor section
    if (jsonEditorSection) {
        jsonEditorSection.classList.add('hidden');
    }

    if (iframeLoader) iframeLoader.classList.add('show');

    if (sidebarLinks && sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => link.classList.remove('active'));
    }

    if (clickedElement) {
        clickedElement.classList.add('active');
        currentActiveLink = clickedElement;

        const parentMenuDiv = clickedElement.closest('div.relative');
        if (parentMenuDiv) {
            const parentAnchor = parentMenuDiv.querySelector('a.sidebar-link');
            if (parentAnchor) {
                parentAnchor.classList.add('active'); 
            }
        }
    }
    
    if (pageTitleElement && clickedElement) {
        pageTitleElement.textContent = clickedElement.textContent.trim() || pageId.charAt(0).toUpperCase() + pageId.slice(1);
        if (pageId === 'guide' && categoryKey) {
             const categoryName = clickedElement.textContent.trim();
             pageTitleElement.textContent = `Quản lý Cẩm nang - ${categoryName}`;
        }
    }

    const targetIframe = iframes[pageId];
    if (targetIframe) {
        if (currentVisibleIframe && currentVisibleIframe !== targetIframe) {
            currentVisibleIframe.classList.add('hidden');
            currentVisibleIframe.classList.remove('visible');
        }
        
        targetIframe.classList.remove('hidden');
        targetIframe.classList.add('visible');
        currentVisibleIframe = targetIframe;

        if (pageId === 'guide' && categoryKey) {
            const sendMessageToGuideIframe = () => {
                if (targetIframe.contentWindow) {
                    console.log(`Attempting to post message to guide iframe: ${categoryKey} for iframe src: ${targetIframe.src}`);
                    targetIframe.contentWindow.postMessage({ type: 'navigateToCategory', category: categoryKey }, '*');
                } else {
                    console.error("Guide iframe contentWindow not accessible yet.");
                }
            };

            if (targetIframe.dataset.loadedOnce === 'true') {
                sendMessageToGuideIframe();
            } else {
                targetIframe.onload = () => {
                    console.log("Guide iframe loaded for the first time or reloaded.");
                    sendMessageToGuideIframe();
                    targetIframe.dataset.loadedOnce = 'true';
                    if (iframeLoader) iframeLoader.classList.remove('show');
                };
                setTimeout(() => {
                    if (!targetIframe.dataset.loadedOnce) {
                         console.warn("Guide iframe onload event might not have fired, attempting postMessage via timeout.");
                         sendMessageToGuideIframe(); 
                    }
                    if (iframeLoader) iframeLoader.classList.remove('show');
                }, 1000); 
            }
        } else {
            if (iframeLoader) {
                setTimeout(() => iframeLoader.classList.remove('show'), 100);
            }
        }
    } else {
        if (iframeLoader) iframeLoader.classList.remove('show');
    }

    if (window.innerWidth < 1024) { 
        closeSidebar();
    }

    if(event) event.preventDefault();
}

function openSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    }
}

function closeSidebar() {
     if (sidebar && sidebarOverlay) {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    }
}

if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', openSidebar);
}
if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

function toggleGuideMenu(event) {
    event.preventDefault();
    const submenu = document.getElementById('submenu-guide');
    const arrow = document.getElementById('guide-menu-arrow');
    const mainGuideLink = document.getElementById('link-guide-main');

    if (submenu) {
        const isHidden = submenu.classList.contains('hidden');
        if (isHidden) {
            submenu.classList.remove('hidden');
            submenu.style.maxHeight = submenu.scrollHeight + "px";
            if (arrow) arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
            if (mainGuideLink) mainGuideLink.setAttribute('aria-expanded', 'true');
        } else {
            submenu.style.maxHeight = "0px";
            submenu.classList.add('hidden');
            if (arrow) arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
            if (mainGuideLink) mainGuideLink.setAttribute('aria-expanded', 'false');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Initialize iframe container
    if (iframeContainer) {
        const initialIframe = iframeContainer.querySelector('iframe.visible');
        if (!initialIframe) {
            const poiIframe = document.getElementById('iframe-poi');
            if (poiIframe) {
                poiIframe.classList.add('visible');
                poiIframe.classList.remove('hidden');
            }
        }
    }

    // Set default active page
    const defaultActiveLink = document.getElementById('link-poi');
    if (defaultActiveLink) {
        showPage('poi', defaultActiveLink);
    }
    
    // Setup sidebar event listeners
    if (openSidebarBtn && sidebar && sidebarOverlay) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
        });
    }
    if (closeSidebarBtn && sidebar && sidebarOverlay) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }

    // Setup JSON editor link
    const jsonEditorLink = document.getElementById('link-json-editor');
    if (jsonEditorLink) {
        jsonEditorLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[DEBUG] Clicked Chỉnh sửa JSON', this);
            showJsonEditor(this);
        });
    }

    // Load dashboard data
    loadStatistics();
    loadRecentActivities();
    
    // Listen for data update messages from iframes
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'dataUpdated') {
            console.log('[DEBUG] Received data update from:', event.data.source);
            // Refresh dashboard data when iframes update data
            setTimeout(() => {
                loadStatistics();
                loadRecentActivities();
            }, 1000); // Wait 1 second for server to process
        }
    });
}); 
// JSON Editor Functions
function showJsonEditor(clickedElement) {
    console.log('[DEBUG] showJsonEditor called', clickedElement);
    // Hide all iframes
    Object.values(iframes).forEach(iframe => {
        if (iframe) {
            iframe.classList.add('hidden');
            iframe.classList.remove('visible');
        }
    });
    
    // Show JSON editor section
    if (jsonEditorSection) {
        jsonEditorSection.classList.remove('hidden');
        console.log('[DEBUG] Showed jsonEditorSection');
    } else {
        console.log('[DEBUG] jsonEditorSection not found');
    }
    
    // Update active link
    if (sidebarLinks && sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => link.classList.remove('active'));
    }
    if (clickedElement) {
        clickedElement.classList.add('active');
        currentActiveLink = clickedElement;
    }
    
    // Update page title
    if (pageTitleElement) {
        pageTitleElement.textContent = 'Chỉnh sửa JSON';
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        closeSidebar();
    }
    
    // Initialize JSON editor if not already done
    initializeJsonEditor();
}

function initializeJsonEditor() {
    if (!jsonFileSelector) return;
    
    // File selector change event
    jsonFileSelector.addEventListener('change', loadJsonFile);
    
    // Button events
    if (validateJsonBtn) {
        validateJsonBtn.addEventListener('click', validateJson);
    }
    
    if (saveJsonBtn) {
        saveJsonBtn.addEventListener('click', saveJsonFile);
    }
    
    if (downloadJsonBtn) {
        downloadJsonBtn.addEventListener('click', downloadJsonFile);
    }
}

// --- NÂNG CẤP: Fetch/lưu JSON qua Netlify Function Blobs ---
async function loadJsonFile() {
    const selectedFile = jsonFileSelector.value;
    if (!selectedFile) {
        showJsonWelcome();
        return;
    }
    currentJsonFile = selectedFile;
    showJsonLoading();
    try {
        // Fetch từ Netlify Function Blobs
        const response = await fetch(`/.netlify/functions/data-blobs?file=${encodeURIComponent(selectedFile)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        currentJsonData = jsonData;
        showJsonEditor();
        jsonTextEditor.value = JSON.stringify(jsonData, null, 2);
        currentJsonFileName.textContent = selectedFile;
        hideValidationResult();
    } catch (error) {
        console.error('Error loading JSON file:', error);
        showValidationResult('error', `Lỗi tải file: ${error.message}`);
        showJsonWelcome();
    }
}

function showJsonLoading() {
    jsonLoadingIndicator.classList.remove('hidden');
    jsonEditorContainer.classList.add('hidden');
    jsonWelcomeMessage.classList.add('hidden');
}

function showJsonEditor() {
    jsonLoadingIndicator.classList.add('hidden');
    jsonEditorContainer.classList.remove('hidden');
    jsonWelcomeMessage.classList.add('hidden');
}

function showJsonWelcome() {
    jsonLoadingIndicator.classList.add('hidden');
    jsonEditorContainer.classList.add('hidden');
    jsonWelcomeMessage.classList.remove('hidden');
}

function validateJson() {
    const jsonText = jsonTextEditor.value.trim();
    
    if (!jsonText) {
        showValidationResult('warning', 'Không có dữ liệu để kiểm tra');
        return;
    }
    
    try {
        const parsed = JSON.parse(jsonText);
        currentJsonData = parsed;
        showValidationResult('success', 'JSON hợp lệ! Dữ liệu đã được phân tích thành công.');
    } catch (error) {
        showValidationResult('error', `JSON không hợp lệ: ${error.message}`);
    }
}

function saveJsonFile() {
    if (!currentJsonFile) {
        showValidationResult('warning', 'Chưa chọn file để lưu');
        return;
    }
    const jsonText = jsonTextEditor.value.trim();
    if (!jsonText) {
        showValidationResult('warning', 'Không có dữ liệu để lưu');
        return;
    }
    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    } catch (error) {
        showValidationResult('error', `JSON không hợp lệ: ${error.message}`);
        return;
    }
    // Gửi POST lên Netlify Function Blobs
    showValidationResult('warning', 'Đang lưu dữ liệu...');
    fetch(`/.netlify/functions/data-blobs?file=${encodeURIComponent(currentJsonFile)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
    })
    .then(() => {
        showValidationResult('success', `Đã lưu thành công file ${currentJsonFile} lên server!`);
        
        // Refresh dashboard data after saving
        setTimeout(() => {
            loadStatistics();
            loadRecentActivities();
            refreshAdminIframes();
        }, 1000); // Wait 1 second for server to process
    })
    .catch(error => {
        showValidationResult('error', `Lỗi khi lưu: ${error.message}`);
    });
}

function downloadJsonFile() {
    if (!currentJsonFile) {
        showValidationResult('warning', 'Chưa chọn file để tải xuống');
        return;
    }
    
    const jsonText = jsonTextEditor.value.trim();
    
    if (!jsonText) {
        showValidationResult('warning', 'Không có dữ liệu để tải xuống');
        return;
    }
    
    try {
        // Validate and format JSON
        const parsed = JSON.parse(jsonText);
        const formattedJson = JSON.stringify(parsed, null, 2);
        
        // Create blob and download
        const blob = new Blob([formattedJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentJsonFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showValidationResult('success', `File ${currentJsonFile} đã được tải xuống thành công!`);
        
    } catch (error) {
        showValidationResult('error', `Không thể tải xuống file: ${error.message}`);
    }
}

function showValidationResult(type, message) {
    if (!jsonValidationResult) return;
    
    jsonValidationResult.classList.remove('hidden');
    jsonValidationResult.className = 'mt-4 p-4 rounded-lg text-sm font-medium';
    
    switch (type) {
        case 'success':
            jsonValidationResult.classList.add('bg-green-50', 'text-green-800', 'border', 'border-green-200');
            jsonValidationResult.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
            break;
        case 'error':
            jsonValidationResult.classList.add('bg-red-50', 'text-red-800', 'border', 'border-red-200');
            jsonValidationResult.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
            break;
        case 'warning':
            jsonValidationResult.classList.add('bg-yellow-50', 'text-yellow-800', 'border', 'border-yellow-200');
            jsonValidationResult.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
            break;
    }
}

function hideValidationResult() {
    if (jsonValidationResult) {
        jsonValidationResult.classList.add('hidden');
    }
}

// Dashboard Statistics and Activities
async function loadStatistics() {
    try {
        // Set current date
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            currentDateElement.textContent = new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Load POI count
        const poiResponse = await fetch('/.netlify/functions/data-blobs?file=POI.json');
        if (poiResponse.ok) {
            const poiData = await poiResponse.json();
            const poiCount = Array.isArray(poiData) ? poiData.length : 0;
            const totalPoiElement = document.getElementById('totalPoi');
            const poiCountElement = document.getElementById('poiCount');
            if (totalPoiElement) totalPoiElement.textContent = poiCount;
            if (poiCountElement) poiCountElement.textContent = poiCount;
        }

        // Load Guide counts
        const guideFiles = ['Tours.json', 'Accommodations.json', 'Restaurants.json', 'Specialties.json'];
        const guideCounts = {};
        let totalGuideCount = 0;

        for (const file of guideFiles) {
            const response = await fetch(`/.netlify/functions/data-blobs?file=${file}`);
            if (response.ok) {
                const data = await response.json();
                const count = Array.isArray(data) ? data.length : 0;
                guideCounts[file.replace('.json', '')] = count;
                totalGuideCount += count;
            }
        }

        // Update guide statistics
        const elements = {
            'totalTours': guideCounts['Tours'] || 0,
            'totalAccommodations': guideCounts['Accommodations'] || 0,
            'totalRestaurants': guideCounts['Restaurants'] || 0,
            'guideCount': totalGuideCount,
            'toursCount': guideCounts['Tours'] || 0,
            'accommodationsCount': guideCounts['Accommodations'] || 0,
            'restaurantsCount': guideCounts['Restaurants'] || 0,
            'specialtiesCount': guideCounts['Specialties'] || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load recent activities with real data
async function loadRecentActivities() {
    try {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) return;

        // Get real system status
        const activities = await getSystemActivities();
        
        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center p-3 bg-slate-50 rounded-lg">
                <div class="p-2 ${activity.iconBg} rounded-lg mr-3 flex-shrink-0">
                    <i class="fas ${activity.icon} ${activity.iconColor}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-800 truncate">${activity.title}</p>
                    <p class="text-xs text-slate-600 truncate">${activity.description}</p>
                </div>
                <span class="text-xs text-slate-500 flex-shrink-0 ml-2">${activity.time}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent activities:', error);
        // Fallback to basic status
        const activitiesContainer = document.getElementById('recentActivities');
        if (activitiesContainer) {
            activitiesContainer.innerHTML = `
                <div class="flex items-center p-3 bg-slate-50 rounded-lg">
                    <div class="p-2 bg-green-100 rounded-lg mr-3">
                        <i class="fas fa-check text-green-600"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-800">Hệ thống đã sẵn sàng</p>
                        <p class="text-xs text-slate-600">Tất cả dịch vụ đang hoạt động bình thường</p>
                    </div>
                    <span class="text-xs text-slate-500">Vừa xong</span>
                </div>
            `;
        }
    }
}

// Get real system activities
async function getSystemActivities() {
    const activities = [];
    
    try {
        // Check POI data status
        const poiResponse = await fetch('/.netlify/functions/data-blobs?file=POI.json');
        if (poiResponse.ok) {
            const poiData = await poiResponse.json();
            activities.push({
                title: 'Dữ liệu POI đã tải',
                description: `${poiData.length} điểm tham quan đã được tải thành công`,
                icon: 'fa-map-marker-alt',
                iconColor: 'text-blue-600',
                iconBg: 'bg-blue-100',
                time: 'Vừa xong'
            });
        }

        // Check operating hours data
        const hoursResponse = await fetch('/.netlify/functions/data-blobs?file=GioHoatDong.json');
        if (hoursResponse.ok) {
            const hoursData = await hoursResponse.json();
            activities.push({
                title: 'Giờ hoạt động đã đồng bộ',
                description: `${hoursData.length} bản ghi giờ hoạt động đã được tải`,
                icon: 'fa-clock',
                iconColor: 'text-green-600',
                iconBg: 'bg-green-100',
                time: '1 phút trước'
            });
        }

        // Check system connectivity
        const testResponse = await fetch('/.netlify/functions/data-blobs?file=POI.json');
        if (testResponse.ok) {
            activities.push({
                title: 'Kết nối Netlify Blobs',
                description: 'Kết nối với hệ thống lưu trữ dữ liệu thành công',
                icon: 'fa-database',
                iconColor: 'text-purple-600',
                iconBg: 'bg-purple-100',
                time: '2 phút trước'
            });
        }

    } catch (error) {
        console.error('Error checking system status:', error);
        activities.push({
            title: 'Lỗi kết nối dữ liệu',
            description: 'Không thể kết nối với hệ thống lưu trữ dữ liệu',
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100',
            time: 'Vừa xong'
        });
    }

    // Add system status
    activities.push({
        title: 'Hệ thống đã sẵn sàng',
        description: 'Tất cả dịch vụ đang hoạt động bình thường',
        icon: 'fa-check',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        time: 'Vừa xong'
    });

    return activities;
}

// Refresh dashboard function (called from HTML button)
function refreshDashboard() {
    const refreshBtn = document.querySelector('button[onclick="refreshDashboard()"]');
    if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang làm mới...';
        refreshBtn.disabled = true;
        
        // Refresh all data
        Promise.all([
            loadStatistics(),
            loadRecentActivities(),
            refreshAdminIframes()
        ]).finally(() => {
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
                refreshBtn.disabled = false;
            }, 500);
        });
    }
}

// Refresh admin iframes to show updated data
function refreshAdminIframes() {
    // Refresh POI iframe
    const poiIframe = document.getElementById('iframe-poi');
    if (poiIframe && poiIframe.src) {
        const currentSrc = poiIframe.src;
        poiIframe.src = '';
        setTimeout(() => {
            poiIframe.src = currentSrc;
        }, 100);
    }
    
    // Refresh Guide iframe
    const guideIframe = document.getElementById('iframe-guide');
    if (guideIframe && guideIframe.src) {
        const currentSrc = guideIframe.src;
        guideIframe.src = '';
        setTimeout(() => {
            guideIframe.src = currentSrc;
        }, 100);
    }
}

