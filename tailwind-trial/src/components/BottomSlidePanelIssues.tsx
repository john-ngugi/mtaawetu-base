import { useState, useEffect } from "react";
// import maplibregl from "maplibre-gl";
// import KisiiForm from "../components/KisiiForm";

/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gen-search-widget": any;
    }
  }
}

interface props {
  onLocationSelect: (lng: number, lat: number) => void;
  isVisible: boolean;
  onClose: () => void;
}
function BottomSlidePanel({ isVisible, onClose }: props) {
  // const [location, setLocation] = useState<maplibregl.LngLat>(
  //   new maplibregl.LngLat(0, 0)
  // ); // Initial values

  const [isPopVisible, setIsPopVisible] = useState(false); // State to manage visibility

  // const handleClose = () => {
  //   setIsPopVisible(false); // Hide the message when the button is clicked
  // };

  // const handleMapClick = (lng: number, lat: number) => {
  //   setLocation(new maplibregl.LngLat(lng, lat));
  //   onLocationSelect(lng, lat); // Center map to the clicked location
  // };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cloud.google.com/ai/gen-app-builder/client?hl=en_US";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup on unmount
    };
  }, []);

  return (
    <>
      <div
        className={` rounded-lg w-full md:right-0 md:w-2/6 z-10 fixed bottom-0 md:h-1/2 h-72 bg-white shadow-lg transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Search Widget */}
        <gen-search-widget
          configId="9dd5cc6e-937a-4bb4-a642-b4c61ccf0592"
          triggerId="searchWidgetTrigger"
        ></gen-search-widget>

        {/* Search Input */}
        <div className="d-flex flex-col h-100 w-100">
          <button
            className="text-center outline float-end pl-2 pr-2 mt-3 me-5 outline-1 rounded outline-gray-400 close-button text-gray-400 hover:text-white hover:bg-blue-400"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="close-icon text-2xl text-center">&times;</span>
          </button>

          <input
            className="w-3/4 ms-5 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300 ease-in-out mt-2"
            type="search"
            placeholder={`Ask me something !`}
            id="searchWidgetTrigger"
          />
        </div>
        <div className="px-6 py-4 mt-3 text-gray-600 text-sm md:text-base">
          <p className="font-medium">
            👋 Hi there! I’m{" "}
            <span className="text-blue-500 font-semibold">Street Smart AI</span>
            . I’m here to help you discover insights and get detailed
            information about any <span className="font-semibold">mtaa</span>{" "}
            (neighborhood) in Nairobi.
          </p>
          <p className="mt-1">
            🌍 Whether you’re curious about local amenities, infrastructure, or
            community satisfaction, I’ve got you covered. Just type in a
            question or request, and I’ll analyze data from around the city to
            provide you with personalized insights.
          </p>
          <p className="mt-2">
            🗺️ I can even show you key statistics and map highlights to guide
            your understanding of the area. Get informed about ongoing issues,
            available services, and the overall condition of any neighborhood.
          </p>
          <p className="mt-3">
            Click on the search bar above to start exploring! 🚀 Ask me anything
            about a mtaa and more!
          </p>
        </div>
      </div>
    </>
  );
}

export default BottomSlidePanel;
