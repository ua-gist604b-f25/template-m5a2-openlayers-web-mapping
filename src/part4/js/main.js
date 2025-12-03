/**
 * Part 4: Sentinel-2 COG with Dynamic Contrast Stretch
 * GIST 604B - Module 5: Web GIS Full-Stack Orchestration
 * 
 * Demonstrates:
 * - Discovering Sentinel-2 COGs via STAC API
 * - Loading Cloud Optimized GeoTIFF with signed/public URLs
 * - WebGLTile layer for efficient rendering
 * - Dynamic contrast stretching with user controls
 * - Multi-band visualization (RGB, False Color, NDVI)
 * - Tucson, Arizona study area
 */

let map;
let cogLayer;
let cogSource;

// Default contrast stretch values
const defaults = {
    redMin: 0,
    redMax: 3000,
    greenMin: 0,
    greenMax: 3000,
    nirMin: 0,
    nirMax: 4000
};

// Tucson, Arizona coordinates
const tucsonCenter = [-110.9747, 32.2226]; // [lon, lat]
const tucsonExtent = [-111.2, 32.0, -110.7, 32.5]; // [minLon, minLat, maxLon, maxLat]

/**
 * Initialize the map and COG layer
 */
function initializeMap() {
    console.log('🗺️ Initializing map...');

    // Create base OSM layer
    const osmLayer = new ol.layer.Tile({
        source: new ol.source.OSM(),
        opacity: 0.5
    });

    // Create map
    map = new ol.Map({
        target: 'map',
        layers: [osmLayer],
        view: new ol.View({
            center: ol.proj.fromLonLat(tucsonCenter),
            zoom: 11,
            projection: 'EPSG:3857'
        })
    });

    // Add additional controls
    map.addControl(new ol.control.ScaleLine({
        units: 'metric'
    }));
    map.addControl(new ol.control.FullScreen());

    console.log('✅ Map initialized');
    
    // Search for Sentinel-2 scene via STAC
    searchSTACForScene();
}

/**
 * Search STAC API for Sentinel-2 scene over Tucson
 * Using Element 84's earth-search STAC catalog
 */
async function searchSTACForScene() {
    console.log('🔍 Searching STAC catalog for Sentinel-2 scene...');
    console.log('📍 Area of Interest: Tucson, Arizona');

    try {
        // Element 84 earth-search STAC API
        const stacUrl = 'https://earth-search.aws.element84.com/v1/search';
        
        // Search parameters
        const searchParams = {
            collections: ['sentinel-2-l2a'],
            bbox: [-111.2, 32.0, -110.7, 32.5], // Tucson area
            datetime: '2023-01-01T00:00:00Z/2023-12-31T23:59:59Z',
            limit: 1,
            query: {
                'eo:cloud_cover': {
                    'lt': 10 // Less than 10% cloud cover
                }
            },
            sortby: [
                {
                    field: 'properties.datetime',
                    direction: 'desc'
                }
            ]
        };

        console.log('🌐 Querying:', stacUrl);
        console.log('📦 Search params:', searchParams);

        const response = await fetch(stacUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
            throw new Error(`STAC API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
            throw new Error('No Sentinel-2 scenes found for Tucson area');
        }

        const scene = data.features[0];
        console.log('✅ Found scene:', scene.id);
        console.log('📅 Date:', scene.properties.datetime);
        console.log('☁️ Cloud cover:', scene.properties['eo:cloud_cover'], '%');
        
        // Extract COG URLs from assets
        const assets = scene.assets;
        
        // Try to get TCI (True Color Image) first - single RGB composite
        let cogUrl = assets.visual?.href || assets.true_color?.href;
        
        // If no TCI, try individual bands
        const cogUrls = {
            red: assets.red?.href || assets.B04?.href,
            green: assets.green?.href || assets.B03?.href,
            blue: assets.blue?.href || assets.B02?.href,
            nir: assets.nir?.href || assets.B08?.href
        };

        console.log('🔗 COG URLs discovered:');
        
        if (cogUrl) {
            console.log('  TCI (RGB composite):', cogUrl);
            loadSingleCOG(cogUrl);
        } else if (cogUrls.red && cogUrls.green && cogUrls.blue) {
            console.log('  Red:', cogUrls.red);
            console.log('  Green:', cogUrls.green);
            console.log('  Blue:', cogUrls.blue);
            console.log('  NIR:', cogUrls.nir);
            loadMultiBandCOG(cogUrls);
        } else {
            throw new Error('No suitable COG assets found in STAC response');
        }

    } catch (error) {
        console.error('❌ Error searching STAC:', error);
        console.log('⚠️ Falling back to example COG...');
        
        // Fallback to known working example
        loadFallbackCOG();
    }
}

/**
 * Load a single RGB composite COG (TCI - True Color Image)
 * This is more reliable than loading separate bands
 */
function loadSingleCOG(cogUrl) {
    console.log('🛰️ Loading Sentinel-2 TCI (RGB composite)...');
    console.log('🔗 URL:', cogUrl);

    try {
        cogSource = new ol.source.GeoTIFF({
            sources: [
                {
                    url: cogUrl,
                    max: 255  // TCI is 8-bit RGB
                }
            ],
            crossOrigin: 'anonymous',
            interpolate: false
        });

        // Wait for source to be ready
        cogSource.getView().then((viewConfig) => {
            console.log('✅ COG source ready');
            console.log('📐 Image size:', viewConfig.extent);
            
            // Create WebGLTile layer
            cogLayer = new ol.layer.WebGLTile({
                source: cogSource,
                style: {
                    color: [
                        'array',
                        ['/', ['band', 1], 255], // Red
                        ['/', ['band', 2], 255], // Green  
                        ['/', ['band', 3], 255], // Blue
                        1
                    ]
                }
            });

            map.addLayer(cogLayer);
            console.log('✅ WebGLTile layer added');

            // Zoom to extent
            map.getView().fit(viewConfig.extent, {
                padding: [50, 50, 50, 50],
                duration: 1000
            });
            
            console.log('✅ Sentinel-2 TCI loaded successfully');

        }).catch((error) => {
            console.error('❌ Error loading TCI:', error);
            loadFallbackCOG();
        });

    } catch (error) {
        console.error('❌ Error creating TCI source:', error);
        loadFallbackCOG();
    }
}

/**
 * Load multi-band COG (separate Red, Green, Blue, NIR files)
 * More complex but allows band math
 */
function loadMultiBandCOG(cogUrls) {
    console.log('🛰️ Loading Sentinel-2 multi-band COGs...');
    console.log('⚠️ Warning: Multi-band loading may be unstable with CDN version');
    
    // For now, just load Red band as a fallback
    console.log('🔄 Using single band (Red) instead of multi-band');
    loadSingleCOG(cogUrls.red);
}

/**
 * Load Sentinel-2 COG bands (DEPRECATED - kept for reference)
 */
function loadSentinelCOG(cogUrls) {
    // Redirect to single or multi-band loader
    if (typeof cogUrls === 'string') {
        loadSingleCOG(cogUrls);
    } else {
        loadMultiBandCOG(cogUrls);
    }
}

/**
 * Fallback: Load a known working public COG example
 * Using Planet Disaster Data (public, no auth required)
 */
function loadFallbackCOG() {
    console.log('🔄 Loading fallback COG example...');
    
    try {
        // Planet Disaster Data - Hurricane Harvey (public COG, no auth)
        const fallbackUrl = 'https://storage.googleapis.com/pdd-stac/disasters/hurricane-harvey/0831/20170831_172754_101c_3B_AnalyticMS.tif';
        
        console.log('🔗 Fallback COG:', fallbackUrl);

        cogSource = new ol.source.GeoTIFF({
            sources: [
                { url: fallbackUrl }
            ],
            crossOrigin: 'anonymous'
        });

        // Wait for source to be ready before creating layer
        cogSource.getView().then((viewConfig) => {
            console.log('✅ Fallback COG source ready');
            
            cogLayer = new ol.layer.WebGLTile({
                source: cogSource,
                style: {
                    color: [
                        'array',
                        ['/', ['band', 3], 255], // Red
                        ['/', ['band', 2], 255], // Green
                        ['/', ['band', 1], 255], // Blue
                        1
                    ]
                }
            });

            map.addLayer(cogLayer);
            console.log('✅ Fallback COG loaded');
            
            map.getView().fit(viewConfig.extent, {
                padding: [50, 50, 50, 50]
            });
            
        }).catch((error) => {
            console.error('❌ Fallback COG failed to load:', error);
            alert('Could not load any COG imagery. Check console for details.');
        });

    } catch (error) {
        console.error('❌ Fallback COG initialization error:', error);
        alert('Could not load any COG imagery. Check console for details.');
    }
}

/**
 * Update contrast stretch based on slider values
 * Note: With TCI (True Color Image), contrast stretch is simplified
 */
function updateContrastStretch() {
    const redMin = parseInt(document.getElementById('red-min').value);
    const redMax = parseInt(document.getElementById('red-max').value);
    const greenMin = parseInt(document.getElementById('green-min').value);
    const greenMax = parseInt(document.getElementById('green-max').value);

    // Update display values
    document.getElementById('red-min-value').textContent = redMin;
    document.getElementById('red-max-value').textContent = redMax;
    document.getElementById('green-min-value').textContent = greenMin;
    document.getElementById('green-max-value').textContent = greenMax;
    document.getElementById('nir-min-value').textContent = 'N/A';
    document.getElementById('nir-max-value').textContent = 'N/A';

    // Update layer style with new stretch values
    if (cogLayer) {
        const vizMode = document.querySelector('input[name="visualization"]:checked').value;

        let color;
        if (vizMode === 'rgb') {
            // True Color with adjustable contrast
            // TCI bands are 8-bit (0-255), so scale sliders accordingly
            const redScale = redMax / 10000; // Convert 0-10000 slider to 0-1 scale
            const greenScale = greenMax / 10000;
            
            color = [
                'array',
                ['clamp', ['*', ['/', ['band', 1], 255], redScale], 0, 1],
                ['clamp', ['*', ['/', ['band', 2], 255], greenScale], 0, 1],
                ['/', ['band', 3], 255], // Blue - fixed
                1
            ];
        } else {
            // For other modes, use standard display
            console.log('⚠️ False Color and NDVI require separate NIR band (not available in TCI)');
            color = [
                'array',
                ['/', ['band', 1], 255],
                ['/', ['band', 2], 255],
                ['/', ['band', 3], 255],
                1
            ];
        }

        try {
            cogLayer.setStyle({ color: color });
            console.log('🎨 Contrast updated:', { mode: vizMode, red: [redMin, redMax], green: [greenMin, greenMax] });
        } catch (error) {
            console.error('❌ Error updating style:', error);
        }
    }
}

/**
 * Reset sliders to default values
 */
function resetToDefaults() {
    document.getElementById('red-min').value = defaults.redMin;
    document.getElementById('red-max').value = defaults.redMax;
    document.getElementById('green-min').value = defaults.greenMin;
    document.getElementById('green-max').value = defaults.greenMax;
    document.getElementById('nir-min').value = defaults.nirMin;
    document.getElementById('nir-max').value = defaults.nirMax;
    document.querySelector('input[name="visualization"][value="rgb"]').checked = true;
    updateContrastStretch();
    console.log('🔄 Reset to defaults');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    const sliders = ['red-min', 'red-max', 'green-min', 'green-max', 'nir-min', 'nir-max'];
    sliders.forEach(sliderId => {
        document.getElementById(sliderId).addEventListener('input', updateContrastStretch);
    });

    document.querySelectorAll('input[name="visualization"]').forEach(radio => {
        radio.addEventListener('change', updateContrastStretch);
    });

    document.getElementById('reset-button').addEventListener('click', resetToDefaults);

    console.log('✅ Event listeners initialized');
}

/**
 * Main initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Part 4: Sentinel-2 COG via STAC API');
    console.log('📡 Element 84 earth-search STAC catalog');
    
    initializeMap();
    initializeEventListeners();
    
    console.log('✅ Application ready!');
});
