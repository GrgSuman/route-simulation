import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Maps from "./components/Maps";
import { Navigation, Plus, Minus, MapPin, Menu, X } from 'lucide-react';
import { getCurrentLocation } from "./utils/permission.js";

function App() {
  const [coord, setCoord] = useState({
    lat: -33.958841087081495,
    lng: 151.20982351133807,
  });
  const [radius, setRadius] = useState(500);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [destinations, setDestinations] = useState([]);
  const [totalDestinations, setTotalDestinations] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSettingDestination, setIsSettingDestination] = useState(false);
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleRouteComplete = () => {
    setIsNavigating(false);
    alert("Route completed!");
  };

  useEffect(() => {
    async function getLocation() {
      try {
        const coords = await getCurrentLocation();
        setCoord({
          lat: coords.lat,
          lng: coords.lng,
        });
      } catch (error) {
        console.error("Error getting location:", error.message);
      }
    }
    getLocation();
  }, []);

  const handleRecenter = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentLocation();
      setCoord({
        lat: coords.lat,
        lng: coords.lng,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateZoom = (radius) => {
    if (radius <= 200) return 17;
    if (radius <= 500) return 16;
    if (radius <= 1000) return 15;
    if (radius <= 2000) return 14;
    if (radius <= 3500) return 13;
    return 12;
  };

  const currentZoom = useMemo(() => calculateZoom(radius), [radius]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  };

  const handleMapClick = (clickedCoord) => {
    if (isSettingDestination && destinations.length < totalDestinations) {
      const distance = calculateDistance(
        coord.lat,
        coord.lng,
        clickedCoord[0],
        clickedCoord[1]
      );

      if (distance <= radius) {
        setDestinations([
          ...destinations,
          {
            id: Date.now(),
            lat: clickedCoord[0],
            lng: clickedCoord[1],
            distance: Math.round(distance),
          },
        ]);
        setError("");

        if (destinations.length + 1 >= totalDestinations) {
          setIsSettingDestination(false);
        }
      } else {
        setError(
          "Selected point is outside the radius. Please select a point within the highlighted area."
        );
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const removeDestination = (idToRemove) => {
    setDestinations(destinations.filter((dest) => dest.id !== idToRemove));
    setIsSettingDestination(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full h-[70vh] lg:h-full relative">
        <Maps
          center={[coord.lat, coord.lng]}
          zoom={currentZoom}
          radius={radius}
          onMapClick={handleMapClick}
          destinations={destinations}
          isNavigating={isNavigating}
          onRouteComplete={handleRouteComplete}
        />
        <button
          onClick={handleRecenter}
          className="bg-white hover:bg-slate-300 p-2 lg:p-3 rounded-md shadow cursor-pointer absolute z-[999] bottom-[5%] right-[5%]"
          disabled={loading}
        >
          <Navigation className={`w-6 h-6 lg:w-8 lg:h-8 ${loading ? "animate-spin" : ""}`} />
        </button>
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-3 py-1 lg:px-4 lg:py-2 text-sm lg:text-base rounded-md shadow z-[1000] animate-fade-in">
            {error}
          </div>
        )}
      </div>

      
      {(isSidebarOpen || window.innerWidth >= 1024) && (
        <div className="w-full h-[30vh] lg:w-[30%] lg:h-full bg-white p-4 lg:p-6 shadow-lg overflow-y-auto">
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Map Controls</h2>

            <div className="space-y-2">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">
                Search Radius (meters)
              </h3>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full p-2 border rounded"
                min="100"
                max="5000"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">
                Number of Destinations
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setTotalDestinations((prev) => Math.max(1, prev - 1))
                  }
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
                <span className="text-lg lg:text-xl font-bold">{totalDestinations}</span>
                <button
                  onClick={() => setTotalDestinations((prev) => prev + 1)}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingDestination(true)}
              disabled={destinations.length >= totalDestinations}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {isSettingDestination
                ? "Click on map to set destination"
                : "Set Destinations"}
            </button>

            <div className="space-y-2">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">
                Selected Destinations
              </h3>
              <div className="space-y-2">
                {destinations.map((dest, index) => (
                  <div
                    key={dest.id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs lg:text-sm"
                  >
                    <div>
                      <div>Point {index + 1}</div>
                      <div className="text-gray-500">
                        Lat: {dest.lat.toFixed(6)}
                        <br />
                        Lng: {dest.lng.toFixed(6)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDestination(dest.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              disabled={destinations.length < totalDestinations || isNavigating}
              onClick={() => setIsNavigating(true)}
            >
              {isNavigating ? "Navigation in Progress..." : "Start Navigation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

