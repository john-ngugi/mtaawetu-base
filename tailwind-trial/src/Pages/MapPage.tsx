import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Home,
  List,
  LayoutDashboard,
  Menu,
  X,
  TimerReset,
  Layers,
  ArrowLeft,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMap, setCurrentMap] = useState("Map 1");
  const [loadedLayers, setLoadedLayers] = useState<string[]>(["Map 1"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  // const [neighbourhoodName, setCurrentNeighborhoodName] = useState<string>("");
  const MAPTILER_KEY = "Zk2vXxVka5bwTvXQmJ0l";
  const mapRef = useRef<maplibregl.Map | null>(null); // Reference for the map instance
  const [activePanel, setActivePanel] = useState("select");
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

  // const timeSeriesRef = useRef(null);
  const ipAddress = "http://127.0.0.1:8000";
  // var neighbourhoodName = "";

  // // Function to fetch possible location suggestions (limited to 4 results)
  // const fetchSuggestions = async (input: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://nominatim.openstreetmap.org/search?format=json&q=${input}, Kenya`
  //     );
  //     const data = await response.json();
  //     setSuggestions(data.slice(0, 4));
  //     // Extract relevant fields and sort alphabetically by display_name or city/town
  //     const formattedSuggestions = data
  //       .map((location: any) => {
  //         const { display_name, lat, lon, address } = location;
  //         // Extract city, town, or village, fallback to display_name if none exists
  //         const place =
  //           address?.city || address?.town || address?.village || display_name;
  //         return {
  //           place, // Display name (city/town/village)
  //           lat,
  //           lon,
  //         };
  //       })
  //       .sort((a: any, b: any) => a.place.localeCompare(b.place)) // Sort alphabetically by place name
  //       .slice(0, 4); // Limit to top 4 suggestions

  //     setSuggestions(formattedSuggestions); // Update the suggestions state
  //   } catch (error) {
  //     console.error("Error fetching location suggestions:", error);
  //   }
  // };

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
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
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
      time_series: data.map((item: any) => ({
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
      map_layers: data.map((item: any) => ({
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

  const handleOtherClick = () => {
    setIsTimeSeriesVisible(false);
  };

  const handleHomeClick = () => {
    setPanelsVisible(true);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`z-30 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col h-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700/50">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
              GeoViz
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-blue-700/50 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <ArrowLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <div className={`space-y-1 ${isSidebarOpen ? "mt-2" : "mt-6"}`}>
            <button
              onClick={handleHomeClick}
              className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
            >
              <Home
                size={isSidebarOpen ? 18 : 22}
                className={`${!isSidebarOpen && "mx-auto"}`}
              />
              {isSidebarOpen && (
                <span className="ml-3 font-medium">County Select</span>
              )}
            </button>

            <button
              onClick={handleTabClick}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                isTimeSeriesVisible ? "bg-blue-700/70" : "hover:bg-blue-700/50"
              }`}
            >
              <TimerReset
                size={isSidebarOpen ? 18 : 22}
                className={`${!isSidebarOpen && "mx-auto"}`}
              />
              {isSidebarOpen && (
                <span className="ml-3 font-medium">Time Series</span>
              )}
            </button>

            <button
              onClick={handleOtherClick}
              className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
            >
              <List
                size={isSidebarOpen ? 18 : 22}
                className={`${!isSidebarOpen && "mx-auto"}`}
              />
              {isSidebarOpen && (
                <span className="ml-3 font-medium">List View</span>
              )}
            </button>

            <button
              onClick={handleOtherClick}
              className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
            >
              <LayoutDashboard
                size={isSidebarOpen ? 18 : 22}
                className={`${!isSidebarOpen && "mx-auto"}`}
              />
              {isSidebarOpen && (
                <span className="ml-3 font-medium">Dashboard</span>
              )}
            </button>
          </div>
        </nav>

        {/* Footer Area */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-blue-700/50">
            <div className="text-xs text-blue-200/70">GeoViz Platform v2.0</div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="z-20 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <SearchComponent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              flyTo={flyTo}
            />
            <div className="flex items-center space-x-4">
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                onClick={() => setPanelsVisible(!isPanelsVisible)}
              >
                <Layers size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Map and content area */}
        <div className="flex-grow relative overflow-hidden">
          <div id="map" className="w-full h-full" />

          {/* Panel Container */}
          <div
            className={`absolute top-0 ${
              isSidebarOpen ? "left-64" : "left-20"
            } h-full transition-all duration-300`}
          >
            {/* Time Series Panel */}
            <div
              className={`absolute top-4 h-[calc(100%-10rem)] bg-white border-r border-gray-200 shadow-lg w-80 transition-transform transform duration-300 ease-out
                ${
                  isTimeSeriesVisible
                    ? "translate-x-0 opacity-100 pointer-events-auto"
                    : "-translate-x-full opacity-0 pointer-events-none"
                }
              `}
            >
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
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
                className="p-4 overflow-y-auto"
                style={{ height: "calc(100% - 82px)" }}
              >
                <div className="space-y-3">
                  {Object.entries(groupedTimeSeries).map(
                    ([category, group]) => (
                      <SelectMenuMap
                        key={category}
                        items={group.items}
                        category={category}
                        description={group.description}
                        onClick={(name, apilink, legendUrl) => {
                          addWMSLayer(mapRef.current, name, apilink, name);
                          showLegend(legendUrl, name);
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Layers Control Panel */}
            <div
              className={`absolute top-4 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[calc(100%-2rem)] transition-all duration-300 ${
                isTimeSeriesVisible ? "left-[332px]" : "left-1"
              } ${
                isPanelsVisible
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              style={{
                transform: isPanelsVisible
                  ? "translateX(0)"
                  : "translateX(-20px)",
                overflow: "hidden",
              }}
            >
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-blue-800">
                    Layer Controls
                  </h3>
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
                className="overflow-y-hidden p-4"
                style={{ maxHeight: "calc(100% - 130px)" }}
              >
                {activePanel === "select" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Select map layers to display on your visualization.
                    </p>
                    {Object.entries(groupedMapLayers).map(
                      ([category, data]) => (
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
                          }}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Currently active map layers. Manage visibility and
                      settings.
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
                              <span className="text-sm font-medium text-gray-700">
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

          {/* Legend */}
          <div
            id="legend"
            className="absolute bottom-4 right-4 bg-white p-4 rounded-md shadow-md border border-gray-300 hidden"
          >
            <h4 className="font-semibold mb-2 text-blue-500">Legend</h4>
            <ul
              id="legend-content"
              className="text-sm space-y-1 text-gray-700"
            ></ul>
          </div>

          <Toaster />
          <BottomSlidePanel
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
