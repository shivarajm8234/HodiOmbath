import { useState, useEffect, useRef, useMemo } from 'react';
import { Memory } from '@/lib/types';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, MapPin } from 'lucide-react';
import { geocodePlace, extractGoogleDriveImageUrl } from '@/lib/geocoding';
import { 
  validateTitle, 
  validateDescription, 
  validateTags, 
  validateCoordinates, 
  validateRating,
  validateLocation,
  sanitizeText 
} from '@/lib/validation';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false } as any) as any;

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<any>(null);

  const mapEvents = useMapEvents({
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

interface MemoryFormProps {
  initialMemory?: Memory;
  onSubmit: (memory: Memory) => void;
  onCancel: () => void;
}

export default function MemoryForm({
  initialMemory,
  onSubmit,
  onCancel,
}: MemoryFormProps) {
  useEffect(() => {
    // Initialize Leaflet icons on client side
    const initLeaflet = async () => {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    };
    initLeaflet();
  }, []);
  const [formData, setFormData] = useState<Partial<Memory>>(
    initialMemory || {
      title: '',
      description: '',
      coordinates: [0, 0],
      location: {
        country: '',
        state: '',
        district: '',
        city: '',
      },
      images: [],
      tags: [],
      mood: 'joyful',
      rating: 5,
      travelDate: new Date().toISOString().split('T')[0],
    }
  );

  const [tagsInput, setTagsInput] = useState(
    initialMemory?.tags.join(', ') || ''
  );
  const [placeNameInput, setPlaceNameInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const key = name.split('.')[1] as keyof typeof formData.location;
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: value,
        },
      }));
    } else if (name.startsWith('coordinates.')) {
      const idx = parseInt(name.split('.')[1]);
      const coords = (formData.coordinates || [0, 0]) as [number, number];
      coords[idx] = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        coordinates: coords,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'rating' ? parseInt(value) : value,
      }));
    }
  };

  const handleAutoGeocode = async () => {
    if (!placeNameInput.trim()) {
      setError('Please enter a place name');
      return;
    }

    setIsGeocoding(true);
    setError(null);
    
    try {
      const location = await geocodePlace(placeNameInput);

      if (location) {
        setFormData((prev) => ({
          ...prev,
          coordinates: [location.longitude, location.latitude],
          location: {
            country: location.country,
            state: location.state,
            district: location.district,
            city: location.city,
          },
        }));
        setPlaceNameInput('');
        setError(null);
      } else {
        setError('Location not found. Try a different place name (e.g., Paris, Tokyo, New York)');
      }
    } catch (err) {
      console.error('[v0] Geocoding error:', err);
      setError('Failed to fetch location. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddDriveImage = () => {
    if (!driveLink.trim()) {
      setError('Please enter a Google Drive link');
      return;
    }

    const imageUrl = extractGoogleDriveImageUrl(driveLink);
    if (imageUrl) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrl],
      }));
      setDriveLink('');
      setError(null);
    } else {
      setError('Invalid Google Drive link. Please ensure it\'s a valid shareable link.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Comprehensive validation using utility functions
    const titleValidation = validateTitle(formData.title || '');
    if (!titleValidation.valid) {
      setError(titleValidation.error || 'Invalid title');
      return;
    }

    const descValidation = validateDescription(formData.description || '');
    if (!descValidation.valid) {
      setError(descValidation.error || 'Invalid description');
      return;
    }

    const locValidation = validateLocation(formData.location);
    if (!locValidation.valid) {
      setError(locValidation.error || 'Invalid location');
      return;
    }

    const coordsValidation = validateCoordinates(
      (formData.coordinates?.[1] as number) || 0,
      (formData.coordinates?.[0] as number) || 0
    );
    if (!coordsValidation.valid) {
      setError(coordsValidation.error || 'Invalid coordinates');
      return;
    }

    const ratingValidation = validateRating(formData.rating || 5);
    if (!ratingValidation.valid) {
      setError(ratingValidation.error || 'Invalid rating');
      return;
    }

    const tagsValidation = validateTags(tagsInput);
    if (!tagsValidation.valid) {
      setError(tagsValidation.error || 'Invalid tags');
      return;
    }

    try {
      const memory: Memory = {
        id: initialMemory?.id || Date.now().toString(),
        title: sanitizeText(formData.title || ''),
        description: sanitizeText(formData.description || ''),
        coordinates: formData.coordinates as [number, number],
        location: formData.location || { country: '' },
        images: formData.images || [],
        tags: tagsValidation.tags,
        mood: (formData.mood as Memory['mood']) || 'joyful',
        rating: Math.max(1, Math.min(5, formData.rating || 5)),
        travelDate: formData.travelDate || new Date().toISOString(),
        createdAt: initialMemory?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSubmit(memory);
    } catch (err) {
      console.error('[v0] Form submission error:', err);
      setError('Failed to save memory. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background z-10">
          <h2 className="text-2xl font-bold text-foreground">
            {initialMemory ? 'Edit Memory' : 'Create Memory'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={24} className="text-foreground" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
          >
            <p className="text-sm font-medium text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Memory title"
              className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Tell the story of this memory..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Place Name - Auto Geocoding */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <span className="flex items-center gap-2">
                <MapPin size={18} /> Place Name *
              </span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Enter a place name (e.g., "Paris, France" or "Tokyo") to automatically fill coordinates and location details.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={placeNameInput}
                onChange={(e) => setPlaceNameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAutoGeocode()}
                placeholder="e.g., 'Paris', 'Tokyo, Japan', 'New York City'"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAutoGeocode}
                disabled={isGeocoding || !placeNameInput.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isGeocoding ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Finding...
                  </>
                ) : (
                  'Auto-fill'
                )}
              </button>
            </div>

            {/* Display auto-filled location */}
            {(formData.location?.country ||
              formData.location?.city ||
              formData.coordinates?.[0]) && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Location Details (Auto-filled)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium text-foreground">
                      {formData.location?.country || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium text-foreground">
                      {formData.location?.city || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State</p>
                    <p className="font-medium text-foreground">
                      {formData.location?.state || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium text-foreground">
                      {formData.location?.district || '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Coordinates</p>
                    <p className="font-medium text-foreground">
                      Lat: {formData.coordinates?.[1]?.toFixed(4) || '0'}, Lon:{' '}
                      {formData.coordinates?.[0]?.toFixed(4) || '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Based Pinning */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-[#00a82d]" /> Pin Location on Map *
              </span>
            </label>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to set the exact coordinates for this memory. You can also drag the pin after placing it.
            </p>
            <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-gray-50 relative z-0">
              <MapContainer
                center={(formData.coordinates && formData.coordinates[0] !== 0) ? [formData.coordinates[1], formData.coordinates[0]] : [20, 77]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker 
                  position={[formData.coordinates?.[1] || 0, formData.coordinates?.[0] || 0]} 
                  setPosition={(pos) => {
                    setFormData(prev => ({
                      ...prev,
                      coordinates: [pos[1], pos[0]]
                    }));
                  }} 
                />
              </MapContainer>
            </div>
            <div className="flex gap-4 text-xs font-mono text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
              <div className="flex-1">
                <span className="text-gray-400">Lat:</span> <span className="text-[#2d2e2e] font-bold">{(formData.coordinates?.[1] || 0).toFixed(6)}</span>
              </div>
              <div className="flex-1">
                <span className="text-gray-400">Lon:</span> <span className="text-[#2d2e2e] font-bold">{(formData.coordinates?.[0] || 0).toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Travel Date *
            </label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Mood & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Mood
              </label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="nostalgic">Nostalgic</option>
                <option value="joyful">Joyful</option>
                <option value="peaceful">Peaceful</option>
                <option value="adventurous">Adventurous</option>
                <option value="reflective">Reflective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Rating (1-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="1"
                max="5"
                className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. nature, adventure, food"
              className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Images
            </label>

            {/* Google Drive Link */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Add Photo from Google Drive
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Paste a Google Drive shareable link to add an image directly.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDriveImage()}
                  placeholder="e.g., https://drive.google.com/file/d/..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddDriveImage}
                  disabled={!driveLink.trim()}
                  className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Image Preview */}
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images?.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {initialMemory ? 'Update Memory' : 'Create Memory'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
