export interface Memory {
  id: string;
  title: string;
  description: string;
  coordinates: [number, number]; // [longitude, latitude]
  location: {
    country: string;
    state?: string;
    district?: string;
    city?: string;
  };
  images: string[];
  videos?: string[];
  tags: string[];
  mood: 'nostalgic' | 'joyful' | 'peaceful' | 'adventurous' | 'reflective';
  rating: number; // 1-5
  travelDate: string; // ISO date
  createdAt: string;
  updatedAt: string;
  collectionId?: string;
}

export interface MemoryCollection {
  id: string;
  name: string;
  description: string;
  memories: string[]; // Array of memory IDs
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryPin {
  id: string;
  memoryId: string;
  coordinates: [number, number];
  cluster?: boolean;
  clusterSize?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface GeoData {
  countries: GeoFeature[];
  states: GeoFeature[];
  districts: GeoFeature[];
}

export interface GeoFeature {
  id: string;
  name: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: Record<string, any>;
}
