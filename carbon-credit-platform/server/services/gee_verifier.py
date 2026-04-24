import ee
import json
import sys

import os

# 1. Initialize the Earth Engine API
try:
    project_id = os.environ.get('GEE_PROJECT_ID')
    if project_id:
        ee.Initialize(project=project_id)
    else:
        # Fallback to default if no environment variable is set
        ee.Initialize()
except Exception as e:
    # Fail-safe: if GEE isn't authenticated or no project is set, this tells the Node.js server
    print(json.dumps({"error": f"GEE Initialization failed: {str(e)}", "verified": False}))
    sys.exit(1)

def get_satellite_proof(lat, lon, area_ha):
    # Create a small region around the coordinates
    point = ee.Geometry.Point([lon, lat])
    region = point.buffer(100) # 100 meter radius

    # 2. Fetch the latest Sentinel-2 Imagery
    # We filter for low cloud cover to ensure accuracy
    image = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
             .filterBounds(point)
             .filterDate('2025-06-01', '2026-04-24')
             .sort('CLOUDY_PIXEL_PERCENTAGE')
             .first())

    # 3. Calculate NDVI
    # B8 is Near-Infrared, B4 is Red
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')

    # 4. Reduce Region (Get the average score for that patch of land)
    stats = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region,
        scale=10
    ).getInfo()

    score = stats.get('NDVI', 0)
    
    # Logic: If NDVI > 0.4, it's verified vegetation. 
    # Credits: 10 credits per hectare, scaled by greenness.
    is_verified = score > 0.4
    credits_to_mint = int(area_ha * 10 * (score / 0.8)) if is_verified else 0

    return {
        "ndviScore": round(score, 3),
        "credits": credits_to_mint,
        "verified": is_verified,
        "satellite": "Sentinel-2 via Google Earth Engine"
    }

if __name__ == "__main__":
    try:
        # Arguments from Node.js: [lat, lon, area]
        lat_arg = float(sys.argv[1]) if len(sys.argv) > 1 else 19.0443
        lon_arg = float(sys.argv[2]) if len(sys.argv) > 2 else 72.8203
        area_arg = float(sys.argv[3]) if len(sys.argv) > 3 else 5.0
        
        result = get_satellite_proof(lat_arg, lon_arg, area_arg)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e), "verified": False}))