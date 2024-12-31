import { useState } from "react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: any[];
  setSuggestions: (suggestions: any[]) => void; // New prop to clear suggestions
  flyTo: (lon: string, lat: string) => void; // Updated flyTo prop
  fetchSuggestions: (input: string) => void; // Prop to fetch suggestions as the user types
}

const Search: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  setSuggestions, // Clear suggestions on selection
  flyTo,
  fetchSuggestions,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle input change and fetch suggestions dynamically
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      fetchSuggestions(value); // Fetch suggestions as user types
      setIsVisible(true);
    } else {
      setIsVisible(false); // Hide suggestions if input is cleared
      setSuggestions([]); // Clear previous suggestions
    }
  };

  // Handle click on a suggestion
  const handleSuggestionClick = (lon: string, lat: string) => {
    flyTo(lon, lat); // Move the map to the selected location
    setIsVisible(false); // Hide suggestions after selection
    setSuggestions([]); // Clear previous suggestions after selection
  };

  return (
    <header className="bg-gray-100 p-4  flex flex-row justify-between">
      
      <div className="flex flex-col sm:flex-row w-full h-9">
        {/* Stacks on small screens, row layout on larger screens */}
        <input
          type="text"
          placeholder="Find Location"
          value={searchQuery}
          onChange={handleChange} // Fetch suggestions as user types
          className="w-full sm:w-72 md:w-96 mb-2 sm:mb-0 sm:mr-3 px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {/* Suggestion box (only visible if there are suggestions) */}
      {isVisible && suggestions.length > 0 && (
        <div className="fixed h-auto mt-11 md:mt-10 z-20 w-80 md:w-96 bg-white shadow-md">
          {suggestions.map((location) => (
            <div
              key={location.place_id}
              className="w-full hover:bg-gray-50 h-au flex flex-col justify-center cursor-pointer"
              onClick={() => handleSuggestionClick(location.lon, location.lat)} // Fly to selected location
            >
              <h1 className="ps-4">{location.place}</h1>
              <hr className="my-2" />
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Search;

