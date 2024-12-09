import React, { useState } from "react";
import maplibregl from "maplibre-gl";
import { EyeOff, Eye } from "lucide-react";

interface ToggleButtonProps {
  layerId: string;
  map: maplibregl.Map | null;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ layerId, map }) => {
  const [isVisible, setIsVisible] = useState(true); // Track the visibility of the layer

  const toggleLayer = () => {
    if (map) {
      const visibility = isVisible ? "none" : "visible"; // Toggle between 'none' and 'visible'
      map.setLayoutProperty(layerId, "visibility", visibility); // Update the map layer visibility
      setIsVisible(!isVisible); // Update the state
    }
  };

  return (
    <button
      onClick={toggleLayer}
      className="rounded-md px-1 py-1 text-sm text-white bg-green-600 hover:bg-green-500"
    >
      {/* {isVisible ? "Hide" : "Show"} */}
      <div className="flex flex-row">
        {isVisible ? <EyeOff size="16" /> : <Eye size="16" />}{" "}
        <span className="mr-1"></span>
        {/* {isVisible ? "Hide" : "Show"} Layer */}
      </div>
    </button>
  );
};

export default ToggleButton;
