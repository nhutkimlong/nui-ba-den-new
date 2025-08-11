let currentLoadToken = 0;
let hasInitialContentLoaded = false; // True once the first category data is successfully rendered

document.addEventListener('DOMContentLoaded', function () {
    // IMPORTANT: Replace with your new Web App URL after deploying code.gs
    const LOCAL_DATA_URLS = {
        tours: '../../../data/Tours.json',
        accommodations: '../../../data/Accommodations.json',
        restaurants: '../../../data/Restaurants.json',
        specialties: '../../../data/Specialties.json'
    }; 
    const DEFAULT_TAB = 'tours';

    // Sheet names in Google Sheets corresponding to tabs
    const SHEET_MAP = {
        tours: 'Tours',
        accommodations: 'Accommodations',
        restaurants: 'Restaurants',
        specialties: 'Specialties'
    };

    // --- UPDATED: API URLs for dynamic CRUD ---
    const API_URLS = {
        tours: '/.netlify/functions/data-blobs?file=Tours.json',
        accommodations: '/.netlify/functions/data-blobs?file=Accommodations.json',
        restaurants: '/.netlify/functions/data-blobs?file=Restaurants.json',
        specialties: '/.netlify/functions/data-blobs?file=Specialties.json'
    };

    // DOM Elements
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContentArea = document.getElementById('tab-content-area');
    const loadingIndicator = document.getElementById('loading-indicator');
    const itemModal = document.getElementById('itemModal');
    const modalContent = itemModal.querySelector('.modal-content'); // For animation
    const modalTitle = document.getElementById('modalTitle');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const itemForm = document.getElementById('itemForm');
    const formFieldsContainer = document.getElementById('formFieldsContainer');
    const itemIdInput = document.getElementById('itemId');
    const itemSheetNameInput = document.getElementById('itemSheetName');

    let currentSheetName = ''; // Actual sheet name like 'Tours'
    let currentTab = DEFAULT_TAB; // Tab identifier like 'tours'
    let adminDataCache = {}; // { sheetName: { data: [], headers: [] } }

    // --- Initialization ---
    function initializeAdminPage() {
        console.log('Sử dụng API động từ Netlify Blobs');
        setupEventListeners();
        window.addEventListener('message', handleIncomingMessage);
        
        // Load fresh data immediately for default tab
        switchTab(DEFAULT_TAB, true);
    }

    function setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', () => switchTab(link.dataset.tab));
        });

        closeModalBtn.addEventListener('click', closeModal);
        cancelModalBtn.addEventListener('click', closeModal);
        itemForm.addEventListener('submit', handleFormSubmit);

        // Close modal on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && itemModal.classList.contains('active')) {
                closeModal();
            }
        });
        // Close modal on outside click
        itemModal.addEventListener('click', (event) => {
            if (event.target === itemModal) {
                closeModal();
            }
        });
    }

    function handleIncomingMessage(event) {
        // Optional: Add origin check for security if your parent window is on a different domain
        // if (event.origin !== 'https://your-parent-domain.com') return; 
        
        if (event.data && event.data.type === 'navigateToCategory') {
            const categoryKey = event.data.category;
            if (categoryKey && SHEET_MAP[categoryKey]) {
                console.log(`Message received: Navigate to category '${categoryKey}'. Has initial content loaded: ${hasInitialContentLoaded}`);
                
                // Determine if this is the first content load attempt for this iframe instance
                const isFirstMeaningfulLoad = !hasInitialContentLoaded;
                switchTab(categoryKey, isFirstMeaningfulLoad);

            } else {
                console.warn(`Message received with invalid or unknown category key: '${categoryKey}'`);
            }
        }
    }

    function switchTab(tabId, isAttemptingInitialLoad = false) {
        currentLoadToken++;
        const loadTokenForThisCall = currentLoadToken;

        currentTab = tabId;
        currentSheetName = SHEET_MAP[tabId];
        
        // Update tab UI
        document.querySelectorAll('.tab-link').forEach(link => {
            link.classList.remove('bg-white', 'text-slate-700', 'shadow-sm');
            link.classList.add('bg-transparent', 'text-slate-600');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.remove('bg-transparent', 'text-slate-600');
            activeTab.classList.add('bg-white', 'text-slate-700', 'shadow-sm');
        }
        
        // Removed: tabLinks.forEach(link => { link.classList.toggle('active', link.dataset.tab === tabId); });

        // Update content title directly using currentSheetName (which is the display name like "Tours")
        const contentTitleElement = document.getElementById('guide-content-title');
        if (contentTitleElement) {
            contentTitleElement.textContent = currentSheetName || 'Cẩm nang'; // Fallback title
        }
        
        console.log(`Switching tab to: ${tabId}, Sheet: ${currentSheetName}, Initial Load Attempt: ${isAttemptingInitialLoad}, Token: ${loadTokenForThisCall}`);
        loadTabData(currentSheetName, isAttemptingInitialLoad, loadTokenForThisCall);
    }

    // --- Data Fetching & Display ---
    async function loadTabData(sheetName, isAttemptingInitialLoad, loadToken) {
        if (!sheetName) {
            console.error('Invalid sheetName for loadTabData');
            tabContentArea.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-times-circle mr-2"></i>Tên sheet không hợp lệ.</div>`;
            return;
        }
        loadingIndicator.style.display = 'flex';
        if (!isAttemptingInitialLoad) {
            tabContentArea.innerHTML = '';
        }
        // Fetch from Netlify Blobs API
        const tabKey = Object.keys(SHEET_MAP).find(key => SHEET_MAP[key] === sheetName);
        const url = API_URLS[tabKey];
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const headers = guessHeaders(data);
            renderTable(data, headers, sheetName);
            // Cache for edit/delete
            adminDataCache[sheetName] = { data, headers };
        } catch (error) {
            console.error(`Error loading data for ${sheetName}:`, error);
            tabContentArea.innerHTML = `<div class="p-6 text-center text-red-600 bg-red-50 rounded-md"><i class="fas fa-exclamation-circle mr-2"></i>Không thể tải dữ liệu cho ${sheetName}: ${error.message}.</div>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function guessHeaders(data) {
        if (!data || data.length === 0) return [];
        let headers = Object.keys(data[0]);
        const preferredOrder = ['id', 'name', 'isActive', 'image', 'address', 'description']; 
        headers.sort((a, b) => {
            let posA = preferredOrder.indexOf(a);
            let posB = preferredOrder.indexOf(b);
            if (posA !== -1 && posB !== -1) return posA - posB;
            if (posA !== -1) return -1;
            if (posB !== -1) return 1;
            return a.localeCompare(b);
        });
        return headers;
    }

    function renderTable(data, headers, sheetKey) {
        if (!data) {
            tabContentArea.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-info-circle mr-2"></i>Không có dữ liệu để hiển thị.</div>';
            return;
        }
        let tableHTML = `
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-xl font-semibold text-gray-700">Danh sách ${sheetKey} (${data.length} mục)</h2>
                <button id="addItemBtn-${sheetKey}" class="bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition" title="Thêm mới">
                    <i class="fas fa-plus mr-2"></i>Thêm mới
                </button>
            </div>
            <div class="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>`;
        headers.forEach(header => {
            tableHTML += `<th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${header}</th>`;
        });
        tableHTML += `<th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Hành động</th>`;
        tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${headers.length + 1}" class="text-center py-10 text-gray-500 px-5 py-3.5"><i class="fas fa-folder-open fa-2x mb-2"></i><br>Chưa có dữ liệu nào.</td></tr>`;
        } else {
            data.forEach((item, idx) => {
                tableHTML += `<tr class="hover:bg-indigo-50 transition-colors duration-150">`;
                headers.forEach(header => {
                    let value = item[header];
                    let displayValue = '';
                    if (typeof value === 'boolean') {
                        displayValue = value ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1.5"></i>Kích hoạt</span>' 
                                          : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><i class="fas fa-times-circle mr-1.5"></i>Vô hiệu</span>';
                    } else if (header.toLowerCase() === 'image' && value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
                        displayValue = `<img src="${value}" alt="Image" class="h-12 w-12 object-cover rounded-md shadow" loading="lazy" onerror="this.style.display='none'; this.nextSibling.style.display='block'"><span style="display:none; font-size:0.8em; color: #777;">No img</span>`;
                    } else {
                        displayValue = value !== null && typeof value !== 'undefined' ? String(value).substring(0, 70) + (String(value).length > 70 ? '...' : '') : '<span class="text-gray-400 italic">N/A</span>';
                    }
                    tableHTML += `<td class="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">${displayValue}</td>`;
                });
                tableHTML += `<td class="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700 text-right">
                    <button class="edit-item-btn text-indigo-600 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition mr-2" data-idx="${idx}" title="Sửa"><i class="fas fa-pencil-alt fa-fw"></i></button>
                    <button class="delete-btn text-red-600 bg-red-50 p-2 rounded-md hover:bg-red-100 transition" data-idx="${idx}" title="Xóa"><i class="fas fa-trash-alt fa-fw"></i></button>
                </td></tr>`;
            });
        }
        tableHTML += `</tbody></table></div>`;
        tabContentArea.innerHTML = tableHTML;
        // Gán sự kiện cho nút
        document.getElementById(`addItemBtn-${sheetKey}`).onclick = () => openModalForAdd();
        tabContentArea.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.onclick = () => openModalForEdit(parseInt(btn.dataset.idx));
        });
        tabContentArea.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => deleteGuideItem(parseInt(btn.dataset.idx));
        });
    }

    // --- Modal & Form Handling ---
    function openModalForAdd() {
        // Lấy headers từ tab hiện tại
        const headers = adminDataCache[currentSheetName]?.headers || [];
        generateFormFields(null, headers);
        modalTitle.textContent = 'Thêm mới';
        itemIdInput.value = '';
        itemSheetNameInput.value = currentSheetName;
        itemModal.classList.add('active');
        modalContent.classList.remove('scale-95', 'opacity-0');
    }
    function openModalForEdit(idx) {
        const data = adminDataCache[currentSheetName]?.data || [];
        const headers = adminDataCache[currentSheetName]?.headers || [];
        const item = data[idx];
        generateFormFields(item, headers);
        modalTitle.textContent = 'Sửa mục';
        itemIdInput.value = item.id || '';
        itemSheetNameInput.value = currentSheetName;
        itemModal.classList.add('active');
        modalContent.classList.remove('scale-95', 'opacity-0');
        itemForm.dataset.editIdx = idx;
    }
    function closeModal() {
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            itemModal.classList.remove('active');
            formFieldsContainer.innerHTML = '';
            delete itemForm.dataset.editIdx;
        }, 200);
    }
    function generateFormFields(item, headers) {
        formFieldsContainer.innerHTML = '';
        if (!headers || headers.length === 0) {
            formFieldsContainer.innerHTML = '<p class="text-red-500">Không thể tạo form, không có thông tin cột.</p>';
            return;
        }

        headers.forEach(header => {
            if (header.toLowerCase() === 'id' && item) return; // Don't show ID field for editing, it's auto for new

            const div = document.createElement('div');
            const label = document.createElement('label');
            label.htmlFor = `field-${header}`;
            label.className = 'block text-sm font-semibold text-gray-700 mb-1.5';
            label.textContent = header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1').trim(); // Capitalize and add space for camelCase
            
            let input;
            const value = item ? (item[header] || '') : '';
            const baseInputClasses = 'mt-1 block w-full py-2.5 px-3.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';

            if (header.toLowerCase() === 'isactive') {
                input = document.createElement('select');
                input.className = baseInputClasses;
                const optionTrue = document.createElement('option');
                optionTrue.value = 'true';
                optionTrue.textContent = 'Hoạt động (True)';
                const optionFalse = document.createElement('option');
                optionFalse.value = 'false';
                optionFalse.textContent = 'Không hoạt động (False)';
                input.appendChild(optionTrue);
                input.appendChild(optionFalse);
                input.value = (item && (item[header] === true || String(item[header]).toLowerCase() === 'true')) ? 'true' : 'false';
            } else if (header.toLowerCase().includes('description') || header.toLowerCase().includes('activities') || header.length > 50) { // Guess for textarea
                input = document.createElement('textarea');
                input.rows = 4;
                input.className = baseInputClasses;
                input.value = value;
            } else if (header.toLowerCase().includes('image') || header.toLowerCase().includes('link')) {
                input = document.createElement('input');
                input.type = 'url';
                input.className = baseInputClasses;
                input.value = value;
                input.placeholder = 'https://example.com/image.jpg';
            } else if (header.toLowerCase().includes('phone') || header.toLowerCase().includes('number') || header.toLowerCase().includes('price') || header.toLowerCase().includes('duration')){
                 input = document.createElement('input');
                 input.type = 'text'; // Using text for flexibility, could be number but Google Sheet often has mixed data
                 input.className = baseInputClasses;
                 input.value = value;
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.className = baseInputClasses;
                input.value = value;
            }
            input.id = `field-${header}`;
            input.name = header;
            if (header.toLowerCase() === 'id') input.readOnly = true; // ID is auto-generated or not editable

            div.appendChild(label);
            div.appendChild(input);
            formFieldsContainer.appendChild(div);
        });
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const headers = adminDataCache[currentSheetName]?.headers || [];
        const data = adminDataCache[currentSheetName]?.data || [];
        const formData = new FormData(itemForm);
        const item = {};
        headers.forEach(header => {
            let val = formData.get(header);
            if (header.toLowerCase() === 'isactive') {
                item[header] = val === 'true';
            } else {
                item[header] = val;
            }
        });
        if (itemIdInput.value && itemForm.dataset.editIdx) {
            // Sửa
            data[parseInt(itemForm.dataset.editIdx)] = item;
        } else {
            // Thêm mới
            // Tạo id tự động nếu có trường id
            if (headers.includes('id')) {
                let prefix = '';
                if (currentSheetName.toLowerCase().includes('tour')) prefix = 'TOUR';
                else if (currentSheetName.toLowerCase().includes('accommodation')) prefix = 'ACC';
                else if (currentSheetName.toLowerCase().includes('restaurant')) prefix = 'RES';
                else if (currentSheetName.toLowerCase().includes('specialty')) prefix = 'SPE';
                // Tìm số lớn nhất
                const maxId = data.reduce((max, it) => {
                    const m = (it.id || '').match(/\d+/);
                    return m ? Math.max(max, parseInt(m[0])) : max;
                }, 0);
                item.id = prefix + String(maxId + 1).padStart(3, '0');
            }
            data.push(item);
        }
        saveCurrentSheetData(data, headers);
        closeModal();
    }

    async function saveCurrentSheetData(data, headers) {
        loadingIndicator.style.display = 'flex';
        const tabKey = Object.keys(SHEET_MAP).find(key => SHEET_MAP[key] === currentSheetName);
        const url = API_URLS[tabKey];
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Refresh data from server to ensure consistency
            const refreshResponse = await fetch(url);
            if (refreshResponse.ok) {
                const freshData = await refreshResponse.json();
                adminDataCache[currentSheetName].data = freshData;
                renderTable(freshData, headers, currentSheetName);
            } else {
                // Fallback to local data if refresh fails
                adminDataCache[currentSheetName].data = data;
                renderTable(data, headers, currentSheetName);
            }
            
            // Reload current tab data to ensure everything is fresh
            await loadTabData(currentSheetName, false);
            
            // Notify parent window to refresh dashboard data
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'dataUpdated', source: 'guide' }, '*');
            }
        } catch (error) {
            alert('Lỗi khi lưu dữ liệu: ' + error.message);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function toggleActiveStatus() {
        alert('Chức năng thay đổi trạng thái đã bị vô hiệu hóa. Vui lòng chỉnh sửa file JSON trực tiếp trên server.');
    }

    function deleteGuideItem(idx) {
        if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        const data = adminDataCache[currentSheetName]?.data || [];
        const headers = adminDataCache[currentSheetName]?.headers || [];
        data.splice(idx, 1);
        saveCurrentSheetData(data, headers);
    }

    // --- Start the page ---
    initializeAdminPage();
}); 

function addItemToSheet(sheet, itemData) {
  var headersRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  var rawHeaders = headersRange.getValues()[0];
  var normalizedHeaders = rawHeaders.map(normalizeHeader);

  var newRow = [];
  var idColIndex = normalizedHeaders.indexOf('id');

  if (idColIndex !== -1 && (!itemData.id || itemData.id.toString().trim() === "")) {
    var sheetName = sheet.getName();
    var prefix = '';
    if (sheetName.toLowerCase().includes('tour')) {
      prefix = 'TOUR';
    } else if (sheetName.toLowerCase().includes('accommodation')) {
      prefix = 'ACC';
    } else if (sheetName.toLowerCase().includes('restaurant')) {
      prefix = 'RES';
    } else if (sheetName.toLowerCase().includes('specialty')) {
      prefix = 'SPE';
    }

    // Quét toàn bộ cột ID, tìm số lớn nhất
    var idValues = sheet.getRange(2, idColIndex + 1, Math.max(0, sheet.getLastRow() - 1), 1).getValues();
    var maxIdNum = 0;
    var idPattern = new RegExp('^' + prefix + '(\\d{3})$');
    for (var i = 0; i < idValues.length; i++) {
      var match = idValues[i][0] && idValues[i][0].toString().match(idPattern);
      if (match) {
        var num = parseInt(match[1]);
        if (num > maxIdNum) maxIdNum = num;
      }
    }
    itemData.id = prefix + String(maxIdNum + 1).padStart(3, '0');
  }

  // ... phần còn lại giữ nguyên ...
} 