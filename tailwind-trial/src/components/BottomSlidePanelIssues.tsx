import { useState, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown, Search } from "lucide-react";

// Define global typing for the Google search widget
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gen-search-widget": any;
    }
  }
}

interface Props {
  onLocationSelect?: (lng: number, lat: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

function BottomSlidePanel({ isVisible, onClose }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Load Google AI search widget script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cloud.google.com/ai/gen-app-builder/client?hl=en_US";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Handle click outside to close panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        isVisible &&
        !isExpanded
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose, isExpanded]);

  // Handle swipe down to close on mobile
  useEffect(() => {
    let touchStart = 0;
    let touchEnd = 0;

    function handleTouchStart(e: TouchEvent) {
      touchStart = e.targetTouches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      touchEnd = e.targetTouches[0].clientY;
    }

    function handleTouchEnd() {
      if (touchStart && touchEnd && touchEnd - touchStart > 100) {
        // Swipe down detected
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          onClose();
        }
      }
      touchStart = 0;
      touchEnd = 0;
    }

    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener("touchstart", handleTouchStart as EventListener);
      panel.addEventListener("touchmove", handleTouchMove as EventListener);
      panel.addEventListener("touchend", handleTouchEnd as EventListener);

      return () => {
        panel.removeEventListener(
          "touchstart",
          handleTouchStart as EventListener
        );
        panel.removeEventListener(
          "touchmove",
          handleTouchMove as EventListener
        );
        panel.removeEventListener("touchend", handleTouchEnd as EventListener);
      };
    }

    return undefined;
  }, [isExpanded, onClose]);

  return (
    <div
      ref={panelRef}
      className={`fixed inset-x-0 bottom-0 z-50 transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "translate-y-full"}
        ${isExpanded ? "h-[70vh] sm:h-[60vh] md:h-[50vh]" : "h-auto"}`}
    >
      <div className="bg-white rounded-t-xl shadow-lg w-full max-w-4xl mx-auto overflow-hidden">
        {/* Handle for dragging */}
        <div className="w-full pt-2 pb-1 px-4 cursor-grab touch-pan-y">
          <div
            className="w-12 h-1 bg-gray-300 rounded-full mx-auto"
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <Search size={18} className="mr-2 text-blue-500" />
            Street Smart AI
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Collapsed Content */}
        {!isExpanded && (
          <div className="p-4">
            <p className="text-gray-600 text-sm">
              👋 Meet{" "}
              <span className="text-blue-500 font-medium">Street Smart AI</span>
              ! Discover insights & explore Nairobi's neighborhoods easily.
            </p>

            {/* AI Search Widget Trigger Button */}
            <button
              id="searchWidgetTrigger"
              onClick={() => setIsExpanded(true)}
              className="mt-0 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                flex items-center justify-center transition-colors duration-200"
            >
              <Search size={18} className="mr-2" />
              Ask Street Smart AI
            </button>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className="overflow-y-auto"
            style={{ height: "calc(100% - 55px)" }}
          >
            {/* Search Widget Container */}
            <div className="p-4">
              <gen-search-widget
                configId="9dd5cc6e-937a-4bb4-a642-b4c61ccf0592"
                triggerId="searchWidgetTrigger"
              ></gen-search-widget>

              {/* Description Text */}
              <div className="mt-4 text-gray-600 space-y-3">
                <p>
                  👋 Hi there! I'm{" "}
                  <span className="text-blue-500 font-semibold">
                    Street Smart AI
                  </span>
                  . I'm here to help you discover insights and get detailed
                  information about any
                  <span className="font-semibold"> mtaa</span> (neighborhood) in
                  Nairobi.
                </p>
                <p>
                  🌍 Whether you're curious about local amenities,
                  infrastructure, or community satisfaction, I've got you
                  covered. Just type in a question or request, and I'll analyze
                  data from around the city to provide you with personalized
                  insights.
                </p>
                <p>
                  🗺️ I can show you key statistics and map highlights to guide
                  your understanding of the area. Get informed about ongoing
                  issues, available services, and the overall condition of any
                  neighborhood.
                </p>
                <p className="font-medium">
                  Try asking about safety ratings, amenities, or public services
                  in specific areas!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BottomSlidePanel;
