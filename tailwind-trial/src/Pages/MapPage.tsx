import React, { useState, useEffect, useRef } from "react";
import { Home, Map, List, LayoutDashboard, Menu, X } from "lucide-react";
import maplibregl, { ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SelectMenuMap from "../components/SelectMenuMap";
import ToggleButton from "../components/ToggoleVisibilityBtn";
import BottomSlidePanel from "../components/BottomSlidePanelIssues";
import Search from "../components/Search";

// Define the type for suggestion (based on Nominatim response structure)
interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}
const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentMap, setCurrentMap] = useState("Map 1");
  const [loadedLayers, setLoadedLayers] = useState<string[]>(["Map 1"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // Explicitly type suggestions as an array of Suggestion objects
  const MAPTILER_KEY = "Zk2vXxVka5bwTvXQmJ0l";
  const mapRef = useRef<maplibregl.Map | null>(null); // Reference for the map instance
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  // const [boundCoords, setBoundCoords] = useState<maplibregl.LngLatBoundsLike>();
  const [isVisible, setIsPanelVisible] = useState(false);

  // Function to fetch possible location suggestions (limited to 4 results)
  const fetchSuggestions = async (input: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${input}, Kenya`
      );
      const data = await response.json();
      setSuggestions(data.slice(0, 4));
      // Extract relevant fields and sort alphabetically by display_name or city/town
      const formattedSuggestions = data
        .map((location: any) => {
          const { display_name, lat, lon, address } = location;
          // Extract city, town, or village, fallback to display_name if none exists
          const place =
            address?.city || address?.town || address?.village || display_name;
          return {
            place, // Display name (city/town/village)
            lat,
            lon,
          };
        })
        .sort((a: any, b: any) => a.place.localeCompare(b.place)) // Sort alphabetically by place name
        .slice(0, 4); // Limit to top 4 suggestions

      setSuggestions(formattedSuggestions); // Update the suggestions state
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  // Function to add the GeoJSON layer
  const addGeoJsonLayer = async (
    map: maplibregl.Map | null,
    url: string,
    id: string,
    colorProperty: string,
    numericProperty: string
  ) => {
    if (!map) {
      console.error("Map instance is not available.");
      return;
    }

    try {
      // Fetch the GeoJSON data from the server
      const response = await fetch(url);
      const estates = await response.json();

      if (estates && estates.geoJson) {
        // setBoundCoords(estates.coordinates);
        console.log(estates.geoJson);
        // Add GeoJSON source
        map.addSource(id, {
          type: "geojson",
          data: estates.geoJson, // Ensure this is a valid GeoJSON object
        });

        // Insert the layer below the label layer
        const layers = map.getStyle().layers;
        let labelLayerId;

        if (layers) {
          // Check if layers is not undefined
          for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];

            // Check if layer and layer.layout exist and that it has the 'text-field' property
            if (
              layer.type === "symbol" &&
              layer.layout &&
              "text-field" in layer.layout
            ) {
              labelLayerId = layer.id;
              break;
            }
          }
        }
        const layerId = id;
        if (layerId == "Neighbourhoods") {
          // Generate a random color for each feature
          function getRandomColor() {
            let randomColor = Math.floor(Math.random() * 16777215).toString(16);
            return "#" + randomColor.padStart(6, "0");
          }

          // Assign random colors to the features based on properties
          const geojsonData = estates.geoJson;
          const propertyColors: Record<string, string> = {};
          geojsonData.features.forEach((feature: any) => {
            let propertyValue = feature.properties.name; // or any other property
            if (!propertyColors[propertyValue]) {
              propertyColors[propertyValue] = getRandomColor();
            }
          });

          // Create fill-color expression for dynamic coloring
          let fillColorExpression: any[] = ["case"];
          Object.entries(propertyColors).forEach(([key, color]) => {
            fillColorExpression.push(["==", ["get", `${colorProperty}`], key]);
            fillColorExpression.push(color);
          });
          fillColorExpression.push("#bfbfbf"); // Fallback color

          // Add the GeoJSON layer with dynamic coloring
          map.addLayer(
            {
              id: id,
              type: "fill",
              source: id,
              layout: {},
              paint: {
                "fill-color": fillColorExpression as any,
                "fill-opacity": 0.3,
              },
            },
            labelLayerId // Place below the label layer
          );
        } else if (estates.geomType === "MultiPolygon") {
          console.log("In if else else");
          if (!estates.geoJson || !estates.geoJson.features) {
            throw new Error("Invalid GeoJSON data.");
          }

          // Define type of GeoJSON feature
          type GeoJSONFeature = {
            properties: Record<string, any>;
          };

          // Extract unique values from the numeric property
          const uniqueValues: number[] = Array.from(
            new Set(
              (estates.geoJson.features as GeoJSONFeature[]).map((feature) =>
                Number(feature.properties[numericProperty])
              )
            )
          );

          // Generate random colors for each unique value
          const colorMap: Record<number, string> = {};
          uniqueValues.forEach((value) => {
            colorMap[value] = `#${Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0")}`;
          });

          // Create `fill-color` expression for MapLibre
          const fillColorExpression: any[] = ["case"];
          uniqueValues.forEach((value) => {
            fillColorExpression.push(["==", ["get", numericProperty], value]);
            fillColorExpression.push(colorMap[value]);
          });
          fillColorExpression.push("#bfbfbf"); // Default color if no match

          map.addLayer(
            {
              id: id,
              type: "fill",
              source: id,
              layout: {},
              paint: {
                "fill-color": fillColorExpression as any,
                "fill-opacity": 0.3,
              },
            },
            labelLayerId // Place below the label layer
          );
        } else if (estates.geomType === "MultiLineString") {
          map.addLayer({
            id: id,
            type: "line",
            source: id,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "purple",
              "line-width": 4,
            },
          });
        } else {
          // Add the GeoJSON layer with dynamic coloring
          map.addLayer(
            {
              id: id,
              type: "fill",
              source: id,
              layout: {},
              paint: {
                "fill-color": "#fff",
                "fill-opacity": 0.3,
              },
            },
            labelLayerId // Place below the label layer
          );
        }
        // Update the loadedLayers state to include the new layer
        setLoadedLayers((prevLayers) => [...prevLayers, layerId]);
      } else {
        console.error("Invalid GeoJSON data:", estates);
      }
    } catch (error) {
      console.error("Error fetching GeoJSON data:", error);
    }
  };
  // Function to add a popup on click event to the map
  function addPopupOnMapClick(map: maplibregl.Map) {
    // Listen for click events on the map
    map.on("click", (e) => {
      const coordinates = e.lngLat; // Get the clicked coordinates
      const coordinatelat = parseFloat(coordinates.lat.toFixed(2));
      const coordinatelng = parseFloat(coordinates.lng.toFixed(2));
      setSelectedLat(coordinatelat);
      setSelectedLng(coordinatelng);
      setIsPanelVisible(true);
      map.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 19,
        speed: 0.4,
      });
      // Create a new popup and set its content and position
      // new maplibregl.Popup()
      //   .setLngLat([coordinates.lng, coordinates.lat]) // Set popup position
      //   .setHTML(popupHTML) // Set popup content
      //   .addTo(map); // Add the popup to the map
    });
  }
  const removeLayer = (layerId: string) => {
    if (mapRef.current && mapRef.current.getLayer(layerId)) {
      mapRef.current.removeLayer(layerId);
      mapRef.current.removeSource(layerId); // Remove source as well
      setLoadedLayers(loadedLayers.filter((layer) => layer !== layerId)); // Update state
    }
  };

  // function enableFeaturePopupOnLayer(map: maplibregl.Map, layerId: string) {
  //   // Ensure the layer exists before adding the event listener
  //   if (!map.getLayer(layerId)) {
  //     console.error(`Layer with ID '${layerId}' not found.`);
  //     return;
  //   }

  //   // Listen for click events on the specific GeoJSON layer
  //   map.on("click", layerId, (e) => {
  //     // Check if the clicked feature has geometry and properties
  //     if (e.features && e.features.length > 0) {
  //       const feature = e.features[0]; // Get the clicked feature
  //       const coordinates =
  //         feature.geometry.type === "Point"
  //           ? (feature.geometry.coordinates as [number, number])
  //           : e.lngLat.toArray(); // Get coordinates for point geometries

  //       const description =
  //         feature.properties?.description || "No description available"; // You can customize this

  //       // Adjust coordinates if needed for map wrap-around effect
  //       while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  //       }

  //       // Create a popup and set its content and position
  //       new maplibregl.Popup()
  //         .setLngLat(coordinates) // Set the popup position
  //         .setHTML(`<strong>Description:</strong> ${description}`) // Set the popup content
  //         .addTo(map); // Add the popup to the map
  //     }
  //   });

  //   // Change cursor style to pointer when hovering over the features in the layer
  //   map.on("mouseenter", layerId, () => {
  //     map.getCanvas().style.cursor = "pointer";
  //   });

  //   // Reset cursor style when not hovering over features
  //   map.on("mouseleave", layerId, () => {
  //     map.getCanvas().style.cursor = "";
  //   });
  // }
  // Initialize the map and add the GeoJSON layer
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.remove(); // Remove the old map if it exists
    }
    //https://api.maptiler.com/maps/streets-v2-light/style.json?key=Zk2vXxVka5bwTvXQmJ0l
    //https://api.maptiler.com/maps/streets-v2-dark/style.json?key=Zk2vXxVka5bwTvXQmJ0l
    const map = new maplibregl.Map({
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [36.8219, -1.2921],
      zoom: 15.5,
      pitch: 60,
      bearing: -17.6,
      container: "map",
      antialias: true,
      // maxBounds: boundCoords,
    });

    mapRef.current = map; // Save the map instance to the ref
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    // map.addControl(new maptilersdk.MaptilerTerrainControl(), "top-left");
    // Create and add the scale control
    const scale = new ScaleControl({
      maxWidth: 80,
      unit: "metric",
    });
    map.addControl(scale); // Add the scale control to the map

    // // Add the GeoJSON layer once the map loads
    // map.on("load", () => {
    //   addGeoJsonLayer(map); // Call the function to add the GeoJSON layer
    // });
    // Add popup on map click
    addPopupOnMapClick(map);
    // enableFeaturePopupOnLayer(map, "Neigbourhoods");
    setCurrentMap("map 1")
    return () => {
      map.remove(); // Clean up map on unmount
      mapRef.current = null;
    };
    
  }, [currentMap]); // Effect re-runs when the current map changes

  // Function to handle fly to a searched location
  const flyTo = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}+ ", Kenya"`
      );

      const data = await response.json();

      if (data.length > 0) {
        const { lon, lat } = data[0]; // Longitude, Latitude

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lon, lat], // Fly to coordinates
            essential: true,
            zoom: 15.5,
          });
        }
      } else {
        console.log("Location not found.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
    // if (searchQuery.length > 0) {
    //   await fetchSuggestions(searchQuery);
    // }
  };

  const maps: (
    | "Accessibility"
    | "Design Of Road Network"
    | "Map 3"
    | "Map 4"
  )[] = ["Accessibility", "Design Of Road Network", "Map 3", "Map 4"];

  const mapData = {
    Accessibility: [
      {
        id: 1,
        name: "Neighbourhoods",
        apilink: "https://mtaawetu.com/get-estates/",
      },
      {
        id: 2,
        name: "Hospital Accessibility",
        apilink: "http://34.66.220.78/products/maps-wfs/nbihealthaccess/",
      },
      {
        id: 3,
        name: "Schools Accessibility",
        apilink:
          "http://34.66.220.78/products/maps-wfs/schoolaccessindexwalk/",
      },
    ],
    //"http://127.0.0.1:8000/products/maps-wfs/sdna_1000meters_2018/"
    //"http://127.0.0.1:8000/products/maps/sdna_1000m2018/",
    "Design Of Road Network": [
      {
        id: 1,
        name: "sdna_1000m2018",
        apilink:
          "http://34.66.220.78/products/maps/sdna_1000m2018/",
      },
      {
        id: 2,
        name: "Traffic Patterns",
        apilink: "https://example.com/traffic-patterns",
      },
    ],
    "Map 3": [
      {
        id: 1,
        name: "Parks and Recreation",
        apilink: "https://example.com/parks-recreation",
      },
    ],
    "Map 4": [
      {
        id: 1,
        name: "Waterways",
        apilink: "https://example.com/waterways",
      },
    ],
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <aside
        className={`z-20 bg-indigo-600 text-white p-5 flex flex-col space-y-6 transition-transform duration-300 ${
          isSidebarOpen ? "w-64 md:w-64 sm:w-48 overflow-y-scroll" : "w-16"
        }`} // Set a smaller width for small screens
      >
        <button className="text-white" onClick={toggleSidebar}>
          <Menu color="white" />
        </button>
        <nav className="flex flex-col space-y-4">
          <a href="#" className="flex items-center space-x-3">
            <Home color="white" />
            <span className={`${isSidebarOpen ? "block" : "hidden"}`}>
              Home
            </span>
          </a>
          <div>
            <button className="flex items-center space-x-3">
              <Map color="white" />
              <span className={`${isSidebarOpen ? "block" : "hidden"}`}>
                Maps
              </span>
            </button>
            {/* Dropdown to choose map */}
            <div
              className={`${
                isSidebarOpen ? "block" : "hidden"
              } ml-8 mt-2 space-y-2`}
            >
              {maps.map((mapName) => (
                <SelectMenuMap
                  key={mapName}
                  items={mapData[mapName]} // Dynamically pass the maps based on category
                  category={mapName} // Pass the current category as the title
                  onClick={(name, apilink) =>
                    addGeoJsonLayer(
                      mapRef.current,
                      apilink,
                      name,
                      "name",
                      "population"
                    )
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <button className="flex items-center space-x-3">
              <List color="white" />
              <span className={`${isSidebarOpen ? "block" : "hidden"}`}>
                Layers
              </span>
            </button>

            {/* Legend with hide/remove buttons */}
            <div
              className={`${
                isSidebarOpen ? "block" : "hidden"
              } ml-1 mt-2 space-y-2`}
            >
              {loadedLayers.map((layer) => (
                <div
                  key={layer}
                  className="rounded-md px-2 py-2 flex-col items-center justify-between ring-1 ring-inset ring-gray-300  hover:bg-green-300"
                >
                  <span>{layer}</span>
                  <div className="flex mt-1 ">
                    {/* Hide Button */}
                    <ToggleButton layerId={layer} map={mapRef.current} />{" "}
                    {/* Use the ToggleButton */}
                    {/* Remove Button */}
                    <button
                      className="rounded-md px-1 py-1 text-sm text-white bg-red-500 hover:bg-red-700"
                      onClick={() => removeLayer(layer)}
                    >
                      <div className="flex flex-row align-middle justify-center">
                        <div>{<X size="16" />}</div> <div>Remove</div>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <a href="#" className="flex items-center space-x-3">
            <LayoutDashboard color="white" />
            <span className={`${isSidebarOpen ? "block" : "hidden"}`}>
              Dashboard
            </span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Search
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          suggestions={suggestions}
          setSuggestions={setSuggestions} // Allow clearing of suggestions
          flyTo={flyTo} // Pass flyTo as a prop to Header
          fetchSuggestions={fetchSuggestions} // Pass fetchSuggestions to update dynamically
        />

        {/* Map and content area */}
        <div className="flex-grow rounded-sm">
          <div id="map" className="w-full h-full" />
          <BottomSlidePanel
            lat={selectedLat}
            lng={selectedLng}
            onClose={() => setIsPanelVisible(false)}
            onLocationSelect={(lng, lat) =>
              console.log("Location selected:", lng, lat)
            }
            isVisible={isVisible}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* NOTES: To reference the map variable for a flyTo function or any other map manipulation, you can store the map instance in a useRef so that it's accessible throughout your component lifecycle without being tied to state updates (which would cause re-renders).

Here’s how you can modify your code to use useRef for the map instance and create a flyTo function: */
