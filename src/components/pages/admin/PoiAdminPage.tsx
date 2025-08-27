
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PoiAdminPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBolt, faEdit, faThList, faSearch, faTrashAlt, faSave, faEraser, faList, faPlus } from '@fortawesome/free-solid-svg-icons';

// Fix for default marker icon in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const API_URLS = {
    poi: '/.netlify/functions/data-blobs?file=POI.json',
    gioHoatDong: '/.netlify/functions/data-blobs?file=GioHoatDong.json',
};

const PoiAdminPage: React.FC = () => {
    const [poiList, setPoiList] = useState<any[]>([]);
    const [gioHoatDongList, setGioHoatDongList] = useState<any[]>([]);
    const [statusMessage, setStatusMessage] = useState<{ message: string, isError: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [formCoordinates, setFormCoordinates] = useState<[number, number] | null>(null);

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        loadAllPoisAndSyncGioHoatDong();
    }, []);

    const showStatus = (message: string, isError = false, duration = 5000) => {
        setStatusMessage({ message, isError });
        setTimeout(() => setStatusMessage(null), duration);
    };

    const fetchData = async (url: string, options: RequestInit = {}) => {
        setIsLoading(true);
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            if (options.method && options.method !== 'GET' && response.headers.get("content-type")?.includes("application/json") === false) {
                return await response.text();
            }
            return await response.json();
        } catch (error: any) {
            showStatus(`Lỗi: ${error.message || 'Không thể kết nối đến máy chủ.'}`, true);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllPoisAndSyncGioHoatDong = async () => {
        setIsLoading(true);
        try {
            const [poiData, gioData] = await Promise.all([
                fetchData(API_URLS.poi),
                fetchData(API_URLS.gioHoatDong)
            ]);

            if (Array.isArray(poiData)) {
                setPoiList(poiData);
            } else {
                showStatus('Lỗi: Không nhận được dữ liệu POI hợp lệ từ server.', true);
            }

            if (Array.isArray(gioData)) {
                setGioHoatDongList(gioData);
            } else {
                showStatus('Lỗi: Không nhận được dữ liệu Giờ Hoạt Động hợp lệ từ server.', true);
            }
            showStatus('Đã tải đồng bộ POI và Giờ Hoạt Động thành công!');
        } catch (e: any) {
            showStatus('Lỗi khi tải dữ liệu: ' + e.message, true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearForm = () => {
        formRef.current?.reset();
        const hiddenId = formRef.current?.querySelector('input[name="id"]') as HTMLInputElement;
        if(hiddenId) hiddenId.value = '';
        const displayId = document.getElementById('poiIdDisplay') as HTMLInputElement;
        if(displayId) displayId.value = '(Tự động)';
    };

    const populateFormForEdit = (poi: any) => {
        clearForm();
        if (!poi || typeof poi !== 'object' || !poi.id) {
            showStatus("Không có dữ liệu POI hợp lệ để điền vào form.", true);
            return;
        }
        
        const displayId = document.getElementById('poiIdDisplay') as HTMLInputElement;
        if(displayId) displayId.value = poi.id;

        if(formRef.current){
            const elements = formRef.current.elements;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                const key = element.name;
                if (key && poi.hasOwnProperty(key)) {
                    element.value = poi[key];
                }
            }
        }
        
        document.getElementById('poiForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showStatus(`Đã tải dữ liệu POI ID ${poi.id} vào form.`, false, 3000);
    };

    const getPoiByIdAndPopulate = async (id: string) => {
        if (!id) return;
        const poi = poiList.find(p => String(p.id) === String(id));
        if (poi) {
            populateFormForEdit(poi);
        } else {
            showStatus(`Không tìm thấy POI với ID ${id} trong danh sách hiện tại.`, true);
        }
    };

    const addOrUpdatePoi = async () => {
        if(!formRef.current) return;

        const formData = new FormData(formRef.current);
        const poiData: any = {};
        formData.forEach((value, key) => {
            poiData[key] = value;
        });

        if (!poiData.name) {
            showStatus('Vui lòng nhập Tên POI (trường bắt buộc).', true);
            return;
        }

        let updatedList = [...poiList];
        const currentIdValue = poiData.id;
        let isUpdate = !!currentIdValue;

        if (isUpdate) {
            const idx = updatedList.findIndex(p => String(p.id) === String(currentIdValue));
            if (idx !== -1) {
                updatedList[idx] = { ...updatedList[idx], ...poiData };
            }
        } else {
            let maxId = 0;
            updatedList.forEach(p => { const idNum = parseInt(p.id); if (!isNaN(idNum) && idNum > maxId) maxId = idNum; });
            poiData.id = String(maxId + 1);
            updatedList.push(poiData);
        }

        await fetchData(API_URLS.poi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedList)
        });

        showStatus('Đã lưu thành công lên server!', false);
        await loadAllPoisAndSyncGioHoatDong();
        clearForm();
    };

    const deletePoiFromRow = async (id: string) => {
        if (!id || !window.confirm('Bạn có chắc chắn muốn xóa POI này?')) return;
        
        const updatedList = poiList.filter(p => String(p.id) !== String(id));

        await fetchData(API_URLS.poi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedList)
        });

        showStatus('Đã xóa và lưu thành công!', false);
        await loadAllPoisAndSyncGioHoatDong();
        clearForm();
    };

    const MapPicker = () => {
        const map = useMapEvents({
            click(e) {
                setFormCoordinates([e.latlng.lat, e.latlng.lng]);
                const latInput = document.getElementById('poiLatInput') as HTMLInputElement;
                const lonInput = document.getElementById('poiLonInput') as HTMLInputElement;
                if(latInput) latInput.value = e.latlng.lat.toFixed(6);
                if(lonInput) lonInput.value = e.latlng.lng.toFixed(6);
                setShowMapModal(false);
            },
        });

        return formCoordinates ? <Marker position={formCoordinates}></Marker> : null;
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-indigo-600" /> Quản lý POI Núi Bà Đen
                </h1>
                <p className="text-slate-600">Quản lý và cập nhật thông tin các điểm tham quan trên Núi Bà Đen</p>
            </header>

            {statusMessage && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${statusMessage.isError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                    {statusMessage.message}
                </div>
            )}

            {isLoading && <div className="mb-6 text-center py-8"><div className="loader"></div><p className="text-sm text-slate-500 mt-3">Đang tải dữ liệu...</p></div>}

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <FontAwesomeIcon icon={faBolt} className="mr-2 text-amber-500" /> Hành động nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-transparent mb-2">Ẩn</label>
                        <button onClick={loadAllPoisAndSyncGioHoatDong} className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200 flex items-center justify-center">
                            <FontAwesomeIcon icon={faList} className="mr-2" /> Tải tất cả POI
                        </button>
                    </div>
                    <div>
                        <label htmlFor="getPoiId" className="block text-sm font-medium text-slate-700 mb-2">Lấy POI theo ID:</label>
                        <div className="flex gap-2">
                            <input type="number" id="getPoiId" placeholder="Nhập ID POI" className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            <button onClick={() => getPoiByIdAndPopulate((document.getElementById('getPoiId') as HTMLInputElement).value)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="deletePoiId" className="block text-sm font-medium text-slate-700 mb-2">Xóa POI theo ID:</label>
                        <div className="flex gap-2">
                            <input type="number" id="deletePoiId" placeholder="Nhập ID POI cần xóa" className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                            <button onClick={() => deletePoiFromRow((document.getElementById('deletePoiId') as HTMLInputElement).value)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <FontAwesomeIcon icon={faEdit} className="mr-2 text-green-600" /> Thêm / Cập nhật POI
                </h2>
                <form id="poiForm" ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <input type="hidden" id="poiIdHidden" name="id" />
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-slate-700 mb-3">Thông tin cơ bản</h3>
                                <div>
                                    <label htmlFor="poiIdDisplay" className="block text-sm font-medium text-slate-700 mb-1">ID</label>
                                    <input type="text" id="poiIdDisplay" readOnly placeholder="(Tự động)" className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="poiNameInput" className="block text-sm font-medium text-slate-700 mb-1">Tên (name) <span className="text-red-500">*</span></label>
                                    <input type="text" id="poiNameInput" name="name" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="poiNameEnInput" className="block text-sm font-medium text-slate-700 mb-1">Tên tiếng Anh (name_en)</label>
                                    <input type="text" id="poiNameEnInput" name="name_en" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-slate-700 mb-3">Thông tin vị trí</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí (latitude, longitude)</label>
                                    <div className="flex gap-2">
                                        <input type="number" id="poiLatInput" name="latitude" step="any" placeholder="Vĩ độ" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        <input type="number" id="poiLonInput" name="longitude" step="any" placeholder="Kinh độ" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        <button type="button" onClick={() => setShowMapModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">Chọn trên bản đồ</button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="poiElevInput" className="block text-sm font-medium text-slate-700 mb-1">Độ cao (elevation)</label>
                                    <input type="number" id="poiElevInput" name="elevation" placeholder="Ví dụ: 986" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-slate-700 mb-3">Phân loại</h3>
                                <div>
                                    <label htmlFor="poiCategoryInput" className="block text-sm font-medium text-slate-700 mb-1">Danh mục (category)</label>
                                    <select id="poiCategoryInput" name="category" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                                        <option value="">-- Chọn danh mục --</option>
                                        <option value="attraction">Điểm tham quan (attraction)</option>
                                        <option value="food">Ẩm thực (food)</option>
                                        <option value="religion">Tôn giáo (religion)</option>
                                        <option value="parking">Bãi đỗ xe (parking)</option>
                                        <option value="transport">Vận chuyển (transport)</option>
                                        <option value="amenities">Tiện ích (amenities)</option>
                                        <option value="viewpoint">Điểm ngắm cảnh (viewpoint)</option>
                                        <option value="historical">Di tích lịch sử (historical)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="poiAreaSelect" className="block text-sm font-medium text-slate-700 mb-1">Khu vực (area)</label>
                                    <select id="poiAreaSelect" name="area" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">-- Chọn Khu vực --</option>
                                        <option value="Chân núi">Chân núi</option>
                                        <option value="Chùa Bà">Chùa Bà</option>
                                        <option value="Đỉnh núi">Đỉnh núi</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="poiFeaturedInput" className="block text-sm font-medium text-slate-700 mb-1">Nổi bật (featured)</label>
                                    <select id="poiFeaturedInput" name="featured" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">-- Chọn trạng thái --</option>
                                        <option value="TRUE">Có (TRUE)</option>
                                        <option value="FALSE">Không (FALSE)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-slate-700 mb-3">URL Media</h3>
                                <div>
                                    <label htmlFor="poiIconUrlInput" className="block text-sm font-medium text-slate-700 mb-1">URL Biểu tượng (iconurl)</label>
                                    <input type="url" id="poiIconUrlInput" name="iconurl" placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="poiImageUrlInput" className="block text-sm font-medium text-slate-700 mb-1">URL Hình ảnh (imageurl)</label>
                                    <input type="url" id="poiImageUrlInput" name="imageurl" placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="poiAudioUrlInput" className="block text-sm font-medium text-slate-700 mb-1">URL Âm thanh (audio_url)</label>
                                    <input type="url" id="poiAudioUrlInput" name="audio_url" placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-slate-700 mb-3">Thông tin bổ sung</h3>
                                <div>
                                    <label htmlFor="poiAudioUrlEnInput" className="block text-sm font-medium text-slate-700 mb-1">URL Âm thanh EN (audio_url_en)</label>
                                    <input type="url" id="poiAudioUrlEnInput" name="audio_url_en" placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="poiWalkableInput" className="block text-sm font-medium text-slate-700 mb-1">Đi bộ tới (walkable_to)</label>
                                    <input type="text" id="poiWalkableInput" name="walkable_to" placeholder="ID cách nhau bởi dấu phẩy, ví dụ: 2,3,5" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <h3 className="text-lg font-medium text-slate-700 mb-3">Mô tả</h3>
                        <div>
                            <label htmlFor="poiDescInput" className="block text-sm font-medium text-slate-700 mb-1">Mô tả (description)</label>
                            <textarea id="poiDescInput" name="description" rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                        <div>
                            <label htmlFor="poiDescEnInput" className="block text-sm font-medium text-slate-700 mb-1">Mô tả tiếng Anh (description_en)</label>
                            <textarea id="poiDescEnInput" name="description_en" rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                        <button type="button" onClick={clearForm} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-medium">
                            <FontAwesomeIcon icon={faEraser} className="mr-2" /> Xóa Form
                        </button>
                        <button type="button" onClick={addOrUpdatePoi} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                            <FontAwesomeIcon icon={faSave} className="mr-2" /> Lưu (Thêm / Cập nhật)
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <FontAwesomeIcon icon={faThList} className="mr-2 text-blue-600" /> Danh sách POI
                </h2>
                <div className="overflow-x-auto">
                    <table id="poiTable" className="min-w-full divide-y divide-slate-200 border border-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="w-16 px-4 py-3 text-left text-sm font-medium text-slate-700">ID</th>
                                <th scope="col" className="min-w-[200px] px-4 py-3 text-left text-sm font-medium text-slate-700">Tên</th>
                                <th scope="col" className="min-w-[150px] px-4 py-3 text-left text-sm font-medium text-slate-700">Danh mục</th>
                                <th scope="col" className="min-w-[120px] px-4 py-3 text-left text-sm font-medium text-slate-700">Khu vực</th>
                                <th scope="col" className="min-w-[250px] px-4 py-3 text-left text-sm font-medium text-slate-700">Giờ hoạt động</th>
                                <th scope="col" className="w-24 px-4 py-3 text-center text-sm font-medium text-slate-700">Nổi bật</th>
                                <th scope="col" className="w-28 px-4 py-3 text-center text-sm font-medium text-slate-700">Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="poiTableBody" className="bg-white divide-y divide-slate-200">
                            {poiList.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500 italic">Chưa có dữ liệu. Nhấn "Tải tất cả POI" để bắt đầu.</td></tr>
                            ) : (
                                poiList.map(poi => (
                                    <tr key={poi.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-4 py-3 font-medium text-slate-900">{poi.id}</td>
                                        <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={poi.name}>{poi.name}</td>
                                        <td className="px-4 py-3">{poi.category}</td>
                                        <td className="px-4 py-3">{poi.area}</td>
                                        <td className="px-4 py-3">{/* Operating hours would be complex to render here without more logic */}</td>
                                        <td className="px-4 py-3 text-center">{poi.featured ? 'Có' : 'Không'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="text-indigo-600 hover:text-indigo-900" onClick={() => getPoiByIdAndPopulate(poi.id)}><FontAwesomeIcon icon={faEdit} /></button>
                                            <button className="text-red-600 hover:text-red-900 ml-4" onClick={() => deletePoiFromRow(poi.id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-4 relative w-full max-w-2xl h-[500px] flex flex-col">
                        <button onClick={() => setShowMapModal(false)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 text-xl">&times;</button>
                        <h3 className="text-lg font-semibold mb-2">Chọn vị trí trên bản đồ vệ tinh</h3>
                        <MapContainer center={formCoordinates || [11.374232, 106.175094]} zoom={16} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                                attribution="© Google"
                            />
                            <MapPicker />
                        </MapContainer>
                        <div className="mt-4 text-right">
                            <button onClick={() => setShowMapModal(false)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoiAdminPage;
