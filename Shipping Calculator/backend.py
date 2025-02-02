from flask_cors import CORS
from flask import Flask, request, jsonify
import time
import requests

app = Flask(__name__)
CORS(app) 

WAREHOUSES = {
    "Delhi": (28.6139, 77.2090),
    "Mumbai": (19.0760, 72.8777),
    "Bangalore": (12.9716, 77.5946),
    "Kolkata": (22.5726, 88.3639),
    "Chennai": (13.0827, 80.2707)
}

ROAD_COST_PER_KM = 2  
ROAD_TIME_PER_KM = 5  
FLIGHT_COST_PER_KM = 10  
FLIGHT_TIME_PER_KM = 1  

def get_coordinates(city_name):
    time.sleep(1)  
    url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json"
    headers = {"User-Agent": "backend/1.0 (divyanshuguptanl@gmail.com)"}
    try:
        response = requests.get(url, headers=headers,timeout=5)  
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code} from Nominatim API")
            return None
        data = response.json()
        if not data:  
            print("Error: No data received from Nominatim API.")
            return None
        if data:
            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])
            return (lat, lon)
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except (ValueError, IndexError):
        print("Error: Unexpected response format from API")
        return None
    
def get_distance(origin, destination):
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{origin[1]},{origin[0]};{destination[1]},{destination[0]}?overview=false"

    response = requests.get(osrm_url)
    data = response.json()

    if "routes" in data and data["routes"]:
        distance_meters = data["routes"][0]["distance"]
        return distance_meters / 1000 
    return None

@app.route('/')
def home():
    return "Flask server is running!"

@app.route("/calculate", methods=["POST"])
def calculate_shipping():
    data = request.json
    destination = data.get("destination")

    if not destination:
        return jsonify({"error": "Destination is required"}), 400

    destination_coords = get_coordinates(destination)
    if not destination_coords:
        return jsonify({"error": "Invalid destination"}), 400

    results = []
    for city, coords in WAREHOUSES.items():
        distance = get_distance(coords, destination_coords)
        if distance is not None:
            road_cost = distance * ROAD_COST_PER_KM
            road_time = (distance * ROAD_TIME_PER_KM) / 60
            flight_cost = distance * FLIGHT_COST_PER_KM
            flight_time = (distance * FLIGHT_TIME_PER_KM) / 60

            results.append({
                "warehouse": city,
                "distance_km": distance,
                "road": {"cost": road_cost, "time": road_time},
                "flight": {"cost": flight_cost, "time": flight_time}
            })

    if not results:
        return jsonify({"error": "Could not calculate distances"}), 500

    def get_cheapest_option(entry):
        return min(entry["road"]["cost"], entry["flight"]["cost"]), "road" if entry["road"]["cost"] < entry["flight"]["cost"] else "flight"

    def get_quickest_option(entry):
        return min(entry["road"]["time"], entry["flight"]["time"]), "road" if entry["road"]["time"] < entry["flight"]["time"] else "flight"

    def get_best_option(entry):
        road_score = entry["road"]["cost"] * 0.5 + entry["road"]["time"] * 0.5
        flight_score = entry["flight"]["cost"] * 0.5 + entry["flight"]["time"] * 0.5
        return (road_score, "road") if road_score < flight_score else (flight_score, "flight")

    cheapest = min(results, key=lambda x: get_cheapest_option(x)[0])
    cheapest_mode = get_cheapest_option(cheapest)[1]
    #print(cheapest)

    quickest = min(results, key=lambda x: get_quickest_option(x)[0])
    quickest_mode= get_quickest_option(quickest)[1]
    #print(quickest)

    best = min(results, key=lambda x: get_best_option(x)[0])
    best_mode = get_best_option(best)[1]  

    return jsonify({
        "results": results,
        "cheapest": cheapest,
        "quickest": quickest,
        "best": best,
        "cheapest_mode":cheapest_mode,
        "quickest_mode":quickest_mode,
        "best_mode":best_mode
    })
if __name__ == "__main__":
    app.run(debug=True)
