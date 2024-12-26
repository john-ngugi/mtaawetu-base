import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Feature {
  properties: {
    [key: string]: any; // Properties can have various keys and values
  };
}

interface GeoJSONWithFeatures {
  features: Feature[]; // GeoJSON contains an array of features
}

interface CalcPercentagesInterface {
  geojson: GeoJSONWithFeatures;
  column: string; // The property name to extract, e.g., "access_index"
}
export function calcPercentages({ geojson, column }: CalcPercentagesInterface): string {
  // Extract the values of the specified property from each feature
  const values = geojson.features.map(feature => feature.properties[column]);

  // Validate that the array contains only numbers or null
  const isValid = values.every(value => typeof value === "number" || value === null);
  if (!isValid) {
    return JSON.stringify(geojson)
  }

  // Filter out null values for min and max calculations
  const numericValues = values.filter(value => value !== null) as number[];
  if (numericValues.length === 0) {
    throw new Error("No numeric values found in the specified property");
    
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  // Handle the edge case where min equals max (no range)
  const percentages = values.map(value => {
    if (value === null) return 0; // Treat null as 0% for normalization
    if (min === max) return 100; // All values are the same
    return ((value - min) / (max - min)) * 100;
  });

  // Add the "percent" column as a string to each feature's properties
  geojson.features.forEach((feature, index) => {
    feature.properties["percent"] = percentages[index].toFixed(2); // Convert to string with two decimal places
  });

  // Convert the updated GeoJSON object to a string
  return JSON.stringify(geojson);
}



// get the column suggested.

// legendManager.ts
export const showLegend = (legendUrl: string | null, layerName: string) => {
  const legendElement = document.getElementById("legend");
  const legendContent = document.getElementById("legend-content");

  if (!legendElement || !legendContent) {
    console.error("Legend elements are missing in the DOM.");
    return;
  }

  // Ensure legend is visible
  legendElement.classList.remove("hidden");

  // Add legend entry for the new layer
  const listItem = document.createElement("li");
  listItem.id = `legend-${layerName}`; // Unique ID for easy removal
  listItem.innerHTML = `<img src="${legendUrl}" alt="${layerName} legend" class="inline-block mr-2" /> <span>${layerName}</span>`;
  legendContent.appendChild(listItem);
};

export const hideLegend = (layerName: string) => {
  const legendEntry = document.getElementById(`legend-${layerName}`);
  if (legendEntry) {
    legendEntry.remove();
  }

  const legendContent = document.getElementById("legend-content");
  const legendElement = document.getElementById("legend");
  
  // Hide legend if no entries remain
  if (legendContent && legendContent.children.length === 0 && legendElement) {
    legendElement.classList.add("hidden");
  }
};
