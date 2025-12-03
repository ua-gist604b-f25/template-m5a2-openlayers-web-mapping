# Part 4: Sentinel-2 COG with Dynamic Contrast Stretch

**GIST 604B - Module 5: Web GIS Full-Stack Orchestration**

---

## 🎯 Overview

This example demonstrates advanced raster visualization using:
- **Cloud Optimized GeoTIFF (COG)** from Sentinel-2 satellite imagery
- **WebGLTile layer** for high-performance rendering
- **Dynamic contrast stretching** with user-adjustable sliders
- **Multi-band visualization** (True Color, False Color, NDVI)
- **Real-world data** over Tucson, Arizona

---

## 🛰️ What is a Cloud Optimized GeoTIFF?

A **COG** is a regular GeoTIFF with an internal organization that enables efficient streaming and partial reading:

- **Tiled Structure:** Data organized in tiles for fast random access
- **Overviews:** Multi-resolution pyramids for zoom-level optimization
- **HTTP Range Requests:** Only download the data you need
- **No Server-Side Processing:** Direct rendering in the browser

**Why COGs Matter:**
- Stream terabytes of satellite imagery without downloading entire files
- Industry standard for cloud-native geospatial workflows
- Used by NASA, ESA, USGS, and commercial satellite providers

---

## 📊 Sentinel-2 Satellite Data

**Sentinel-2** is a European Space Agency (ESA) Earth observation mission:

- **Constellation:** Two satellites (2A and 2B)
- **Revisit Time:** 5 days (both satellites)
- **Resolution:** 10m (visible + NIR), 20m (red edge), 60m (atmospheric)
- **Swath Width:** 290 km
- **Spectral Bands:** 13 bands from visible to short-wave infrared

**Bands Used in This Example:**

| Band | Name | Wavelength | Resolution | Use |
|------|------|-----------|------------|-----|
| B4 | Red | 665 nm | 10m | True color, NDVI |
| B3 | Green | 560 nm | 10m | True color |
| B2 | Blue | 490 nm | 10m | True color |
| B8 | NIR | 842 nm | 10m | Vegetation analysis, NDVI |

---

## 🎨 Visualization Modes

### 1. True Color (RGB)
- **Bands:** Red, Green, Blue
- **Use:** Natural appearance, like a photograph
- **Good for:** Visual interpretation, urban areas, water bodies

### 2. False Color (NIR-R-G)
- **Bands:** NIR → Red, Red → Green, Green → Blue
- **Use:** Vegetation appears bright red
- **Good for:** Agricultural assessment, forest monitoring, wetlands

### 3. NDVI (Normalized Difference Vegetation Index)
- **Formula:** (NIR - Red) / (NIR + Red)
- **Range:** -1 to +1
- **Interpretation:**
  - High values (>0.6): Dense vegetation
  - Medium values (0.2-0.6): Sparse vegetation
  - Low values (<0.2): Bare soil, water, urban

---

## 🎛️ Contrast Stretching Explained

**What is Contrast Stretch?**

Raw satellite imagery often has low contrast because:
- Sensors capture wide dynamic range (0-65535 for 16-bit)
- Actual surface reflectance uses only a portion of the range
- Atmospheric effects compress the histogram

**How Stretching Works:**

1. **Min/Max Stretch:** Map input range [min, max] to display range [0, 255]
2. **Linear Interpolation:** Values between min/max are scaled proportionally
3. **Clipping:** Values below min → 0, values above max → 255

**Example:**
```
Raw Red Band: min=500, max=3000
Stretched: [500→0, 3000→255]
Value 1750 → (1750-500)/(3000-500) * 255 = 127
```

**Why Adjustable Sliders?**
- Different scenes require different stretch values
- Seasonal changes affect optimal ranges
- User can emphasize features of interest
- No "one size fits all" for Earth observation

---

## 🚀 Running the Example

### ⚠️ Important: Part 4 Requires npm Build

Unlike Parts 1-3, **Part 4 requires building with npm** because:
- COG rendering needs `ol.source.GeoTIFF` and `geotiff` library
- WebGLTile layer requires proper module bundling  
- ES6 imports need to be transpiled

### First Time Setup:

```bash
# Install dependencies (run once from project root)
npm install
```

This installs:
- `ol` (OpenLayers v10.2.1)
- `geotiff` (GeoTIFF.js v2.1.3)
- `vite` (Build tool)

### Running Part 4:

```bash
# Option 1: Development server with hot reload (recommended)
npm run part4

# Option 2: Build for production
npm run part4:build

# Option 3: Preview production build
npm run part4:preview
```

The development server will automatically:
- Bundle OpenLayers and GeoTIFF
- Enable hot module replacement
- Open your browser to `http://localhost:8004`

---

## 🎯 Features to Try

1. **Adjust Sliders:**
   - Move Red/Green/NIR min/max sliders
   - Watch the map update in real-time
   - Find the stretch that shows the most detail

2. **Change Visualization:**
   - Toggle between True Color, False Color, and NDVI
   - Notice how different features stand out in each mode

3. **Zoom and Explore:**
   - Use mouse wheel to zoom
   - Click and drag to pan
   - Notice how the COG streams data as you navigate

4. **Reset to Defaults:**
   - Click "Reset to Defaults" button
   - Returns to initial stretch values

---

## 📚 Technical Implementation

### Why npm Build is Required:

**CDN Limitations:**
- ❌ `ol.source.GeoTIFF` requires `geotiff.js` as a dependency
- ❌ Multi-band COG rendering fails with "Rendering array data is not yet supported"
- ❌ WebGLTile has compatibility issues with standalone CDN bundle

**npm Build Advantages:**
- ✅ Proper dependency management (`ol` + `geotiff`)
- ✅ WebGLTile layer with GPU-accelerated rendering
- ✅ Multi-band COG support with band math
- ✅ Tree-shaking for smaller bundle size
- ✅ Modern ES6 module syntax

### Project Structure:

```
src/part4/
├── index.html          # Entry point (no CDN scripts)
├── js/
│   └── main.js         # ES6 modules with imports
├── css/
│   └── styles.css
└── README.md
```

### Key OpenLayers Components (npm version):

```javascript
// ES6 imports (not possible with CDN)
import 'ol/ol.css';
import Map from 'ol/Map';
import GeoTIFF from 'ol/source/GeoTIFF';
import WebGLTileLayer from 'ol/layer/WebGLTile';

// Create multi-band COG source
const cogSource = new GeoTIFF({
    sources: [
        { url: redBandUrl, nodata: 0 },
        { url: greenBandUrl, nodata: 0 },
        { url: blueBandUrl, nodata: 0 },
        { url: nirBandUrl, nodata: 0 }
    ],
    crossOrigin: 'anonymous'
});

// GPU-accelerated rendering with WebGLTile
const cogLayer = new WebGLTileLayer({
    source: cogSource,
    style: {
        color: [
            'array',
            ['interpolate', ['linear'], ['band', 1], 0, 0, 3000, 1], // Red
            ['interpolate', ['linear'], ['band', 2], 0, 0, 3000, 1], // Green
            ['interpolate', ['linear'], ['band', 3], 0, 0, 3000, 1], // Blue
            1
        ]
    }
});
```

### STAC API Integration:

This demo queries the [Element 84 Earth Search STAC API](https://earth-search.aws.element84.com/v1) to find real Sentinel-2 scenes:

```javascript
const response = await fetch('https://earth-search.aws.element84.com/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        collections: ['sentinel-2-l2a'],
        bbox: [-111.2, 32.0, -110.7, 32.5], // Tucson
        datetime: '2023-01-01T00:00:00Z/2023-12-31T23:59:59Z',
        limit: 1,
        sortby: [{ field: 'properties.eo:cloud_cover', direction: 'asc' }]
    })
});
```

### Vite Configuration:

Vite automatically handles:
- Bundling OpenLayers + GeoTIFF
- ES6 module transpilation
- CSS processing
- Development server with HMR
- Production optimization

No configuration file needed for this simple setup!

### Band Math Expressions:

OpenLayers uses a **style expression** language for WebGL rendering:

```javascript
// Linear stretch for Red band
['interpolate', ['linear'], ['band', 1], minValue, 0, maxValue, 1]
//   ^operation  ^type      ^band-num   ^input-min    ^input-max

// NDVI calculation
['/', ['-', ['band', 4], ['band', 3]], ['+', ['band', 4], ['band', 3]]]
//  division  (NIR - Red)                    (NIR + Red)
```

---

## 🌐 Data Source

**Public Sentinel-2 COGs:**
- **AWS Open Data:** `s3://sentinel-cogs/`
- **Direct HTTPS:** `https://sentinel-cogs.s3.us-west-2.amazonaws.com/`
- **No Authentication Required:** Freely accessible
- **Registry:** `https://registry.opendata.aws/sentinel-2-l2a-cogs/`

**Finding Scenes:**
1. Search by tile ID (e.g., `32SNP` for Tucson)
2. Browse by date and path/row
3. Use STAC API for programmatic access

---

## 💡 Extension Ideas

### 1. Multi-Date Comparison
- Load two COGs from different dates
- Create a slider to blend between dates
- Show seasonal changes or disaster impacts

### 2. Custom Band Combinations
- Add dropdown for band selection
- Let users create custom RGB combinations
- Implement NDWI (water index), EVI (enhanced vegetation)

### 3. Histogram Display
- Show band histograms
- Visualize the effect of stretching
- Allow histogram equalization

### 4. Export Stretched Image
- Capture current view as PNG
- Save stretch parameters as JSON
- Generate shareable URLs with preset stretches

---

## 📖 References

### OpenLayers Documentation:
- [GeoTIFF Source](https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF.html)
- [WebGLTile Layer](https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLTile.html)
- [COG Example](https://openlayers.org/en/latest/examples/cog.html)
- [Band Contrast Stretch](https://openlayers.org/en/latest/examples/cog-stretch.html)

### Sentinel-2 Resources:
- [Sentinel Online](https://sentinel.esa.int/web/sentinel/missions/sentinel-2)
- [AWS Open Data](https://registry.opendata.aws/sentinel-2-l2a-cogs/)
- [Sentinel Hub](https://www.sentinel-hub.com/)

### COG Specification:
- [COG Spec](https://www.cogeo.org/)
- [GDAL COG Driver](https://gdal.org/drivers/raster/cog.html)

---

## 🐛 Troubleshooting

**COG doesn't load:**
- Check browser console for CORS errors
- Verify COG URL is accessible (try in browser)
- Ensure `crossOrigin: 'anonymous'` is set

**Performance issues:**
- Reduce visible area (zoom in)
- Lower resolution overviews will load first
- Check network tab for tile requests

**Stretch doesn't work:**
- Verify band numbers match your COG
- Check that values are in expected range
- Try resetting to defaults

**Colors look wrong:**
- TCI (True Color Image) has RGB pre-processed
- Raw L1C requires different band mapping
- Verify you're using L2A COGs

---

## ✅ Learning Objectives

After completing this example, you should understand:

1. ✅ **COG Format:** Structure and advantages over regular GeoTIFFs
2. ✅ **Contrast Stretching:** Why it's needed and how it works
3. ✅ **Multi-spectral Visualization:** True color vs false color vs indices
4. ✅ **WebGL Rendering:** GPU-accelerated raster processing
5. ✅ **Band Math:** Expressions for index calculations
6. ✅ **Real-World Data:** Working with professional satellite imagery

---

## 🎓 Related Course Concepts

**Module 3 (Python GIS):**
- M3A4: Rasterio for raster processing
- Band math and NDVI calculation
- Histogram analysis and stretching

**Module 5 (Web GIS):**
- M5A1: Leaflet web mapping (vector focus)
- M5A2: OpenLayers enterprise applications (this example!)
- COG streaming and visualization

**Professional Skills:**
- Remote sensing workflows
- Earth observation data analysis
- Cloud-native geospatial processing

---

**🌟 This example demonstrates professional-grade satellite imagery visualization in a web browser!**

