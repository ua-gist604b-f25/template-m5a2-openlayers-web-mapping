// ============================================
// GIST 604B - OpenLayers Enterprise Mapping
// Student Name: [YOUR NAME HERE]
// ============================================

console.log('OpenLayers Part 2 - Enterprise Features');

// ============================================
// STEP 1: Initialize the Map
// ============================================
// TODO: Create your OpenLayers map here
// Example:
// const map = new ol.Map({
//     target: 'map',
//     view: new ol.View({
//         center: ol.proj.fromLonLat([-122.3321, 47.6062]),
//         zoom: 11
//     })
// });


// ============================================
// STEP 2: Add Base Map Layer
// ============================================
// TODO: Add OpenStreetMap tile layer
// Example:
// const osmLayer = new ol.layer.Tile({
//     source: new ol.source.OSM(),
//     title: 'OpenStreetMap'
// });
// map.addLayer(osmLayer);


// ============================================
// STEP 3: Add Vector Tile Layer
// ============================================
// TODO: Add a vector tile layer (MVT format)
// Note: Vector tiles are scalable and client-rendered
// Example using OpenMapTiles:
// const vectorTileLayer = new ol.layer.VectorTile({
//     source: new ol.source.VectorTile({
//         format: new ol.format.MVT(),
//         url: 'https://tile-server-url/{z}/{x}/{y}.pbf'
//     }),
//     title: 'Vector Streets',
//     visible: false
// });
// map.addLayer(vectorTileLayer);


// ============================================
// STEP 4: Add WMS Layer
// ============================================
// TODO: Add a Web Map Service layer
// Example using USGS imagery:
// const wmsLayer = new ol.layer.Tile({
//     source: new ol.source.TileWMS({
//         url: 'https://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WmsServer',
//         params: {
//             'LAYERS': '0',
//             'TILED': true
//         },
//         serverType: 'geoserver'
//     }),
//     title: 'USGS Imagery',
//     visible: false
// });
// map.addLayer(wmsLayer);


// ============================================
// STEP 5: Create Layer Switcher Control
// ============================================
// TODO: Implement layer switcher for toggling visibility
// Example:
// const layerSwitcher = document.createElement('div');
// layerSwitcher.className = 'layer-switcher';
// layerSwitcher.innerHTML = '<h4>Layers</h4><div id="layer-list"></div>';
// 
// const control = new ol.control.Control({
//     element: layerSwitcher
// });
// map.addControl(control);
//
// // Populate with layer checkboxes
// const layerList = document.getElementById('layer-list');
// map.getLayers().forEach(function(layer) {
//     const title = layer.get('title');
//     if (title) {
//         // Create checkbox for layer
//     }
// });


// ============================================
// STEP 6: Add Drawing Interactions
// ============================================
// Create drawing layer
const drawSource = new ol.source.Vector();
const drawLayer = new ol.layer.Vector({
    source: drawSource,
    title: 'Drawings',
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});
// map.addLayer(drawLayer);

// Drawing interaction
let currentDraw = null;

// TODO: Implement this function
function addDrawInteraction(type) {
    // Remove existing draw interaction
    // if (currentDraw) {
    //     map.removeInteraction(currentDraw);
    // }
    
    // Add new draw interaction
    // currentDraw = new ol.interaction.Draw({
    //     source: drawSource,
    //     type: type
    // });
    // map.addInteraction(currentDraw);
    
    console.log('Drawing mode:', type);
}

// TODO: Implement this function
function clearDrawings() {
    // drawSource.clear();
    console.log('Drawings cleared');
}


// ============================================
// STEP 7: Add Popup Overlay (Optional)
// ============================================
// TODO: Create popup for feature information
// Example:
// const popup = new ol.Overlay({
//     element: document.getElementById('popup'),
//     positioning: 'bottom-center',
//     stopEvent: false,
//     offset: [0, -10]
// });
// map.addOverlay(popup);
//
// // Handle map clicks
// map.on('click', function(event) {
//     // Check for features at clicked location
//     // Display popup with feature info
// });


// ============================================
// Helper Functions
// ============================================

// Format coordinates for display
function formatCoordinates(coords) {
    const lonLat = ol.proj.toLonLat(coords);
    return `Lon: ${lonLat[0].toFixed(6)}, Lat: ${lonLat[1].toFixed(6)}`;
}

// Get layer by title
function getLayerByTitle(title) {
    let foundLayer = null;
    map.getLayers().forEach(function(layer) {
        if (layer.get('title') === title) {
            foundLayer = layer;
        }
    });
    return foundLayer;
}

console.log('main.js loaded - ready to implement TODOs!');

