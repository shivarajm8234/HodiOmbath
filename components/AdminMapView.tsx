'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Memory } from '@/lib/types';
import { MOOD_COLORS } from '@/lib/mapUtils';
import { RotateCw, Zap } from 'lucide-react';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

import 'leaflet/dist/leaflet.css';

interface AdminMapViewProps {
  memories: Memory[];
  onMemorySelect?: (memory: Memory) => void;
}

export default function AdminMapView({ memories, onMemorySelect }: AdminMapViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animateWave, setAnimateWave] = useState(false);
  const [L_instance, setLInstance] = useState<any>(null);

  useEffect(() => {
    // Ensure component loads on client only
    setIsLoaded(true);
    
    // Import Leaflet on client side
    import('leaflet').then((L) => {
      setLInstance(L);
    });
  }, []);

  // Calculate center of all memories
  const calculateCenter = () => {
    if (memories.length === 0) return [20, 0] as [number, number];
    
    const coords = memories.map((m) => m.coordinates);
    const avgLat =
      coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length;
    const avgLon =
      coords.reduce((sum, [lon]) => sum + lon, 0) / coords.length;
    
    return [avgLat, avgLon] as [number, number];
  };

  const triggerWave = () => {
    setAnimateWave(true);
    setTimeout(() => setAnimateWave(false), 1000);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <RotateCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-primary/20 bg-muted">
      {/* Map Container */}
      <MapContainer
        center={calculateCenter()}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Memory markers with animations */}
        {memories.map((memory, idx) => {
          const coords = memory.coordinates as [number, number];
          const moodColor = MOOD_COLORS[memory.mood as keyof typeof MOOD_COLORS] || '#94a3b8';
          
          return (
            <div key={memory.id}>
              {/* Animated ripple effect */}
              {animateWave && (
                <Circle
                  center={[coords[1], coords[0]]}
                  radius={100000 * (1 + idx * 0.1)}
                  pathOptions={{
                    color: moodColor,
                    fillColor: moodColor,
                    fillOpacity: Math.max(0, 0.4 - idx * 0.08),
                    weight: 2,
                    dashArray: '5, 5',
                  }}
                />
              )}

              {/* Memory marker */}
              <Marker
                position={[coords[1], coords[0]]}
                icon={
                  L_instance
                    ? L_instance.divIcon({
                        className: 'custom-admin-marker',
                        html: `
                          <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center border-3 border-white shadow-xl cursor-pointer transform hover:scale-125 transition-transform duration-300"
                                 style="background: linear-gradient(135deg, ${moodColor}, ${moodColor}dd);">
                              <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                            </div>
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-bounce"></div>
                          </div>
                        `,
                        iconSize: [48, 48],
                        iconAnchor: [24, 24],
                        popupAnchor: [0, -24],
                      })
                    : undefined
                }
                eventHandlers={{
                  click: () => onMemorySelect?.(memory),
                }}
              >
                <Popup>
                  <div className="max-w-xs">
                    {memory.images && memory.images[0] && (
                      <img
                        src={memory.images[0]}
                        alt={memory.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-foreground text-sm">
                      {memory.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {memory.location?.city}, {memory.location?.country}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Mood: {memory.mood}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      {/* Fun Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
        <button
          onClick={triggerWave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Send waves across your memories!"
        >
          <Zap size={18} />
          Wave Effect
        </button>
        <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
          {memories.length} memories mapped
        </div>
      </div>

      {/* Info tooltip */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border text-xs text-muted-foreground max-w-xs">
        <p className="font-semibold text-foreground mb-1">Admin Map</p>
        Click on any memory to see details or add to collections!
      </div>
    </div>
  );
}
