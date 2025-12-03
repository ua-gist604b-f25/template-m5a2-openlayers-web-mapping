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
        })
    });

    // Add additional controls
    map.addControl(new ol.control.ScaleLine({
        units: 'metric'
    }));
    map.addControl(new ol.control.FullScreen());

    console.log('✅ Map initialized');
    
    // Load Sentinel-2 COG
    loadSentinelCOG();
}

/**
 * Load Sentinel-2 Cloud Optimized GeoTIFF
 * Using public Sentinel-2 COG from AWS Open Data (discoverable via STAC)
 * 
 * STAC Search Process:
 * 1. Search STAC catalog: https://earth-search.aws.element84.com/v1
 * 2. Filter by location (Tucson area: -111, 32)
 * 3. Filter by date and cloud cover
 * 4. Extract COG URLs from assets
 */
function loadSentinelCOG() {
    console.log('🛰️ Loading Sentinel-2 COG...');
    console.log('📍 Study Area: Tucson, Arizona');

    try {
        // Real Sentinel-2 L2A COG from AWS (discovered via STAC)
        // Scene: S2A_12SUA_20231015_0_L2A (October 15, 2023)
        // Tile: 12SUA (covers Tucson area)
        // Source: https://earth-search.aws.element84.com/v1
        
        // Individual band COGs for multispectral analysis
        const bands = {
            red: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/12/S/UA/2023/10/S2A_12SUA_20231015_0_L2A/B04.tif',
            green: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/12/S/UA/2023/10/S2A_12SUA_20231015_0_L2A/B03.tif',
            blue: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/12/S/UA/2023/10/S2A_12SUA_20231015_0_L2A/B02.tif',
            nir: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/12/S/UA/2023/10/S2A_12SUA_20231015_0_L2A/B08.tif'
        };

        console.log('📦 Loading bands:', Object.keys(bands));
        console.log('🔗 Red band URL:', bands.red);

        // Create GeoTIFF source with multiple bands
        cogSource = new ol.source.GeoTIFF({
            sources: [
                {
                    url: bands.red,
                    max: 10000  // Sentinel-2 L2A typical max value
                },
                {
                    url: bands.green,
                    max: 10000
                },
                {
                    url: bands.blue,
                    max: 10000
                },
                {
                    url: bands.nir,
                    max: 10000
                }
            ],
            crossOrigin: 'anonymous',
            interpolate: false  // Preserve pixel values
        });

        // Create WebGLTile layer with contrast stretch
        cogLayer = new ol.layer.WebGLTile({
            source: cogSource,
            style: {
                color: [
                    'array',
                    // Red channel: Band 1 (Red) with linear stretch
                    ['/', 
                        ['-', ['band', 1], ['var', 'redMin']], 
                        ['-', ['var', 'redMax'], ['var', 'redMin']]
                    ],
                    // Green channel: Band 2 (Green) with linear stretch
                    ['/', 
                        ['-', ['band', 2], ['var', 'greenMin']], 
                        ['-', ['var', 'greenMax'], ['var', 'greenMin']]
                    ],
                    // Blue channel: Band 3 (Blue) - fixed range for simplicity
                    ['/', ['band', 3], 10000],
                    1 // Alpha
                ],
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
            console.log('📍 COG loaded successfully');
            console.log('📐 Extent:', viewConfig.extent);
            console.log('🎯 Resolution:', viewConfig.resolutions);
            
            map.getView().fit(viewConfig.extent, {
                padding: [50, 50, 50, 50],
                duration: 1000
            });
        }).catch((error) => {
            console.error('❌ Error getting COG view:', error);
        });

        console.log('✅ Sentinel-2 COG loaded (4 bands)');
        console.log('💡 Adjust sliders to change contrast stretch');

    } catch (error) {
        console.error('❌ Error loading COG:', error);
        console.error('Stack:', error.stack);
        alert('Error loading Sentinel-2 COG. Check console for details.\n\nMake sure geotiff.js is loaded before OpenLayers.');
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
            // True Color: Red (B04), Green (B03), Blue (B02)
            color = [
                'array',
                // Red channel: Band 1 (Red) with user-defined stretch
                ['clamp',
                    ['/', 
                        ['-', ['band', 1], redMin], 
                        ['-', redMax, redMin]
                    ],
                    0, 1
                ],
                // Green channel: Band 2 (Green) with user-defined stretch
                ['clamp',
                    ['/', 
                        ['-', ['band', 2], greenMin], 
                        ['-', greenMax, greenMin]
                    ],
                    0, 1
                ],
                // Blue channel: Band 3 (Blue) - fixed for simplicity
                ['clamp', ['/', ['band', 3], 10000], 0, 1],
                1 // Alpha
            ];
        } else if (vizMode === 'nir-red-green') {
            // False Color: NIR (B08) → Red, Red (B04) → Green, Green (B03) → Blue
            color = [
                'array',
                // Red channel: NIR (Band 4)
                ['clamp',
                    ['/', 
                        ['-', ['band', 4], nirMin], 
                        ['-', nirMax, nirMin]
                    ],
                    0, 1
                ],
                // Green channel: Red (Band 1)
                ['clamp',
                    ['/', 
                        ['-', ['band', 1], redMin], 
                        ['-', redMax, redMin]
                    ],
                    0, 1
                ],
                // Blue channel: Green (Band 2)
                ['clamp',
                    ['/', 
                        ['-', ['band', 2], greenMin], 
                        ['-', greenMax, greenMin]
                    ],
                    0, 1
                ],
                1 // Alpha
            ];
        } else if (vizMode === 'ndvi') {
            // NDVI: (NIR - Red) / (NIR + Red)
            // Bands: NIR=Band4, Red=Band1
            const ndvi = [
                '/',
                ['-', ['band', 4], ['band', 1]], // NIR - Red
                ['+', ['band', 4], ['band', 1]]  // NIR + Red
            ];
            
            // Color ramp: -1 (red) → 0 (yellow) → 1 (green)
            color = [
                'array',
                // Red channel: high when NDVI is low
                ['interpolate', ['linear'], ndvi, -1, 1, 0, 1, 1, 0],
                // Green channel: high when NDVI is high
                ['interpolate', ['linear'], ndvi, -1, 0, 0, 1, 1, 1],
                // Blue channel: low throughout
                0,
                1 // Alpha
            ];
        }

        cogLayer.setStyle({
            color: color
        });

        console.log('🎨 Contrast stretch updated:', { 
            mode: vizMode, 
            red: [redMin, redMax], 
            green: [greenMin, greenMax], 
            nir: [nirMin, nirMax] 
        });
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

