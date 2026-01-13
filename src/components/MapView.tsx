'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Layers, ZoomIn, ZoomOut, Locate } from 'lucide-react';

// Types for saved items with location
interface SavedItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  place_name?: string | null;
  booking_status?: string | null;
  is_anchor?: boolean | null;
}

interface MapViewProps {
  items: SavedItem[];
  onItemClick?: (item: SavedItem) => void;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Category colors for markers
const categoryColors: Record<string, string> = {
  accommodation: '#3B82F6', // blue
  activity: '#10B981', // green
  transport: '#F59E0B', // amber
  food: '#EF4444', // red
  other: '#8B5CF6', // purple
};

export default function MapView({
  items,
  onItemClick,
  className = '',
  initialCenter = [133.7751, -25.2744], // Australia center
  initialZoom = 4,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'outdoors'>('streets');
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter items with valid coordinates
  const itemsWithLocation = items.filter(
    (item) => item.latitude != null && item.longitude != null
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set access token from environment variable
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    if (!mapboxgl.accessToken) {
      console.warn('Mapbox token not configured');
      return;
    }

    const styleUrls: Record<string, string> = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrls[mapStyle],
      center: initialCenter,
      zoom: initialZoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current) return;

    const styleUrls: Record<string, string> = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    };

    map.current.setStyle(styleUrls[mapStyle]);
  }, [mapStyle]);

  // Update markers when items change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    itemsWithLocation.forEach((item) => {
      if (item.latitude == null || item.longitude == null) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="marker-container ${item.is_anchor ? 'anchor' : ''}" style="--marker-color: ${categoryColors[item.category || 'other']}">
          <div class="marker-pin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="marker-icon">
              <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
            </svg>
          </div>
          ${item.is_anchor ? '<div class="anchor-ring"></div>' : ''}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'custom-popup',
      }).setHTML(`
        <div class="popup-content">
          <h3 class="popup-title">${item.title}</h3>
          ${item.place_name ? `<p class="popup-place">${item.place_name}</p>` : ''}
          ${item.category ? `<span class="popup-category" style="background: ${categoryColors[item.category]}">${item.category}</span>` : ''}
          ${item.is_anchor ? '<span class="popup-anchor">Anchor Event</span>' : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle click
      el.addEventListener('click', () => {
        if (onItemClick) {
          onItemClick(item);
        }
      });

      markers.current.push(marker);
    });

    // Fit bounds if there are items
    if (itemsWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      itemsWithLocation.forEach((item) => {
        if (item.latitude != null && item.longitude != null) {
          bounds.extend([item.longitude, item.latitude]);
        }
      });

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }
  }, [items, isLoaded, onItemClick]);

  const handleZoomIn = () => {
    map.current?.zoomIn();
  };

  const handleZoomOut = () => {
    map.current?.zoomOut();
  };

  const handleLocate = () => {
    if (itemsWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      itemsWithLocation.forEach((item) => {
        if (item.latitude != null && item.longitude != null) {
          bounds.extend([item.longitude, item.latitude]);
        }
      });
      map.current?.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  };

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-card border border-border rounded-xl ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Map Not Configured</h3>
          <p className="text-sm text-muted">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables to enable the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Map controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Style switcher */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 flex gap-1">
          <button
            onClick={() => setMapStyle('streets')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              mapStyle === 'streets'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Streets"
          >
            Streets
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              mapStyle === 'satellite'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Satellite"
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle('outdoors')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              mapStyle === 'outdoors'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Outdoors"
          >
            Outdoors
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleLocate}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Fit all markers"
        >
          <Locate className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Legend */}
      {itemsWithLocation.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">CATEGORIES</h4>
          <div className="space-y-1">
            {Object.entries(categoryColors).map(([category, color]) => {
              const count = itemsWithLocation.filter((i) => (i.category || 'other') === category).length;
              if (count === 0) return null;
              return (
                <div key={category} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="capitalize text-gray-600 dark:text-gray-300">{category}</span>
                  <span className="text-gray-400">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state overlay */}
      {itemsWithLocation.length === 0 && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
            <MapPin className="w-10 h-10 text-muted mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No locations yet</h3>
            <p className="text-sm text-muted">
              Add saved items with locations to see them on the map
            </p>
          </div>
        </div>
      )}

      {/* Custom styles for markers and popups */}
      <style jsx global>{`
        .custom-marker {
          cursor: pointer;
        }

        .marker-container {
          position: relative;
          width: 36px;
          height: 36px;
        }

        .marker-pin {
          width: 36px;
          height: 36px;
          color: var(--marker-color);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          transition: transform 0.2s ease;
        }

        .marker-icon {
          width: 100%;
          height: 100%;
        }

        .marker-container:hover .marker-pin {
          transform: scale(1.1);
        }

        .marker-container.anchor .marker-pin {
          animation: pulse 2s infinite;
        }

        .anchor-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border: 2px solid var(--marker-color);
          border-radius: 50%;
          animation: ring-pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes ring-pulse {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        .custom-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .popup-content {
          padding: 12px 16px;
        }

        .popup-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .popup-place {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .popup-category {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          color: white;
          text-transform: capitalize;
          margin-right: 4px;
        }

        .popup-anchor {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: white;
        }

        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: white;
        }

        .dark .mapboxgl-popup-content {
          background: #1f2937;
          color: white;
        }

        .dark .popup-place {
          color: #9ca3af;
        }

        .dark .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: #1f2937;
        }
      `}</style>
    </div>
  );
}
