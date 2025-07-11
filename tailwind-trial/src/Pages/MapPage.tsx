import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
// import { useNavigate } from "react-router-dom";
import {
  Home,
  // List,
  // LayoutDashboard,
  Menu,
  X,
  TimerReset,
  Layers,
  ArrowLeft,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import maplibregl, { ScaleControl } from "maplibre-gl";
import * as turf from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";
import SelectMenuMap from "../components/SelectMenuMap";
import ToggleButton from "../components/ToggoleVisibilityBtn";
import BottomSlidePanel from "../components/BottomSlidePanelIssues";
import SearchComponent from "../components/Search";
import { SheetComponent } from "@/components/Sheet";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { calcPercentages, generateStyleFromProperty } from "../utils/utils";
import DropDownComponent from "../components/Popover";
import { showLegend } from "../utils/utils";
import { hideLegend } from "../utils/utils";
import LogoutButton from "@/components/LogoutButton";
import { User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

import { useNavigate } from "react-router-dom";
// Define the type for suggestion (based on Nominatim response structure)
// interface Suggestion {
//   place_id: string;
//   display_name: string;
//   lat: string;
//   lon: string;
// }
// Location interface to ensure type consistency
interface LocationSuggestion {
  place: string;
  lat: string;
  lon: string;
  display_name?: string;
  place_id?: string;
}
interface Items {
  id: number;
  category: {
    id: number;
    category_name: string;
    description: string;
  };
  name: string;
  apilink: string;
  legendUrl: string | null;
  county: string | null;
}
const Dashboard: React.FC = () => {
  // const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMap, setCurrentMap] = useState("Basemap");
  const [loadedLayers, setLoadedLayers] = useState<string[]>(["Basemap"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
  // const [neighbourhoodName, setCurrentNeighborhoodName] = useState<string>("");
  const MAPTILER_KEY = "Zk2vXxVka5bwTvXQmJ0l";
  const mapRef = useRef<maplibregl.Map | null>(null); // Reference for the map instance
  const [activePanel, setActivePanel] = useState("select");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [selectedLat, setSelectedLat] = useState<number | null>(null);
  // const [selectedLng, setSelectedLng] = useState<number | null>(null);
  // const [boundCoords, setBoundCoords] = useState<maplibregl.LngLatBoundsLike>();
  const [isVisible, setIsPanelVisible] = useState(false);
  const [isTimeSeriesVisible, setIsTimeSeriesVisible] = useState(false);
  const [isPanelsVisible, setPanelsVisible] = useState(true);
  const [mapData, setMapData] = useState<MapDataType>({ map_layers: [] });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataType>({
    time_series: [],
  });

  // 2. Add this in your component (after other state declarations)
  const { user } = useAuth(); // Get user from auth context

  // Helper function to get user initials
  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const navigate = useNavigate();
  // const timeSeriesRef = useRef(null);
  const ipAddress = import.meta.env.VITE_API_URL || "http://localhost:8000";

  console.log(mapData);
  console.log(isVisible);
  // Function to add the GeoJSON layer and handle feature click
  const addGeoJsonLayer = async (
    map: maplibregl.Map | null,
    url: string,
    id: string,
    colorProperty: string
  ) => {
    if (!map) {
      console.error("Map instance is not available.");
      return;
    }

    try {
      // Fetch the GeoJSON data from the server
      const response = await fetch(url);
      const data = await response.json();
      let data_with_percent: any; // <-- Declare it outside

      // First check: Does the original data.geoJson have "access_index"?
      const hasAccessIndex =
        data.geoJson &&
        data.geoJson.features &&
        data.geoJson.features.length > 0 &&
        "access_index" in data.geoJson.features[0].properties;

      if (hasAccessIndex) {
        // Now it's safe to calculate percentages
        const data_with_percent_string = calcPercentages({
          geojson: data.geoJson,
          column: "access_index",
        });
        data_with_percent = JSON.parse(data_with_percent_string); // <-- Assign it
      } else {
        data_with_percent = data.geoJson; // Use the original data.geoJson
        // If the GeoJSON does not have "access_index", log a warning
        console.warn(
          "The GeoJSON does not have 'access_index' in its features."
        );
        // return; // Stop function
      }
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

        if (id == "estates_nairobi") {
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

          const result = generateStyleFromProperty(geojsonData, "access_index");
          console.log(result.expression);
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
        }
        // Add the layer based on the geometry type
        else if (data.geomType === "MultiPolygon" && hasAccessIndex) {
          // Generate random colors for features based on properties

          const percentileColors = [
            { range: [0, 1], color: "#ffffff" }, // White
            { range: [1, 25], color: "#dbeeff" }, // Very Light Blue
            { range: [26, 50], color: "#a6c8ff" }, // Soft Sky Blue
            { range: [51, 75], color: "#5b9aff" }, // Medium Blue
            { range: [76, 100], color: "#003f88" }, // Deep Navy Blue
          ];

          const fillColorExpression: any[] = ["case"];
          percentileColors.forEach(({ range, color }) => {
            fillColorExpression.push(
              [
                "all",
                [
                  ">=",
                  ["coalesce", ["to-number", ["get", accessIndexKey]], -1],
                  range[0],
                ],
                [
                  "<=",
                  ["coalesce", ["to-number", ["get", accessIndexKey]], -1],
                  range[1],
                ],
              ],
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
                "fill-color": fillColorExpression as any,
                "fill-opacity": 0.4, // Test with full opacity
              },
            },
            labelLayerId // Test without label layer placement
          );
        } else if (data.geomType === "MultiLineString") {
          map.addLayer(
            {
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
                "fill-color": "#00BB77",
                "fill-opacity": 0.3,
              },
            },
            labelLayerId
          );
        }

        toast.success(`Layer ${id} added successfully`);

        map.on("click", id, async (e) => {
          const { lng, lat } = e.lngLat;

          // First fetch: Get the neighborhood
          const fetchNeighborhood = async () => {
            try {
              const response = await fetch(
                `${ipAddress}/products/get-curent-neighbourhood/?coordinates=${lng},${lat}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!response.ok) {
                throw new Error(
                  `Error fetching neighborhood: ${response.statusText}`
                );
              }
              const data = await response.json();

              if (data.geojson) {
                const geojson = JSON.parse(data.geojson);
                const centroid = turf.centroid(geojson);
                const [longitude, latitude] = centroid.geometry.coordinates;
                // let neighbourhoodName = geojson.features[0].properties.name;
                // console.log("Name", neighbourhoodName);
                console.log("GeoJson", geojson);
                // Remove the existing source and layer if they exist
                if (map.getSource("highlighted-polygon")) {
                  if (map.getLayer("highlighted-polygon-outline")) {
                    map.removeLayer("highlighted-polygon-outline");
                  }
                  map.removeSource("highlighted-polygon");
                }

                // Add the new source
                map.addSource("highlighted-polygon", {
                  type: "geojson",
                  data: geojson,
                });

                // Add the new layer
                map.addLayer({
                  id: "highlighted-polygon-outline",
                  type: "line",
                  source: "highlighted-polygon",
                  paint: {
                    "line-color": "#FF0000",
                    "line-width": 2,
                  },
                });

                // Fly to the new polygon's centroid
                map.flyTo({
                  center: [longitude, latitude],
                  zoom: 14,
                  speed: 0.8,
                  curve: 1,
                  easing: (t) => t,
                });
              } else {
                console.warn(
                  data.message ||
                    "No neighborhood found for the given coordinates."
                );
              }
            } catch (error) {
              console.error("Error fetching neighborhood:", error);
            }
          };

          // Second fetch: Get statistics
          const fetchStatistics = async () => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const { id: featureId, properties } = feature;

              try {
                const statsResponse = await fetch(
                  `${ipAddress}/products/get-map-stats/${encodeURIComponent(
                    id
                  )}/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      featureId,
                      properties,
                      coordinates: { lat, lng },
                    }),
                  }
                );

                if (!statsResponse.ok) {
                  throw new Error(
                    `Error fetching statistics: ${statsResponse.statusText}`
                  );
                }

                const statsData = await statsResponse.json();
                console.log("Stats:", statsData);

                const popupContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 400px; max-height: 200px; overflow-y: auto;">
                    <h3 style="color: #333; margin-bottom: 8px;">Feature Details</h3>
                    <div style="margin-bottom: 12px;">
                      <strong>ID:</strong> ${id}<br>
                      <strong>Properties:</strong>
                      <ul style="margin: 0; padding-left: 18px; color: #555;">
                        ${Object.entries(properties)
                          .map(
                            ([key, value]) =>
                              `<li><strong>${key}:</strong> ${value}</li>`
                          )
                          .join("")}
                      </ul>
                    </div>
                  </div>
                  <div id="sheet-container" style="margin-top: 16px;"></div>
                `;

                new maplibregl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(popupContent)
                  .addTo(map);
                setIsPanelVisible(true);

                const container = document.getElementById("sheet-container");
                if (container) {
                  ReactDOM.render(
                    <SheetComponent
                      statsData={statsData.response}
                      areaName={properties.name}
                      percent={properties.percent}
                    />,
                    container
                  );
                }
              } catch (error) {
                console.error("Error fetching statistics:", error);
              }
            } else {
              console.warn("No features found at the click location.");
            }
          };

          // Execute both fetches independently

          fetchNeighborhood();
          fetchStatistics();
        });

        // Update the loadedLayers state
        setLoadedLayers((prevLayers) => [...prevLayers, id]);
      } else {
        console.error("Invalid GeoJSON data:", data);
      }
    } catch (error) {
      console.error("Error fetching GeoJSON data:", error);
      toast.error("Error fetching GeoJSON data");
    }
  };

  const addWMSLayer = (
    map: maplibregl.Map | null,
    layerName: string,
    wmsBaseUrl: string,
    id: string
  ) => {
    if (!map) {
      console.error("Map instance is null. Cannot add WMS layer.");
      return;
    }

    fetch(wmsBaseUrl)
      .then((response) => response.json()) // Assuming the response is a JSON object
      .then((data) => {
        const wmsTileUrl = data.layer.apilink; // Get the WMS URL from the response
        console.log(data);
        console.log(wmsTileUrl);

        // Add the WMS source to the map after the URL is fetched
        map.addSource(layerName, {
          type: "raster",
          tiles: [`${wmsTileUrl}`],
          tileSize: 256,
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

        // Add the layer to the map
        map.addLayer(
          {
            id: layerName,
            type: "raster",
            source: layerName,
            paint: {},
          },
          labelLayerId
        );

        console.log(`WMS layer added: ${layerName}`);
        setLoadedLayers((prevLayers) => [...prevLayers, id]);
        toast.success(`Layer ${id} added successfully`);

        // **Add an onclick event listener to query the backend**
        map.on("click", async (e) => {
          const { lng, lat } = e.lngLat;

          try {
            const response = await fetch(
              `${ipAddress}/products/get-curent-neighbourhood/?coordinates=${lng},${lat}`
            );
            const result = await response.json();
            console.log("Query Result:", result);

            if (result.geojson.length > 0) {
              const geojsonData = JSON.parse(result.geojson);
              const feature = geojsonData.features[0];
              const { id: featureId, properties } = feature;
              const neighbourhoodName = properties?.name || "Unknown";

              toast.success(`Data retrieved: ${neighbourhoodName} data`);

              // Remove the existing source and layer if they exist
              if (map.getSource("highlighted-polygon-wms")) {
                if (map.getLayer("highlighted-polygon-outline-wms")) {
                  map.removeLayer("highlighted-polygon-outline-wms");
                }
                map.removeSource("highlighted-polygon-wms");
              }

              // Add the new source
              map.addSource("highlighted-polygon-wms", {
                type: "geojson",
                data: geojsonData,
              });

              // Add the new layer
              map.addLayer({
                id: "highlighted-polygon-outline-wms",
                type: "line",
                source: "highlighted-polygon-wms",
                paint: {
                  "line-color": "#FF0000",
                  "line-width": 2,
                },
              });

              // Fly to the new polygon's centroid
              map.flyTo({
                center: [lng, lat],
                zoom: 14,
                speed: 0.8,
                curve: 1,
                easing: (t) => t,
              });

              // **Fetch Statistics**
              try {
                const statsResponse = await fetch(
                  `${ipAddress}/products/get-map-stats/estates_nairobi/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      featureId,
                      properties,
                      coordinates: { lat, lng },
                    }),
                  }
                );

                if (!statsResponse.ok) {
                  throw new Error(
                    `Error fetching statistics: ${statsResponse.statusText}`
                  );
                }

                const statsData = await statsResponse.json();
                console.log("Stats:", statsData);

                const popupContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 400px; max-height: 200px; overflow-y: auto;">
                    <h3 style="color: #333; margin-bottom: 8px;">Feature Details</h3>
                    <div style="margin-bottom: 12px;">
                      <strong>ID:</strong> ${id}<br>
                      <strong>Properties:</strong>
                      <ul style="margin: 0; padding-left: 18px; color: #555;">
                        ${Object.entries(properties)
                          .map(
                            ([key, value]) =>
                              `<li><strong>${key}</strong> <br/> ${value}</li>`
                          )
                          .join("")}
                      </ul>
                    </div>
                  </div>
                  <div id="sheet-container" style="margin-top: 16px;"></div>
                `;

                new maplibregl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(popupContent)
                  .addTo(map);
                setIsPanelVisible(true);

                const container = document.getElementById("sheet-container");
                if (container) {
                  if (id == "population density") {
                    ReactDOM.render(
                      <SheetComponent
                        statsData={statsData.response}
                        areaName={neighbourhoodName}
                        dataType="demographics"
                      />,
                      container
                    );
                  } else {
                    ReactDOM.render(
                      <SheetComponent
                        statsData={statsData.response}
                        areaName={neighbourhoodName}
                        percent={properties.percent}
                      />,
                      container
                    );
                  }
                }
              } catch (error) {
                console.error("Error fetching statistics:", error);
              }
            } else {
              toast.info("No data found at this location.");
            }
          } catch (error) {
            console.error("Error querying the layer:", error);
            toast.error(`Error querying the layer`);
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching WMS layer:", error);
        toast.error(`Error fetching WMS layer`);
      });
  };

  // Function to remove a layer from the map

  const removeLayer = (layerId: string) => {
    if (mapRef.current && mapRef.current.getLayer(layerId)) {
      mapRef.current.removeLayer(layerId);
      mapRef.current.removeSource(layerId); // Remove source as well
      setLoadedLayers(loadedLayers.filter((layer) => layer !== layerId)); // Update state
      hideLegend(layerId);
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
      style: `https://api.maptiler.com/maps/streets-v2-light/style.json?key=${MAPTILER_KEY}`,
      center: [36.8219, -1.2921],
      zoom: 12.5,
      // pitch: 60,
      // bearing: -17.6,
      container: "map",
      antialias: true,
      // maxBounds: boundCoords,
    });

    mapRef.current = map; // Save the map instance to the ref
    map.addControl(new maplibregl.NavigationControl(), "top-right");
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
    // addPopupOnMapClick(map);
    setCurrentMap("Basemap");
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

  type MapDataType = {
    map_layers: Items[];
  };

  type TimeSeriesItem = {
    id: number;
    category: {
      id: number;
      category_name: string;
      description: string;
    };
    name: string;
    timestamp: string;
    value: number;
    apilink: string; // Ensure it's always a string
    legendUrl: string; // Ensure it's always a string
    county: string;
  };

  type TimeSeriesDataType = {
    [category: string]: TimeSeriesItem[];
  };

  const [groupedMapLayers, setGroupedMapLayers] = useState<{
    [category: string]: {
      description: string;
      items: Items[];
    };
  }>({});

  const fetchTimeSeriesData = async (): Promise<{
    time_series: TimeSeriesItem[];
  }> => {
    const response = await fetch(`${ipAddress}/data/api/time-series/`);
    const data = await response.json();

    return {
      time_series: data.results.map((item: any) => ({
        id: item.id,
        category: {
          category_name: item.category_fk
            ? item.category_fk.category_name
            : "Unknown", // Ensure category_name is accessed correctly
          description: item.category_fk
            ? item.category_fk.description
            : "No description available", // Ensure description is accessed correctly
        },
        name: item.name,
        apilink: item.apilink,
        legendUrl: item.legend_url,
        county: item.county,
        month: {
          name: item.month.name,
          number: item.month.number,
        },
      })),
    };
  };

  const fetchMapData = async (): Promise<{ map_layers: Items[] }> => {
    const response = await fetch(`${ipAddress}/data/api/map-layers/`);
    const data = await response.json();

    return {
      map_layers: data.results.map((item: any) => ({
        id: item.id,
        category: {
          id: item.category_fk.id,
          category_name: item.category_fk.category_name,
          description: item.category_fk.description,
        },
        name: item.name,
        apilink: item.apilink,
        legendUrl: item.legend_url,
        county: item.county,
      })),
    };
  };

  useEffect(() => {
    const loadData = async () => {
      const mapDataResponse = await fetchMapData();
      setMapData(mapDataResponse);

      // Group by category with description
      const grouped: {
        [categoryName: string]: {
          description: string;
          items: Items[];
        };
      } = {};

      mapDataResponse.map_layers.forEach((item) => {
        const categoryKey = item.category.category_name;
        const description = item.category.description;

        if (!grouped[categoryKey]) {
          grouped[categoryKey] = {
            description,
            items: [],
          };
        }

        grouped[categoryKey].items.push(item);
      });

      setGroupedMapLayers(grouped);

      const timeSeriesResponse = await fetchTimeSeriesData();
      setTimeSeriesData(timeSeriesResponse);
    };

    loadData();
  }, []);

  // useEffect(() => {
  //   const loadData = async () => {
  //     const mapDataResponse = await fetchMapData();
  //     setMapData(mapDataResponse); // ✅ Now it matches { map_layers: Items[] }

  //     const timeSeriesResponse = await fetchTimeSeriesData();
  //     setTimeSeriesData(timeSeriesResponse);
  //   };

  //   loadData();
  // }, []);

  const groupedTimeSeries = timeSeriesData.time_series.reduce(
    (acc, item) => {
      const key = item.category.category_name;
      if (!acc[key]) {
        acc[key] = {
          description: item.category.description,
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    },
    {} as {
      [category: string]: {
        description: string;
        items: TimeSeriesItem[];
      };
    }
  );

  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleTabClick = () => {
    setIsTimeSeriesVisible(true);
  };

  // const handleOtherClick = () => {
  //   setIsTimeSeriesVisible(false);
  // };

  const handleHomeClick = () => {
    setPanelsVisible(true);
  };

  // Function to show legends
  // const showLegend = (legendUrl, name) => {
  //   const legend = document.getElementById("legend");
  //   const legendContent = document.getElementById("legend-content");

  //   if (legend) {
  //     legend.classList.remove("hidden");
  //   }

  //   if (legendUrl) {
  //     // Clear previous content
  //     legendContent.innerHTML = "";

  //     // Create image element for the legend
  //     const img = document.createElement("img");
  //     img.src = legendUrl;
  //     img.alt = `Legend for ${name}`;
  //     img.style.maxWidth = "100%";

  //     legendContent.appendChild(img);
  //   } else {
  //     legendContent.innerHTML = "<li>No legend available for this layer</li>";
  //   }
  // };

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobileMenuOpen &&
        !(event.target as HTMLElement)?.closest("aside")
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Header - Responsive for both mobile and desktop */}
      <header className="z-20 bg-gradient-to-r from-blue-50 to-white shadow-lg px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:justify-between mx-auto gap-4 lg:gap-0">
          <div className="flex">
            {/* Mobile menu button - only visible on mobile */}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-white bg-blue-800 hover:bg-blue-700/50 transition-colors mr-2 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            {/* Logo - always visible, positioned to the left */}
            <h1 className="font-Zaine text-4xl font-bold bg-clip-text text-transparent bg-blue-800 ms-5">
              mtaawetu
            </h1>
          </div>

          {/* Search bar - full width on mobile, smaller on desktop */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between lg:w-1/4 md:w-3/4 space-y-2 md:space-y-0 md:space-x-2">
            <SearchComponent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              flyTo={flyTo}
            />

            {/* User block - hidden on mobile, shown inline on md+ screens */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <div
                  className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 rounded-lg p-2 transition-colors"
                  onClick={() => navigate("/dashboard")}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {getUserInitials(user.username || user.email || "U")}
                    </span>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-gray-700">
                      {user.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.is_paid_user ? "Premium" : "Free"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons - hidden on desktop, visible on mobile */}
          {/* <div className="flex items-center space-x-2 lg:hidden">
            <button
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center"
              onClick={() => setIsTimeSeriesVisible(!isTimeSeriesVisible)}
            >
              <TimerReset size={18} />
            </button>
            <button
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center"
              onClick={() => setPanelsVisible(!isPanelsVisible)}
            >
              <Layers size={18} />
            </button>
          </div> */}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile Navigation Drawer Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Desktop Sidebar / Mobile Menu - Always visible on desktop */}
        <aside
          className={`fixed top-0 left-0 z-50 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col h-full transition-all duration-300 ease-in-out lg:static lg:block lg:z-30 ${
            isMobileMenuOpen ? "w-64" : "w-0 lg:w-20"
          } ${isSidebarOpen ? "lg:w-64" : "lg:w-20"}`}
          style={{
            // Hide content completely on mobile when closed
            overflow:
              isMobileMenuOpen || window.innerWidth >= 1024
                ? "visible"
                : "hidden",
            // Ensure content is not visible when sidebar is closed on mobile
            ...(window.innerWidth < 1024 &&
              !isMobileMenuOpen && {
                overflow: "hidden",
                visibility: "hidden",
              }),
          }}
        >
          {/* Content wrapper to ensure proper hiding on mobile */}
          <div
            className={`h-full flex flex-col ${
              !isMobileMenuOpen && window.innerWidth < 1024
                ? "opacity-0"
                : "opacity-100"
            } transition-opacity duration-300`}
          >
            {/* Logo/Close button area */}
            <div className="flex items-center justify-between p-4 border-b border-blue-700/50">
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileMenuOpen(!isMobileMenuOpen);
                  } else {
                    setIsSidebarOpen(!isSidebarOpen);
                  }
                }}
                className="p-2 rounded-md hover:bg-blue-700/50 transition-colors"
                aria-label="Toggle sidebar"
              >
                {isMobileMenuOpen ? (
                  <X size={20} />
                ) : isSidebarOpen ? (
                  <ArrowLeft size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </button>
            </div>
            {/* Navigation Links */}
            <nav className="flex-1 p-4">
              <div className={`space-y-3 ${isSidebarOpen ? "mt-2" : "mt-6"}`}>
                <button
                  onClick={() => {
                    handleHomeClick();
                    if (window.innerWidth < 1024) setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors group"
                >
                  <Layers
                    size={isMobileMenuOpen || isSidebarOpen ? 18 : 22}
                    className={`${
                      !isMobileMenuOpen && !isSidebarOpen && "mx-auto"
                    } group-hover:scale-110 transition-transform`}
                  />
                  {(isMobileMenuOpen || isSidebarOpen) && (
                    <span className="ml-3 font-medium">Layer select</span>
                  )}
                  {!isMobileMenuOpen && !isSidebarOpen && (
                    <div className="absolute left-20 hidden lg:group-hover:flex bg-blue-800 text-white py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Layer Select
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleTabClick();
                    if (window.innerWidth < 1024) setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors group ${
                    isTimeSeriesVisible
                      ? "bg-blue-700/70"
                      : "hover:bg-blue-700/50"
                  }`}
                >
                  <TimerReset
                    size={isMobileMenuOpen || isSidebarOpen ? 18 : 22}
                    className={`${
                      !isMobileMenuOpen && !isSidebarOpen && "mx-auto"
                    } group-hover:scale-110 transition-transform`}
                  />
                  {(isMobileMenuOpen || isSidebarOpen) && (
                    <span className="ml-3 font-medium">Time Series</span>
                  )}
                  {!isMobileMenuOpen && !isSidebarOpen && (
                    <div className="absolute left-20 hidden lg:group-hover:flex bg-blue-800 text-white py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Time Series
                    </div>
                  )}
                </button>
              </div>
            </nav>
            {/* Bottom Section - User Info & Actions */}
            <div className="mt-auto">
              {/* User Section - Expanded sidebar or mobile menu */}
              {(isMobileMenuOpen || isSidebarOpen) && user && (
                <div className="p-4 border-t border-blue-700/50">
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      navigate("/dashboard");
                      if (window.innerWidth < 1024) setMobileMenuOpen(false);
                    }}
                  >
                    {/* User Avatar Circle */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 font-semibold text-sm">
                        {getUserInitials(user.username || user.email || "U")}
                      </span>
                    </div>
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {user.username || "User"}
                      </p>
                      <p className="text-blue-200 text-xs truncate">
                        {user.email}
                      </p>
                      <p className="text-blue-300 text-xs">
                        {user.is_paid_user ? "Premium" : "Free"} Account
                      </p>
                    </div>
                  </div>

                  {/* Logout Button - Only show when sidebar is expanded */}
                  {isSidebarOpen && (
                    <div className="mt-3 px-3">
                      <LogoutButton />
                    </div>
                  )}
                </div>
              )}

              {/* Collapsed User Icon - When sidebar is collapsed on desktop */}
              {!isMobileMenuOpen && !isSidebarOpen && user && (
                <div className="p-4 border-t border-blue-700/50">
                  <div className="relative group">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full p-2 rounded-lg hover:bg-blue-700/50 transition-colors flex justify-center"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-semibold text-xs">
                          {getUserInitials(user.username || user.email || "U")}
                        </span>
                      </div>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-20 bottom-0 hidden lg:group-hover:flex bg-blue-800 text-white py-2 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <div>
                        <p className="font-medium text-sm">
                          {user.username || "User"}
                        </p>
                        <p className="text-xs text-blue-200">
                          {user.is_paid_user ? "Premium" : "Free"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Version Info - Only show when sidebar is expanded */}
              {(isMobileMenuOpen || isSidebarOpen) && (
                <div className="p-4 border-t border-blue-700/50">
                  <div className="text-xs text-blue-200/70 text-center">
                    Mtaa Wetu Platform v2.0
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Footer Area - Always visible */}
        </aside>

        {/* Map Container with proper sidebar margin on desktop */}
        <div
          id="map"
          className="flex-1 relative transition-all duration-300"
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          {/* Street Smart AI Button - Desktop Positioning */}
          <button
            onClick={() => setIsBottomPanelVisible(true)}
            className="absolute bottom-14 md:bottom-10 left-1/2 transform -translate-x-1/2 z-20
                    bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full 
                    shadow-lg flex items-center space-x-2 transition-all duration-300"
          >
            <span className="hidden sm:inline">Ask Street Smart AI</span>
            <span className="sm:hidden">AI Help</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Panel Container - Improved Desktop Experience */}
        <div className="fixed inset-0 pointer-events-none z-30">
          {/* Time Series Panel - Bottom Sheet on Mobile, Side Panel on Desktop */}
          {/* Fixed: Corrected pointer-events logic to ensure clickability */}
          <div
            className={`bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-out
    ${isTimeSeriesVisible ? "pointer-events-auto" : "pointer-events-none"}
    ${
      isTimeSeriesVisible
        ? "translate-y-0 opacity-100"
        : "translate-y-full opacity-0"
    }
    lg:absolute lg:inset-y-0 lg:left-auto lg:translate-y-0 lg:right-0 lg:bottom-0 lg:border-l lg:border-t-0 lg:rounded-none lg:w-1/4 lg:h-full
    ${!isTimeSeriesVisible && "lg:translate-x-full lg:opacity-0"}
  `}
            style={{
              position: "fixed",
              height: "90vh",
              maxHeight: "90vh",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
              bottom: "0",
              left: "0",
              width: "100%",
              paddingBottom: "70px",
              ...(!isTimeSeriesVisible && { transform: "translateY(100%)" }),
              ...(window.innerWidth >= 1024 && {
                position: "fixed",
                bottom: "0",
                top: "80px", // Add top offset for navbar height
                right: "0",
                left: "auto",
                width: "25%",
                height: "calc(100vh - 80px)", // Subtract navbar height
                maxHeight: "calc(100vh - 80px)", // Subtract navbar height
                borderTopLeftRadius: "0",
                borderTopRightRadius: "0",
                paddingBottom: "0",
                transform: isTimeSeriesVisible
                  ? "translateX(0)"
                  : "translateX(100%)",
              }),
            }}
          >
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
              {/* Mobile handle for drag */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 lg:hidden"></div>

              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-blue-800">Time Series</h3>
                <button
                  onClick={() => setIsTimeSeriesVisible(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                View and analyze temporal data trends
              </p>
            </div>

            <div
              className="p-4 overflow-y-auto pb-20 lg:pb-4"
              style={{
                height:
                  window.innerWidth >= 1024
                    ? "calc(100% - 86px)"
                    : "calc(100% - 110px)",
              }}
            >
              <div className="space-y-3">
                {Object.entries(groupedTimeSeries).map(([category, group]) => (
                  <SelectMenuMap
                    key={category}
                    items={group.items}
                    category={category}
                    description={group.description}
                    onClick={(name, apilink, legendUrl) => {
                      addWMSLayer(mapRef.current, name, apilink, name);
                      showLegend(legendUrl, name);
                      if (window.innerWidth < 1024)
                        setIsTimeSeriesVisible(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Layers Control Panel - Improved Desktop Positioning */}
          {/* Fixed: Corrected pointer-events logic to ensure clickability */}
          <div
            className={`bg-white border-t border-gray-200 shadow-lg transition-all duration-300
    ${isPanelsVisible ? "pointer-events-auto" : "pointer-events-none"}
    ${
      isPanelsVisible
        ? "translate-y-0 opacity-100"
        : "translate-y-full opacity-0"
    }
    lg:absolute lg:inset-y-0 lg:translate-y-0 lg:translate-x-0 lg:border-l lg:border-t-0 lg:rounded-none lg:w-1/4 lg:h-full
    ${!isPanelsVisible && "lg:translate-x-full lg:opacity-0"}
  `}
            style={{
              position: "fixed",
              bottom: "0",
              left: "0",
              height: "90vh",
              maxHeight: "90vh",
              width: "100%",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
              paddingBottom: "70px",
              zIndex: isPanelsVisible && isTimeSeriesVisible ? "40" : "30",
              ...(!isPanelsVisible && { transform: "translateY(100%)" }),
              ...(window.innerWidth >= 1024 && {
                position: "fixed",
                bottom: "0",
                top: "80px", // Add top offset for navbar height
                right: isTimeSeriesVisible ? "25%" : "0",
                left: "auto",
                width: "25%",
                height: "calc(100vh - 80px)", // Subtract navbar height
                maxHeight: "calc(100vh - 80px)", // Subtract navbar height
                borderTopLeftRadius: "0",
                borderTopRightRadius: "0",
                paddingBottom: "0",
                transform: isPanelsVisible
                  ? "translateX(0)"
                  : "translateX(100%)",
              }),
            }}
          >
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
              {/* Mobile handle for drag */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 lg:hidden"></div>

              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-blue-800">Layer Controls</h3>
                <button
                  onClick={() => setPanelsVisible(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Toggle Buttons */}
            <div className="sticky top-[73px] z-10 bg-white border-b border-gray-200">
              <div className="flex p-2 gap-2">
                <button
                  onClick={() => setActivePanel("select")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activePanel === "select"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Select Layers
                </button>
                <button
                  onClick={() => setActivePanel("loaded")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activePanel === "loaded"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Loaded Layers
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div
              className="overflow-y-auto p-4 lg:pb-4"
              style={{
                height:
                  window.innerWidth >= 1024
                    ? "calc(100% - 125px)"
                    : "calc(100% - 130px)",
              }}
            >
              {activePanel === "select" ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Select map layers to display on your visualization.
                  </p>
                  {Object.entries(groupedMapLayers).map(([category, data]) => (
                    <SelectMenuMap
                      key={category}
                      items={data.items}
                      category={category}
                      description={data.description}
                      onClick={(name, apilink, legendUrl) => {
                        if (apilink.includes("maps-wms")) {
                          addWMSLayer(mapRef.current, name, apilink, name);
                          showLegend(legendUrl, name);
                        } else {
                          addGeoJsonLayer(
                            mapRef.current,
                            apilink,
                            name,
                            "name"
                          );
                        }
                        if (window.innerWidth < 1024) setPanelsVisible(false);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Currently active map layers. Manage visibility and settings.
                  </p>
                  {loadedLayers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Layers size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No layers loaded</p>
                      <p className="text-sm mt-1">
                        Switch to Select Layers to add data
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loadedLayers.map((layer) => (
                        <div
                          key={layer}
                          className="rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors"
                        >
                          <div className="overflow-hidden">
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {layer}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ToggleButton
                              layerId={layer}
                              map={mapRef.current}
                            />
                            <DropDownComponent />
                            <button
                              className="p-1 rounded-md text-red-600 hover:bg-red-50"
                              onClick={() => removeLayer(layer)}
                              title="Remove layer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend - Better Desktop Positioning */}
        <div
          id="legend"
          className="fixed bottom-24 md:left-20 md:bottom-16 bg-white p-3 rounded-md shadow-md border border-gray-300 hidden max-w-[90%] md:max-w-xs lg:max-w-sm z-20 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-blue-500">Legend</h4>
            <div className="flex space-x-1">
              <button
                id="toggle-legend-size"
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hidden md:block"
                title="Toggle size"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => {
                  const legend = document.getElementById("legend");
                  if (legend) {
                    legend.classList.add("hidden");
                  }
                }}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <ul
            id="legend-content"
            className="text-sm space-y-1 text-gray-700 max-h-48 overflow-y-auto"
          ></ul>
        </div>

        <Toaster position="top-center" />

        {/* Bottom Slide Panel - Better Desktop Integration */}
        <BottomSlidePanel
          isVisible={isBottomPanelVisible}
          onClose={() => setIsBottomPanelVisible(false)}
          onLocationSelect={(lng, lat) => {
            console.log("Location selected:", lng, lat);
            // Here you could add code to fly to the location or add a marker
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
