# M5A2: OpenLayers Enterprise Web Mapping

**GIST 604B - Module 5: Web GIS**

---

## 🎯 Assignment Structure

This assignment has **three progressive parts** that build your OpenLayers skills from fundamentals to enterprise-level applications:

| Part | Focus | Points |
|------|-------|--------|
| **Part 1: Simple Tutorial** | Build from scratch - HTML basics to interactive OpenLayers map | 5 pts |
| **Part 2: Walkthrough Tutorial** | Vector tiles, WMS layers, and advanced controls | 5 pts |
| **Part 3: Advanced Challenge** | Build an enterprise feature (drawing tools, measurement, or editing) | 5 pts |

**Total: 15 points**

---

## 📚 Part 1: Simple Tutorial - Build From Scratch

**Goal:** Learn OpenLayers fundamentals by building a map step-by-step from a blank HTML file.

### What You'll Learn:
- ✅ OpenLayers initialization and view configuration
- ✅ Understanding projections (EPSG:3857 vs EPSG:4326)
- ✅ Adding tile layers (OSM, satellite, terrain)
- ✅ Creating vector features with hardcoded geometries
- ✅ Simple basemap switcher

### Files to Create:
- `src/part1/index.html` - Build from scratch!

### Step-by-Step Instructions:

---

#### **Step 1.1: Create Blank HTML**

📖 **Learn more:** [HTML Basics](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML)

Create `src/part1/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First OpenLayers Map</title>
</head>
<body>
    <h1>Hello OpenLayers!</h1>
</body>
</html>
```

**Test:** Open in browser - you should see "Hello OpenLayers!"

---

#### **Step 1.2: Add OpenLayers CSS and Container**

📖 **Learn more:** [OpenLayers Quick Start](https://openlayers.org/doc/quickstart.html)

Update your `<head>`:

```html
<head>
    <title>My First OpenLayers Map</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v10.2.1/ol.css">
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        #map { width: 100%; height: 600px; }
    </style>
</head>
```

Update your `<body>`:

```html
<body>
    <h1>My First OpenLayers Map</h1>
    <div id="map"></div>
</body>
```

**Test:** You should see an empty rectangle for the map container.

---

#### **Step 1.3: Add OpenLayers JavaScript and Initialize Map**

📖 **Learn more:** [ol/Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html) | [ol/View](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html)

Before closing `</body>` tag, add:

```html
<script src="https://cdn.jsdelivr.net/npm/ol@v10.2.1/dist/ol.js"></script>
<script>
    // Create OpenLayers map with view
    const map = new ol.Map({
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([-122.3321, 47.6062]),  // Seattle [lon, lat]
            zoom: 10
        })
    });
    
    console.log('OpenLayers map created!');
</script>
```

**Understanding Projections:**

OpenLayers uses **EPSG:3857** (Web Mercator) internally for display, but coordinates are often in **EPSG:4326** (latitude/longitude).

- `ol.proj.fromLonLat([lon, lat])` converts from EPSG:4326 → EPSG:3857
- **Why?** Web maps use Mercator projection for efficient tiling
- **Input:** Longitude first, then latitude `[lon, lat]`

**Test:** Open console (F12) - you should see "OpenLayers map created!" but no tiles yet.

---

#### **Step 1.4: Add Base Map Tiles**

📖 **Learn more:** [ol/source/OSM](https://openlayers.org/en/latest/apidoc/module-ol_source_OSM-OSM.html) | [ol/layer/Tile](https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html) | [Slippy Map Tilenames](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)

**Understanding Layers in OpenLayers:**

Unlike Leaflet where you add tiles directly, OpenLayers uses a **Layer → Source** architecture:

```
Layer (how to display) → Source (where data comes from)
```

Add after creating the map:

```javascript
// Create tile layer with OSM source
const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

map.addLayer(osmLayer);
```

**What's happening:**
- `ol.layer.Tile` - A layer that displays tiled images
- `ol.source.OSM` - A source that fetches OpenStreetMap tiles
- `map.addLayer()` - Adds the layer to the map

**Test:** You should now see an actual map of Seattle!

---

#### **Step 1.5: Add Static Vector Features**

📖 **Learn more:** [ol/Feature](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html) | [ol/geom](https://openlayers.org/en/latest/apidoc/module-ol_geom.html) | [ol/layer/Vector](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html)

Add markers for Seattle landmarks:

```javascript
// Create vector source for markers
const vectorSource = new ol.source.Vector();

// Space Needle
const spaceNeedle = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([-122.3493, 47.6205])),
    name: 'Space Needle',
    description: 'Iconic Seattle landmark'
});

// Pike Place Market
const pikePlace = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([-122.3425, 47.6097])),
    name: 'Pike Place Market',
    description: 'Historic public market'
});

// Add features to source
vectorSource.addFeatures([spaceNeedle, pikePlace]);

// Create vector layer
const vectorLayer = new ol.layer.Vector({
    source: vectorSource
});

map.addLayer(vectorLayer);
```

**Test:** You should see blue markers at each location!

---

#### **Step 1.6: Add Popups on Click**

📖 **Learn more:** [ol/Overlay](https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html) | [Map Events](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#event:click)

Add popup container to HTML (after map div):

```html
<div id="popup" style="position: absolute; background: white; padding: 10px; 
     border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: none;">
    <div id="popup-content"></div>
</div>
```

Add popup overlay and click handler to your `<script>`:

```javascript
// Create popup overlay
const popup = new ol.Overlay({
    element: document.getElementById('popup'),
    positioning: 'bottom-center',
    offset: [0, -10]
});
map.addOverlay(popup);

// Handle map clicks
map.on('click', function(event) {
    const feature = map.forEachFeatureAtPixel(event.pixel, function(feature) {
        return feature;
    });
    
    if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        const name = feature.get('name');
        const description = feature.get('description');
        
        document.getElementById('popup-content').innerHTML = 
            '<h3>' + name + '</h3><p>' + description + '</p>';
        document.getElementById('popup').style.display = 'block';
        popup.setPosition(coordinates);
    } else {
        document.getElementById('popup').style.display = 'none';
    }
});
```

**Test:** Click markers - popups should appear!

---

### ✅ Part 1 Completion Checklist:

- [ ] HTML file created from scratch
- [ ] OpenLayers CSS and JS added
- [ ] Map initializes with correct view
- [ ] OSM tiles load
- [ ] Two markers appear
- [ ] Clicking markers shows popups
- [ ] All code works without errors (check console)

**Submit:** Commit your `src/part1/` directory with working `index.html`

**Grading (5 points):**
- Map initialization with view (1 pt)
- OSM tile layer (1 pt)
- Vector features (1 pt)
- Popups (1 pt)
- Code quality (1 pt)

---

## 🗺️ Part 2: Walkthrough Tutorial - Enterprise Features

**Goal:** Work with real-world data sources including vector tiles, WMS layers, and advanced controls.

### What You'll Learn:
- ✅ Loading vector tiles (MVT format)
- ✅ Connecting to WMS services
- ✅ Layer management with switcher
- ✅ Custom styling for vector data
- ✅ Drawing and measurement tools

### Files Provided:
- `src/part2/index.html` - Starter template
- `src/part2/js/main.js` - TODO comments guide you

### Step-by-Step Instructions:

---

#### **Step 2.1: Initialize Enterprise Map**

📖 **Learn more:** [OpenLayers Examples](https://openlayers.org/en/latest/examples/)

Open `src/part2/js/main.js` and implement the basic map:

```javascript
const map = new ol.Map({
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-122.3321, 47.6062]),
        zoom: 11
    })
});

// Add OSM base layer
const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    title: 'OpenStreetMap'
});
map.addLayer(osmLayer);
```

**Test:** Run `npm start` - map should appear!

---

#### **Step 2.2: Add Vector Tile Layer**

📖 **Learn more:** [ol/layer/VectorTile](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorTile-VectorTileLayer.html) | [MVT Format](https://github.com/mapbox/vector-tile-spec)

Add a Mapbox Streets vector tile layer:

```javascript
const vectorTileLayer = new ol.layer.VectorTile({
    source: new ol.source.VectorTile({
        format: new ol.format.MVT(),
        url: 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.mvt?access_token=YOUR_TOKEN'
    }),
    title: 'Vector Streets'
});
map.addLayer(vectorTileLayer);
```

**Note:** For this exercise, you can use OpenMapTiles or OpenStreetMap vector tiles instead.

**Test:** Vector features should render as scalable graphics.

---

#### **Step 2.3: Add WMS Layer**

📖 **Learn more:** [ol/source/TileWMS](https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html) | [WMS Standard](https://www.ogc.org/standard/wms/)

Add a Web Map Service layer (USGS imagery):

```javascript
const wmsLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WmsServer',
        params: {
            'LAYERS': '0',
            'TILED': true
        },
        serverType: 'geoserver'
    }),
    title: 'USGS Imagery',
    visible: false
});
map.addLayer(wmsLayer);
```

**Test:** Toggle layer visibility in console: `wmsLayer.setVisible(true)`

---

#### **Step 2.4: Add Layer Switcher Control**

📖 **Learn more:** [ol/control](https://openlayers.org/en/latest/apidoc/module-ol_control.html)

Create a custom layer switcher:

```javascript
// Create control element
const layerSwitcher = document.createElement('div');
layerSwitcher.className = 'layer-switcher';
layerSwitcher.innerHTML = '<h4>Layers</h4><div id="layer-list"></div>';

// Add to map
const control = new ol.control.Control({
    element: layerSwitcher
});
map.addControl(control);

// Populate layer list
const layerList = document.getElementById('layer-list');
map.getLayers().forEach(function(layer) {
    const title = layer.get('title');
    if (title) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = layer.getVisible();
        checkbox.addEventListener('change', function() {
            layer.setVisible(this.checked);
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + title));
        layerList.appendChild(label);
        layerList.appendChild(document.createElement('br'));
    }
});
```

Add CSS for layer switcher (in `<style>` tag):

```css
.layer-switcher {
    position: absolute;
    top: 10px;
    right: 10px;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
```

**Test:** Layer checkboxes should toggle visibility!

---

#### **Step 2.5: Add Drawing Tools**

📖 **Learn more:** [ol/interaction/Draw](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-Draw.html)

Add drawing controls:

```javascript
// Create draw source and layer
const drawSource = new ol.source.Vector();
const drawLayer = new ol.layer.Vector({
    source: drawSource,
    title: 'Drawings'
});
map.addLayer(drawLayer);

// Add draw interaction
let currentDraw = null;

function addDrawInteraction(type) {
    if (currentDraw) {
        map.removeInteraction(currentDraw);
    }
    
    currentDraw = new ol.interaction.Draw({
        source: drawSource,
        type: type
    });
    map.addInteraction(currentDraw);
}

// Add buttons (in HTML)
```

Add drawing buttons to HTML:

```html
<div style="position: absolute; top: 10px; left: 10px; z-index: 1;">
    <button onclick="addDrawInteraction('Point')">Draw Point</button>
    <button onclick="addDrawInteraction('LineString')">Draw Line</button>
    <button onclick="addDrawInteraction('Polygon')">Draw Polygon</button>
</div>
```

**Test:** Click buttons and draw on map!

---

### ✅ Part 2 Completion Checklist:

- [ ] Map initializes with enterprise configuration
- [ ] Vector tile layer loads
- [ ] WMS layer loads
- [ ] Layer switcher controls visibility
- [ ] Drawing tools work for all geometry types
- [ ] Professional UI layout
- [ ] No console errors

**Submit:** Commit your completed `src/part2/` directory

**Grading (5 points):**
- Vector tiles (1 pt)
- WMS integration (1 pt)
- Layer switcher (1 pt)
- Drawing tools (1 pt)
- Code quality (1 pt)

---

## 🚀 Part 3: Advanced Challenge - Enterprise Feature

**Goal:** Build one advanced enterprise feature that demonstrates professional web GIS capabilities.

### Requirements:

Choose **ONE** of these enterprise features to implement:

### Option A: Advanced Measurement Tools (5 pts)

Build a professional measurement system:

- **Length measurement** with distance calculation
- **Area measurement** with acreage/hectares
- **Bearing/azimuth** for directional analysis
- **Coordinate display** on mouse move
- **Unit conversion** (meters/feet, km/miles)
- **Measurement persistence** (save/load measurements)

### Option B: Feature Editing System (5 pts)

Build collaborative editing capabilities:

- **Feature selection** with modify interaction
- **Attribute editing** with form interface
- **Geometry editing** (move, reshape, delete)
- **Validation rules** preventing invalid geometries
- **Undo/redo** functionality
- **Export edited features** to GeoJSON

### Option C: Spatial Analysis Tools (5 pts)

Build analysis capabilities:

- **Buffer generation** with distance parameter
- **Intersection** of two layers
- **Union** of features
- **Spatial query** (features within distance)
- **Results visualization** with custom styling
- **Analysis export** to GeoJSON

### Files to Create:
- `src/part3/index.html` - Your implementation
- `src/part3/js/main.js` - Your code
- `src/part3/css/styles.css` - Custom styling
- `src/part3/README.md` - **REQUIRED**: Document your feature

---

### Documentation Required:

Create `src/part3/README.md`:

```markdown
# Part 3: Enterprise Feature - [Feature Name]

## Overview
[Brief description of the feature and why you chose it]

## Features Implemented

### Core Functionality
- [ ] Feature 1 description
- [ ] Feature 2 description
- [ ] Feature 3 description

### UI/UX
- [ ] Professional interface
- [ ] User feedback (messages, loading indicators)
- [ ] Responsive design

### Technical Implementation
- [ ] OpenLayers interactions used
- [ ] Data management approach
- [ ] Error handling

## Usage Instructions

1. [Step-by-step guide for users]
2. [...]

## Technical Notes

### Key OpenLayers APIs Used:
- `ol.interaction.Draw` - [explanation]
- `ol.geom.Polygon.getArea()` - [explanation]
- ...

### Challenges Encountered:
[Any interesting problems you solved]

### Future Enhancements:
[What you would add with more time]
```

---

### ✅ Part 3 Completion Checklist:

- [ ] Advanced feature fully implemented
- [ ] Professional UI with clear controls
- [ ] Error handling for edge cases
- [ ] Code is well-commented
- [ ] README.md documents the feature
- [ ] Feature works without errors

**Submit:** Commit your `src/part3/` directory with all files and documentation

**Grading (5 points):**
- Core functionality (2 pts)
- UI/UX quality (1 pt)
- Code quality (1 pt)
- Documentation (1 pt)

---

## 📤 Submission

### How to Submit:

1. **Complete all three parts** (or as many as you can)
2. **Commit your work:**
   ```bash
   git add src/part1/ src/part2/ src/part3/
   git commit -m "Complete M5A2 OpenLayers assignment"
   git push
   ```
3. **Submit repository URL to D2L**

### What Gets Graded:

- **Part 1:** `src/part1/index.html` - working simple map (5 pts)
- **Part 2:** `src/part2/` - enterprise data integration (5 pts)
- **Part 3:** `src/part3/` - advanced feature with documentation (5 pts)

**Total: 15 points**

---

## 🆘 Getting Help

### Common Issues:

**Part 1 - Map doesn't appear:**
- Check `#map { height: 600px; }` in CSS
- Verify OpenLayers JS loaded (check console)
- Check projection conversion for coordinates

**Part 2 - WMS doesn't load:**
- Verify WMS URL is correct
- Check CORS errors in console
- Test WMS URL in browser first

**Part 3 - Interactions not working:**
- Check if interaction is added to map
- Verify event handlers are attached
- Look for JavaScript errors in console

### Where to Ask Questions:

- **GitHub Discussions:** Module 5 Q&A
- **Office Hours:** [Calendly](https://calendly.com/aaryno/30min)
- **Email:** aaryn@arizona.edu

---

## 📚 Resources

### OpenLayers Documentation:
- [API Documentation](https://openlayers.org/en/latest/apidoc/)
- [Examples](https://openlayers.org/en/latest/examples/)
- [Workshop](https://openlayers.org/workshop/)

### Key Concepts:
- [Projections](https://openlayers.org/en/latest/doc/tutorials/concepts.html#projection)
- [Vector Tiles](https://openlayers.org/en/latest/examples/mapbox-vector-tiles.html)
- [WMS/WMTS](https://openlayers.org/en/latest/examples/wms-tiled.html)

### Enterprise GIS:
- [Web GIS Development Best Practices](https://www.osgeo.org/resources/)
- [OGC Standards](https://www.ogc.org/standards/)

---

## 💡 Tips for Success

1. **Do parts in order** - Each builds on previous skills
2. **Test frequently** - Check after every code change
3. **Use console.log()** - Debug by printing objects
4. **Start simple in Part 3** - Get basic functionality working first
5. **Document as you go** - Note implementation decisions

Good luck! 🗺️

