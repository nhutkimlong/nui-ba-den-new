import React, { useEffect, useRef, useState } from 'react';
import { POWER_POLE_TRAIL_GEOJSON } from '../../utils/climbUtils';
import { 
  Loader2, 
  AlertTriangle,
  Mountain,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/utils/cn';

declare global {
  interface Window {
    L: any;
  }
}

// Dynamic Leaflet loader
const loadLeaflet = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if Leaflet is already loaded
    if (typeof window.L !== 'undefined') {
      resolve(window.L);
      return;
    }

    // Load Leaflet CSS if not already loaded
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = () => {
      // Wait a bit for Leaflet to initialize
      setTimeout(() => {
        if (typeof window.L !== 'undefined') {
          resolve(window.L);
        } else {
          reject(new Error('Leaflet failed to initialize'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Leaflet'));
    };
    
    document.head.appendChild(script);
  });
};

export const ClimbMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error removing map:', e);
      }
      mapInstanceRef.current = null;
    }
    setIsInitialized(false);
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    // Prevent multiple initializations
    if (isInitialized || mapInstanceRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load Leaflet
      const L = await loadLeaflet();

      // Validate trail data
      const coordinates = POWER_POLE_TRAIL_GEOJSON.geometry.coordinates;
      if (!coordinates || coordinates.length === 0) {
        throw new Error('Dữ liệu tuyến đường không hợp lệ');
      }

      // Calculate bounds from trail coordinates
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;
      
      coordinates.forEach((coord: number[]) => {
        if (coord && coord.length >= 2) {
          const [lng, lat] = coord;
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        }
      });

      // Validate bounds
      if (minLat === Infinity || maxLat === -Infinity) {
        throw new Error('Tọa độ tuyến đường không hợp lệ');
      }

      // Calculate center point
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const mapCenter = [centerLat, centerLng];

      // Check if container is already initialized
      if ((mapRef.current as any)._leaflet_id) {
        console.warn('Map container already initialized, cleaning up first');
        cleanupMap();
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Initialize map (disable default zoom control to avoid duplicates)
      const map = L.map(mapRef.current, { zoomControl: false }).setView(mapCenter, 15);
      mapInstanceRef.current = map;
      setIsInitialized(true);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      }).addTo(map);

      // Add trail with proper styling
      const trailStyle = { 
        color: "#E67E22", 
        weight: 4, 
        opacity: 0.8,
        fillOpacity: 0.2
      };
      
      const geoJsonLayer = L.geoJSON(POWER_POLE_TRAIL_GEOJSON, {
        style: trailStyle,
        onEachFeature: (feature: any, layer: any) => {
          if (feature.properties?.name) {
            layer.bindPopup(`<b>${feature.properties.name}</b><br>Tuyến đường chính thức.`);
          }
        }
      }).addTo(map);

      // Fit map to trail bounds with padding
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.1));
      }

      // Add start and end markers
      const startPoint = coordinates[0];
      const endPoint = coordinates[coordinates.length - 1];
      
      // Create custom icons
      const startIcon = L.divIcon({ 
        html: `
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        `, 
        className: 'bg-transparent border-none', 
        iconSize: [32, 32], 
        iconAnchor: [16, 16], 
        popupAnchor: [0, -16] 
      });
      
      const endIcon = L.divIcon({ 
        html: `
          <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
        `, 
        className: 'bg-transparent border-none', 
        iconSize: [32, 32], 
        iconAnchor: [16, 16], 
        popupAnchor: [0, -16] 
      });

      // Add start marker
      if (startPoint && startPoint.length >= 2) {
        const [startLng, startLat] = startPoint;
        L.marker([startLat, startLng], { 
          icon: startIcon, 
          title: "Điểm bắt đầu" 
        }).addTo(map).bindPopup("<b>Điểm bắt đầu</b><br>Tuyến đường Cột Điện");
      }
      
      // Add end marker
      if (endPoint && endPoint.length >= 2) {
        const [endLng, endLat] = endPoint;
        L.marker([endLat, endLng], { 
          icon: endIcon, 
          title: "Điểm kết thúc (Gần đỉnh)" 
        }).addTo(map).bindPopup("<b>Điểm kết thúc</b><br>(Gần đỉnh)");
      }

      // Add zoom controls
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // Add location button
      const locationButton = L.Control.extend({
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const button = L.DomUtil.create('a', 'leaflet-control-locate', container);
          button.innerHTML = `
            <div class="w-6 h-6 bg-white rounded shadow-md flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
            </div>
          `;
          button.title = 'Hiển thị vị trí của tôi';
          button.style.width = '30px';
          button.style.height = '30px';
          button.style.lineHeight = '30px';
          button.style.textAlign = 'center';
          
          button.onclick = function() {
            map.locate({setView: true, maxZoom: 17});
          };
          
          return container;
        }
      });
      
      new locationButton({position: 'topright'}).addTo(map);

      // Handle location errors
      map.on('locationerror', (e: any) => {
        console.error('Location error:', e.message);
      });

      setLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khởi tạo bản đồ. Vui lòng thử lại.');
      setLoading(false);
      cleanupMap();
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      cleanupMap();
    };
  }, []);

  const handleRetry = () => {
    cleanupMap();
    setError(null);
    initializeMap();
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className={cn(
          "relative z-0 w-full rounded-xl border border-gray-300 shadow-lg bg-gray-100 overflow-hidden",
          "transition-all duration-300",
          loading ? "animate-pulse" : ""
        )}
        style={{ height: '500px' }}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Đang tải bản đồ...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="text-center max-w-sm mx-auto p-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Lỗi tải bản đồ</h3>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Mountain className="w-4 h-4 text-primary-600" />
          Chú thích tuyến đường
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Điểm bắt đầu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Điểm kết thúc</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Tuyến đường chính thức</span>
          </div>
        </div>
      </div>
    </div>
  );
};
