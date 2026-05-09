export const mapboxToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbTBpZXI5bm0wMDAwMm5wZHZxMHRqaWwyIn0.example'; // Placeholder - users need their own

export const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export const MAP_CONFIG = {
  initialZoom: 7,
  initialCenter: [15.3173, 75.7139] as [number, number],
  minZoom: 2,
  maxZoom: 18,
};

export const CLUSTER_CONFIG = {
  radius: 50, // pixels
  maxZoom: 14, // cluster at max zoom
  minZoom: 0,
};

export const MOOD_COLORS: Record<string, string> = {
  nostalgic: '#8B6F47',
  joyful: '#FFB347',
  peaceful: '#4CAF50',
  adventurous: '#FF6B6B',
  reflective: '#87CEEB',
};

export const calculateBounds = (
  coordinates: Array<[number, number]>
): [[number, number], [number, number]] => {
  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};
