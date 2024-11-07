import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = () => {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: "https://demotiles.maplibre.org/style.json", // Map style
      center: [0, 0], // Initial map center [lng, lat]
      zoom: 2, // Initial zoom level
    });

    return () => map.remove(); // Cleanup map when component unmounts
  }, []);

  return (
    <div className="flex flex-col items-center h-screen p-5">
      <div id="map" className="w-full h-4/5 rounded-lg"></div>
    </div>
  );
};

export default MapComponent;
