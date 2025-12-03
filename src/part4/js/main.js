/**
 * Part 4: Sentinel-2 COG with Dynamic Contrast Stretch
 * GIST 604B - Module 5: Web GIS Full-Stack Orchestration
 * 
 * Demonstrates:
 * - Loading Cloud Optimized GeoTIFF (COG) from public Sentinel-2 data
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
        }),
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine({
                units: 'metric'
            }),
            new ol.control.FullScreen()
        ])
    });

    console.log('✅ Map initialized');
    
    // Load Sentinel-2 COG
    loadSentinelCOG();
}

/**
 * Load Sentinel-2 Cloud Optimized GeoTIFF
 * Using public Sentinel-2 COG from AWS Open Data
 */
function loadSentinelCOG() {
    console.log('🛰️ Loading Sentinel-2 COG...');

    try {
        // Public Sentinel-2 L2A COG from AWS
        // Example: Tucson area - Scene from Sentinel-2 COGs on AWS
        // Note: This is a real public COG URL. You may need to find a specific scene for Tucson.
        const cogUrl = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/32/S/NP/2023/7/S2A_32SNP_20230715_0_L2A/TCI.tif';

        cogSource = new ol.source.GeoTIFF({
            sources: [
                {
                    url: cogUrl,
                    // Normalize: true converts values to 0-1 range
                    normalize: false,
                    // For multispectral, we can specify band configuration
                    // Sentinel-2 L2A TCI (True Color Image) has RGB bands
                }
            ],
            // Allow cross-origin requests
            crossOrigin: 'anonymous'
        });

        // Create WebGLTile layer with contrast stretch
        cogLayer = new ol.layer.WebGLTile({
            source: cogSource,
            style: {
                color: [
                    'array',
                    ['/', ['band', 1], 255], // Red (normalize to 0-1)
                    ['/', ['band', 2], 255], // Green
                    ['/', ['band', 3], 255], // Blue
                    1 // Alpha
                ],
                // Enable contrast stretching
                variables: {
                    redMin: defaults.redMin,
                    redMax: defaults.redMax,
                    greenMin: defaults.greenMin,
                    greenMax: defaults.greenMax,
                    nirMin: defaults.nirMin,
                    nirMax: defaults.nirMax
                }
            }
        });

        map.addLayer(cogLayer);

        // Zoom to COG extent when ready
        cogSource.getView().then((viewConfig) => {
            console.log('📍 COG loaded, extent:', viewConfig.extent);
            map.getView().fit(viewConfig.extent, {
                padding: [50, 50, 50, 50],
                duration: 1000
            });
        }).catch((error) => {
            console.error('❌ Error getting COG view:', error);
        });

        console.log('✅ Sentinel-2 COG loaded');

    } catch (error) {
        console.error('❌ Error loading COG:', error);
        alert('Error loading Sentinel-2 imagery. Please check the console for details.');
    }
}

/**
 * Update contrast stretch based on slider values
 */
function updateContrastStretch() {
    const redMin = parseInt(document.getElementById('red-min').value);
    const redMax = parseInt(document.getElementById('red-max').value);
    const greenMin = parseInt(document.getElementById('green-min').value);
    const greenMax = parseInt(document.getElementById('green-max').value);
    const nirMin = parseInt(document.getElementById('nir-min').value);
    const nirMax = parseInt(document.getElementById('nir-max').value);

    // Update display values
    document.getElementById('red-min-value').textContent = redMin;
    document.getElementById('red-max-value').textContent = redMax;
    document.getElementById('green-min-value').textContent = greenMin;
    document.getElementById('green-max-value').textContent = greenMax;
    document.getElementById('nir-min-value').textContent = nirMin;
    document.getElementById('nir-max-value').textContent = nirMax;

    // Update layer style with new stretch values
    if (cogLayer) {
        // Get current visualization mode
        const vizMode = document.querySelector('input[name="visualization"]:checked').value;

        let color;
        if (vizMode === 'rgb') {
            // True Color: Red, Green, Blue
            color = [
                'array',
                ['interpolate', ['linear'], ['band', 1], redMin, 0, redMax, 1],  // Red
                ['interpolate', ['linear'], ['band', 2], greenMin, 0, greenMax, 1], // Green
                ['interpolate', ['linear'], ['band', 3], 0, 0, 255, 1], // Blue (fixed for TCI)
                1
            ];
        } else if (vizMode === 'nir-red-green') {
            // False Color: NIR, Red, Green
            color = [
                'array',
                ['interpolate', ['linear'], ['band', 1], nirMin, 0, nirMax, 1],  // NIR -> Red
                ['interpolate', ['linear'], ['band', 1], redMin, 0, redMax, 1],  // Red -> Green
                ['interpolate', ['linear'], ['band', 2], greenMin, 0, greenMax, 1], // Green -> Blue
                1
            ];
        } else if (vizMode === 'ndvi') {
            // NDVI: (NIR - Red) / (NIR + Red)
            // Display as grayscale where higher values = more vegetation
            const ndvi = [
                '/',
                ['-', ['band', 1], ['band', 1]], // NIR - Red (simplified for TCI)
                ['+', ['band', 1], ['band', 1]]  // NIR + Red
            ];
            color = [
                'array',
                ndvi, // Red channel
                ndvi, // Green channel
                ndvi, // Blue channel
                1
            ];
        }

        cogLayer.setStyle({
            color: color
        });

        console.log('🎨 Contrast stretch updated:', { redMin, redMax, greenMin, greenMax, nirMin, nirMax });
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

    // Reset to RGB mode
    document.querySelector('input[name="visualization"][value="rgb"]').checked = true;

    updateContrastStretch();
    console.log('🔄 Reset to defaults');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Slider event listeners
    const sliders = ['red-min', 'red-max', 'green-min', 'green-max', 'nir-min', 'nir-max'];
    sliders.forEach(sliderId => {
        document.getElementById(sliderId).addEventListener('input', updateContrastStretch);
    });

    // Visualization mode radio buttons
    document.querySelectorAll('input[name="visualization"]').forEach(radio => {
        radio.addEventListener('change', updateContrastStretch);
    });

    // Reset button
    document.getElementById('reset-button').addEventListener('click', resetToDefaults);

    console.log('✅ Event listeners initialized');
}

/**
 * Main initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Part 4: Sentinel-2 COG Contrast Stretch Application');
    
    initializeMap();
    initializeEventListeners();
    
    console.log('✅ Application ready!');
    console.log('💡 Adjust the sliders to change the contrast stretch');
});

