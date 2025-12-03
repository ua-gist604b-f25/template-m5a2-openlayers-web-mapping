/**
 * Part 4: Sentinel-2 COG with Dynamic Contrast Stretch
 * GIST 604B - Module 5: Web GIS Full-Stack Orchestration
 * 
 * Demonstrates:
 * - Discovering Sentinel-2 COGs via STAC API
 * - Loading Cloud Optimized GeoTIFF (npm build required)
 * - WebGLTile layer for GPU-accelerated rendering
 * - Dynamic contrast stretching with user controls
 * - Multi-band visualization (RGB, False Color, NDVI)
 * - Tucson, Arizona study area
 */

// Import OpenLayers modules
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import WebGLTileLayer from 'ol/layer/WebGLTile';
import OSM from 'ol/source/OSM';
import GeoTIFF from 'ol/source/GeoTIFF';
import {ScaleLine, FullScreen} from 'ol/control';

let map;
let cogLayer;
let cogSource;
let cogUrls = null; // Store COG URLs for band switching

// Default contrast stretch values (for Sentinel-2 L2A, values are 0-10000)
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
 * Initialize the map
 */
function initializeMap() {
    console.log('🗺️ Initializing map...');

    // Create base OSM layer
    const osmLayer = new TileLayer({
        source: new OSM(),
        opacity: 0.5
    });

    // Create map
    map = new Map({
        target: 'map',
        layers: [osmLayer],
        view: new View({
            center: fromLonLat(tucsonCenter),
            zoom: 11
        })
    });

    // Add additional controls
    map.addControl(new ScaleLine({
        units: 'metric'
    }));
    map.addControl(new FullScreen());

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
            bbox: tucsonExtent,
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
        console.log('🗺️ Scene geometry:', scene.geometry);
        console.log('📦 Scene bbox:', scene.bbox);
        
        // Check if scene actually intersects Tucson
        if (scene.bbox) {
            const [minLon, minLat, maxLon, maxLat] = scene.bbox;
            const tucsonLon = tucsonCenter[0];
            const tucsonLat = tucsonCenter[1];
            const containsTucson = tucsonLon >= minLon && tucsonLon <= maxLon && 
                                   tucsonLat >= minLat && tucsonLat <= maxLat;
            console.log('✓ Scene contains Tucson:', containsTucson);
            if (!containsTucson) {
                console.warn('⚠️ STAC returned scene that does NOT contain Tucson!');
                console.warn('   This might be a STAC API issue. Using it anyway as example.');
            }
        }
        
        // Extract COG URLs from assets
        const assets = scene.assets;
        
        // Get individual band URLs (10m resolution bands)
        cogUrls = {
            red: assets.red?.href || assets.B04?.href,
            green: assets.green?.href || assets.B03?.href,
            blue: assets.blue?.href || assets.B02?.href,
            nir: assets.nir?.href || assets.B08?.href
        };

        console.log('🔗 COG URLs discovered:');
        console.log('  Red (B04):', cogUrls.red);
        console.log('  Green (B03):', cogUrls.green);
        console.log('  Blue (B02):', cogUrls.blue);
        console.log('  NIR (B08):', cogUrls.nir);

        if (cogUrls.red && cogUrls.green && cogUrls.blue && cogUrls.nir) {
            loadMultiBandCOG(cogUrls);
        } else {
            throw new Error('Missing required bands (R, G, B, NIR)');
        }

    } catch (error) {
        console.error('❌ Error searching STAC:', error);
        console.log('⚠️ Falling back to example COG...');
        loadFallbackCOG();
    }
}

/**
 * Load multi-band COG (separate Red, Green, Blue, NIR files)
 * This enables full band math and custom visualizations
 */
function loadMultiBandCOG(urls) {
    console.log('🛰️ Loading Sentinel-2 multi-band COGs...');

    try {
        // Create GeoTIFF source with all 4 bands
        cogSource = new GeoTIFF({
            sources: [
                { url: urls.red, nodata: 0 },     // Band 1
                { url: urls.green, nodata: 0 },   // Band 2  
                { url: urls.blue, nodata: 0 },    // Band 3
                { url: urls.nir, nodata: 0 }      // Band 4
            ],
            crossOrigin: 'anonymous',
            interpolate: false
        });

        // Wait for source to be ready
        cogSource.getView().then((viewConfig) => {
            console.log('✅ COG source ready');
            console.log('📐 Bands available:', 4); // We loaded 4 sources
            console.log('📐 COG extent:', viewConfig.extent);
            console.log('📐 COG projection:', viewConfig.projection);
            
            // Create WebGLTile layer with initial RGB visualization
            cogLayer = new WebGLTileLayer({
                source: cogSource,
                style: createRGBStyle()
            });

            map.addLayer(cogLayer);
            console.log('✅ WebGLTile layer added with GPU acceleration');
            console.log('🎨 Initial style applied - if image is black, try adjusting sliders');
            console.log('💡 Try moving Red Max slider to 10000 if no image visible');

            // Keep map centered on Tucson (don't zoom to COG extent)
            // The COG should cover Tucson if STAC search worked correctly
            console.log('📍 Keeping map centered on Tucson, Arizona');
            console.log('ℹ️ If COG not visible, check that STAC returned correct scene');
            
            console.log('✅ Sentinel-2 COG loaded successfully (4 bands)');
            console.log('💡 Use sliders to adjust contrast stretch');

        }).catch((error) => {
            console.error('❌ Error loading multi-band COG:', error);
            loadFallbackCOG();
        });

    } catch (error) {
        console.error('❌ Error creating multi-band COG source:', error);
        loadFallbackCOG();
    }
}

/**
 * Create RGB visualization style with wider range
 */
function createRGBStyle() {
    const redMin = parseInt(document.getElementById('red-min').value);
    const redMax = parseInt(document.getElementById('red-max').value);
    const greenMin = parseInt(document.getElementById('green-min').value);
    const greenMax = parseInt(document.getElementById('green-max').value);

    console.log('🎨 Creating RGB style with:', {redMax, greenMax});

    // Start with very simple normalization - just divide by max value
    // Sentinel-2 L2A surface reflectance: 0-10000 (scaled by 10000)
    return {
        color: [
            'array',
            ['clamp', ['/', ['band', 1], redMax], 0, 1],     // Red
            ['clamp', ['/', ['band', 2], greenMax], 0, 1],   // Green  
            ['clamp', ['/', ['band', 3], 3000], 0, 1],       // Blue
            1
        ]
    };
}

/**
 * Create False Color (NIR-R-G) visualization style
 */
function createFalseColorStyle() {
    const nirMin = parseInt(document.getElementById('nir-min').value);
    const nirMax = parseInt(document.getElementById('nir-max').value);
    const redMin = parseInt(document.getElementById('red-min').value);
    const redMax = parseInt(document.getElementById('red-max').value);
    const greenMin = parseInt(document.getElementById('green-min').value);
    const greenMax = parseInt(document.getElementById('green-max').value);

    return {
        color: [
            'array',
            ['interpolate', ['linear'], ['band', 4], nirMin, 0, nirMax, 1],   // NIR → Red
            ['interpolate', ['linear'], ['band', 1], redMin, 0, redMax, 1],   // Red → Green
            ['interpolate', ['linear'], ['band', 2], greenMin, 0, greenMax, 1], // Green → Blue
            1
        ]
    };
}

/**
 * Create NDVI visualization style
 */
function createNDVIStyle() {
    return {
        color: [
            'case',
            // NDVI = (NIR - Red) / (NIR + Red)
            ['>', ['+', ['band', 4], ['band', 1]], 0], // Avoid division by zero
            [
                'interpolate',
                ['linear'],
                ['/', ['-', ['band', 4], ['band', 1]], ['+', ['band', 4], ['band', 1]]],
                -1, ['color', 0, 0, 255],     // Water/bare soil: blue
                0, ['color', 139, 69, 19],    // Low vegetation: brown
                0.2, ['color', 255, 255, 0],  // Sparse vegetation: yellow
                0.4, ['color', 173, 255, 47], // Medium vegetation: yellow-green
                0.6, ['color', 0, 255, 0],    // Dense vegetation: green
                1, ['color', 0, 100, 0]       // Very dense vegetation: dark green
            ],
            ['color', 0, 0, 0, 0]  // Transparent for invalid areas
        ],
        opacity: 0.8
    };
}

/**
 * Update visualization based on selected mode and contrast settings
 */
function updateContrastStretch() {
    if (!cogLayer) {
        console.warn('⚠️ COG layer not ready yet');
        return;
    }

    const vizMode = document.querySelector('input[name="visualization"]:checked').value;
    
    // Update display values
    document.getElementById('red-min-value').textContent = document.getElementById('red-min').value;
    document.getElementById('red-max-value').textContent = document.getElementById('red-max').value;
    document.getElementById('green-min-value').textContent = document.getElementById('green-min').value;
    document.getElementById('green-max-value').textContent = document.getElementById('green-max').value;
    document.getElementById('nir-min-value').textContent = document.getElementById('nir-min').value;
    document.getElementById('nir-max-value').textContent = document.getElementById('nir-max').value;

    let newStyle;
    switch (vizMode) {
        case 'rgb':
            newStyle = createRGBStyle();
            console.log('🎨 Switched to True Color (RGB)');
            break;
        case 'nir-red-green':
            newStyle = createFalseColorStyle();
            console.log('🌿 Switched to False Color (NIR-R-G)');
            break;
        case 'ndvi':
            newStyle = createNDVIStyle();
            console.log('📊 Switched to NDVI');
            break;
    }

    try {
        cogLayer.setStyle(newStyle);
        console.log('✅ Visualization updated');
    } catch (error) {
        console.error('❌ Error updating visualization:', error);
    }
}

/**
 * Fallback: Load a known working public COG example
 */
function loadFallbackCOG() {
    console.log('🔄 Loading fallback COG example...');
    
    try {
        // Use the Red band from the Tucson scene we already found
        // This should work since STAC returned valid URLs
        const fallbackUrl = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/12/S/VA/2023/12/S2B_12SVA_20231225_0_L2A/B04.tif';
        
        console.log('🔗 Fallback COG:', fallbackUrl);

        cogSource = new GeoTIFF({
            sources: [{ url: fallbackUrl, nodata: 0 }],
            crossOrigin: 'anonymous'
        });

        cogSource.getView().then((viewConfig) => {
            console.log('✅ Fallback COG source ready');
            
            cogLayer = new WebGLTileLayer({
                source: cogSource,
                style: {
                    color: [
                        'interpolate',
                        ['linear'],
                        ['band', 1],
                        0, ['color', 0, 0, 0],
                        3000, ['color', 255, 255, 255]
                    ]
                }
            });

            map.addLayer(cogLayer);
            console.log('✅ Fallback COG loaded (grayscale Red band)');
            console.log('💡 Showing single Red band as grayscale');
            
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
    console.log('🚀 Part 4: Sentinel-2 COG via STAC API (npm build version)');
    console.log('📡 Element 84 earth-search STAC catalog');
    console.log('⚡ Using WebGLTile for GPU-accelerated rendering');
    
    initializeMap();
    initializeEventListeners();
    
    console.log('✅ Application ready!');
});
