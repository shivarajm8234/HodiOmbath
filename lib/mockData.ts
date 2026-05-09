import { Memory, MemoryCollection, User } from './types';

export const mockUser: User = {
  id: '1',
  email: 'admin@hodiombath.com',
  name: 'Travel Admin',
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockMemories: Memory[] = [
  {
    id: '1',
    title: 'Sunrise in Bali',
    description: 'Watched the sun rise over the rice terraces in Ubud. The mist was magical and the local coffee was incredible.',
    coordinates: [115.2625, -8.5069],
    location: {
      country: 'Indonesia',
      state: 'Bali',
      city: 'Ubud',
    },
    images: [
      'https://images.unsplash.com/photo-1537225228614-b190b6974d5b?w=800&h=600&fit=crop',
    ],
    tags: ['sunrise', 'nature', 'indonesia', 'bali'],
    mood: 'peaceful',
    rating: 5,
    travelDate: '2024-03-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Street Food in Bangkok',
    description: 'Got lost in the night markets and found the best pad thai from a street vendor. Pure bliss!',
    coordinates: [100.5018, 13.7563],
    location: {
      country: 'Thailand',
      state: 'Bangkok',
      city: 'Bangkok',
    },
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    ],
    tags: ['food', 'thailand', 'bangkok', 'adventure'],
    mood: 'joyful',
    rating: 5,
    travelDate: '2024-02-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Hiking in Machu Picchu',
    description: 'The ancient Incan city was even more breathtaking in person. Climbed Huayna Picchu and felt on top of the world.',
    coordinates: [-72.5449, -13.1631],
    location: {
      country: 'Peru',
      state: 'Cusco Region',
      city: 'Machu Picchu',
    },
    images: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
    ],
    tags: ['hiking', 'peru', 'machu picchu', 'adventure'],
    mood: 'adventurous',
    rating: 5,
    travelDate: '2024-01-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Northern Lights in Iceland',
    description: 'Standing under the dancing aurora was a dream come true. The green glow felt surreal.',
    coordinates: [-21.9426, 64.9631],
    location: {
      country: 'Iceland',
      city: 'Reykjavik',
    },
    images: [
      'https://images.unsplash.com/photo-1504681869696-d977e3e7f3e0?w=800&h=600&fit=crop',
    ],
    tags: ['aurora', 'iceland', 'nature', 'winter'],
    mood: 'reflective',
    rating: 5,
    travelDate: '2023-12-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Safari in Kenya',
    description: 'Spotted the big five in their natural habitat. The vastness of the Serengeti was humbling.',
    coordinates: [37.7669, -1.2921],
    location: {
      country: 'Kenya',
      state: 'Nairobi County',
      city: 'Nairobi',
    },
    images: [
      'https://images.unsplash.com/photo-1516426122078-8023e26305d7?w=800&h=600&fit=crop',
    ],
    tags: ['safari', 'kenya', 'wildlife', 'africa'],
    mood: 'adventurous',
    rating: 5,
    travelDate: '2023-11-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCollections: MemoryCollection[] = [
  {
    id: '1',
    name: 'Southeast Asia Adventure',
    description: 'My journey through Thailand, Indonesia, and beyond',
    memories: ['1', '2'],
    coverImage: 'https://images.unsplash.com/photo-1537225228614-b190b6974d5b?w=800&h=600&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'South America Expeditions',
    description: 'Exploring the wonders of Peru and the Andes',
    memories: ['3'],
    coverImage: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Polar Beauty',
    description: 'Northern lights and Arctic landscapes',
    memories: ['4'],
    coverImage: 'https://images.unsplash.com/photo-1504681869696-d977e3e7f3e0?w=800&h=600&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
