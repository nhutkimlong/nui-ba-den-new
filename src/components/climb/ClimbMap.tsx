import React, { useEffect, useRef } from 'react';
import { POWER_POLE_TRAIL_GEOJSON } from '../../utils/climbUtils';

declare global {
  interface Window {
    L: any;
  }
}

export const ClimbMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      // Check if Leaflet is available
      if (typeof window.L === 'undefined') {
        mapRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fa-solid fa-exclamation-triangle mr-2"></i> Lỗi: Leaflet chưa được tải.</div>';
        return;
      }

      try {
        const mapCenter = [11.3727, 106.1676];
        const map = window.L.map(mapRef.current).setView(mapCenter, 15);
        mapInstanceRef.current = map;

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: ''
        }).addTo(map);

        // Add trail
        const trailStyle = { 
          color: "#E67E22", 
          weight: 4, 
          opacity: 0.8 
        };
        
        const geoJsonLayer = window.L.geoJSON(POWER_POLE_TRAIL_GEOJSON, {
          style: trailStyle,
          onEachFeature: (feature: any, layer: any) => {
            if (feature.properties?.name) {
              layer.bindPopup(`<b>${feature.properties.name}</b><br>Tuyến đường chính thức.`);
            }
          }
        }).addTo(map);

        map.fitBounds(geoJsonLayer.getBounds().pad(0.1));

        // Add start and end markers
        const startPoint = POWER_POLE_TRAIL_GEOJSON.geometry.coordinates[0];
        const endPoint = POWER_POLE_TRAIL_GEOJSON.geometry.coordinates[POWER_POLE_TRAIL_GEOJSON.geometry.coordinates.length - 1];
        
        const startIcon = window.L.divIcon({ 
          html: '<i class="fa-solid fa-person-hiking text-green-600 text-2xl"></i>', 
          className: 'bg-transparent border-none', 
          iconSize: [24, 24], 
          iconAnchor: [12, 24], 
          popupAnchor: [0, -24] 
        });
        
        const endIcon = window.L.divIcon({ 
          html: '<i class="fa-solid fa-flag-checkered text-red-600 text-2xl"></i>', 
          className: 'bg-transparent border-none', 
          iconSize: [24, 24], 
          iconAnchor: [12, 24], 
          popupAnchor: [0, -24] 
        });

        if (startPoint) {
          window.L.marker([startPoint[1], startPoint[0]], { 
            icon: startIcon, 
            title: "Điểm bắt đầu" 
          }).addTo(map).bindPopup("<b>Điểm bắt đầu</b><br>Tuyến đường Cột Điện");
        }
        
        if (endPoint) {
          window.L.marker([endPoint[1], endPoint[0]], { 
            icon: endIcon, 
            title: "Điểm kết thúc (Gần đỉnh)" 
          }).addTo(map).bindPopup("<b>Điểm kết thúc</b><br>(Gần đỉnh)");
        }

        // Add locate control (simplified version)
        try {
          if (window.L.Control && window.L.Control.Locate) {
            window.L.control.locate({
              position: 'topright',
              flyTo: true,
              strings: { 
                title: "Hiển thị vị trí của tôi", 
                popup: "Bạn đang ở trong bán kính {distance} {unit} từ điểm này", 
                outsideMapBoundsMsg: "Có vẻ bạn đang ở ngoài phạm vi bản đồ." 
              },
              locateOptions: { 
                maxZoom: 17, 
                enableHighAccuracy: true 
              },
              iconElement: 'i',
              icon: 'fa-solid fa-location-crosshairs',
              iconLoading: 'fa-solid fa-spinner fa-spin'
            }).addTo(map);
          }
        } catch (locateError) {
          console.warn('Locate control not available:', locateError);
          // Add a simple location button instead
          const locationButton = window.L.Control.extend({
            onAdd: function() {
              const container = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control');
              const button = window.L.DomUtil.create('a', 'leaflet-control-locate', container);
              button.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
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
        }

        map.on('locationerror', (e: any) => {
          console.error('Location error:', e.message);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fa-solid fa-exclamation-triangle mr-2"></i> Lỗi khởi tạo bản đồ. Vui lòng thử lại.</div>';
        }
      }
    };

    // Simplified Leaflet loading
    const loadLeaflet = async () => {
      if (typeof window.L !== 'undefined') {
        initializeMap();
        return;
      }

      // Wait a bit for CDN to load
      setTimeout(() => {
        if (typeof window.L !== 'undefined') {
          initializeMap();
        } else {
          console.error('Leaflet not loaded from CDN');
          if (mapRef.current) {
            mapRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fa-solid fa-exclamation-triangle mr-2"></i> Lỗi: Không thể tải Leaflet. Vui lòng tải lại trang.</div>';
          }
        }
      }, 1000);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef}
      className="w-full rounded-md border border-gray-300 shadow-sm bg-gray-200 z-0 relative"
      style={{ height: '500px' }}
    >
      <div className="flex items-center justify-center h-full text-gray-500">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải bản đồ...
      </div>
    </div>
  );
};
