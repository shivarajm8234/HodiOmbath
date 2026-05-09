// Geocoding utility using Nominatim (OpenStreetMap's geocoding service)

// Input validation constants
const MAX_PLACE_NAME_LENGTH = 200;
const PLACE_NAME_REGEX = /^[a-zA-Z0-9\s,.\-'()]+$/;

export interface GeoLocation {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  district: string;
  city: string;
  displayName: string;
}

// Validate and sanitize place name input
function validatePlaceName(placeName: string): boolean {
  if (!placeName || typeof placeName !== 'string') return false;
  if (placeName.length > MAX_PLACE_NAME_LENGTH) return false;
  // Allow only safe characters
  return PLACE_NAME_REGEX.test(placeName);
}

export async function geocodePlace(placeName: string): Promise<GeoLocation | null> {
  try {
    // Validate input
    if (!validatePlaceName(placeName)) {
      console.error('[v0] Invalid place name format');
      return null;
    }

    // Use Nominatim API from OpenStreetMap with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'HodiOmbath/1.0', // Required by Nominatim
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[v0] Geocoding error:', response.statusText);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      console.error('[v0] No results found for place:', placeName);
      return null;
    }

    const result = results[0];

    // Get detailed address information using reverse geocoding
    const reverseResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${result.lat}&lon=${result.lon}&format=json&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HodiOmbath/1.0',
        },
      }
    );

    const addressData = await reverseResponse.json();
    const address = addressData.address || {};

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      country: address.country || result.address?.split(',')[result.address.split(',').length - 1]?.trim() || '',
      state: address.state || address.province || '',
      district: address.county || address.district || '',
      city: address.city || address.town || address.village || '',
      displayName: result.display_name || placeName,
    };
  } catch (error) {
    console.error('[v0] Geocoding service error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HodiOmbath/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address || {};

    return {
      latitude: lat,
      longitude: lon,
      country: address.country || '',
      state: address.state || address.province || '',
      district: address.county || address.district || '',
      city: address.city || address.town || address.village || '',
      displayName: data.display_name || '',
    };
  } catch (error) {
    console.error('[v0] Reverse geocoding error:', error);
    return null;
  }
}

// Validate file ID - only alphanumeric and hyphens
const GOOGLE_DRIVE_FILE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

// Extract and validate image URLs from Google Drive sharing link
export function extractGoogleDriveImageUrl(driveLink: string): string | null {
  try {
    // Validate URL format
    if (!driveLink || typeof driveLink !== 'string') {
      console.error('[v0] Invalid Drive link format');
      return null;
    }

    // Must be from google drive domain
    if (!driveLink.includes('drive.google.com')) {
      console.error('[v0] URL is not from Google Drive');
      return null;
    }

    // Flexible regex to capture file ID from various Drive URL formats
    let fileId = '';
    const idMatch = driveLink.match(/([a-zA-Z0-9_-]{25,})/);
    if (idMatch) {
      fileId = idMatch[0];
    }

    // Validate file ID format
    if (fileId && GOOGLE_DRIVE_FILE_ID_REGEX.test(fileId)) {
      // Use the most reliable format for public "Anyone with the link" files
      return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    }

    console.error('[v0] Invalid Google Drive file ID format');
    return null;
  } catch (error) {
    console.error('[v0] Error parsing Google Drive link:', error);
    return null;
  }
}
