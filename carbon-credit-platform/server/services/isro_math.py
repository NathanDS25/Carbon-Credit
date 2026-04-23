# server/services/isro_math.py
import sys
import json
import random
import time

def analyze_satellite_data(ngo_wallet, area):
    """
    Simulates the process of fetching ISRO Bhuvan imagery 
    and calculating NDVI (Vegetation Index).
    """
    # 1. Simulate API Latency (Making it feel like a real satellite fetch)
    time.sleep(1.5)

    # 2. Generate a realistic NDVI score for Indian terrain
    # 0.7 - 0.9 is typical for healthy forest/agriculture
    ndvi_score = round(random.uniform(0.65, 0.88), 2)
    
    # 3. Calculate Credits based on area and 'greenness'
    # Base: 10 credits per hectare, adjusted by NDVI intensity
    credits_per_hectare = 10 * (ndvi_score / 0.7) 
    total_credits = int(area * credits_per_hectare)

    # 4. Prepare the result for Node.js
    result = {
        "ngo": ngo_wallet,
        "ndvi": ndvi_score,
        "credits": total_credits,
        "verified": True if ndvi_score > 0.5 else False,
        "satellite_source": "ISRO Resourcesat-2 (Simulated)"
    }
    
    # Send result to Node.js via Standard Output
    print(json.dumps(result))

if __name__ == "__main__":
    try:
        # Capture arguments passed from Node.js spawn()
        wallet_addr = sys.argv[1]
        land_size = float(sys.argv[2])
        
        analyze_satellite_data(wallet_addr, land_size)
    except Exception as e:
        error_res = {"error": str(e), "verified": False}
        print(json.dumps(error_res))
