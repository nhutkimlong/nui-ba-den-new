const pageTitles = {
    poi: 'Quản lý POI',
    guide: 'Quản lý Cẩm nang',
    'json-editor': 'Chỉnh sửa JSON'
};

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
let currentVisibleIframe = iframes['poi']; 
let currentActiveLink = document.getElementById('link-poi');

let isTransitioning = false;

function showPage(pageId, clickedElement, categoryKey = null) {
    if (isTransitioning) return;

    // Hide JSON editor section
    if (jsonEditorSection) {
        jsonEditorSection.classList.add('hidden');
    }

    if (iframeLoader) iframeLoader.classList.add('show');

    sidebarLinks.forEach(link => link.classList.remove('active'));

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

document.getElementById('currentYear').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    const initialIframe = iframeContainer.querySelector('iframe.visible');
    if (!initialIframe) {
        const poiIframe = document.getElementById('iframe-poi');
        if (poiIframe) {
            poiIframe.classList.add('visible');
            poiIframe.classList.remove('hidden');
        }
    }

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const defaultActiveLink = document.getElementById('link-poi');
    if (defaultActiveLink) {
        showPage('poi', defaultActiveLink);
    }
    
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

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

    // Đảm bảo nút Chỉnh sửa JSON luôn hoạt động
    const jsonEditorLink = document.getElementById('link-json-editor');
    if (jsonEditorLink) {
        jsonEditorLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[DEBUG] Clicked Chỉnh sửa JSON', this);
            showJsonEditor(this);
        });
    }
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
    sidebarLinks.forEach(link => link.classList.remove('active'));
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