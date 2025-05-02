import { useState, useEffect } from "react";
import TryAIButton from "../components/AiButton";
import { X } from "lucide-react";
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gen-search-widget": any;
    }
  }
}

interface Props {
  onLocationSelect: (lng: number, lat: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

function BottomSlidePanel({ isVisible, onClose }: Props) {
  const [isExpanded, setIsExpanded] = useState(false); // Expands only once
  const [isBottomNoteVisible, setIsBottomNoteVisible] = useState(true); // For future use
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
    <div
      className={`rounded-lg w-full md:right-0 md:w-2/6 z-10 fixed bottom-0 bg-white shadow-lg transition-all duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } ${isExpanded ? "h-5/6" : "h-32"} ${
        isBottomNoteVisible ? "inline" : "h-0"
      }`} // Starts small, expands when button is clicked
    >
      {/* Search Widget */}
      <gen-search-widget
        configId="9dd5cc6e-937a-4bb4-a642-b4c61ccf0592"
        triggerId="searchWidgetTrigger"
      ></gen-search-widget>

      <div className="d-flex flex-col h-100 w-100">
        {/* Close Button (Collapses everything) */}
        {isExpanded && (
          <button
            className="text-center float-end pl-2 pr-2 mt-3 me-5 outline rounded outline-gray-400 text-gray-400 hover:text-white hover:bg-blue-400"
            onClick={() => {
              setIsExpanded(false); // Collapse when closed
              onClose(); // Close the entire panel
            }}
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        )}

        {/* Try AI Button - Expands but does NOT collapse */}
        {!isExpanded && (
          <div className={`justify-center items-center mt-4 flex`}>
            <TryAIButton onClick={() => setIsExpanded(true)} />
            <p className="text-gray-500 text-sm mt-2 text-center px-4">
              👋 Meet{" "}
              <span className="text-blue-500 font-medium">Street Smart AI</span>
              ! Discover insights & explore Nairobi’s neighborhoods easily.
            </p>
            <button
              onClick={() => {
                setIsBottomNoteVisible(false);
                onClose(); // This will trigger the parent to hide the whole panel
              }}
              className="text-gray-500 hover:text-red-500 transition duration-200 ease-in-out"
            >
              <X size="20" />
            </button>
          </div>
        )}
      </div>

      {/* Information Section (Only visible when expanded) */}
      {isExpanded && (
        <div className="px-6 py-4 mt-3 text-gray-600 text-sm md:text-base align-middle justify-center">
          <TryAIButton onClick={() => setIsExpanded(true)} />
          <p className="text-sm">
            👋 Hi there! I’m{" "}
            <span className="text-blue-500 font-semibold">Street Smart AI</span>
            . I’m here to help you discover insights and get detailed
            information about any <span className="font-semibold">mtaa</span>{" "}
            (neighborhood) in Nairobi.
          </p>
          <p className="text-sm mt-1">
            🌍 Whether you’re curious about local amenities, infrastructure, or
            community satisfaction, I’ve got you covered. Just type in a
            question or request, and I’ll analyze data from around the city to
            provide you with personalized insights.
          </p>
          {/* <p className="mt-2">
            🗺️ I can even show you key statistics and map highlights to guide
            your understanding of the area. Get informed about ongoing issues,
            available services, and the overall condition of any neighborhood.
          </p>
          <p className="mt-3">
            Click on the search bar above to start exploring! 🚀 Ask me anything
            about a mtaa and more!
          </p> */}
        </div>
      )}
    </div>
  );
}

export default BottomSlidePanel;
