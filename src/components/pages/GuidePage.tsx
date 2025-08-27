import React, { useState, useEffect, useMemo, useCallback } from 'react';

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

// --- CUSTOM HOOK for data fetching and pagination ---
const useGuideSection = <T extends GuideItem>(file: string) => {
    const [allItems, setAllItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 3 : 6);

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
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/.netlify/functions/data-blobs?file=${file}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format from API.");
                }
                setAllItems(data);
            } catch (e: any) {
                setError(e.message);
                console.error(`Failed to fetch ${file}:`, e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [file]);

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
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <img loading="lazy" height="192"
            src={item.image || '../assets/images/gallery/placeholder-1-800.webp'}
            srcSet={!item.image ? '../assets/images/gallery/placeholder-1-400.webp 400w, ../assets/images/gallery/placeholder-1-800.webp 800w, ../assets/images/gallery/placeholder-1-1200.webp 1200w' : undefined}
            sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
            alt={item.name || 'Hình ảnh tour'} className="w-full h-40 sm:h-48 object-cover" />
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <h3 className="text-md sm:text-lg font-semibold text-primary-600 mb-1 sm:mb-2">{item.name || 'Tên tour không xác định'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 flex-grow mobile-description-truncate">{item.description || 'Không có mô tả.'}</p>
            <div className="text-xs text-gray-500 mb-2 mt-auto">
                {item.duration && <><span className="font-semibold">Thời gian:</span> {item.duration}<br className="sm:hidden" /> </>}
                {item.activities && <><span className="font-semibold mobile-hideable tour-activities">Hoạt động:</span> <span className="mobile-hideable tour-activities-content">{item.activities}</span></>}
            </div>
            <a href={item.detailsLink || item.detailslink || '#'} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition duration-150 self-start">
                {item.buttonText || 'Xem chi tiết'}
            </a>
        </div>
    </div>
);

const AccommodationCard: React.FC<{ item: Accommodation }> = ({ item }) => {
    const starCount = item.stars ? parseInt(item.stars) : 0;
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <img loading="lazy" height="192"
                src={item.image || '../assets/images/gallery/placeholder-2-800.webp'}
                srcSet={!item.image ? '../assets/images/gallery/placeholder-2-400.webp 400w, ../assets/images/gallery/placeholder-2-800.webp 800w, ../assets/images/gallery/placeholder-2-1200.webp 1200w' : undefined}
                sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                alt={item.name || 'Hình ảnh lưu trú'} className="w-full h-40 sm:h-48 object-cover" />
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <h3 className="text-md sm:text-lg font-semibold text-accent-600 mb-1 sm:mb-2">{item.name || 'Tên địa điểm không xác định'}</h3>
                {starCount > 0 && (
                    <div className="flex items-center text-yellow-400 mb-1 sm:mb-2 text-xs sm:text-sm">
                        {Array.from({ length: starCount }, (_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                        <span className="text-xs text-gray-500 ml-1 sm:ml-2">({starCount} sao)</span>
                    </div>
                )}
                <div className="flex-grow text-xs sm:text-sm">
                    {item.address && <p className="text-gray-600 mb-1 mobile-address-truncate"><i className="fa-solid fa-map-marker-alt mr-1 sm:mr-2 text-gray-400"></i>{item.address}</p>}
                    {item.phone && <p className="text-gray-600 mb-2"><i className="fa-solid fa-phone mr-1 sm:mr-2 text-gray-400"></i>{item.phone}</p>}
                </div>
                <a href={item.mapLink || item.maplink || '#'} target="_blank" rel="noopener noreferrer" className="inline-block bg-accent-500 hover:bg-accent-600 text-white text-xs sm:text-sm font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition duration-150 self-start mt-auto">
                    Xem trên bản đồ
                </a>
            </div>
        </div>
    );
};

const RestaurantCard: React.FC<{ item: Restaurant }> = ({ item }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <img loading="lazy" height="192"
            src={item.image || '../assets/images/gallery/placeholder-3-800.webp'}
            srcSet={!item.image ? '../assets/images/gallery/placeholder-3-400.webp 400w, ../assets/images/gallery/placeholder-3-800.webp 800w, ../assets/images/gallery/placeholder-3-1200.webp 1200w' : undefined}
            sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
            alt={item.name || 'Hình ảnh nhà hàng'} className="w-full h-40 sm:h-48 object-cover" />
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <h3 className="text-md sm:text-lg font-semibold text-orange-600 mb-1 sm:mb-2">{item.name || 'Tên nhà hàng không xác định'}</h3>
            <div className="flex-grow text-xs sm:text-sm">
                {item.address && <p className="text-gray-600 mb-1 mobile-address-truncate"><i className="fa-solid fa-map-marker-alt mr-1 sm:mr-2 text-gray-400"></i>{item.address}</p>}
                {item.cuisine && <p className="text-gray-600 mb-2 mobile-hideable"><i className="fa-solid fa-tags mr-1 sm:mr-2 text-gray-400"></i>{item.cuisine}</p>}
            </div>
            <a href={item.mapLink || item.maplink || '#'} target="_blank" rel="noopener noreferrer" className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition duration-150 self-start mt-auto">
                Xem trên bản đồ
            </a>
        </div>
    </div>
);

const SpecialtyCard: React.FC<{ item: Specialty }> = ({ item }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <img loading="lazy" height="192"
            src={item.image || '../assets/images/gallery/placeholder-4-800.webp'}
            srcSet={!item.image ? '../assets/images/gallery/placeholder-4-400.webp 400w, ../assets/images/gallery/placeholder-4-800.webp 800w, ../assets/images/gallery/placeholder-4-1200.webp 1200w' : undefined}
            sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
            alt={item.name || 'Hình ảnh đặc sản'} className="w-full h-40 sm:h-48 object-cover" />
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <h3 className="text-md sm:text-lg font-semibold text-lime-600 mb-1 sm:mb-2">{item.name || 'Tên đặc sản không xác định'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 flex-grow mobile-description-truncate">{item.description || 'Không có mô tả.'}</p>
            {item.purchaseLocation && <p className="text-xs text-gray-500 mt-auto mobile-hideable"><i className="fa-solid fa-store mr-1 sm:mr-2 text-gray-400"></i>{item.purchaseLocation}</p>}
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
        <nav aria-label="Page navigation" className="mt-8 text-center">
            <ul className="inline-flex items-center -space-x-px">
                <li>
                    <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1} className={`py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="sr-only">Previous</span><i className="fas fa-chevron-left"></i>
                    </button>
                </li>
                {pageNumbers.map((num, index) => (
                    <li key={index}>
                        {typeof num === 'number' ? (
                            <button onClick={() => handlePageClick(num)} className={`py-2 px-3 leading-tight ${num === currentPage ? 'text-primary-600 bg-primary-50 border-primary-300 z-10' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}
                                {...(num === currentPage && { 'aria-current': 'page' })}>
                                {num}
                            </button>
                        ) : (
                            <span className="py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300">...</span>
                        )}
                    </li>
                ))}
                <li>
                    <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages} className={`py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="sr-only">Next</span><i className="fas fa-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

// --- GENERIC GUIDE SECTION COMPONENT ---
interface GuideSectionProps<T extends GuideItem> {
    id: string;
    title: string;
    icon: string;
    colorClass: string;
    file: string;
    CardComponent: React.FC<{ item: T }>;
    infoText: string;
}

const GuideSection = <T extends GuideItem>({ id, title, icon, colorClass, file, CardComponent, infoText }: GuideSectionProps<T>) => {
    const { loading, error, paginatedItems, currentPage, totalPages, setCurrentPage } = useGuideSection<T>(file);
    
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [id, setCurrentPage]);

    return (
        <section id={id} className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <h2 className={`text-2xl md:text-3xl font-semibold mb-6 ${colorClass} border-b pb-4 flex items-center`}>
                <i className={`${icon} text-3xl mr-4`}></i>
                {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && <p className="text-center py-5 text-gray-500 col-span-full"><i className="fas fa-spinner fa-spin mr-2"></i> Đang tải {infoText}...</p>}
                {error && <p className="text-center py-5 text-red-500 col-span-full"><i className="fas fa-exclamation-circle mr-2"></i> Không thể tải dữ liệu. {error}</p>}
                {!loading && !error && paginatedItems.length === 0 && <p className="text-gray-500 col-span-full text-center p-4">Hiện chưa có thông tin {infoText} nào.</p>}
                {!loading && !error && paginatedItems.map((item, index) => (
                    <CardComponent key={index} item={item as T} />
                ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </section>
    );
};


// --- MAIN GUIDE PAGE COMPONENT ---
const GuidePage = () => {
    return (
        <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 text-gray-800 font-sans antialiased -m-4 sm:-m-6">
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 max-w-6xl">
                <header className="text-center mb-10 md:mb-16">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-3 tracking-tight">Cẩm nang du lịch Núi Bà Đen</h1>
                    <p className="text-lg md:text-xl text-gray-600">Khám phá trọn vẹn Núi Bà Đen với các gợi ý tour, ẩm thực, lưu trú và đặc sản nổi bật.</p>
                </header>

                <main className="space-y-10 md:space-y-16">
                    <GuideSection
                        id="tours"
                        title="Chương trình tour gợi ý"
                        icon="fa-solid fa-route"
                        colorClass="text-primary-700 border-primary-200"
                        file="Tours.json"
                        CardComponent={TourCard as React.FC<{ item: GuideItem }>}
                        infoText="chương trình tour"
                    />
                    <GuideSection
                        id="accommodations"
                        title="Khách sạn và Lưu trú"
                        icon="fa-solid fa-hotel"
                        colorClass="text-accent-700 border-accent-200"
                        file="Accommodations.json"
                        CardComponent={AccommodationCard as React.FC<{ item: GuideItem }>}
                        infoText="thông tin lưu trú"
                    />
                    <GuideSection
                        id="restaurants"
                        title="Địa điểm ăn uống"
                        icon="fa-solid fa-utensils"
                        colorClass="text-orange-700 border-orange-200"
                        file="Restaurants.json"
                        CardComponent={RestaurantCard as React.FC<{ item: GuideItem }>}
                        infoText="địa điểm ăn uống"
                    />
                    <GuideSection
                        id="specialties"
                        title="Đặc sản địa phương"
                        icon="fa-solid fa-pepper-hot"
                        colorClass="text-lime-700 border-lime-200"
                        file="Specialties.json"
                        CardComponent={SpecialtyCard as React.FC<{ item: GuideItem }>}
                        infoText="thông tin đặc sản"
                    />
                </main>
            </div>
        </div>
    );
};

export default GuidePage;