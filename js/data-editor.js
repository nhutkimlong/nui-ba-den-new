const fileSelect = document.getElementById('fileSelect');
const btnLoad = document.getElementById('btnLoad');
const btnSave = document.getElementById('btnSave');
const btnValidate = document.getElementById('btnValidate');
const btnAdd = document.getElementById('btnAdd');
const jsonEditor = document.getElementById('jsonEditor');
const statusDiv = document.getElementById('status');
const tableArea = document.getElementById('tableArea');
const modalBg = document.getElementById('modalBg');
const modalForm = document.getElementById('modalForm');

let currentFile = '';
let dataArr = [];
let headers = [];

function showStatus(type, msg) {
    statusDiv.className = 'status ' + type;
    statusDiv.textContent = msg;
    statusDiv.style.display = 'block';
}

function clearStatus() { 
    statusDiv.style.display = 'none'; 
}

function renderTable() {
    tableArea.innerHTML = '';
    if (!Array.isArray(dataArr) || dataArr.length === 0) {
        tableArea.innerHTML = '<p style="color:#888; margin-top:16px;">Không có dữ liệu để hiển thị.</p>';
        return;
    }
    // Lấy headers từ keys của object đầu tiên
    headers = Object.keys(dataArr[0]);
    let html = '<table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '<th>Hành động</th></tr></thead><tbody>';
    dataArr.forEach((item, idx) => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${item[h] !== undefined ? item[h] : ''}</td>`);
        html += `<td class="table-actions">
            <button onclick="editItem(${idx})"><i class='fas fa-edit'></i> Sửa</button>
            <button onclick="deleteItem(${idx})"><i class='fas fa-trash'></i> Xóa</button>
        </td></tr>`;
    });
    html += '</tbody></table>';
    tableArea.innerHTML = html;
    // Cập nhật lại textarea raw
    jsonEditor.value = JSON.stringify(dataArr, null, 2);
}

// Sửa/thêm item (hiện modal)
window.editItem = function(idx) {
    const item = dataArr[idx];
    let formHtml = `<h3>Sửa mục</h3>`;
    headers.forEach(h => {
        formHtml += `<label>${h}<input type="text" name="${h}" value="${item[h] !== undefined ? item[h] : ''}"></label>`;
    });
    formHtml += `<div class="modal-actions">
        <button onclick="saveEdit(${idx})" style="background:#22c55e;color:#fff;">Lưu</button>
        <button onclick="closeModal()" style="background:#e5e7eb;">Hủy</button>
    </div>`;
    modalForm.innerHTML = formHtml;
    modalBg.style.display = 'flex';
}

window.saveEdit = function(idx) {
    const inputs = modalForm.querySelectorAll('input');
    inputs.forEach(input => {
        dataArr[idx][input.name] = input.value;
    });
    renderTable();
    closeModal();
}

window.deleteItem = function(idx) {
    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
        dataArr.splice(idx, 1);
        renderTable();
    }
}

btnAdd.onclick = function() {
    if (!headers.length) {
        showStatus('warning', 'Hãy tải dữ liệu trước để xác định cấu trúc!');
        return;
    }
    let formHtml = `<h3>Thêm mục mới</h3>`;
    headers.forEach(h => {
        formHtml += `<label>${h}<input type="text" name="${h}" value=""></label>`;
    });
    formHtml += `<div class="modal-actions">
        <button onclick="saveAdd()" style="background:#6366f1;color:#fff;">Thêm</button>
        <button onclick="closeModal()" style="background:#e5e7eb;">Hủy</button>
    </div>`;
    modalForm.innerHTML = formHtml;
    modalBg.style.display = 'flex';
}

window.saveAdd = function() {
    const inputs = modalForm.querySelectorAll('input');
    const newItem = {};
    inputs.forEach(input => {
        newItem[input.name] = input.value;
    });
    dataArr.push(newItem);
    renderTable();
    closeModal();
}

window.closeModal = function() {
    modalBg.style.display = 'none';
    modalForm.innerHTML = '';
}

btnLoad.onclick = async () => {
    clearStatus();
    const file = fileSelect.value;
    if (!file) {
        showStatus('warning', 'Vui lòng chọn file dữ liệu!');
        return;
    }
    currentFile = file;
    showStatus('warning', 'Đang tải dữ liệu...');
    try {
        const res = await fetch(`/.netlify/functions/data-blobs?file=${encodeURIComponent(file)}`);
        if (!res.ok) throw new Error('Không tìm thấy hoặc lỗi server!');
        const data = await res.json();
        if (Array.isArray(data)) {
            dataArr = data;
            renderTable();
            showStatus('success', 'Đã tải dữ liệu thành công!');
        } else {
            dataArr = [];
            tableArea.innerHTML = '<p style="color:#888; margin-top:16px;">File không phải là mảng JSON!</p>';
            jsonEditor.value = JSON.stringify(data, null, 2);
            showStatus('warning', 'File không phải là mảng JSON!');
        }
    } catch (e) {
        dataArr = [];
        tableArea.innerHTML = '';
        jsonEditor.value = '';
        showStatus('error', 'Lỗi tải dữ liệu: ' + e.message);
    }
};

btnSave.onclick = async () => {
    clearStatus();
    if (!currentFile) {
        showStatus('warning', 'Vui lòng chọn file và tải dữ liệu trước!');
        return;
    }
    // Lưu theo dataArr (ưu tiên bảng)
    let parsed;
    try {
        parsed = JSON.parse(jsonEditor.value);
    } catch (e) {
        parsed = dataArr;
    }
    showStatus('warning', 'Đang lưu dữ liệu...');
    try {
        const res = await fetch(`/.netlify/functions/data-blobs?file=${encodeURIComponent(currentFile)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataArr)
        });
        if (!res.ok) throw new Error('Lỗi server khi lưu!');
        showStatus('success', 'Đã lưu thành công lên server!');
    } catch (e) {
        showStatus('error', 'Lỗi khi lưu: ' + e.message);
    }
};

btnValidate.onclick = () => {
    clearStatus();
    try {
        JSON.parse(jsonEditor.value);
        showStatus('success', 'JSON hợp lệ!');
    } catch (e) {
        showStatus('error', 'JSON không hợp lệ: ' + e.message);
    }
};

// Khi sửa textarea raw, cập nhật lại dataArr nếu hợp lệ
jsonEditor.oninput = function() {
    try {
        const val = JSON.parse(jsonEditor.value);
        if (Array.isArray(val)) {
            dataArr = val;
            renderTable();
        }
    } catch {}
}