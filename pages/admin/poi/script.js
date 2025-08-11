// --- Configuration ---
// *** UPDATED API URLs for dynamic CRUD ***
const API_URLS = {
    poi: '/.netlify/functions/data-blobs?file=POI.json',
};
const POI_CACHE_KEY = 'poiCacheData';
const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes cache validity

// --- Global State ---
let currentPoiList = []; // Holds the list currently displayed/used for sorting
let currentSortKey = 'id';
let currentSortDirection = 'asc';
let leafletMap, leafletMarker;

// --- State for both POI and GioHoatDong ---
let poiList = [];
let gioHoatDongList = [];

// --- Lưu trữ danh sách giờ hoạt động toàn cục ---
let globalGioHoatDongList = [];

// --- DOM Elements ---
const poiForm = document.getElementById('poiForm');
const poiTableBody = document.getElementById('poiTableBody');
const statusMessage = document.getElementById('statusMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const poiIdDisplay = document.getElementById('poiIdDisplay');
const poiIdHidden = document.getElementById('poiIdHidden');
const poiNameInput = document.getElementById('poiNameInput');
const poiNameEnInput = document.getElementById('poiNameEnInput');
const nameEnHint = document.getElementById('nameEnHint');
const operatingHoursContainer = document.getElementById('operatingHoursContainer');
const poiOperatingHoursJsonInput = document.getElementById('poiOperatingHoursJsonInput');
const poiAreaSelect = document.getElementById('poiAreaSelect');
const poiFeaturedInput = document.getElementById('poiFeaturedInput');


// --- Operating Hours Configuration ---
const operatingHoursConfig = [
    { key: 'default', label: 'Mặc định' },
    { key: 'mon', label: 'Thứ 2' },
    { key: 'tue', label: 'Thứ 3' },
    { key: 'wed', label: 'Thứ 4' },
    { key: 'thu', label: 'Thứ 5' },
    { key: 'fri', label: 'Thứ 6' },
    { key: 'sat', label: 'Thứ 7' },
    { key: 'sun', label: 'Chủ nhật' }
];

const operatingStatusOptions = [
    { value: 'ignore', text: 'Không áp dụng' }, // Default/ignore state
    { value: 'open', text: 'Mở cửa' },
    { value: 'closed', text: 'Đóng cửa' }
];

// --- UI Functions ---

function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

function displayStatus(message, isError = false, duration = 5000) {
    if (!message) return; // Don't display empty messages

    statusMessage.textContent = message;
    statusMessage.className = `mb-4 p-4 rounded-md text-sm font-medium border ${isError
        ? 'bg-red-100 text-red-700 border-red-300' // Adjusted colors for better contrast
        : 'bg-green-100 text-green-700 border-green-300' // Adjusted colors
        }`;
    statusMessage.style.display = 'block';

    // Scroll into view if it's not visible
    const rect = statusMessage.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
        statusMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Auto-hide after duration
    setTimeout(() => {
        if (statusMessage.textContent === message) { // Only hide if message hasn't changed
            statusMessage.style.display = 'none';
            statusMessage.className = ''; // Reset classes
        }
    }, duration);
}

// --- Local Storage Cache Functions ---

function savePoisToCache(poiList) {
    try {
        const cacheEntry = {
            timestamp: Date.now(),
            data: poiList
        };
        localStorage.setItem(POI_CACHE_KEY, JSON.stringify(cacheEntry));
        console.log('POI list saved to local cache.');
    } catch (e) {
        console.error("Error saving POIs to localStorage:", e);
        // Clear cache if storage is full or corrupt
        clearPoiCache();
    }
}

function loadPoisFromCache() {
    try {
        const cachedEntry = localStorage.getItem(POI_CACHE_KEY);
        if (!cachedEntry) return null;

        const parsedEntry = JSON.parse(cachedEntry);

        // Check if cache has expired
        if (Date.now() - parsedEntry.timestamp > CACHE_EXPIRY_MS) {
            console.log("POI cache expired. Clearing.");
            clearPoiCache();
            return null;
        }

        console.log("Loading POI list from local cache.");
        return parsedEntry.data; // Return the actual POI list
    } catch (e) {
        console.error("Error loading POIs from localStorage:", e);
        clearPoiCache(); // Clear corrupted cache
        return null;
    }
}

function clearPoiCache() {
    localStorage.removeItem(POI_CACHE_KEY);
    console.log("POI cache cleared.");
}

// --- API Interaction ---

async function fetchData(url, options = {}) {
    showLoading(true);
    statusMessage.style.display = 'none'; // Hide previous status messages
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (options.method && options.method !== 'GET') {
            // POST/PUT: chỉ trả về text
            return await response.text();
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch Exception:', error);
        displayStatus(`Lỗi: ${error.message || 'Không thể kết nối đến máy chủ.'}`, true);
        return null;
    } finally {
        showLoading(false);
    }
}

// --- Data Operations ---
// Removed: loadAllData and displayDataInTable functions - no longer needed

// --- Hiển thị bảng Giờ Hoạt Động ---
function displayGioHoatDongInTable(gioList) {
    let table = document.getElementById('gioTable');
    if (!table) {
        // Tạo bảng nếu chưa có
        const container = document.querySelector('.container');
        const section = document.createElement('div');
        section.className = 'bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-10';
        section.innerHTML = `
            <h2 class="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                <i class="fas fa-clock mr-2 text-amber-600"></i> Danh sách Giờ Hoạt Động
            </h2>
            <div class="overflow-x-auto">
                <table id="gioTable" class="min-w-full divide-y divide-slate-200 border border-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="w-16 px-4 py-3 text-left text-sm font-medium text-slate-700">ID</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-slate-700">Giờ hoạt động</th>
                            <th class="w-28 px-4 py-3 text-center text-sm font-medium text-slate-700">Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="gioTableBody" class="bg-white divide-y divide-slate-200"></tbody>
                </table>
            </div>
        `;
        container.appendChild(section);
        table = document.getElementById('gioTable');
    }
    const tbody = document.getElementById('gioTableBody');
    tbody.innerHTML = '';
    if (!gioList || gioList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-6 text-center text-sm text-slate-500 italic">Chưa có dữ liệu giờ hoạt động.</td></tr>';
        return;
    }
    gioList.forEach((item, idx) => {
        const row = tbody.insertRow();
        row.className = 'hover:bg-slate-50 transition-colors duration-150';
        row.innerHTML = `
            <td class="px-4 py-3 font-medium text-slate-900">${item.id || ''}</td>
            <td class="px-4 py-3">${item.operatingHours || ''}</td>
            <td class="px-4 py-3 text-center">
                <button class="btn btn-icon btn-primary text-xs" title="Sửa" onclick="editGioHoatDong(${idx})"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-icon btn-danger text-xs" title="Xóa" onclick="deleteGioHoatDong(${idx})"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
}

function editGioHoatDong(idx) {
    const item = gioHoatDongList[idx];
    alert('Sửa giờ hoạt động cho ID: ' + item.id + '\n(Chức năng này cần mở rộng giao diện form/modal tương tự POI)');
}
function deleteGioHoatDong(idx) {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    gioHoatDongList.splice(idx, 1);
    saveGioHoatDongList();
}
async function saveGioHoatDongList() {
    try {
        const response = await fetch('/.netlify/functions/data-blobs?file=GioHoatDong.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gioHoatDongList)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        displayStatus('Đã lưu Giờ Hoạt Động thành công lên server!', false);
        displayGioHoatDongInTable(gioHoatDongList);
    } catch (error) {
        alert('Lỗi khi lưu dữ liệu Giờ Hoạt Động: ' + error.message);
    }
}

// Removed: Tab switcher functionality - no longer needed

// --- Fetch both JSON files on load ---
async function loadAllDataBoth() {
    showLoading(true);
    try {
        // Fetch POI
        const poiData = await fetchData('/.netlify/functions/data-blobs?file=POI.json');
        if (Array.isArray(poiData)) {
            poiList = poiData;
            displayPoisInTable(poiList);
        } else {
            displayStatus('Lỗi: Không nhận được dữ liệu POI hợp lệ từ server.', true);
        }
        // Fetch GioHoatDong
        const gioData = await fetchData('/.netlify/functions/data-blobs?file=GioHoatDong.json');
        if (Array.isArray(gioData)) {
            gioHoatDongList = gioData;
            displayGioHoatDongInTable(gioHoatDongList);
        } else {
            displayStatus('Lỗi: Không nhận được dữ liệu Giờ Hoạt Động hợp lệ từ server.', true);
        }
    } catch (e) {
        displayStatus('Lỗi khi tải dữ liệu: ' + e, true);
    } finally {
        showLoading(false);
    }
}

// --- Form Handling ---

function clearForm() {
    poiForm.reset(); // Resets most fields
    poiIdDisplay.value = '';
    poiIdHidden.value = '';
    nameEnHint.style.display = 'none';
    // Explicitly reset selects to default option
    if (poiAreaSelect) poiAreaSelect.selectedIndex = 0;
    if (poiFeaturedInput) poiFeaturedInput.selectedIndex = 0;
    clearOperatingHoursUi(); // Clear operating hours inputs
    // Remove any validation styles if necessary
    document.getElementById('poiForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- Đồng bộ giờ hoạt động với GioHoatDong.json ---
async function fetchGioHoatDongList() {
    try {
        const response = await fetch('/.netlify/functions/data-blobs?file=GioHoatDong.json');
        const data = await response.json();
        console.log('[DEBUG] Dữ liệu GioHoatDong.json trả về:', data);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('[DEBUG] Lỗi fetch GioHoatDong.json:', err);
        return [];
    }
}
async function saveGioHoatDongList(list) {
    try {
        await fetch('/.netlify/functions/data-blobs?file=GioHoatDong.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list)
        });
    } catch {}
}
// --- Khi mở form sửa POI, ưu tiên giờ hoạt động từ GioHoatDong.json ---
async function populateFormForEdit(poi) {
    clearForm();
    if (!poi || typeof poi !== 'object' || !poi.id) {
        displayStatus("Không có dữ liệu POI hợp lệ để điền vào form.", true);
        return;
    }
    poiIdDisplay.value = poi.id || '';
    poiIdHidden.value = poi.id || '';

    const elements = poiForm.elements;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const key = element.name; // Assumes element names match POI object keys (lowercase)

        if (!key || key === 'id' || key.startsWith('oh_')) {
            continue;
        }

        if (poi.hasOwnProperty(key)) {
            const value = poi[key];

            if (element.type === 'select-one') {
                // *** FIXED: Set value directly without toUpperCase() ***
                // Handle boolean TRUE/FALSE needing to be string 'TRUE'/'FALSE' for select value
                if (typeof value === 'boolean') {
                    element.value = value ? 'TRUE' : 'FALSE';
                } else {
                    element.value = value !== null && value !== undefined ? value : '';
                }

                // Add a check: If setting the value resulted in empty (no match found), log warning
                if (element.value === '' && value !== null && value !== undefined && value !== '') {
                    // Check if original value was boolean false, which maps to 'FALSE' string
                    const expectedValue = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : value;
                    console.warn(`Could not select value "${expectedValue}" for select [name="${key}"]. Check if option value matches.`);
                    if (element.options[0]?.value === '') {
                        element.selectedIndex = 0;
                    }
                }
            } else if (element.type === 'number' && (value === null || value === undefined)) {
                element.value = ''; // Clear number fields if data is null/undefined
            } else if (element.tagName.toLowerCase() === 'textarea') {
                element.value = value !== null && value !== undefined ? value : '';
            } else { // Handles text, url, number (with value), etc.
                element.value = value !== null && value !== undefined ? value : '';
            }
        } else {
            // Field exists in form but not in POI data, clear it
            if (element.type !== 'hidden' && element.type !== 'button' && element.type !== 'submit') {
                element.value = '';
                if (element.type === 'select-one' && element.options[0]?.value === '') {
                    element.selectedIndex = 0;
                }
            }
        }
    }

    // Fetch giờ hoạt động từ GioHoatDong.json nếu có
    let hoursJsonString = null;
    const gioList = await fetchGioHoatDongList();
    console.log('[DEBUG] populateFormForEdit - gioList:', gioList);
    const gioEntry = gioList.find(g => String(g.id) === String(poi.id));
    console.log('[DEBUG] populateFormForEdit - Found gioEntry for POI ID', poi.id, ':', gioEntry);
    
    if (gioEntry && gioEntry.operating_hours) {
        console.log('[DEBUG] populateFormForEdit - Found operating_hours:', gioEntry.operating_hours);
        hoursJsonString = typeof gioEntry.operating_hours === 'string'
            ? gioEntry.operating_hours
            : JSON.stringify(gioEntry.operating_hours);
    } else {
        console.log('[DEBUG] populateFormForEdit - No operating_hours found for POI ID:', poi.id);
    }
    
    console.log('[DEBUG] populateFormForEdit - Final hoursJsonString:', hoursJsonString);
    parseAndSetOperatingHoursUi(hoursJsonString);

    // Show hint for English name if editing and it's empty
    if (poiIdHidden.value && poiNameInput.value && !poiNameEnInput.value) {
        nameEnHint.style.display = 'block';
    } else {
        nameEnHint.style.display = 'none';
    }

    // Scroll form into view and show success message
    document.getElementById('poiForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    displayStatus(`Đã tải dữ liệu POI ID ${poi.id} vào form.`, false, 3000); // Shorter duration for info message
}

// --- Operating Hours UI ---

function createOperatingHoursUi() {
    operatingHoursContainer.innerHTML = ''; // Clear previous inputs
    operatingHoursConfig.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'operating-hours-day';

        // Status Dropdown
        const statusSelect = document.createElement('select');
        statusSelect.id = `oh_${day.key}_status`;
        statusSelect.name = `oh_${day.key}_status`;
        operatingStatusOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            statusSelect.appendChild(option);
        });

        // Status Label
        const statusLabel = document.createElement('span');
        statusLabel.className = 'oh-status-label ml-2 text-xs font-semibold';
        statusLabel.style.minWidth = '90px';
        statusLabel.textContent = 'Không áp dụng';
        statusLabel.style.color = '#64748b'; // slate-500

        // Time Input Div (Start and End)
        const timeInputsDiv = document.createElement('div');
        timeInputsDiv.className = 'time-inputs hidden'; // Start hidden
        timeInputsDiv.id = `oh_${day.key}_time_inputs`;
        timeInputsDiv.innerHTML = `
            <input type="time" id="oh_${day.key}_start" name="oh_${day.key}_start">
            <span class="text-slate-400">-</span>
            <input type="time" id="oh_${day.key}_end" name="oh_${day.key}_end">
        `;

        // Day Label
        const dayLabel = document.createElement('span');
        dayLabel.className = 'day-label';
        dayLabel.textContent = day.label;

        // Assemble the row
        dayDiv.appendChild(dayLabel);
        dayDiv.appendChild(statusSelect);
        dayDiv.appendChild(statusLabel);
        dayDiv.appendChild(timeInputsDiv);

        operatingHoursContainer.appendChild(dayDiv);

        // Function to update status label
        function updateStatusLabel(selectedValue) {
            if (selectedValue === 'open') {
                statusLabel.textContent = 'Mở cửa';
                statusLabel.style.color = '#16a34a'; // green-600
            } else if (selectedValue === 'closed') {
                statusLabel.textContent = 'Đóng cửa';
                statusLabel.style.color = '#ef4444'; // red-500
            } else {
                statusLabel.textContent = 'Không áp dụng';
                statusLabel.style.color = '#64748b'; // slate-500
            }
        }

        // Add event listener to show/hide time inputs and update label based on status
        statusSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            const timeInputs = dayDiv.querySelector('.time-inputs');
            const startInput = timeInputs.querySelector(`#oh_${day.key}_start`);
            const endInput = timeInputs.querySelector(`#oh_${day.key}_end`);

            updateStatusLabel(selectedValue);

            if (selectedValue === 'open') {
                timeInputs.classList.remove('hidden');
            } else {
                timeInputs.classList.add('hidden');
                // Clear time inputs when status is not 'open'
                startInput.value = '';
                endInput.value = '';
            }
        });

        // Set initial label
        updateStatusLabel(statusSelect.value);
    });
}

function clearOperatingHoursUi() {
    operatingHoursConfig.forEach(day => {
        const statusSelect = document.getElementById(`oh_${day.key}_status`);
        const startTimeInput = document.getElementById(`oh_${day.key}_start`);
        const endTimeInput = document.getElementById(`oh_${day.key}_end`);
        const timeInputsDiv = document.getElementById(`oh_${day.key}_time_inputs`);

        if (statusSelect) statusSelect.value = 'ignore'; // Reset to default
        if (startTimeInput) startTimeInput.value = '';
        if (endTimeInput) endTimeInput.value = '';
        if (timeInputsDiv) timeInputsDiv.classList.add('hidden');
    });
    poiOperatingHoursJsonInput.value = ''; // Clear the hidden JSON input
}

function parseAndSetOperatingHoursUi(hoursJsonString) {
    console.log('[DEBUG] parseAndSetOperatingHoursUi called with:', hoursJsonString, 'Type:', typeof hoursJsonString);
    clearOperatingHoursUi(); // Start fresh
    if (!hoursJsonString || typeof hoursJsonString !== 'string' || hoursJsonString.trim() === '') {
        console.log("No operating hours data to parse.");
        return; // Nothing to parse
    }

    let hoursObj;
    try {
        console.log('[DEBUG] Attempting to parse JSON in parseAndSetOperatingHoursUi:', hoursJsonString);
        hoursObj = JSON.parse(hoursJsonString);
        console.log('[DEBUG] Parsed hoursObj:', hoursObj, 'Type:', typeof hoursObj);
        
        if (typeof hoursObj !== 'object' || hoursObj === null || Array.isArray(hoursObj)) {
            console.warn("Parsed operating hours JSON is not a valid object:", hoursJsonString);
            displayStatus("Lỗi: Dữ liệu giờ hoạt động không hợp lệ.", true);
            return;
        }
    } catch (error) {
        console.error("Lỗi phân tích JSON giờ hoạt động để cập nhật UI:", hoursJsonString, error);
        displayStatus("Lỗi: Không thể đọc dữ liệu giờ hoạt động hiện tại.", true);
        return; // Stop if JSON is invalid
    }

    // Iterate through configured days and set UI based on parsed object
    operatingHoursConfig.forEach(day => {
        const key = day.key;
        if (hoursObj.hasOwnProperty(key)) {
            const value = hoursObj[key];
            const statusSelect = document.getElementById(`oh_${key}_status`);
            const startTimeInput = document.getElementById(`oh_${key}_start`);
            const endTimeInput = document.getElementById(`oh_${key}_end`);
            const timeInputsDiv = document.getElementById(`oh_${key}_time_inputs`);

            if (!statusSelect || !startTimeInput || !endTimeInput || !timeInputsDiv) {
                console.warn(`UI elements for operating hours day '${key}' not found.`);
                return; // Skip if UI elements are missing
            }

            // Determine status and times
            if (typeof value === 'string' && value.trim().toLowerCase() === 'closed') {
                statusSelect.value = 'closed';
                timeInputsDiv.classList.add('hidden');
                startTimeInput.value = '';
                endTimeInput.value = '';
                statusSelect.dispatchEvent(new Event('change'));
            } else if (typeof value === 'string' && value.includes('-')) {
                const times = value.split('-');
                if (times.length === 2) {
                    const start = times[0].trim();
                    const end = times[1].trim();
                    // Basic validation for time format (HH:MM)
                    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(start) && /^([01]\d|2[0-3]):([0-5]\d)$/.test(end)) {
                        statusSelect.value = 'open';
                        timeInputsDiv.classList.remove('hidden');
                        startTimeInput.value = start;
                        endTimeInput.value = end;
                        statusSelect.dispatchEvent(new Event('change'));
                    } else {
                        console.warn(`Invalid time format in range for '${key}': ${value}. Setting to 'ignore'.`);
                        statusSelect.value = 'ignore'; // Fallback to ignore
                        timeInputsDiv.classList.add('hidden');
                        startTimeInput.value = '';
                        endTimeInput.value = '';
                        statusSelect.dispatchEvent(new Event('change'));
                    }
                } else {
                    console.warn(`Invalid time range format for '${key}': ${value}. Setting to 'ignore'.`);
                    statusSelect.value = 'ignore'; // Fallback to ignore
                    timeInputsDiv.classList.add('hidden');
                    startTimeInput.value = '';
                    endTimeInput.value = '';
                    statusSelect.dispatchEvent(new Event('change'));
                }
            } else {
                // If value is not 'closed' or a valid-looking range, treat as 'ignore'
                console.warn(`Unexpected or invalid value for operating hours '${key}': ${value}. Setting to 'ignore'.`);
                statusSelect.value = 'ignore';
                timeInputsDiv.classList.add('hidden');
                startTimeInput.value = '';
                endTimeInput.value = '';
                statusSelect.dispatchEvent(new Event('change'));
            }
        } else {
            // If key is missing in JSON, ensure UI is set to 'ignore' (already done by clearOperatingHoursUi)
            const statusSelect = document.getElementById(`oh_${key}_status`);
            if (statusSelect && statusSelect.value !== 'ignore') {
                statusSelect.value = 'ignore';
                document.getElementById(`oh_${key}_time_inputs`)?.classList.add('hidden');
                document.getElementById(`oh_${key}_start`).value = '';
                document.getElementById(`oh_${key}_end`).value = '';
                statusSelect.dispatchEvent(new Event('change'));
            }
        }
    });
}

function generateOperatingHoursJson() {
    const hoursObj = {};
    let hasData = false; // Track if any day has specific setting
    operatingHoursConfig.forEach(day => {
        const key = day.key;
        const statusSelect = document.getElementById(`oh_${key}_status`);
        const startTimeInput = document.getElementById(`oh_${key}_start`);
        const endTimeInput = document.getElementById(`oh_${key}_end`);

        if (!statusSelect) return; // Skip if element not found

        const status = statusSelect.value;

        if (status === 'closed') {
            hoursObj[key] = 'closed';
            hasData = true;
        } else if (status === 'open') {
            const start = startTimeInput?.value;
            const end = endTimeInput?.value;
            // Only include if both start and end times are provided and valid
            if (start && end && /^([01]\d|2[0-3]):([0-5]\d)$/.test(start) && /^([01]\d|2[0-3]):([0-5]\d)$/.test(end)) {
                hoursObj[key] = `${start}-${end}`;
                hasData = true;
            } else {
                console.warn(`Giờ mở cửa không đầy đủ hoặc không hợp lệ cho ngày ${day.label} (${key}), bỏ qua.`);
                // Don't add this key to hoursObj if times are invalid/missing
            }
        }
        // If status is 'ignore', we simply don't add the key to hoursObj
    });

    // Set hidden input value
    const jsonString = hasData ? JSON.stringify(hoursObj) : null;
    poiOperatingHoursJsonInput.value = jsonString || ""; // Use empty string for form submission if null
    console.log("Generated Operating Hours JSON:", jsonString);
    return jsonString; // Return null or the string for addOrUpdatePoi logic
}


// --- POI Data Operations ---

// Function to render the POI list in the table
function displayPoisInTable(poiList) {
    poiTableBody.innerHTML = ''; // Clear existing table rows
    currentPoiList = poiList || []; // Update global list

    if (!currentPoiList || currentPoiList.length === 0) {
        poiTableBody.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-sm text-slate-500 italic">Chưa có dữ liệu POI.</td></tr>';
        return;
    }

    // Sort the list before displaying
    const sortedList = sortPoiList(currentPoiList, currentSortKey, currentSortDirection);

    sortedList.forEach(poi => {
        const row = poiTableBody.insertRow();
        row.className = 'hover:bg-slate-50 transition-colors duration-150';

        // Lấy operating hours từ globalGioHoatDongList thay vì từ poi.operating_hours
        console.log('[DEBUG] displayPoisInTable - globalGioHoatDongList length:', globalGioHoatDongList ? globalGioHoatDongList.length : 'undefined');
        console.log('[DEBUG] displayPoisInTable - Looking for POI ID:', poi.id);
        const gioItem = globalGioHoatDongList.find(item => String(item.id) === String(poi.id));
        console.log('[DEBUG] displayPoisInTable - Found gioItem for POI ID', poi.id, ':', gioItem);
        const operatingHoursString = gioItem && gioItem.operating_hours ? gioItem.operating_hours : null;
        console.log('[DEBUG] displayPoisInTable - operatingHoursString for POI ID', poi.id, ':', operatingHoursString);
        const formattedHours = formatOperatingHoursForTable(operatingHoursString);

        let featuredHtml = '<span class="text-xs text-slate-500 italic">(Chưa đặt)</span>';
        const featuredValue = poi.featured;
        const isConsideredTrue = (featuredValue === true || String(featuredValue).trim().toUpperCase() === 'TRUE');
        const isConsideredFalse = (featuredValue === false || featuredValue === 0 || String(featuredValue).trim().toUpperCase() === 'FALSE');

        if (isConsideredTrue) {
            featuredHtml = '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Nổi bật</span>';
        } else if (isConsideredFalse) {
            featuredHtml = '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Không</span>';
        }

        row.innerHTML = `
            <td class="px-4 py-3 font-medium text-slate-900">${poi.id || ''}</td>
            <td class="px-4 py-3 text-slate-700 max-w-xs truncate" title="${poi.name || ''}">${poi.name || ''}</td>
            <td class="px-4 py-3">${poi.category || ''}</td>
            <td class="px-4 py-3">${poi.area || ''}</td>
            <td class="px-4 py-3">${formattedHours}</td>
            <td class="px-4 py-3 text-center">${featuredHtml}</td>
            <td class="px-4 py-3 text-center">
                <button class="btn btn-icon btn-primary text-xs" title="Sửa POI ID ${poi.id}" onclick="getPoiByIdAndPopulate('${poi.id}')"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-icon btn-danger text-xs" title="Xóa POI ID ${poi.id}" onclick="deletePoiFromRow('${poi.id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
    updateSortIcons(); // Update visual indicator for sorting
}


// Modified loadAllPois to fetch only when needed and use cache
async function loadAllPois() {
    showLoading(true);
    try {
        const data = await fetchData(API_URLS.poi);
        if (Array.isArray(data)) {
            currentPoiList = data;
            displayPoisInTable(currentPoiList);
            savePoisToCache(currentPoiList);
            displayStatus('Tải dữ liệu POI thành công!');
        } else {
            displayStatus('Lỗi: Không nhận được dữ liệu hợp lệ từ server.', true);
        }
    } catch (e) {
        displayStatus('Lỗi khi tải POI: ' + e, true);
    } finally {
        showLoading(false);
    }
}

async function getPoiById() {
    const idInput = document.getElementById('getPoiId');
    const id = idInput.value.trim();
    if (!id || isNaN(parseInt(id))) {
        displayStatus('Vui lòng nhập một ID POI hợp lệ (số).', true);
        idInput.focus();
        idInput.select();
        return;
    }
    await getPoiByIdAndPopulate(id);
    idInput.value = ''; // Clear input after fetching
}

async function getPoiByIdAndPopulate(id) {
    if (!id) return;

    // Try finding in current list first (faster than API call)
    const poiFromCurrentList = currentPoiList.find(p => String(p.id) === String(id));
    if (poiFromCurrentList) {
        console.log(`Populating form for ID ${id} from current list.`);
        populateFormForEdit(poiFromCurrentList);
        return;
    }

    // If not in current list, fetch from API
    console.log(`POI ID ${id} not found in current list, fetching from API...`);
    const response = await fetchData(`${API_URLS.poi}?action=getPoiById&id=${id}`);

    if (response && response.id) {
        const poiData = response;
        if (poiData.id) {
            populateFormForEdit(poiData);
        } else {
            console.error("Dữ liệu POI nhận được không hợp lệ (thiếu ID hoặc cấu trúc sai):", poiData);
            displayStatus(`Không tìm thấy dữ liệu hợp lệ cho POI ID ${id}.`, true);
            clearForm();
        }
    } else {
        // Error handled by fetchData
        clearForm();
    }
}

// --- Đồng bộ giờ hoạt động sang bảng GioHoatDong ---
async function syncOperatingHoursToGioHoatDong(poi) {
    try {
        const res = await fetch('/.netlify/functions/data?key=giohoatdong');
        let gioList = [];
        try { gioList = await res.json(); } catch { }
        const idx = gioList.findIndex(g => String(g.id) === String(poi.id));
        const newEntry = { id: poi.id, operating_hours: poi.operating_hours };
        if (idx >= 0) gioList[idx] = newEntry;
        else gioList.push(newEntry);
        await fetch('/.netlify/functions/data?key=giohoatdong', {
            method: 'POST',
            body: JSON.stringify(gioList),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.warn('Không thể đồng bộ giờ hoạt động sang bảng GioHoatDong:', e);
    }
}

// --- Khi lưu POI, đồng bộ sang GioHoatDong.json ---
async function addOrUpdatePoi() {
    const poiData = {};
    const formData = new FormData(poiForm);
    // 1. Generate Operating Hours JSON
    const operatingHoursJson = generateOperatingHoursJson();
    poiData['operating_hours'] = operatingHoursJson;
    // 2. Process other form fields
    formData.forEach((value, key) => {
        if (key.startsWith('oh_') || key === 'id' || key === 'operating_hours') {
            return;
        }
        const trimmedValue = typeof value === 'string' ? value.trim() : value;
        if ((key === 'latitude' || key === 'longitude' || key === 'elevation') && trimmedValue === '') {
            poiData[key] = null;
        } else if (key === 'featured' && trimmedValue === '') {
            poiData[key] = null;
        } else if (key === 'area' && trimmedValue === '') {
            poiData[key] = '';
        } else {
            if (trimmedValue !== '' || typeof trimmedValue === 'number' || typeof trimmedValue === 'boolean') {
                poiData[key] = trimmedValue;
            }
        }
    });
    // 3. Basic Validation
    if (!poiData.name) {
        displayStatus('Vui lòng nhập Tên POI (trường bắt buộc).', true);
        document.getElementById('poiNameInput').focus();
        return;
    }
    // 4. Determine Action
    const currentIdValue = poiIdHidden.value;
    let isUpdate = (currentIdValue && !isNaN(parseInt(currentIdValue)));
    if (isUpdate) {
        // Update
        const idx = currentPoiList.findIndex(p => String(p.id) === String(currentIdValue));
        if (idx !== -1) {
            poiData.id = currentIdValue;
            currentPoiList[idx] = { ...currentPoiList[idx], ...poiData };
        }
                } else {
        // Add new
        // Tìm id lớn nhất + 1
        let maxId = 0;
        currentPoiList.forEach(p => { const idNum = parseInt(p.id); if (!isNaN(idNum) && idNum > maxId) maxId = idNum; });
        poiData.id = String(maxId + 1);
        currentPoiList.push(poiData);
    }
    // 5. Lưu toàn bộ lên API
    displayStatus('Đang lưu dữ liệu...', false);
    await fetchData(API_URLS.poi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPoiList)
    });
    // --- Đồng bộ sang GioHoatDong.json ---
    console.log('[DEBUG] addOrUpdatePoi - operatingHoursJson:', operatingHoursJson);
    let gioList = await fetchGioHoatDongList();
    console.log('[DEBUG] addOrUpdatePoi - Current gioList:', gioList);
    const idxGio = gioList.findIndex(g => String(g.id) === String(poiData.id));
    console.log('[DEBUG] addOrUpdatePoi - Found index for POI ID', poiData.id, ':', idxGio);
    
    if (operatingHoursJson) {
        if (idxGio !== -1) {
            gioList[idxGio].operating_hours = operatingHoursJson;
            console.log('[DEBUG] addOrUpdatePoi - Updated existing entry at index', idxGio);
                } else {
            gioList.push({ id: poiData.id, operating_hours: operatingHoursJson });
            console.log('[DEBUG] addOrUpdatePoi - Added new entry for POI ID', poiData.id);
        }
        console.log('[DEBUG] addOrUpdatePoi - Saving updated gioList:', gioList);
        await saveGioHoatDongList(gioList);
        console.log('[DEBUG] addOrUpdatePoi - Successfully saved to GioHoatDong.json');
        } else {
        console.log('[DEBUG] addOrUpdatePoi - No operatingHoursJson to save');
    }
    displayStatus('Đã lưu thành công lên server!', false);
    displayPoisInTable(currentPoiList);
    clearForm();
}

async function deletePoiById() {
    alert('Chức năng xóa đã bị vô hiệu hóa. Vui lòng chỉnh sửa file JSON trực tiếp trên server.');
}

async function deletePoiFromRow(id, clearInputAfter = false) {
    if (!id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa POI này?')) return;
    const idx = currentPoiList.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
        currentPoiList.splice(idx, 1);
        await fetchData(API_URLS.poi, {
        method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentPoiList)
        });
        displayStatus('Đã xóa và lưu thành công!', false);
        displayPoisInTable(currentPoiList);
        if (clearInputAfter) clearForm();
    }
}

// --- Sorting Logic ---

function sortPoiList(list, key, direction) {
    if (!list) return [];
    return [...list].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Handle specific types for proper sorting
        if (key === 'id' || key === 'elevation') {
            valA = parseInt(valA || 0, 10);
            valB = parseInt(valB || 0, 10);
        } else if (key === 'latitude' || key === 'longitude') {
            valA = parseFloat(valA || 0);
            valB = parseFloat(valB || 0);
        } else if (key === 'featured') {
            // Sort TRUE > FALSE > null/undefined
            const featuredA = (valA === true || String(valA).toUpperCase() === 'TRUE');
            const featuredB = (valB === true || String(valB).toUpperCase() === 'TRUE');
            const notSetA = (valA === null || valA === undefined || String(valA).toUpperCase() !== 'TRUE' && String(valA).toUpperCase() !== 'FALSE');
            const notSetB = (valB === null || valB === undefined || String(valB).toUpperCase() !== 'TRUE' && String(valB).toUpperCase() !== 'FALSE');

            if (notSetA && !notSetB) return 1;
            if (!notSetA && notSetB) return -1;
            if (notSetA && notSetB) return 0;
            if (featuredA && !featuredB) return -1;
            if (!featuredA && featuredB) return 1;
            return 0; // Both true or both false
        } else {
            // Default to string comparison, case-insensitive
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
        }

        let comparison = 0;
        if (valA > valB) {
            comparison = 1;
        } else if (valA < valB) {
            comparison = -1;
        }
        return direction === 'desc' ? (comparison * -1) : comparison;
    });
}

function handleSort(key) {
    if (currentSortKey === key) {
        // Toggle direction if same key is clicked
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // Default to ascending for new key
        currentSortKey = key;
        currentSortDirection = 'asc';
    }
    displayPoisInTable(currentPoiList); // Re-render table with new sort order
}

function updateSortIcons() {
    const headers = document.querySelectorAll('#poiTable thead th[data-sort-key]');
    headers.forEach(th => {
        const iconSpan = th.querySelector('.sort-icon');
        if (!iconSpan) return;

        iconSpan.classList.remove('fa-sort', 'fa-sort-up', 'fa-sort-down'); // Remove all sort classes
        const key = th.getAttribute('data-sort-key');

        if (key === currentSortKey) {
            iconSpan.classList.add(currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
        } else {
            iconSpan.classList.add('fa-sort'); // Default sort icon
        }
    });
}


// --- Event Listeners & Initialization ---

poiNameInput.addEventListener('input', () => {
    nameEnHint.style.display = (poiIdHidden.value && poiNameInput.value && !poiNameEnInput.value) ? 'block' : 'none';
});
poiNameEnInput.addEventListener('input', () => {
    nameEnHint.style.display = (!poiNameEnInput.value && poiIdHidden.value && poiNameInput.value) ? 'block' : 'none';
});

// Helper function to format operating hours for table display
function formatOperatingHoursForTable(hoursJsonString) {
    console.log('[DEBUG] operating_hours truyền vào:', hoursJsonString, 'Type:', typeof hoursJsonString);
    if (!hoursJsonString || typeof hoursJsonString !== 'string' || hoursJsonString.trim() === '') {
        console.warn('[DEBUG] Không có dữ liệu giờ hoạt động hoặc rỗng:', hoursJsonString);
        return '<span class="operating-hours-display not-set">Chưa có</span>';
    }
    let hoursObj;
    try {
        console.log('[DEBUG] Attempting to parse JSON:', hoursJsonString);
        hoursObj = JSON.parse(hoursJsonString);
        console.log('[DEBUG] Parsed result:', hoursObj, 'Type:', typeof hoursObj);
        
        if (typeof hoursObj !== 'object' || hoursObj === null || Array.isArray(hoursObj) || Object.keys(hoursObj).length === 0) {
            console.warn('[DEBUG] Parsed operating_hours không hợp lệ hoặc rỗng:', hoursJsonString);
            return '<span class="operating-hours-display not-set">Chưa có</span>';
        }
    } catch (error) {
        console.error('[DEBUG] Lỗi parse JSON operating_hours:', hoursJsonString, error);
        return `<span class="operating-hours-display error" title="${error}">Lỗi JSON</span>`;
    }

    const groupedHours = {};
    const dayOrder = ['default', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    dayOrder.forEach(key => {
        if (hoursObj.hasOwnProperty(key)) {
            const value = hoursObj[key];
            const valueKey = String(value).toLowerCase();
            if (!groupedHours[valueKey]) {
                groupedHours[valueKey] = [];
            }
            groupedHours[valueKey].push(key);
        }
    });

    if (Object.keys(groupedHours).length === 0) {
        return '<span class="operating-hours-display not-set">Chưa có</span>';
    }

    let formattedHtml = '<div class="operating-hours-display">';
    const dayMap = {
        'default': 'Mặc định', 'mon': 'T2', 'tue': 'T3', 'wed': 'T4',
        'thu': 'T5', 'fri': 'T6', 'sat': 'T7', 'sun': 'CN'
    };
    const displayOrder = ['open', 'closed', 'other'];
    const sortedGroupKeys = Object.keys(groupedHours).sort((a, b) => {
        let aType = a.includes(':') ? 'open' : (a === 'closed' ? 'closed' : 'other');
        let bType = b.includes(':') ? 'open' : (b === 'closed' ? 'closed' : 'other');
        let aIndex = displayOrder.indexOf(aType);
        let bIndex = displayOrder.indexOf(bType);
        if (aIndex !== bIndex) return aIndex - bIndex;
        if (aType === 'open') return a.localeCompare(b);
        return a.localeCompare(b);
    });

    sortedGroupKeys.forEach(valueKey => {
        const days = groupedHours[valueKey];
        const displayDays = days.map(d => dayMap[d] || d).join(', ');
        let hoursDisplay = valueKey;
        let hoursClass = 'error';

        if (valueKey === 'closed') {
            hoursDisplay = 'Đóng cửa';
            hoursClass = 'closed';
        } else if (valueKey.includes('-')) {
            const times = valueKey.split('-');
            // Regex to check HH:MM format more strictly
            if (times.length === 2 && /^([01]\d|2[0-3]):([0-5]\d)$/.test(times[0].trim()) && /^([01]\d|2[0-3]):([0-5]\d)$/.test(times[1].trim())) {
                hoursDisplay = times.map(t => t.trim()).join(' - ');
                hoursClass = 'open';
            } else {
                hoursDisplay = valueKey; // Show raw value if format is unexpected
            }
        } else {
            hoursDisplay = valueKey; // Show raw value for anything else
        }
        formattedHtml += `<div><strong>${displayDays}:</strong> <span class="${hoursClass}">${hoursDisplay}</span></div>`;
    });
    formattedHtml += '</div>';
    return formattedHtml;
}

function openMapPicker() {
    document.getElementById('mapModal').classList.remove('hidden');
    setTimeout(initLeafletMapPicker, 100);
}

function closeMapPicker() {
    document.getElementById('mapModal').classList.add('hidden');
}

function initLeafletMapPicker() {
    const defaultLat = parseFloat(document.getElementById('poiLatInput').value) || 11.374232;
    const defaultLng = parseFloat(document.getElementById('poiLonInput').value) || 106.175094;
    if (!leafletMap) {
        leafletMap = L.map('leafletMap').setView([defaultLat, defaultLng], 16);
        // Google Satellite (nếu không hiển thị, hãy dùng Esri bên dưới)
        L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '© Google'
        }).addTo(leafletMap);
        leafletMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(leafletMap);
        leafletMap.on('click', function (e) {
            leafletMarker.setLatLng(e.latlng);
            updateLatLngInputs(e.latlng.lat, e.latlng.lng);
        });
        leafletMarker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            updateLatLngInputs(pos.lat, pos.lng);
        });
    } else {
        leafletMap.setView([defaultLat, defaultLng], 16);
        leafletMarker.setLatLng([defaultLat, defaultLng]);
    }
}

function updateLatLngInputs(lat, lng) {
    document.getElementById('poiLatInput').value = lat.toFixed(6);
    document.getElementById('poiLonInput').value = lng.toFixed(6);
    // Lấy độ cao từ Open-Elevation API (miễn phí, không cần key)
    fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.results && data.results[0] && typeof data.results[0].elevation === 'number') {
                document.getElementById('poiElevInput').value = Math.round(data.results[0].elevation);
            }
        })
        .catch(() => {
            // Nếu lỗi, không làm gì, người dùng có thể nhập tay
        });
}

// --- Khi ấn nút 'Tải tất cả POI', đồng bộ luôn 2 json ---
async function loadAllPoisAndSyncGioHoatDong() {
    showLoading(true);
    try {
        // Fetch POI
        const poiData = await fetchData('/.netlify/functions/data-blobs?file=POI.json');
        // Fetch GioHoatDong
        const gioData = await fetchData('/.netlify/functions/data-blobs?file=GioHoatDong.json');
        console.log('[DEBUG] loadAllPoisAndSyncGioHoatDong - gioData received:', gioData);
        globalGioHoatDongList = Array.isArray(gioData) ? gioData : [];
        console.log('[DEBUG] loadAllPoisAndSyncGioHoatDong - globalGioHoatDongList set to:', globalGioHoatDongList);
        if (Array.isArray(poiData)) {
            currentPoiList = poiData;
            displayPoisInTable(currentPoiList);
            savePoisToCache(currentPoiList);
            displayStatus('Đã tải đồng bộ POI và Giờ Hoạt Động thành công!');
        } else {
            displayStatus('Lỗi: Không nhận được dữ liệu POI hợp lệ từ server.', true);
        }
    } catch (e) {
        displayStatus('Lỗi khi tải dữ liệu: ' + e, true);
    } finally {
        showLoading(false);
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    createOperatingHoursUi(); // Create the operating hours input structure
    console.log("POI Management UI Initialized. API URL:", API_URLS.poi);

    // Load fresh data immediately instead of using cache
    loadAllPoisAndSyncGioHoatDong();

    // Add event listeners to sortable headers
    document.querySelectorAll('#poiTable thead th[data-sort-key]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort-key');
            if (key) {
                handleSort(key);
            }
        });
        // Add cursor pointer to indicate clickable
        th.style.cursor = 'pointer';
    });

    // Removed: Tab switcher for POI button

    // Gán lại nút tải tất cả POI
    const btnLoadAll = document.querySelector('button[onclick="loadAllPois()"]');
    if (btnLoadAll) {
        btnLoadAll.onclick = loadAllPoisAndSyncGioHoatDong;
    }
}); 