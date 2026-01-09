// OpenStreetMap Overpass API Service
// Lightweight industrial facility detection with aggressive caching

const OSM_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const CACHE_EXPIRY = 86400000; // 24 hours
const MAX_CACHE_ENTRIES = 50;
const API_TIMEOUT = 3000; // 3 seconds

// Cache Management
const getCacheKey = (lat, lon) => `osm_${lat.toFixed(2)}_${lon.toFixed(2)}`;

const getCachedData = (lat, lon) => {
    try {
        const key = getCacheKey(lat, lon);
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
            return data;
        }
        // Expired, remove it
        localStorage.removeItem(key);
        return null;
    } catch (e) {
        console.warn('Cache read error:', e);
        return null;
    }
};

const setCachedData = (lat, lon, data) => {
    try {
        const key = getCacheKey(lat, lon);
        const entry = { data, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(entry));

        // Cleanup: Keep only last 50 entries
        const allKeys = Object.keys(localStorage).filter(k => k.startsWith('osm_'));
        if (allKeys.length > MAX_CACHE_ENTRIES) {
            // Remove oldest entries
            const sorted = allKeys.map(k => {
                const item = localStorage.getItem(k);
                return { key: k, timestamp: JSON.parse(item).timestamp };
            }).sort((a, b) => a.timestamp - b.timestamp);

            sorted.slice(0, allKeys.length - MAX_CACHE_ENTRIES).forEach(item => {
                localStorage.removeItem(item.key);
            });
        }
    } catch (e) {
        console.warn('Cache write error (may be full):', e);
    }
};

// Query OpenStreetMap for industrial facilities
export const queryIndustrialFacilities = async (lat, lon, radius = 5000) => {
    // Check cache first
    const cached = getCachedData(lat, lon);
    if (cached !== null) {
        return cached;
    }

    // Build Overpass query (Note: use GET for better CORS compatibility)
    const query = `[out:json][timeout:3];(node["industrial"](around:${radius},${lat},${lon});way["industrial"](around:${radius},${lat},${lon});node["man_made"="wastewater_plant"](around:${radius},${lat},${lon});way["man_made"="wastewater_plant"](around:${radius},${lat},${lon}););out count;`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        // Use GET method with query parameter for better CORS support
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`${OSM_ENDPOINT}?data=${encodedQuery}`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('OSM API error');

        const data = await response.json();

        // Extract count
        const industrialCount = data.elements?.length || 0;
        const hasWastewaterPlant = data.elements?.some(e =>
            e.tags?.man_made === 'wastewater_plant'
        ) || false;

        const result = {
            count: industrialCount,
            hasWastewaterPlant,
            source: 'OpenStreetMap',
            timestamp: Date.now()
        };

        // Cache the result
        setCachedData(lat, lon, result);

        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('OSM query timeout');
        } else {
            console.warn('OSM query failed:', error);
        }

        // Return fallback data
        return {
            count: 0,
            hasWastewaterPlant: false,
            source: 'fallback',
            error: error.message
        };
    }
};

// Debounce helper
let debounceTimer = null;
export const debouncedQuery = (lat, lon, callback, delay = 1000) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        const result = await queryIndustrialFacilities(lat, lon);
        callback(result);
    }, delay);
};
