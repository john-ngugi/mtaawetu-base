import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Home, Map, List, LayoutDashboard, Menu, X } from "lucide-react";
import maplibregl, { ScaleControl } from "maplibre-gl";
import * as turf from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";
import SelectMenuMap from "../components/SelectMenuMap";
import ToggleButton from "../components/ToggoleVisibilityBtn";
import BottomSlidePanel from "../components/BottomSlidePanelIssues";
import Search from "../components/Search";
import { SheetComponent } from "@/components/Sheet";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { calcPercentages } from "../utils/utils";
import DropDownComponent from "../components/Popover";
import { showLegend } from "../utils/utils";
import { hideLegend } from "../utils/utils";
// Define the type for suggestion (based on Nominatim response structure)
interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}
const Dashboard: React.FC = () => {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentMap, setCurrentMap] = useState("Map 1");
  const [loadedLayers, setLoadedLayers] = useState<string[]>(["Map 1"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // Explicitly type suggestions as an array of Suggestion objects
  // const [neighbourhoodName, setCurrentNeighborhoodName] = useState<string>("");
  const MAPTILER_KEY = "Zk2vXxVka5bwTvXQmJ0l";
  const mapRef = useRef<maplibregl.Map | null>(null); // Reference for the map instance
  const [activePanel, setActivePanel] = useState("select");
  // const [selectedLat, setSelectedLat] = useState<number | null>(null);
  // const [selectedLng, setSelectedLng] = useState<number | null>(null);
  // const [boundCoords, setBoundCoords] = useState<maplibregl.LngLatBoundsLike>();
  const [isVisible, setIsPanelVisible] = useState(false);
  const [isTimeSeriesVisible, setIsTimeSeriesVisible] = useState(false);
  const timeSeriesRef = useRef(null);
  const ipAddress = "mtaawetu.com";
  var neighbourhoodName = "";
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
      const data_with_percent_string = calcPercentages({
        geojson: data.geoJson,
        column: "access_index",
      });
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
        else if (data.geomType === "MultiPolygon") {
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
                "fill-color": "#fff",
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
                `http://127.0.0.1:8000/products/get-curent-neighbourhood/?coordinates=${lng},${lat}`,
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
                neighbourhoodName = geojson.features[0].properties.name;
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
                  `http://127.0.0.1:8000/products/get-map-stats/${encodeURIComponent(
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
                      areaName={neighbourhoodName}
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
              `http://127.0.0.1:8000/products/query-layer/?layer=${layerName}&lng=${lng}&lat=${lat}`
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
                  `http://127.0.0.1:8000/products/get-map-stats/estates_nairobi/`,
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
                      areaName={neighbourhoodName}
                    />,
                    container
                  );
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
  const months = [
    { id: 1, name: "JAN" },
    { id: 2, name: "FEB" },
    { id: 3, name: "MAR" },
    { id: 4, name: "APR" },
    { id: 5, name: "MAY" },
    { id: 6, name: "JUN" },
    { id: 7, name: "JUL" },
    { id: 8, name: "AUG" },
    { id: 9, name: "SEP" },
    { id: 10, name: "OCT" },
    { id: 11, name: "NOV" },
    { id: 12, name: "DEC" },
  ];

  const no2AirQualityIndexTimeseries2024 = months.map((month) => ({
    id: month.id,
    name: `${month.name} NO2`,
    apilink: `https://${ipAddress}/products/maps-wms/Nairobi_NO2_AQI_UN_${month.id}_2024`,
    legendUrl:
      "https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:Nairobi_NO2_AQI",
  }));
  const so2AirQualityIndexTimeseries2024 = months.map((month) => ({
    id: month.id,
    name: `${month.name} SO2`,
    apilink: `https://${ipAddress}/products/maps-wms/Nairobi_SO2_AQI_UN_${month.id}_2024`,
    legendUrl: `https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:Nairobi_SO2_AQI_UN_${month.id}_2024`,
  }));

  const maps: (
    | "Accessibility"
    | "Design Of Road Network"
    | "Opportunity"
    | "Indices"
    | "Air Quality"
    | "NO2 Air Quality Index Timeseries 2024"
    | "SO2 Air Quality Index Timeseries 2024"
    | "PM2.5 2025 Timeseries"
  )[] = [
    "Accessibility",
    "Design Of Road Network",
    "Opportunity",
    "Indices",
    "Air Quality",
    "NO2 Air Quality Index Timeseries 2024",
    "SO2 Air Quality Index Timeseries 2024",
    "PM2.5 2025 Timeseries",
  ];

  const mapData = {
    Accessibility: [
      {
        id: 1,
        name: "estates_nairobi",
        apilink: `https://${ipAddress}/products/maps-wfs/estates_nairobi/`,
        legendUrl: null,
      },
      {
        id: 2,
        name: "nbihealthaccess",
        apilink: `https://${ipAddress}/products/maps-wfs/nbihealthaccess/`,
        legendUrl: null,
      },
      {
        id: 3,
        name: "schoolaccessindexwalk",
        apilink: `https://${ipAddress}/products/maps-wfs/schoolaccessindexwalk/`,
        legendUrl: null,
      },
      {
        id: 4,
        name: "jobaccessindex",
        apilink: `https://${ipAddress}/products/maps-wfs/jobaccessindex/`,
        legendUrl: null,
      },
    ],
    //"http://127.0.0.1:8000/products/maps-wfs/sdna_1000meters_2018/"
    //"http://127.0.0.1:8000/products/maps/sdna_1000m2018/",
    "Design Of Road Network": [
      {
        id: 1,
        name: "sdna_1000meters_2018",
        apilink: `https://${ipAddress}/products/maps/sdna_1000m2018/`,
        legendUrl: null,
      },
      {
        id: 2,
        name: "Traffic Patterns",
        apilink: "https://example.com/traffic-patterns",
        legendUrl: null,
      },
    ],
    Opportunity: [
      {
        id: 1,
        name: "hospital_opportunity_25min",
        apilink: `https://${ipAddress}/products/maps-wfs/hospital_opportunity_25min/`,
        legendUrl: null,
      },
    ],
    Indices: [
      {
        id: 1,
        name: "NDVI",
        apilink: `https://${ipAddress}/products/maps-wms/NDVI_modified_Nairobi`,
        legendUrl:
          "https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:NDVI_modified_Nairobi",
      },
      {
        id: 2,
        name: "NDBI",
        apilink: `https://${ipAddress}/products/maps-wms/NDBI_Nairobi`,
        legendUrl:
          "https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:NDBI_Nairobi",
      },
    ],

    "Air Quality": [
      {
        id: 1,
        name: "NO2",
        apilink: `https://${ipAddress}/products/maps-wms/Nairobi_NO2_AQI`,
        legendUrl:
          "https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:Nairobi_NO2_AQI",
      },
      {
        id: 2,
        name: "SO2",
        apilink: `https://${ipAddress}/products/maps-wms/Nairobi_SO2_AQI`,
        legendUrl:
          "https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:Nairobi_SO2_AQI",
      },
    ],

    "NO2 Air Quality Index Timeseries 2024": no2AirQualityIndexTimeseries2024,
    "SO2 Air Quality Index Timeseries 2024": so2AirQualityIndexTimeseries2024,
    "PM2.5 2025 Timeseries": [
      {
        id: 1,
        name: "PM2.5 JAN Nairobi 2025",
        apilink: `https://${ipAddress}/products/maps-wms/PM_25_JAN_Nairobi_2025`,
        legendUrl:
          "https://mtaawetu.com/geoserver/personal/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=personal:PM_25_JAN_Nairobi_2025",
      },
    ],
  };

  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-white">
      {/* Sidebar */}
      <aside className="z-20 bg-blue-400 text-white p-5 flex flex-col space-y-6 w-16 items-center">
        <button className="text-white">
          <Menu color="white" />
        </button>
        <nav className="flex flex-col space-y-6 items-center">
          <a href="#" className="flex flex-col items-center space-y-1">
            <Home color="white" />
            <span className="text-xs font-bold uppercase">
              County <br />
              Select
            </span>
          </a>
          <a href="#" className="flex flex-col items-center space-y-1">
            <Map color="white" />
            <span className="text-xs font-bold uppercase">Map</span>
          </a>
          <a href="#" className="flex flex-col items-center space-y-1">
            <List color="white" />
            <span className="text-xs font-bold uppercase">List</span>
          </a>
          <a href="#" className="flex flex-col items-center space-y-1">
            <LayoutDashboard color="white" />
            <span className="text-xs font-bold uppercase">
              Dash <br></br>board
            </span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-row items-center justify-between bg-white shadow-lg p-1">
          <Search
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            flyTo={flyTo}
            fetchSuggestions={fetchSuggestions}
          />
        </div>

        {/* Map and content area */}
        <div className="flex-grow relative overflow-hidden">
          <div id="map" className="w-full h-full rounded-sm" />
          {/* Parent wrapper for both panels */}
          <div className="absolute top-2 left-8 flex gap-4 h-full">
            {/* Time Series Panel (Side by Side) */}
            <div className="bg-white p-4 rounded-md shadow-md border border-gray-300 w-80 h-4/5 overflow-scroll">
              <h4 className="font-semibold text-blue-600 mb-2">Time Series</h4>
              <p className="text-gray-600 text-sm mb-4">
                Select a category to view and interact with its corresponding
                map layers.
              </p>
              <div className="space-y-2">
                {maps.map((mapName) => (
                  <SelectMenuMap
                    key={mapName}
                    items={mapData[mapName]}
                    category={mapName}
                    onClick={(name, apilink, legendUrl) => {
                      if (apilink.includes("maps-wms")) {
                        addWMSLayer(mapRef.current, name, apilink, name);
                        showLegend(legendUrl, name);
                      } else {
                        addGeoJsonLayer(mapRef.current, apilink, name, "name");
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Layers Panel */}
            <div className="bg-white ps-4 pe-4 pb-4 rounded-md shadow-md border border-gray-300 w-80 h-4/5 overflow-scroll">
              {/* Toggle Buttons */}
              <div className=" sticky top-0 left-0  z-10 bg-white pt-4 mt-0 flex justify-between mb-4 ">
                <button
                  onClick={() => setActivePanel("select")}
                  className={`px-4 py-2 rounded-md ${
                    activePanel === "select"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-blue-500"
                  }`}
                >
                  Select Layers
                </button>
                <button
                  onClick={() => setActivePanel("loaded")}
                  className={`px-4 py-2 rounded-md ${
                    activePanel === "loaded"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-blue-500"
                  }`}
                >
                  Loaded Layers
                </button>
              </div>

              {/* Panels */}
              {activePanel === "select" ? (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2 ">
                    Map Categories
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Select a category to view and interact with its
                    corresponding map layers.
                  </p>
                  <div className="space-y-2">
                    {maps.map((mapName) => (
                      <SelectMenuMap
                        key={mapName}
                        items={mapData[mapName]}
                        category={mapName}
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
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-blue-500 mb-2">
                    Loaded Layers
                  </h4>
                  <div className="ml-1 mt-2 space-y-2">
                    {loadedLayers.map((layer) => (
                      <div
                        key={layer}
                        className="rounded-md px-2 py-2 flex items-center justify-between ring-1 ring-inset ring-gray-300 hover:bg-green-300"
                      >
                        <div className="overflow-hidden w-3/4">
                          <span>{layer}</span>
                        </div>
                        <div className="flex mt-1">
                          <DropDownComponent />
                          <button
                            className="rounded-md px-1 py-1 mr-2 text-sm text-white bg-red-500 hover:bg-red-700"
                            onClick={() => removeLayer(layer)}
                          >
                            <X size="16" />
                          </button>
                          <ToggleButton layerId={layer} map={mapRef.current} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
