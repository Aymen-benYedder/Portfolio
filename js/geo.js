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
      countryCode: 'TN'
    },
    France: {
      cities: 'Paris, Lyon, Marseille',
      country: 'France',
      countryCode: 'FR'
    }
  }
};

/**
 * Fetch user location from ipapi.co API
 * @returns {Promise<Object>} Location data
 */
async function fetchUserLocation() {
  try {
    const response = await fetch(GEO_CONFIG.API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
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
    console.warn('GEO: Location API fetch failed', error);
    return null;
  }
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
      localStorage.removeItem(GEO_CONFIG.CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('GEO: Cache retrieval failed', error);
    return null;
  }
}

/**
 * Set location in localStorage with timestamp
 * @param {Object} location - Location data
 */
function setCachedLocation(location) {
  try {
    const cache = {
      data: location,
      timestamp: Date.now()
    };
    localStorage.setItem(GEO_CONFIG.CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('GEO: Cache save failed', error);
  }
}

/**
 * Format location string based on available data
 * @param {Object} location - Location data
 * @returns {string} Formatted location string
 */
function formatLocationString(location) {
  if (!location) return '';
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.region && location.region !== location.city) parts.push(location.region);
  
  return parts.length > 0 ? parts.join(', ') : location.country || '';
}

/**
 * Get localized message for user's country
 * @param {String} countryCode - ISO country code (e.g., 'TN', 'FR')
 * @returns {String} Localized message
 */
function getLocalizedMessage(countryCode) {
  const messages = {
    'TN': {
      text: 'Tunis, Sfax, Sousse',
      greeting: 'Bonjour from Tunisia! 🇹🇳'
    },
    'FR': {
      text: 'Paris, Lyon, Marseille',
      greeting: 'Bienvenue from France! 🇫🇷'
    },
    'US': {
      text: 'United States',
      greeting: 'Hello from the US! 🇺🇸'
    },
    'GB': {
      text: 'United Kingdom',
      greeting: 'Greetings from the UK! 🇬🇧'
    },
    'DE': {
      text: 'Germany',
      greeting: 'Guten Tag from Germany! 🇩🇪'
    },
    'ES': {
      text: 'Spain',
      greeting: '¡Hola from Spain! 🇪🇸'
    },
    'IT': {
      text: 'Italy',
      greeting: 'Ciao from Italy! 🇮🇹'
    }
  };
  
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
  const localizedMsg = getLocalizedMessage(location.countryCode);
  const locationString = formatLocationString(location);
  const displayText = locationString || localizedMsg.text;
  
  // Update each .geo-target element
  geoTargets.forEach(element => {
    // Apply fade-out effect
    element.style.opacity = '0.7';
    element.style.transition = 'all 0.3s ease-in-out';
    
    // Update text content
    setTimeout(() => {
      element.textContent = displayText;
      element.style.opacity = '1';
    }, 150);
  });
  
  // Log geolocation info (optional - remove in production if privacy-conscious)
  console.log('GEO: Location detected -', {
    city: location.city,
    country: location.country,
    countryCode: location.countryCode,
    region: location.region
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
    
    // Try to get cached location first
    let location = getCachedLocation();
    
    if (!location) {
      console.log('GEO: No cached location, fetching from API...');
      location = await fetchUserLocation();
      
      if (location) {
        setCachedLocation(location);
        console.log('GEO: Location cached for 24 hours');
      }
    } else {
      console.log('GEO: Using cached location');
    }
    
    // Update page with location
    if (location && location.countryCode) {
      updateGeoTargets(location);
    } else {
      console.warn('GEO: Could not determine user location');
    }
  } catch (error) {
    console.error('GEO: Initialization failed', error);
  }
}

/**
 * Public API: Manually trigger location update
 * Useful for testing or forcing refresh
 */
window.GEO_FORCE_UPDATE = async function() {
  console.log('GEO: Forcing location update...');
  localStorage.removeItem(GEO_CONFIG.CACHE_KEY);
  await initGeoTargeting();
};

/**
 * Public API: Clear cache and reset
 */
window.GEO_CLEAR_CACHE = function() {
  localStorage.removeItem(GEO_CONFIG.CACHE_KEY);
  console.log('GEO: Cache cleared');
};

/**
 * Public API: Get current cached location
 */
window.GEO_GET_CACHED = function() {
  return getCachedLocation();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGeoTargeting);
} else {
  // DOM is already loaded
  initGeoTargeting();
}
