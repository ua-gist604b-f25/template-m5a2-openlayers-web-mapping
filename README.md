# M5A2: OpenLayers Enterprise Web Mapping

**GIST 604B - Module 5: Web GIS**

---

## 🎯 Assignment Structure

This assignment has **three progressive parts** that build your OpenLayers skills from fundamentals to enterprise-level applications:

| Part | Focus | Points |
|------|-------|--------|
| **Part 1: Simple Tutorial** | Build from scratch - HTML basics to interactive OpenLayers map | 5 pts |
| **Part 2: Walkthrough Tutorial** | Projections, map rotation, WMS layers, and drawing tools | 5 pts |
| **Part 3: Advanced Challenge** | Build an enterprise feature (projection work, measurement, or editing) | 5 pts |

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

**Understanding Projections: OpenLayers' Superpower** 🌐

**This is a KEY advantage OpenLayers has over Leaflet!**

OpenLayers has robust support for **any projection**, while Leaflet is essentially locked to Web Mercator (EPSG:3857). This matters enormously for:

- **Surveying & Engineering:** Working with State Plane Coordinate Systems
- **Parcel mapping:** Local governments often maintain data in county-specific projections
- **Legal boundaries:** Property lines are surveyed in local coordinate systems
- **Scientific applications:** Research data in UTM zones or custom projections

**Common Projections:**

| Code | Name | Use Case | OpenLayers | Leaflet |
|------|------|----------|------------|---------|
| **EPSG:4326** | WGS84 (Lat/Lon) | GPS coordinates | ✅ | ✅ |
| **EPSG:3857** | Web Mercator | Web mapping | ✅ | ✅ |
| **EPSG:2227** | CA State Plane Zone 3 | California surveys/parcels | ✅ | ❌ |
| **EPSG:32610** | UTM Zone 10N | Pacific Northwest mapping | ✅ | ❌ |

**In this example:**
- `ol.proj.fromLonLat([lon, lat])` converts from EPSG:4326 → EPSG:3857
- **Input:** Longitude first, then latitude `[lon, lat]` (opposite of Leaflet!)
- OpenLayers handles the math automatically

**Real-world example:** If you're building a parcel viewer for a county assessor's office, you NEED OpenLayers because parcel coordinates are in State Plane, not Web Mercator. Leaflet can't handle this without complex workarounds.

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

**Goal:** Master OpenLayers' advanced capabilities that set it apart from Leaflet.

**🎯 Why OpenLayers?** This part focuses on features that are difficult or impossible in Leaflet:
- **Projection transformations** for parcel/survey work
- **Map rotation** for compass/gyro-based navigation
- **WMS enterprise services**

### What You'll Learn:
- ✅ **Working with custom projections** (State Plane, UTM) for surveys/parcels
- ✅ **Map rotation** for handheld compass/gyro devices
- ✅ Connecting to WMS services
- ✅ Layer management with switcher
- ✅ Drawing tools

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

#### **Step 2.2: Working with Custom Projections** 🌐

📖 **Learn more:** [ol/proj](https://openlayers.org/en/latest/apidoc/module-ol_proj.html) | [Proj4js](http://proj4js.org/) | [EPSG.io](https://epsg.io/)

**Why This Matters:** Leaflet cannot do this!

Real-world GIS data often comes in local coordinate systems:
- **Parcel data:** County assessors use State Plane
- **Survey data:** Engineering drawings in State Plane or local grids
- **Legal boundaries:** Property lines surveyed in local coordinates
- **Scientific data:** Research data in UTM zones

**Example: Loading State Plane Data**

Add proj4js library to your HTML `<head>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.9.0/proj4.js"></script>
```

Then define a custom projection (California State Plane Zone 3):

```javascript
// Define California State Plane Zone 3 (feet)
proj4.defs("EPSG:2227", "+proj=lcc +lat_1=38.43333333333333 +lat_2=37.06666666666667 +lat_0=36.5 +lon_0=-120.5 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs");
ol.proj.proj4.register(proj4);

// Now you can work with State Plane coordinates!
// Example: Convert a parcel coordinate to Web Mercator for display
const parcelCoord = [6327426, 2101965];  // In State Plane feet
const webMercatorCoord = ol.proj.transform(parcelCoord, 'EPSG:2227', 'EPSG:3857');

// Create a marker at the parcel location
const parcelFeature = new ol.Feature({
    geometry: new ol.geom.Point(webMercatorCoord),
    name: 'Parcel APN 123-456-789',
    statePlaneX: parcelCoord[0],
    statePlaneY: parcelCoord[1]
});
```

**Real-World Use Case:**

Imagine you're building a web map for a county assessor's office. All their parcel data is in State Plane coordinates (EPSG:2227). With OpenLayers, you can:

1. Load parcel GeoJSON in State Plane
2. Transform to Web Mercator for display
3. Show coordinates in both systems
4. Export data back to State Plane for surveyors

**Leaflet can't do this** without complex external libraries and manual coordinate math.

**Test:** Add a `console.log()` to verify transformation works:

```javascript
console.log('State Plane:', parcelCoord);
console.log('Web Mercator:', webMercatorCoord);
```

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

#### **Step 2.5: Add Map Rotation** 🧭

📖 **Learn more:** [ol/View rotation](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#setRotation)

**Why This Matters:** Leaflet cannot do this!

Map rotation is essential for:
- **Mobile/handheld devices** with compass or gyroscope sensors
- **Navigation apps** that maintain true north as device orientation changes
- **Field data collection** where map orientation matches real-world view
- **Augmented reality** applications overlaying map data on camera view

**Real-World Use Case:**

Imagine you're building a field data collection app for surveyors or utility workers. As they walk and rotate their device, the map rotates to match their orientation, keeping "up" aligned with the direction they're facing. This dramatically improves spatial awareness in the field.

**Implementation:**

Add rotation control to HTML (after layer switcher):

```html
<div style="position: absolute; bottom: 20px; left: 20px; z-index: 1000; background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <label for="rotation">Map Rotation: <span id="rotation-value">0</span>°</label><br>
    <input type="range" id="rotation" min="0" max="360" value="0" style="width: 200px;">
    <button onclick="resetRotation()">Reset North</button>
</div>
```

Add rotation handler to your JavaScript:

```javascript
// Get rotation slider
const rotationSlider = document.getElementById('rotation');
const rotationValue = document.getElementById('rotation-value');

// Handle rotation changes
rotationSlider.addEventListener('input', function(e) {
    const degrees = parseInt(e.target.value);
    const radians = (degrees * Math.PI) / 180;
    
    // Rotate the map view
    map.getView().setRotation(radians);
    
    // Update display
    rotationValue.textContent = degrees;
});

// Reset to north
function resetRotation() {
    map.getView().setRotation(0);
    rotationSlider.value = 0;
    rotationValue.textContent = 0;
}

// Optional: Animate rotation for smooth transitions
function rotateToNorth() {
    map.getView().animate({
        rotation: 0,
        duration: 1000
    });
}
```

**Advanced: Compass Integration**

For mobile devices with compass/gyro sensors:

```javascript
// Check if device orientation API is available
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
        if (event.webkitCompassHeading !== undefined) {
            // iOS
            const heading = event.webkitCompassHeading;
            const radians = (heading * Math.PI) / 180;
            map.getView().setRotation(-radians);
        } else if (event.alpha !== null) {
            // Android
            const heading = 360 - event.alpha;
            const radians = (heading * Math.PI) / 180;
            map.getView().setRotation(-radians);
        }
    });
}
```

**Test:** 
- Move the rotation slider - map should rotate!
- Click "Reset North" - map should snap back to north-up
- On mobile, test compass integration (requires HTTPS)

---

#### **Step 2.6: Add Drawing Tools**

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
- [ ] Custom projection transformation working (State Plane example)
- [ ] Map rotation control functional
- [ ] WMS layer loads
- [ ] Layer switcher controls visibility
- [ ] Drawing tools work for all geometry types
- [ ] Professional UI layout
- [ ] No console errors

**Submit:** Commit your completed `src/part2/` directory

**Grading (5 points):**
- Custom projections (1 pt)
- Map rotation (1 pt)
- WMS integration (1 pt)
- Layer switcher + drawing (1 pt)
- Code quality (1 pt)

---

## 🚀 Part 3: Advanced Challenge - Enterprise Feature

**Goal:** Build one advanced enterprise feature that demonstrates professional web GIS capabilities.

### Requirements:

Choose **ONE** of these enterprise features to implement:

### Option A: Multi-Projection Parcel Viewer (5 pts)

Build a parcel/survey application with projection transformations:

- **Load data in State Plane or UTM** (non-Web Mercator)
- **Coordinate display** in multiple projections (State Plane, Lat/Lon, UTM)
- **Measurement tools** that work in local coordinate system
- **Export capabilities** in original projection
- **Projection switcher** showing same data in different coordinate systems
- **Professional UI** for surveyors/assessors

**Why this matters:** County assessors, surveyors, and engineers work exclusively in local coordinate systems. This demonstrates you can build real-world GIS applications.

### Option B: Advanced Measurement Tools (5 pts)

Build a professional measurement system:

- **Length measurement** with distance calculation
- **Area measurement** with acreage/hectares
- **Bearing/azimuth** for directional analysis
- **Coordinate display** on mouse move
- **Unit conversion** (meters/feet, km/miles)
- **Measurement persistence** (save/load measurements)

### Option B: Advanced Measurement Tools (5 pts)

Build a professional measurement system:

- **Length measurement** with distance calculation
- **Area measurement** with acreage/hectares
- **Bearing/azimuth** for directional analysis
- **Coordinate display** on mouse move (multiple projections)
- **Unit conversion** (meters/feet, km/miles, acres/hectares)
- **Measurement persistence** (save/load measurements)

### Option C: Feature Editing System (5 pts)

Build collaborative editing capabilities:

- **Feature selection** with modify interaction
- **Attribute editing** with form interface
- **Geometry editing** (move, reshape, delete)
- **Validation rules** preventing invalid geometries
- **Undo/redo** functionality
- **Export edited features** to GeoJSON

### Option C: Feature Editing System (5 pts)

Build collaborative editing capabilities:

- **Feature selection** with modify interaction
- **Attribute editing** with form interface
- **Geometry editing** (move, reshape, delete)
- **Validation rules** preventing invalid geometries
- **Undo/redo** functionality
- **Export edited features** to GeoJSON (in original projection if applicable)

### Option D: Compass/Gyro Navigation Interface (5 pts)

Build a rotation-based navigation system:

- **Device orientation integration** (compass/gyroscope)
- **Smooth rotation animations** maintaining north
- **Bearing indicator** showing current heading
- **Rotation lock/unlock** toggle
- **True north indicator** overlay
- **Mobile-optimized controls** for field use

**Use case:** Field data collection app where map orientation matches device orientation for better spatial awareness.

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

