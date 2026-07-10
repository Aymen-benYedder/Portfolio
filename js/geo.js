/**
 * GEO Targeting & Personalization Script
 * Fetches user location and updates .geo-target elements dynamically
 * Uses ipapi.co API with localStorage caching (24-hour duration)
 */

const GEO_CONFIG = {
  API_URL: 'https://ipapi.co/json/',
  CACHE_KEY: 'geo-location-cache',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  DEFAULT_LOCATION: {
    Tunisia: {
      cities: 'Tunis, Sfax, Sousse',
      country: 'Tunisia',
      countryCode: 'TN',
      latitude: '36.8065',
      longitude: '10.1815'
    },
    France: {
      cities: 'Paris, Lyon, Marseille',
      country: 'France',
      countryCode: 'FR',
      latitude: '48.8566',
      longitude: '2.3522'
    }
  }
};

/**
 * Fetch user location from ipapi.co API
 * @returns {Promise<Object>} Location data
 */
// Fetch helper with timeout using AbortController
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch user location from ipapi.co with retries, exponential backoff and timeout
 * @returns {Promise<Object|null>} Location data or null on failure
 */
async function fetchUserLocation() {
  const maxRetries = 2; // max retries (in addition to the initial attempt)
  let attempt = 0;
  let backoff = 1000; // 1s

  // If recent failure is recorded, do not spam API
  try {
    const failed = localStorage.getItem('geo-failure');
    if (failed) {
      const data = JSON.parse(failed);
      if (data && data.expires && Date.now() < data.expires) {
        console.warn('GEO: Recently failed API call; using fallback until', new Date(data.expires).toISOString());
        return null;
      } else {
        localStorage.removeItem('geo-failure');
      }
    }
  } catch (e) {
    // Ignore storage errors; continue
  }

  while (attempt <= maxRetries) {
    try {
      const response = await fetchWithTimeout(GEO_CONFIG.API_URL, { method: 'GET', headers: { 'Accept': 'application/json' } }, 5000);

      // Rate limiting handling
      if (response.status === 429) {
        // Respect Retry-After header if present
        const retryAfter = response.headers.get('Retry-After');
        const wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000; // default 60s
        try {
          localStorage.setItem('geo-failure', JSON.stringify({ expires: Date.now() + wait }));
        } catch (e) {
          // ignore storage failures
        }
        throw new Error('API rate limited (429)');
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        city: data.city || '',
        country: data.country_name || '',
        countryCode: data.country_code || '',
        region: data.region || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        timezone: data.timezone || ''
      };
    } catch (error) {
      // If last attempt, save a short-lived failure marker to avoid repeated attempts
      if (attempt === maxRetries) {
        console.warn('GEO: Location API fetch failed after retries', error);
        try {
          // store a 30s failure backoff (short) to avoid spamming when offline
          localStorage.setItem('geo-failure', JSON.stringify({ expires: Date.now() + 30000 }));
        } catch (e) {
          // storage may be unavailable or full; ignore
        }
        return null;
      }

      // Exponential backoff and retry
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
      attempt++;
    }
  }

  return null;
}

/**
 * Get cached location from localStorage
 * @returns {Object|null} Cached location or null if expired/not found
 */
function getCachedLocation() {
  try {
    const cached = localStorage.getItem(GEO_CONFIG.CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > GEO_CONFIG.CACHE_DURATION;
    
    if (isExpired) {
      try { localStorage.removeItem(GEO_CONFIG.CACHE_KEY); } catch (e) { }
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('GEO: Cache retrieval failed', error);
    // If storage causes exceptions, disable future attempts
    window.GEO_STORAGE_AVAILABLE = false;
    return null;
  }
}

/**
 * Set location in localStorage with timestamp
 * @param {Object} location - Location data
 */
function setCachedLocation(location) {
  if (window.GEO_STORAGE_AVAILABLE === false) return;

  try {
    const cache = {
      data: location,
      timestamp: Date.now()
    };
    localStorage.setItem(GEO_CONFIG.CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('GEO: Cache save failed', error);
    // If quota exceeded or storage throws, disable further storage attempts
    if (error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      window.GEO_STORAGE_AVAILABLE = false;
      try { localStorage.removeItem(GEO_CONFIG.CACHE_KEY); } catch (e) {}
    }
  }
}

/**
 * Format location string based on available data
 * @param {Object} location - Location data
 * @returns {string} Formatted location string
 */
function formatLocationString(location) {
  if (!location) return '';

  // Prefer city when available, then region, finally country
  if (location.city && location.city.trim()) {
    return location.city.trim();
  }

  if (location.region && location.region.trim()) {
    return location.region.trim();
  }

  return location.country || '';
}

/**
 * Get localized message for user's country
 * @param {String} countryCode - ISO country code (e.g., 'TN', 'FR')
 * @returns {String} Localized message
 */
function getLocalizedMessage(countryCode, city) {
  const messages = {
    'TN': {
      text: 'Tunis, Sfax, Sousse',
      greeting: 'Salam from Tunisia! 🇹🇳',
      note: 'Serving Tunisian businesses and startups.'
    },
    'FR': {
      text: 'Paris, Lyon, Marseille',
      greeting: 'Bienvenue from France! 🇫🇷',
      note: 'RGPD-aware solutions for French businesses.'
    },
    'US': {
      text: 'United States',
      greeting: 'Hello from the US! 🇺🇸'
    }
  };

  // City-specific greetings are helpful when we have a city
  const cityMap = {
    'Tunis': { greeting: 'Salam from Tunis! 🇹🇳' },
    'Sfax': { greeting: 'Greetings from Sfax! 🇹🇳' },
    'Sousse': { greeting: 'Hello from Sousse! 🇹🇳' },
    'Paris': { greeting: 'Bonjour from Paris! 🇫🇷' },
    'Lyon': { greeting: 'Salut from Lyon! 🇫🇷' },
    'Marseille': { greeting: 'Bonjour from Marseille! 🇫🇷' }
  };

  if (city && cityMap[city]) {
    return Object.assign({}, messages[countryCode] || {}, cityMap[city]);
  }

  return messages[countryCode] || {
    text: 'worldwide',
    greeting: 'Hello! 👋'
  };
}

/**
 * Update all .geo-target elements with location info
 * @param {Object} location - Location data
 */
function updateGeoTargets(location) {
  const geoTargets = document.querySelectorAll('.geo-target');
  
  if (!geoTargets.length) {
    console.log('GEO: No .geo-target elements found on page');
    return;
  }
  
  // Get localized message
  const localizedMsg = getLocalizedMessage(location && location.countryCode, location && location.city);
  const locationString = formatLocationString(location);
  const displayText = (locationString && locationString.trim()) || (localizedMsg && localizedMsg.text) || 'worldwide';

  // Ensure there is an aria-live region for screen readers to announce failures/status
  let statusEl = document.getElementById('geo-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'geo-status';
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.style.position = 'absolute';
    statusEl.style.left = '-9999px';
    statusEl.style.width = '1px';
    statusEl.style.height = '1px';
    statusEl.style.overflow = 'hidden';
    document.body.appendChild(statusEl);
  }

  // Optionally show a friendly greeting in console for debugging
  if (localizedMsg && localizedMsg.greeting) console.log('GEO:', localizedMsg.greeting);
  
  // Update each .geo-target element with aria-live and content
  geoTargets.forEach(element => {
    element.setAttribute('aria-live', 'polite');

    // Apply fade-out effect
    element.style.opacity = '0.7';
    element.style.transition = 'all 0.3s ease-in-out';
    
    // Update text content safely
    setTimeout(() => {
      element.textContent = displayText || 'worldwide';
      element.style.opacity = '1';
    }, 150);
  });
  
  // Update hidden status region for SR users (non-intrusive)
  if (localizedMsg && localizedMsg.note) {
    statusEl.textContent = localizedMsg.note;
  } else {
    statusEl.textContent = '';
  }

  // Log geolocation info (optional - remove in production if privacy-conscious)
  console.log('GEO: Location detected -', {
    city: location && location.city,
    country: location && location.country,
    countryCode: location && location.countryCode,
    region: location && location.region
  });
}

/**
 * Initialize GEO targeting system
 */
async function initGeoTargeting() {
  try {
    // Check if .geo-target elements exist on page
    const geoTargets = document.querySelectorAll('.geo-target');
    if (!geoTargets.length) {
      console.log('GEO: Page has no .geo-target elements');
      return;
    }

    console.log('GEO: Initializing geolocation system...');

    // Ensure there's a silent status element for screen readers
    if (!document.getElementById('geo-status')) {
      const statusEl = document.createElement('div');
      statusEl.id = 'geo-status';
      statusEl.setAttribute('aria-live', 'polite');
      statusEl.style.position = 'absolute';
      statusEl.style.left = '-9999px';
      statusEl.style.width = '1px';
      statusEl.style.height = '1px';
      statusEl.style.overflow = 'hidden';
      document.body.appendChild(statusEl);
    }

    // Try to get cached location first (storage might fail, but function handles it)
    let location = getCachedLocation();

    if (!location) {
      console.log('GEO: No cached location, fetching from API...');

      location = await fetchUserLocation();

      if (location) {
        setCachedLocation(location);
        console.log('GEO: Location cached for 24 hours');
      } else {
        // Fallback: choose default by page hint, path or use conservative defaults
        console.warn('GEO: API failed; using conservative defaults');

        // If page contains a geo-target hint (e.g. 'Tunisia', 'France'), try to read first occurrence
        const sample = document.querySelector('.geo-target');
        const hint = sample ? sample.textContent.trim() : '';

        if (hint && GEO_CONFIG.DEFAULT_LOCATION[hint]) {
          location = Object.assign({}, GEO_CONFIG.DEFAULT_LOCATION[hint], { city: '' });
          document.getElementById('geo-status').textContent = `Location set to ${hint} by page hint.`;
        } else {
          // Path-based detection
          const path = window.location.pathname.toLowerCase();
          if (path.includes('tunisia')) {
            location = Object.assign({}, GEO_CONFIG.DEFAULT_LOCATION.Tunisia);
            document.getElementById('geo-status').textContent = 'Defaulted to Tunisia based on page URL.';
          } else if (path.includes('france')) {
            location = Object.assign({}, GEO_CONFIG.DEFAULT_LOCATION.France);
            document.getElementById('geo-status').textContent = 'Defaulted to France based on page URL.';
          } else {
            location = { city: '', region: '', country: '', countryCode: '' };
            // Keep status minimal when we truly have no fallback
            document.getElementById('geo-status').textContent = 'Location not detected; showing global services.';
          }
        }
      }
    } else {
      console.log('GEO: Using cached location');
    }

    // Ensure .geo-target elements always receive content
    if (location && (location.countryCode || location.city || location.country)) {
      updateGeoTargets(location);
    } else {
      // Use a conservative display value
      updateGeoTargets({ city: '', region: '', country: '', countryCode: '' });
      console.warn('GEO: Could not determine user location; using generic fallback');
    }
  } catch (error) {
    console.error('GEO: Initialization failed', error);
    // Non-intrusive notification
    try {
      const status = document.getElementById('geo-status');
      if (status) status.textContent = 'Geolocation service unavailable at the moment.';
    } catch (e) {}
  }
}

/**
 * Public API: Manually trigger location update
 * Useful for testing or forcing refresh
 * Usage: window.GEO_FORCE_UPDATE();
 * Notes: clears local cache and attempts to re-fetch location (subject to rate limits/backoff)
 */
window.GEO_FORCE_UPDATE = async function() {
  try {
    console.log('GEO: Forcing location update...');
    try { localStorage.removeItem(GEO_CONFIG.CACHE_KEY); } catch (e) {}
    await initGeoTargeting();
  } catch (err) {
    console.error('GEO_FORCE_UPDATE failed:', err);
  }
};

/**
 * Public API: Clear cache and reset
 * Usage: window.GEO_CLEAR_CACHE();
 */
window.GEO_CLEAR_CACHE = function() {
  try {
    try { localStorage.removeItem(GEO_CONFIG.CACHE_KEY); } catch (e) {}
    console.log('GEO: Cache cleared');
  } catch (err) {
    console.warn('GEO_CLEAR_CACHE could not clear cache:', err);
  }
};

/**
 * Public API: Get current cached location
 * Returns null if not cached or storage unavailable
 */
window.GEO_GET_CACHED = function() {
  try {
    return getCachedLocation();
  } catch (err) {
    console.warn('GEO_GET_CACHED failed:', err);
    return null;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGeoTargeting);
} else {
  // DOM is already loaded
  initGeoTargeting();
}
