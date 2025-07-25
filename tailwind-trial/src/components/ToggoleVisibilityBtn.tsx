import React, { useState } from 'react';
import maplibregl from 'maplibre-gl';
import { EyeOff, Eye } from 'lucide-react';

interface ToggleButtonProps {
  layerId: string;
  map: maplibregl.Map | null;
  className?: string;
  knobClassName?: string;
  knobActiveClassName?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  layerId,
  map,
  className = 'w-10 h-5 bg-gray-300 rounded-full transition-all duration-300 ease-in-out relative cursor-pointer',
  knobClassName = 'absolute left-1 top-1 w-3 h-3 rounded-full transition-transform duration-300 ease-in-out',
  knobActiveClassName = 'translate-x-5',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleLayer = () => {
    if (map) {
      const visibility = isVisible ? 'none' : 'visible';
      map.setLayoutProperty(layerId, 'visibility', visibility);

      const legendEntry = document.getElementById(`legend-${layerId}`);
      if (legendEntry) {
        legendEntry.style.display = isVisible ? 'none' : 'block';
      }

      setIsVisible(!isVisible);
    }
  };

  return (
    <button onClick={toggleLayer} className={className}>
      <span
        className={`${knobClassName} ${isVisible ? knobActiveClassName : ''}`}
        style={{ backgroundColor: isVisible ? '#22c55e' : '#ef4444' }} // green-500 or red-500
      />
      {isVisible ? (
        <Eye size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2" />
      ) : (
        <EyeOff size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2" />
      )}
    </button>
  );
};

export default ToggleButton;
