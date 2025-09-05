import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { offlineStorageService } from '@/services/offlineStorageService';
import SwipeableTabs from '../common/SwipeableTabs';
import { Route, Hotel, Utensils, Flame, MapPin, Phone, Tags, Store, Star, Clock, Users, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, GridLayout, useDevice } from '../layout';
import Button from '../common/Button';
import { cn } from '@/utils/cn';

// --- TYPE DEFINITIONS ---
interface Tour {
    name: string;
    description: string;
    image: string;
    duration: string;
    activities: string;
    detailsLink?: string;
    detailslink?: string;
    buttonText?: string;
}

interface Accommodation {
    name: string;
    image: string;
    stars: string;
    address: string;
    phone: string;
    mapLink?: string;
    maplink?: string;
}

interface Restaurant {
    name: string;
    image: string;
    address: string;
    cuisine: string;
    mapLink?: string;
    maplink?: string;
}

interface Specialty {
    name: string;
    image: string;
    description: string;
    purchaseLocation: string;
}

type GuideItem = Tour | Accommodation | Restaurant | Specialty;

// Simple in-memory cache to avoid re-fetching per tab/mount on mobile
const guideMemoryCache: Record<string, any[]> = {};
const guideFetchInFlight: Record<string, Promise<any[]> | null> = {};

// --- CUSTOM HOOK for data fetching and pagination ---
const useGuideSection = <T extends GuideItem>(file: string) => {
    const [allItems, setAllItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 3 : 6);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const newItemsPerPage = window.innerWidth < 768 ? 3 : 6;
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1); // Reset to first page on resize
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!file) return;
            setError(null);
            setCurrentPage(1);

            // 0) Use in-memory cache immediately to avoid spinner when switching tabs
            if (guideMemoryCache[file] && guideMemoryCache[file].length > 0) {
                setAllItems(guideMemoryCache[file] as any);
                setHasLoaded(true);
                setLoading(false);
                const storeTmp = { 'Tours.json': 'tours', 'Accommodations.json': 'accommodations', 'Restaurants.json': 'restaurants', 'Specialties.json': 'tours' } as Record<string,string>;
                void refreshGuideInBackground(file, storeTmp[file] || 'tours', (items) => {
                    guideMemoryCache[file] = items;
                    setAllItems(items as any);
                });
                return;
            }

            setLoading(true);

            try {
                // 1) Offline-first by file mapping -> store names
                const storeMapLocal: Record<string, string> = {
                    'Tours.json': 'tours',
                    'Accommodations.json': 'accommodations',
                    'Restaurants.json': 'restaurants',
                    'Specialties.json': 'tours' // fallback store if not defined
                };
                const store = storeMapLocal[file] || 'tours';

                // Read cache first
                let cached: any[] = [];
                try {
                    if (store === 'tours') cached = await offlineStorageService.getTours();
                    else if (store === 'accommodations') cached = await offlineStorageService.getAll('accommodations').then(r => r.map(i => i.data));
                    else if (store === 'restaurants') cached = await offlineStorageService.getAll('restaurants').then(r => r.map(i => i.data));
                } catch {}
                if (cached && cached.length > 0) {
                    setAllItems(cached as any);
                    setHasLoaded(true);
                    guideMemoryCache[file] = cached;
                    // background refresh
                    void refreshGuideInBackground(file, store, (items) => {
                        guideMemoryCache[file] = items;
                        setAllItems(items as any);
                    });
                    return;
                }

                // 2) Network fetch as fallback
                if (guideFetchInFlight[file]) {
                    const data = await guideFetchInFlight[file]!;
                    setAllItems(data as any);
                    setHasLoaded(true);
                    setLoading(false);
                    return;
                }

                guideFetchInFlight[file] = fetch(`/.netlify/functions/data-blobs?file=${file}`, { cache: 'no-cache' })
                  .then(async (res) => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const json = await res.json();
                    if (!Array.isArray(json)) throw new Error('Invalid data format from API.');
                    return json as any[];
                  })
                  .finally(() => { guideFetchInFlight[file] = null; });

                const data = await guideFetchInFlight[file]!;

                setAllItems(data);
                setHasLoaded(true);
                guideMemoryCache[file] = data;
                // Store to IndexedDB
                try {
                    if (store === 'tours') await offlineStorageService.storeTours(data);
                    // TODO: add similar store methods for other collections if needed
                } catch {}
            } catch (e: any) {
                console.error(`Failed to fetch ${file}:`, e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [file]);

    const refreshGuideInBackground = async (file: string, store: string, update: (items: any[]) => void) => {
        try {
            const head = await fetch(`/.netlify/functions/data-blobs?file=${file}`, { method: 'HEAD' });
            const lastModified = head.headers.get('last-modified');
            const items: any[] = await offlineStorageService.getAll(store).catch(() => []);
            const newest = items.reduce((m: number, c: any) => Math.max(m, (c as any).lastModified || 0), 0);
            if (lastModified) {
                const serverTime = Date.parse(lastModified);
                if (!isNaN(serverTime) && serverTime <= newest) return;
            }
            const res = await fetch(`/.netlify/functions/data-blobs?file=${file}`, { cache: 'no-cache' });
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data)) return;
            update(data);
            try {
                if (store === 'tours') await offlineStorageService.storeTours(data);
            } catch {}
        } catch {}
    };

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allItems.slice(startIndex, startIndex + itemsPerPage);
    }, [allItems, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(allItems.length / itemsPerPage);
    }, [allItems, itemsPerPage]);

    return { loading, error, paginatedItems, currentPage, totalPages, setCurrentPage };
};


// --- CARD COMPONENTS ---

const TourCard: React.FC<{ item: Tour }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100">
        <div className="relative">
            <img loading="lazy" height="192"
                src={item.image || '../assets/images/gallery/placeholder-1-800.webp'}
                srcSet={!item.image ? '../assets/images/gallery/placeholder-1-400.webp 400w, ../assets/images/gallery/placeholder-1-800.webp 800w, ../assets/images/gallery/placeholder-1-1200.webp 1200w' : undefined}
                sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                alt={item.name || 'Hình ảnh tour'} 
                className="w-full h-40 object-cover" />
            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                <Route className="w-3 h-3 inline mr-1" />
                Tour
            </div>
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{item.name || 'Tên tour không xác định'}</h3>
            <p className="text-xs text-gray-600 mb-2 flex-grow line-clamp-2">{item.description || 'Không có mô tả.'}</p>
            <div className="space-y-1 mb-3">
                {item.duration && (
                    <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1 text-primary-500" />
                        <span className="font-medium">Thời gian:</span>
                        <span className="ml-1">{item.duration}</span>
                    </div>
                )}
                {item.activities && (
                    <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1 text-primary-500" />
                        <span className="font-medium">Hoạt động:</span>
                        <span className="ml-1 line-clamp-1">{item.activities}</span>
                    </div>
                )}
            </div>
            <a
                href={item.detailsLink || item.detailslink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-3 py-1.5 text-xs w-full"
            >
                {item.buttonText || 'Xem chi tiết'}
            </a>
        </div>
    </div>
);

const AccommodationCard: React.FC<{ item: Accommodation }> = ({ item }) => {
    const starCount = item.stars ? parseInt(item.stars) : 0;
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100">
            <div className="relative">
                <img loading="lazy" height="192"
                    src={item.image || '../assets/images/gallery/placeholder-2-800.webp'}
                    srcSet={!item.image ? '../assets/images/gallery/placeholder-2-400.webp 400w, ../assets/images/gallery/placeholder-2-800.webp 800w, ../assets/images/gallery/placeholder-2-1200.webp 1200w' : undefined}
                    sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                    alt={item.name || 'Hình ảnh lưu trú'} 
                    className="w-full h-40 object-cover" />
                <div className="absolute top-2 left-2 bg-accent-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    <Hotel className="w-3 h-3 inline mr-1" />
                    Lưu trú
                </div>
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{item.name || 'Tên địa điểm không xác định'}</h3>
                {starCount > 0 && (
                    <div className="flex items-center mb-2">
                        <div className="flex items-center text-yellow-400">
                            {Array.from({ length: starCount }, (_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({starCount} sao)</span>
                    </div>
                )}
                <div className="space-y-1 mb-3 flex-grow">
                    {item.address && (
                        <div className="flex items-start text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mr-1 mt-0.5 text-accent-500 flex-shrink-0" />
                            <span className="line-clamp-2">{item.address}</span>
                        </div>
                    )}
                    {item.phone && (
                        <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3 h-3 mr-1 text-accent-500" />
                            <span>{item.phone}</span>
                        </div>
                    )}
                </div>
                <a
                    href={item.mapLink || item.maplink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white px-3 py-1.5 text-xs w-full"
                >
                    Xem trên bản đồ
                </a>
            </div>
        </div>
    );
};

const RestaurantCard: React.FC<{ item: Restaurant }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100">
        <div className="relative">
            <img loading="lazy" height="192"
                src={item.image || '../assets/images/gallery/placeholder-3-800.webp'}
                srcSet={!item.image ? '../assets/images/gallery/placeholder-3-400.webp 400w, ../assets/images/gallery/placeholder-3-800.webp 800w, ../assets/images/gallery/placeholder-3-1200.webp 1200w' : undefined}
                sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                alt={item.name || 'Hình ảnh nhà hàng'} 
                className="w-full h-40 object-cover" />
            <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                <Utensils className="w-3 h-3 inline mr-1" />
                Nhà hàng
            </div>
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{item.name || 'Tên nhà hàng không xác định'}</h3>
            <div className="space-y-1 mb-3 flex-grow">
                {item.address && (
                    <div className="flex items-start text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mr-1 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span className="line-clamp-2">{item.address}</span>
                    </div>
                )}
                {item.cuisine && (
                    <div className="flex items-center text-xs text-gray-600">
                        <Tags className="w-3 h-3 mr-1 text-orange-500" />
                        <span>{item.cuisine}</span>
                    </div>
                )}
            </div>
            <a
                href={item.mapLink || item.maplink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-3 py-1.5 text-xs w-full"
            >
                Xem trên bản đồ
            </a>
        </div>
    </div>
);

const SpecialtyCard: React.FC<{ item: Specialty }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100">
        <div className="relative">
            <img loading="lazy" height="192"
                src={item.image || '../assets/images/gallery/placeholder-4-800.webp'}
                srcSet={!item.image ? '../assets/images/gallery/placeholder-4-400.webp 400w, ../assets/images/gallery/placeholder-4-800.webp 800w, ../assets/images/gallery/placeholder-4-1200.webp 1200w' : undefined}
                sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                alt={item.name || 'Hình ảnh đặc sản'} 
                className="w-full h-40 object-cover" />
            <div className="absolute top-2 left-2 bg-lime-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                <Flame className="w-3 h-3 inline mr-1" />
                Đặc sản
            </div>
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{item.name || 'Tên đặc sản không xác định'}</h3>
            <p className="text-xs text-gray-600 mb-2 flex-grow line-clamp-2">{item.description || 'Không có mô tả.'}</p>
            {item.purchaseLocation && (
                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Store className="w-3 h-3 mr-1 text-lime-500" />
                    <span className="line-clamp-1">{item.purchaseLocation}</span>
                </div>
            )}
        </div>
    </div>
);

// --- PAGINATION COMPONENT ---
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePageClick = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    const pageNumbers = [];
    const MAX_VISIBLE_PAGES = 5;
    if (totalPages <= MAX_VISIBLE_PAGES) {
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
        let startPage, endPage;
        const maxPagesBeforeCurrentPage = Math.floor(MAX_VISIBLE_PAGES / 2);
        const maxPagesAfterCurrentPage = Math.ceil(MAX_VISIBLE_PAGES / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            startPage = 1;
            endPage = MAX_VISIBLE_PAGES;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
            startPage = totalPages - MAX_VISIBLE_PAGES + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) pageNumbers.push('...');
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
    }

    return (
        <nav aria-label="Page navigation" className="mt-6 text-center w-full">
            <ul className="inline-flex items-center -space-x-px flex-wrap justify-center">
                <li>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageClick(currentPage - 1)}
                        disabled={currentPage === 1}
                        leftIcon={<ChevronLeft className="w-3 h-3" />}
                        className={cn(
                            "rounded-l-lg text-xs px-2 py-1",
                            currentPage === 1 && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className="sr-only">Previous</span>
                    </Button>
                </li>
                {pageNumbers.map((num, index) => (
                    <li key={index}>
                        {typeof num === 'number' ? (
                            <Button
                                variant={num === currentPage ? "primary" : "outline"}
                                size="sm"
                                onClick={() => handlePageClick(num)}
                                className={cn(
                                    "text-xs px-2 py-1",
                                    num === currentPage && "bg-primary-600 text-white border-primary-600"
                                )}
                                {...(num === currentPage && { 'aria-current': 'page' })}
                            >
                                {num}
                            </Button>
                        ) : (
                            <span className="px-2 py-1 text-xs text-gray-500 bg-white border border-gray-300">
                                ...
                            </span>
                        )}
                    </li>
                ))}
                <li>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageClick(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        leftIcon={<ChevronRight className="w-3 h-3" />}
                        className={cn(
                            "rounded-r-lg text-xs px-2 py-1",
                            currentPage === totalPages && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className="sr-only">Next</span>
                    </Button>
                </li>
            </ul>
        </nav>
    );
};

// --- GENERIC GUIDE SECTION COMPONENT ---
interface GuideSectionProps<T extends GuideItem> {
    id: string;
    title: string;
    icon: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
    file: string;
    CardComponent: React.FC<{ item: T }>;
    infoText: string;
}

const GuideSection = <T extends GuideItem>({ id, title, icon, gradientFrom, gradientTo, file, CardComponent, infoText }: GuideSectionProps<T>) => {
    const { loading, error, paginatedItems, currentPage, totalPages, setCurrentPage } = useGuideSection<T>(file);
    
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [id, setCurrentPage]);

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 text-white`}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        {icon}
                    </div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
                                <p className="text-gray-500">Đang tải {infoText}...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <div className="text-center">
                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <p className="text-red-500">Không thể tải dữ liệu. {error}</p>
                            </div>
                        </div>
                    )}
                    {!loading && !error && paginatedItems.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">Hiện chưa có thông tin {infoText} nào.</p>
                        </div>
                    )}
                    {!loading && !error && paginatedItems.map((item, index) => (
                        <CardComponent key={index} item={item as T} />
                    ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

// --- MOBILE GUIDE SECTION COMPONENT ---
const MobileGuideSection = <T extends GuideItem>({ id, title, icon, gradientFrom, gradientTo, file, CardComponent, infoText }: GuideSectionProps<T>) => {
    const { loading, error, paginatedItems, currentPage, totalPages, setCurrentPage } = useGuideSection<T>(file);
    
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, [setCurrentPage]);

    // Debug logging
    console.log(`MobileGuideSection ${id}:`, {
        loading,
        error,
        itemsCount: paginatedItems.length,
        currentPage,
        totalPages,
        file
    });

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
            <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-3 text-white`}>
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                        {icon}
                    </div>
                    <h3 className="text-base font-bold truncate">{title}</h3>
                </div>
            </div>
            <div className="p-3 w-full">
                <div className="space-y-3 w-full">
                    {loading && (
                        <div className="flex items-center justify-center py-6 w-full">
                            <div className="text-center">
                                <Loader2 className="w-5 h-5 text-primary-600 animate-spin mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Đang tải {infoText}...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center py-6 w-full">
                            <div className="text-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                                <p className="text-xs text-red-500">Không thể tải dữ liệu. {error}</p>
                                <p className="text-xs text-gray-400 mt-1">File: {file}</p>
                            </div>
                        </div>
                    )}
                    {!loading && !error && paginatedItems.length === 0 && (
                        <div className="text-center py-6 w-full">
                            <p className="text-xs text-gray-500">Hiện chưa có thông tin {infoText} nào.</p>
                            <p className="text-xs text-gray-400 mt-1">File: {file}</p>
                        </div>
                    )}
                    {!loading && !error && paginatedItems.map((item, index) => (
                        <div key={`${id}-${index}`} className="w-full">
                            <CardComponent item={item as T} />
                        </div>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="mt-3 flex justify-center w-full">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN GUIDE PAGE COMPONENT ---
const GuidePage = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        // Mobile version with SwipeableTabs
        const tabs = [
            {
                id: 'tours',
                label: 'Tour',
                icon: <Route className="w-4 h-4" />,
                content: (
                    <MobileGuideSection
                        id="tours"
                        title="Chương trình tour gợi ý"
                        icon={<Route className="w-5 h-5" />}
                        gradientFrom="from-primary-600"
                        gradientTo="to-primary-700"
                        file="Tours.json"
                        CardComponent={TourCard as React.FC<{ item: GuideItem }>}
                        infoText="chương trình tour"
                    />
                )
            },
            {
                id: 'accommodations',
                label: 'Lưu trú',
                icon: <Hotel className="w-4 h-4" />,
                content: (
                    <MobileGuideSection
                        id="accommodations"
                        title="Khách sạn và Lưu trú"
                        icon={<Hotel className="w-5 h-5" />}
                        gradientFrom="from-accent-600"
                        gradientTo="to-accent-700"
                        file="Accommodations.json"
                        CardComponent={AccommodationCard as React.FC<{ item: GuideItem }>}
                        infoText="thông tin lưu trú"
                    />
                )
            },
            {
                id: 'restaurants',
                label: 'Ăn uống',
                icon: <Utensils className="w-4 h-4" />,
                content: (
                    <MobileGuideSection
                        id="restaurants"
                        title="Địa điểm ăn uống"
                        icon={<Utensils className="w-5 h-5" />}
                        gradientFrom="from-orange-600"
                        gradientTo="to-orange-700"
                        file="Restaurants.json"
                        CardComponent={RestaurantCard as React.FC<{ item: GuideItem }>}
                        infoText="địa điểm ăn uống"
                    />
                )
            },
            {
                id: 'specialties',
                label: 'Đặc sản',
                icon: <Flame className="w-4 h-4" />,
                content: (
                    <MobileGuideSection
                        id="specialties"
                        title="Đặc sản địa phương"
                        icon={<Flame className="w-5 h-5" />}
                        gradientFrom="from-lime-600"
                        gradientTo="to-lime-700"
                        file="Specialties.json"
                        CardComponent={SpecialtyCard as React.FC<{ item: GuideItem }>}
                        infoText="thông tin đặc sản"
                    />
                )
            }
        ];

        console.log('GuidePage mobile tabs:', tabs.map(tab => ({ id: tab.id, label: tab.label })));

        return (
            <ResponsiveContainer maxWidth="6xl" padding="sm">
                <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 overflow-x-hidden">
                    {/* Header Section */}
                    <div className="text-center mb-6 px-4">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-4 text-white">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                                    <Route className="w-5 h-5" />
                                </div>
                                <h1 className="text-xl font-bold">Cẩm nang du lịch Núi Bà Đen</h1>
                            </div>
                            <p className="text-primary-100 text-xs leading-relaxed">
                                Khám phá trọn vẹn Núi Bà Đen với các gợi ý tour, ẩm thực, lưu trú và đặc sản nổi bật.
                            </p>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="px-4 pb-6 w-full">
                        <SwipeableTabs 
                            tabs={tabs}
                            defaultTab="tours"
                            className="bg-white rounded-xl shadow-lg overflow-hidden w-full"
                        />
                    </div>
                </div>
            </ResponsiveContainer>
        );
    }

    // Desktop version
    return (
        <ResponsiveContainer maxWidth="6xl" padding="lg">
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50">
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white mb-8">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Route className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                                Cẩm nang du lịch Núi Bà Đen
                            </h1>
                        </div>
                        <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto">
                            Khám phá trọn vẹn Núi Bà Đen với các gợi ý tour, ẩm thực, lưu trú và đặc sản nổi bật.
                        </p>
                    </div>
                </div>

                <main className="space-y-8">
                    <GuideSection
                        id="tours"
                        title="Chương trình tour gợi ý"
                        icon={<Route className="w-6 h-6" />}
                        gradientFrom="from-primary-600"
                        gradientTo="to-primary-700"
                        file="Tours.json"
                        CardComponent={TourCard as React.FC<{ item: GuideItem }>}
                        infoText="chương trình tour"
                    />
                    <GuideSection
                        id="accommodations"
                        title="Khách sạn và Lưu trú"
                        icon={<Hotel className="w-6 h-6" />}
                        gradientFrom="from-accent-600"
                        gradientTo="to-accent-700"
                        file="Accommodations.json"
                        CardComponent={AccommodationCard as React.FC<{ item: GuideItem }>}
                        infoText="thông tin lưu trú"
                    />
                    <GuideSection
                        id="restaurants"
                        title="Địa điểm ăn uống"
                        icon={<Utensils className="w-6 h-6" />}
                        gradientFrom="from-orange-600"
                        gradientTo="to-orange-700"
                        file="Restaurants.json"
                        CardComponent={RestaurantCard as React.FC<{ item: GuideItem }>}
                        infoText="địa điểm ăn uống"
                    />
                    <GuideSection
                        id="specialties"
                        title="Đặc sản địa phương"
                        icon={<Flame className="w-6 h-6" />}
                        gradientFrom="from-lime-600"
                        gradientTo="to-lime-700"
                        file="Specialties.json"
                        CardComponent={SpecialtyCard as React.FC<{ item: GuideItem }>}
                        infoText="thông tin đặc sản"
                    />
                </main>
            </div>
        </ResponsiveContainer>
    );
};

export default GuidePage;