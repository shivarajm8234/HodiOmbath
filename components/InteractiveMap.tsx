'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Memory } from '@/lib/types';
import { Satellite, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center"><div className="text-muted-foreground">Loading map...</div></div> }
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

import { MAP_CONFIG, MOOD_COLORS } from '@/lib/mapUtils';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface InteractiveMapProps {
  memories: Memory[];
  onMemoryClick?: (memory: Memory) => void;
  selectedMemoryId?: string;
}

export default function InteractiveMap({
  memories,
  onMemoryClick,
  selectedMemoryId,
}: InteractiveMapProps) {
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure component loads on client only
    setIsLoaded(true);
  }, []);

  const tileLayerUrl = satelliteMode
    ? 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileLayerAttribution = satelliteMode
    ? '© OpenTopoMap, © OpenStreetMap contributors'
    : '© OpenStreetMap contributors';

  if (!isLoaded) {
    return (
      <div className="relative w-full h-full bg-muted animate-pulse flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  // Create custom icon for markers (Photo Bubbles)
  const createMarkerIcon = (memory: Memory, isSelected: boolean) => {
    const imageUrl = memory.images && memory.images[0] ? memory.images[0] : 'https://via.placeholder.com/150';
    const moodColor = MOOD_COLORS[memory.mood as keyof typeof MOOD_COLORS] || '#94a3b8';

    return L.divIcon({
      html: `
        <div class="photo-bubble ${isSelected ? 'selected' : ''}" style="
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50% 50% 50% 0;
          background-color: white;
          border: 3px solid ${moodColor};
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          transform: rotate(-45deg) ${isSelected ? 'scale(1.3)' : 'scale(1)'};
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
          cursor: pointer;
        ">
          <div style="
            width: 100%;
            height: 100%;
            transform: rotate(45deg);
            background-image: url('${imageUrl}');
            background-size: cover;
            background-position: center;
          "></div>
          ${isSelected ? `<div class="pulse-ring" style="border-color: ${moodColor}"></div>` : ''}
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50],
      className: 'custom-photo-marker',
    });
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-cyan-50 to-blue-100">
      <MapContainer
        center={MAP_CONFIG.initialCenter as [number, number]}
        zoom={MAP_CONFIG.initialZoom}
        style={{ width: '100%', height: '100%' }}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
      >
        <TileLayer url={tileLayerUrl} attribution={tileLayerAttribution} />
        
        {/* Memory markers */}
        {memories.map((memory) => {
          const coords = memory.coordinates as [number, number];
          const moodColor = MOOD_COLORS[memory.mood as keyof typeof MOOD_COLORS] || '#94a3b8';
          const isSelected = selectedMemoryId === memory.id;
          
          return (
            <Marker
              key={memory.id}
              position={[coords[1], coords[0]]}
              icon={createMarkerIcon(memory, isSelected)}
              eventHandlers={{
                click: () => {
                  console.log('[v0] Marker clicked:', memory.title);
                  onMemoryClick?.(memory);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* Satellite Mode Toggle */}
      <motion.button
        onClick={() => setSatelliteMode(!satelliteMode)}
        className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg p-3 shadow-lg transition-all flex items-center gap-2 z-[500]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Satellite size={20} className="text-primary" />
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {satelliteMode ? 'Map' : 'Satellite'}
        </span>
      </motion.button>
    </div>
  );
}
