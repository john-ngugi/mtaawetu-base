import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin, Loader } from "lucide-react";
import debounce from "lodash/debounce";

// Improved type definitions
interface Location {
  place: string;
  lat: string;
  lon: string;
  display_name?: string;
  place_id?: string;
}

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: Location[];
  flyTo: (lon?: string, lat?: string) => Promise<void>;
  setSuggestions: React.Dispatch<React.SetStateAction<Location[]>>;
}

const SearchComponent: React.FC<SearchProps> = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  flyTo,
  setSuggestions,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Optimized fetch suggestions function with debounce
  const fetchSuggestions = useCallback(
    debounce(async (input: string) => {
      // Don't search if input is too short
      if (input.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${input}, Kenya&limit=4`
        );

        const data = await response.json();

        // Process data once with proper typing
        const formattedSuggestions = data
          .map((location: any) => {
            const { lat, lon, address, display_name, place_id } = location;
            const place =
              address?.city ||
              address?.town ||
              address?.village ||
              display_name;

            return {
              place,
              lat,
              lon,
              display_name,
              place_id,
            };
          })
          .sort((a: Location, b: Location) => a.place.localeCompare(b.place));

        setSuggestions(formattedSuggestions);

        // Only show suggestions dropdown if we have results and input is focused
        if (formattedSuggestions.length > 0 && isFocused) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms delay for debouncing
    [setSuggestions, isFocused]
  );

  // Handle clicks outside the suggestions box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Cancel any pending debounced calls when unmounting
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length >= 2) {
      // Trigger debounced search
      fetchSuggestions(value);
    } else {
      setIsVisible(false);
      setSuggestions([]);
    }
  };

  // Handle click on a suggestion
  const handleSuggestionClick = (lon: string, lat: string) => {
    // Update the search query with the selected location name
    const selected = suggestions.find((s) => s.lon === lon && s.lat === lat);
    if (selected) {
      setSearchQuery(selected.place || selected.display_name || "");
    }

    // Call flyTo to move the map with the selected coordinates
    flyTo(lon, lat);

    // Hide and clear suggestions
    setIsVisible(false);
  };

  // Clear input field
  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setIsVisible(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <div
        className={`relative flex items-center transition-all ${
          isFocused ? "scale-105" : ""
        }`}
      >
        <div
          className={`absolute left-3 flex items-center justify-center h-8 w-8 rounded-full ${
            isFocused ? "bg-blue-100 text-blue-600" : "text-gray-400"
          } transition-colors`}
        >
          {isLoading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a neighborhood in Nairobi..."
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsVisible(true);
          }}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-12 pl-12 pr-10 bg-white rounded-xl shadow-lg border ${
            isFocused
              ? "border-blue-400 ring-4 ring-blue-100"
              : "border-gray-100"
          } focus:outline-none transition-all duration-300 text-gray-800`}
        />

        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestion dropdown */}
      {isVisible && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ maxHeight: "350px", overflowY: "auto" }}
        >
          <div className="p-2">
            {suggestions.map((location, index) => (
              <div
                key={location.place_id || index}
                className="cursor-pointer rounded-lg hover:bg-blue-50 transition-colors duration-200"
                onClick={() =>
                  handleSuggestionClick(location.lon, location.lat)
                }
              >
                <div className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-1 text-blue-500">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium line-clamp-1">
                      {location.place || location.display_name || ""}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
