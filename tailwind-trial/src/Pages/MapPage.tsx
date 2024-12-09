import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Home, Map, List, LayoutDashboard, Menu, X} from "lucide-react";
import maplibregl, { ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SelectMenuMap from "../components/SelectMenuMap";
import ToggleButton from "../components/ToggoleVisibilityBtn";
import BottomSlidePanel from "../components/BottomSlidePanelIssues";
import Search from "../components/Search";
import { SheetComponent } from "@/components/Sheet";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"
import { calcPercentages } from "../utils/utils";
import DropDownComponent from "../components/Popover"
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

 // Function to add the GeoJSON layer and handle feature click
const addGeoJsonLayer = async (
  map: maplibregl.Map | null,
  url: string,
  id: string,
  colorProperty: string,
) => {
  if (!map) {
    console.error("Map instance is not available.");
    return;
  }

  try {
    // Fetch the GeoJSON data from the server
    const response = await fetch(url);
    const data = await response.json();
    const data_with_percent_string = calcPercentages({geojson: data.geoJson,column: "access_index"});
    const data_with_percent = JSON.parse(data_with_percent_string);
    const accessIndexKey = "percent";
    if (data && data.geoJson) {
      console.log(data.geoJson);

      // Add GeoJSON source
      map.addSource(id, {
        type: "geojson",
        data: data_with_percent, // Ensure this is a valid GeoJSON object
      });

      // Determine where to place the layer
      const layers = map.getStyle().layers;
      let labelLayerId: string | undefined;

      if (layers) {
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
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

      if (id == "Neighbourhoods") {
        // Generate a random color for each feature
        function getRandomColor() {
          let randomColor = Math.floor(Math.random() * 16777215).toString(16);
          return "#" + randomColor.padStart(6, "0");
        }

        // Assign random colors to the features based on properties
        const geojsonData = data_with_percent;
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
        fillColorExpression.push("#ffffff"); // Fallback color

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
        )
      }
      // Add the layer based on the geometry type
      else if (data.geomType === "MultiPolygon") {
        // Generate random colors for features based on properties

        const percentileColors = [
            { range: [0, 1], color: "#ffffff" }, // White
            { range: [1, 25], color: "#dbeeff" },  // Very Light Blue
            { range: [26, 50], color: "#a6c8ff" }, // Soft Sky Blue
            { range: [51, 75], color: "#5b9aff" }, // Medium Blue
            { range: [76, 100], color: "#003f88" } // Deep Navy Blue
        ];
        
        const fillColorExpression: any[] = ["case"];
        percentileColors.forEach(({ range, color }) => {
          fillColorExpression.push(
            ["all", 
              [">=", ["coalesce", ["to-number", ["get", accessIndexKey]], -1], range[0]], 
              ["<=", ["coalesce", ["to-number", ["get", accessIndexKey]], -1], range[1]]],
            color
          );
        });
        fillColorExpression.push("#ffffff"); // Fallback color
        
        map.addLayer(
          {
            id: id,
            type: "fill",
            source: id,
            layout: {},
            paint: {
              "fill-color": fillColorExpression as any ,
              "fill-opacity": 0.4, // Test with full opacity
            },
          },
          labelLayerId // Test without label layer placement
        );
      } else if (data.geomType === "MultiLineString") {
        map.addLayer({
          id: id,
          type: "line",
          source: id,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#5b9aff",
            "line-width": 3,
          },
        },
        labelLayerId
      );
      } else {
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
          labelLayerId
        );
      }

      toast.success(`Layer ${id} added successfully`)

      // Add click event listener for the layer
      map.on("click", id, async (e) => {
        if (!e.features || e.features.length === 0) {
          console.warn("No features found at the click location.");
          return;
        }
      
        const feature = e.features[0];
        const { id: featureId, properties } = feature;
      
        try {
          // Fetch statistics from the server
          const statsResponse = await fetch(`http://127.0.0.1:8000/products/get-map-stats/${encodeURIComponent(id)}/`, {
            method: "POST", 
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              featureId,
              properties,
            }),
          });
      
          if (!statsResponse.ok) {
            throw new Error(`Error fetching statistics: ${statsResponse.statusText}`);
          }
      
          const statsData = await statsResponse.json();
          console.log("Stats",statsData)
          // Create a beautiful HTML structure for the popup
          const popupContent = `
            <div style="font-family: Arial, sans-serif; max-width: 400px;">
              <h3 style="color: #333; margin-bottom: 8px;">Feature Details</h3>
              <div style="margin-bottom: 12px;">
                <strong>ID:</strong> ${id}<br>
                <strong>Properties:</strong>
                <ul style="margin: 0; padding-left: 18px; color: #555;">
                  ${Object.entries(properties)
                    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                    .join("")}
                </ul>
              </div>
              <div id="sheet-container" style="margin-top: 16px;"></div>
            </div>
          `;
      
          // Add a popup with the generated content
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
      
          // Render the SheetComponent into the popup
          const container = document.getElementById("sheet-container");
          if (container) {
            ReactDOM.render(<SheetComponent  statsData={statsData.response}/>, container);
          }
        } catch (error) {
          console.error("Error fetching statistics:", error);
        }
      });
      

      
      

      // Update the loadedLayers state
      setLoadedLayers((prevLayers) => [...prevLayers, id]);
    } else {
      console.error("Invalid GeoJSON data:", data);
    }
  } catch (error) {
    console.error("Error fetching GeoJSON data:", error);
  }
};



  const addWMSLayer = (map: maplibregl.Map | null, layerName: string, apilink: string) => {
    if (!map) {
      console.error("Map instance is null. Cannot add WMS layer.");
      return;
    }
  
    map.addSource(layerName, {
      type: "raster",
      tiles: [apilink],
      tileSize: 256,
    });
  
    map.addLayer({
      id: layerName,
      type: "raster",
      source: layerName,
    });
  
    console.log(`WMS layer added: ${layerName}`);
  };

  // // Function to add a popup on click event to the map
  function addPopupOnMapClick(map: maplibregl.Map) {
    // Listen for click events on the map
    map.on("click", (e) => {
      const coordinates = e.lngLat; // Get the clicked coordinates
      const coordinatelat = parseFloat(coordinates.lat.toFixed(2));
      const coordinatelng = parseFloat(coordinates.lng.toFixed(2));
      setSelectedLat(coordinatelat);
      setSelectedLng(coordinatelng);
      setIsPanelVisible(true);
      // map.flyTo({
      //   center: [coordinates.lng, coordinates.lat],
      //   zoom: 19,
      //   speed: 0.4,
      // });

      

      // Create a new popup and set its content and position
      // new maplibregl.Popup()
      //   .setLngLat([coordinates.lng, coordinates.lat]) // Set popup position
      //   .setHTML("<h1>Hello World!</h1>") // Set popup content
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
      // pitch: 60,
      // bearing: -17.6,
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
    setCurrentMap("map 1");
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
    | "Opportunity"
    | "Map 4"
  )[] = ["Accessibility", "Design Of Road Network", "Opportunity", "Map 4"];

  const mapData = {
    Accessibility: [
      {
        id: 1,
        name: "Neighbourhoods",
        apilink: "https://mtaawetu.com/get-estates/",
      },
      {
        id: 2,
        name: "nbihealthaccess",
        apilink: "http://127.0.0.1:8000/products/maps-wfs/nbihealthaccess/",
      },
      {
        id: 3,
        name: "schoolaccessindexwalk",
        apilink:
          "http://127.0.0.1:8000/products/maps-wfs/schoolaccessindexwalk/",
      },
    ],
    //"http://127.0.0.1:8000/products/maps-wfs/sdna_1000meters_2018/"
    //"http://127.0.0.1:8000/products/maps/sdna_1000m2018/",
    "Design Of Road Network": [
      {
        id: 1,
        name: "sdna_1000meters_2018",
        apilink:
          "http://127.0.0.1:8000/products/maps/sdna_1000meters_2018/",
      },
      {
        id: 2,
        name: "Traffic Patterns",
        apilink: "https://example.com/traffic-patterns",
      },
    ],
    "Opportunity": [
      {
        id: 1,
        name: "hospital_opportunity",
        apilink: "http://127.0.0.1:8000/products/maps-wfs/hospital_opportunity",
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
                    {if (apilink.includes("maps-wms")) {
                      addWMSLayer( mapRef.current, name, apilink);
                    }else{ addGeoJsonLayer(
                      mapRef.current,
                      apilink,
                      name,
                      "name",
                    )}}
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
                  className="rounded-md px-2 py-2 flex items-center justify-between ring-1 ring-inset ring-gray-300  hover:bg-green-300"
                >
                  <div className="overflow-hidden w-3/4"><span>{layer}</span></div>
                  <div className="flex mt-1">
                    <DropDownComponent />
                      {/* Remove Button */}
                      <button
                      className="rounded-md px-1 py-1 mr-2 text-sm text-white bg-red-500 hover:bg-red-700"
                      onClick={() => removeLayer(layer)}
                    >
                      <div className="flex flex-row align-middle justify-center">
                        <div>{<X size="16" />}</div> 
                      </div>
                    </button>{" "}
                    {/* Hide Button */}
                    <ToggleButton layerId={layer} map={mapRef.current} />
                    {/* Use the ToggleButton */}

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
          <Toaster />
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
