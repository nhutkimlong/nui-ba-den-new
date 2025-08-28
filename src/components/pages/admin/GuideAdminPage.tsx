
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AdminStyles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faBed, faUtensils, faGift, faPlus, faSave, faTimes, faPencilAlt, faTrashAlt, faCircleNotch, faArrowLeft, faBook } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveContainer, useDevice } from '../../layout';

const SHEET_MAP = {
    tours: 'Tours',
    accommodations: 'Accommodations',
    restaurants: 'Restaurants',
    specialties: 'Specialties'
};

const API_URLS = {
    tours: '/.netlify/functions/data-blobs?file=Tours.json',
    accommodations: '/.netlify/functions/data-blobs?file=Accommodations.json',
    restaurants: '/.netlify/functions/data-blobs?file=Restaurants.json',
    specialties: '/.netlify/functions/data-blobs?file=Specialties.json'
};

const GuideAdminPage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<keyof typeof SHEET_MAP>('tours');
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState<any | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        loadTabData(currentTab);
    }, [currentTab]);

    const loadTabData = async (tabId: keyof typeof SHEET_MAP) => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URLS[tabId]);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const jsonData = await response.json();
            const guessedHeaders = guessHeaders(jsonData);
            setData(jsonData);
            setHeaders(guessedHeaders);
        } catch (error) {
            console.error(`Error loading data for ${tabId}:`, error);
            setData([]);
            setHeaders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const guessHeaders = (data: any[]): string[] => {
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
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const item: any = {};
        headers.forEach(header => {
            let val = formData.get(header);
            if (header.toLowerCase() === 'isactive') {
                item[header] = val === 'true';
            } else {
                item[header] = val;
            }
        });

        let updatedData = [...data];
        if (item.id) { // Edit
            const index = data.findIndex(d => d.id === item.id);
            if (index > -1) {
                updatedData[index] = item;
            }
        } else { // Add
            let prefix = '';
            if (currentTab === 'tours') prefix = 'TOUR';
            else if (currentTab === 'accommodations') prefix = 'ACC';
            else if (currentTab === 'restaurants') prefix = 'RES';
            else if (currentTab === 'specialties') prefix = 'SPE';
            
            const maxId = data.reduce((max, it) => {
                const m = (it.id || '').match(/\d+/);
                return m ? Math.max(max, parseInt(m[0])) : max;
            }, 0);
            item.id = prefix + String(maxId + 1).padStart(3, '0');
            updatedData.push(item);
        }

        await saveCurrentSheetData(updatedData);
        closeModal();
    };

    const saveCurrentSheetData = async (updatedData: any[]) => {
        setIsLoading(true);
        try {
            const url = API_URLS[currentTab];
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            await loadTabData(currentTab);
        } catch (error) {
            alert('Lỗi khi lưu dữ liệu: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteItem = (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        const updatedData = data.filter(item => item.id !== id);
        saveCurrentSheetData(updatedData);
    };

    const openModal = (item: any | null = null) => {
        setModalItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalItem(null);
    };

    const renderFormFields = () => {
        if (!headers || headers.length === 0) {
            return <p className="text-red-500">Không thể tạo form, không có thông tin cột.</p>;
        }

        return headers.map(header => {
            if (header.toLowerCase() === 'id' && modalItem) return null;

            const value = modalItem ? (modalItem[header] || '') : '';
            const inputType = header.toLowerCase().includes('image') || header.toLowerCase().includes('link') ? 'url' : 'text';

            return (
                <div key={header}>
                    <label htmlFor={`field-${header}`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {header.toLowerCase() === 'isactive' ? (
                        <select
                            id={`field-${header}`}
                            name={header}
                            defaultValue={value.toString()}
                            className="mt-1 block w-full py-2.5 px-3.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="true">Hoạt động (True)</option>
                            <option value="false">Không hoạt động (False)</option>
                        </select>
                    ) : header.toLowerCase().includes('description') ? (
                        <textarea
                            id={`field-${header}`}
                            name={header}
                            defaultValue={value}
                            rows={4}
                            className="mt-1 block w-full py-2.5 px-3.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    ) : (
                        <input
                            type={inputType}
                            id={`field-${header}`}
                            name={header}
                            defaultValue={value}
                            readOnly={header.toLowerCase() === 'id'}
                            className="mt-1 block w-full py-2.5 px-3.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    )}
                </div>
            );
        });
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
                                    <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                                        <FontAwesomeIcon icon={faBook} className="text-emerald-600 text-2xl" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">Quản lý Cẩm Nang Du Lịch</h1>
                                        <p className="text-slate-600 text-sm lg:text-base truncate">Quản lý và cập nhật thông tin cẩm nang du lịch Núi Bà Đen</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            <div className="mb-6">
                <nav className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
                    {(Object.keys(SHEET_MAP) as Array<keyof typeof SHEET_MAP>).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setCurrentTab(tab)}
                            className={`tab-link px-3 lg:px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${currentTab === tab ? 'bg-white text-slate-700 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-white hover:text-slate-700'}`}
                        >
                            <FontAwesomeIcon icon={
                                tab === 'tours' ? faRoute :
                                tab === 'accommodations' ? faBed :
                                tab === 'restaurants' ? faUtensils : faGift
                            } className="mr-1 lg:mr-2" />
                            <span className="hidden sm:inline">{SHEET_MAP[tab]}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div id="tab-content-area">
                {isLoading ? (
                    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[150]">
                        <div className="text-center">
                            <FontAwesomeIcon icon={faCircleNotch} spin className="text-5xl text-indigo-600" />
                            <p className="mt-4 text-xl text-slate-700">Đang xử lý...</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-700">Danh sách {SHEET_MAP[currentTab]} ({data.length} mục)</h2>
                            <button onClick={() => openModal()} className="bg-indigo-600 text-white font-medium py-2.5 px-4 lg:px-5 rounded-lg shadow-md hover:bg-indigo-700 transition text-sm lg:text-base">
                                <FontAwesomeIcon icon={faPlus} className="mr-1 lg:mr-2" />
                                <span className="hidden sm:inline">Thêm mới</span>
                                <span className="sm:hidden">Thêm</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {headers.map(header => <th key={header} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{header}</th>)}
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.length === 0 ? (
                                        <tr><td colSpan={headers.length + 1} className="text-center py-10 text-gray-500 px-5 py-3.5">Chưa có dữ liệu nào.</td></tr>
                                    ) : (
                                        data.map((item, idx) => (
                                            <tr key={item.id || idx} className="hover:bg-indigo-50 transition-colors duration-150">
                                                {headers.map(header => {
                                                    let value = item[header];
                                                    let displayValue: React.ReactNode = '';
                                                    if (typeof value === 'boolean') {
                                                        displayValue = value ? 'Kích hoạt' : 'Vô hiệu';
                                                    } else if (header.toLowerCase() === 'image' && value && typeof value === 'string' && value.startsWith('http')) {
                                                        displayValue = <img src={value} alt="Image" className="h-12 w-12 object-cover rounded-md shadow" loading="lazy" />;
                                                    } else {
                                                        displayValue = value !== null && typeof value !== 'undefined' ? String(value).substring(0, 70) + (String(value).length > 70 ? '...' : '') : 'N/A';
                                                    }
                                                    return <td key={header} className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">{displayValue}</td>;
                                                })}
                                                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700 text-right">
                                                    <button onClick={() => openModal(item)} className="text-indigo-600 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition mr-2"><FontAwesomeIcon icon={faPencilAlt} /></button>
                                                    <button onClick={() => deleteItem(item.id)} className="text-red-600 bg-red-50 p-2 rounded-md hover:bg-red-100 transition"><FontAwesomeIcon icon={faTrashAlt} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal active fixed inset-0 bg-slate-900 bg-opacity-80 h-full w-full p-4 z-[200]">
                    <div className="modal-content bg-white rounded-xl shadow-2xl w-full max-w-xl lg:max-w-3xl">
                        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-200">
                            <h2 className="text-2xl font-semibold text-slate-800">{modalItem ? 'Sửa mục' : 'Thêm mới'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 transition duration-150 text-4xl leading-none focus:outline-none">&times;</button>
                        </div>
                        <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col flex-grow overflow-hidden p-6 pt-2">
                            <input type="hidden" name="id" defaultValue={modalItem?.id || ''} />
                            <div id="formFieldsContainer" className="space-y-5">
                                {renderFormFields()}
                            </div>
                            <div className="mt-auto flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200">
                                <button type="button" onClick={closeModal} className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition duration-150 font-medium text-sm">
                                    <FontAwesomeIcon icon={faTimes} className="mr-2" />Hủy Bỏ
                                </button>
                                <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 font-medium text-sm">
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />Lưu Thay Đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </ResponsiveContainer>
    );
};

export default GuideAdminPage;
