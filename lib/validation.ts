// Comprehensive validation utilities for input sanitization and security

const MAX_STRING_LENGTH = 1000;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS_COUNT = 20;

// Sanitize text input to prevent XSS
export function sanitizeText(input: string, maxLength: number = MAX_STRING_LENGTH): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape special characters
    .replace(/[<>'"]/g, (char) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escapeMap[char] || char;
    });
}

// Validate memory title
export function validateTitle(title: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(title, MAX_TITLE_LENGTH);
  
  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (sanitized.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  
  return { valid: true };
}

// Validate memory description
export function validateDescription(description: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(description, MAX_DESCRIPTION_LENGTH);
  
  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  if (sanitized.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }
  
  return { valid: true };
}

// Validate tags
export function validateTags(tagsString: string): { valid: boolean; tags: string[]; error?: string } {
  if (!tagsString || typeof tagsString !== 'string') {
    return { valid: true, tags: [] };
  }

  const tags = tagsString
    .split(',')
    .map((tag) => sanitizeText(tag, MAX_TAG_LENGTH).trim())
    .filter((tag) => tag.length > 0);

  if (tags.length > MAX_TAGS_COUNT) {
    return { 
      valid: false, 
      tags: [], 
      error: `Maximum ${MAX_TAGS_COUNT} tags allowed` 
    };
  }

  // Check individual tag length
  const invalidTag = tags.find((tag) => tag.length > MAX_TAG_LENGTH);
  if (invalidTag) {
    return { 
      valid: false, 
      tags: [], 
      error: `Tag "${invalidTag}" is too long (max ${MAX_TAG_LENGTH} characters)` 
    };
  }

  return { valid: true, tags };
}

// Validate coordinates
export function validateCoordinates(lat: number, lon: number): { valid: boolean; error?: string } {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return { valid: false, error: 'Invalid coordinates format' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (lon < -180 || lon > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true };
}

// Validate rating
export function validateRating(rating: number): { valid: boolean; error?: string } {
  if (typeof rating !== 'number') {
    return { valid: false, error: 'Invalid rating format' };
  }

  if (rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }

  return { valid: true };
}

// Validate location object
export function validateLocation(location: any): { valid: boolean; error?: string } {
  if (!location || typeof location !== 'object') {
    return { valid: false, error: 'Invalid location format' };
  }

  const country = sanitizeText(location.country || '');
  
  if (!country || country.length === 0) {
    return { valid: false, error: 'Country is required' };
  }

  return { valid: true };
}

// Safe JSON stringify to prevent circular references
export function safeJSONStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return undefined;
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    console.error('[v0] JSON stringify error:', error);
    return '{}';
  }
}
