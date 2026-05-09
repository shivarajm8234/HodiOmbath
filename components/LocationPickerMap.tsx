'use client';

import { useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<any>(null);
  const map = useMap();

  useEffect(() => {
    if (position && position[0] !== 0 && map) {
      map.flyTo(position, 12);
    }
  }, [position, map]);

  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
        }
      },
    }),
    [setPosition]
  );

  return (position && position[0] !== 0) ? (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position} 
      ref={markerRef}
    />
  ) : null;
}

export default function LocationPickerMap({
  coordinates,
  setCoordinates
}: {
  coordinates: [number, number];
  setCoordinates: (pos: [number, number]) => void;
}) {
  return (
    <MapContainer
      center={(coordinates && coordinates[0] !== 0) ? [coordinates[1], coordinates[0]] : [20, 77]}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
      doubleClickZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker position={[coordinates[1] || 0, coordinates[0] || 0]} setPosition={setCoordinates} />
    </MapContainer>
  );
}
