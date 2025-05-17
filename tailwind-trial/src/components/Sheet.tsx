import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);

// Define the props interface
interface SheetComponentProps {
  statsData: {
    [key: string]: any;
  };
  areaName: string;
  percent?: number;
  dataType?: string; // Optional prop to explicitly set the data type
}

// Data type constants
const DATA_TYPES = {
  ACCESS_INDEX: "access_index",
  POLLUTION: "pollution",
  DEMOGRAPHICS: "demographics",
  CLIMATE: "climate",
  GENERIC: "generic",
};

export function SheetComponent({
  statsData,
  areaName,
  percent,
  dataType,
}: SheetComponentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Detect the data type based on the keys in statsData
  const detectDataType = () => {
    if (dataType) {
      return dataType; // Use the explicitly provided type if available
    }

    const keys = Object.keys(statsData);

    if (keys.some((key) => key.includes("access_index"))) {
      return DATA_TYPES.ACCESS_INDEX;
    }

    if (
      keys.some(
        (key) =>
          key.includes("no2") || key.includes("so2") || key.includes("pm")
      )
    ) {
      return DATA_TYPES.POLLUTION;
    }

    if (
      keys.some(
        (key) =>
          key.includes("population") ||
          key.includes("household") ||
          key.includes("income")
      )
    ) {
      return DATA_TYPES.DEMOGRAPHICS;
    }

    if (
      keys.some(
        (key) =>
          key.includes("temp") ||
          key.includes("rainfall") ||
          key.includes("humidity")
      )
    ) {
      return DATA_TYPES.CLIMATE;
    }

    return DATA_TYPES.GENERIC;
  };

  const currentDataType = detectDataType();

  // Extract monthly data for any measurement type
  const extractMonthlyData = (prefix: string) => {
    const months = [
      "janmea",
      "febmea",
      "marmea",
      "aprmea",
      "maymea",
      "junmea",
      "julmea",
      "augmea",
      "sepmea",
      "octmea",
      "novmea",
      "decmea",
    ];

    // Check if the data uses the 'mean_' prefix or not
    const usesMeanPrefix = Object.keys(statsData).some((key) =>
      key.startsWith(`mean_${prefix}`)
    );

    const actualPrefix = usesMeanPrefix ? `mean_${prefix}` : prefix;

    return months.map((month) => {
      const value = statsData[`${actualPrefix}_${month}`];
      return value !== undefined ? parseFloat(value) : 0;
    });
  };

  // Calculate statistics for any array of values
  const calculateStats = (data: number[]) => {
    const validValues = data.filter((val) => !isNaN(val) && val !== null);
    if (validValues.length === 0) return { max: 0, min: 0, avg: 0 };

    return {
      max: Math.max(...validValues),
      min: Math.min(...validValues),
      avg: validValues.reduce((sum, val) => sum + val, 0) / validValues.length,
    };
  };

  // Access Index Data & Chart
  const accessIndexPercent = statsData.mean_access_index_percent
    ? parseFloat(statsData.mean_access_index_percent)
    : null;

  // Ensure accessValue is always a number
  const accessValue =
    typeof percent === "number"
      ? percent
      : accessIndexPercent !== null
      ? accessIndexPercent
      : 0;

  const accessChartData = {
    labels: ["Access Index (%)", "Remaining"],
    datasets: [
      {
        data: [accessValue, 100 - accessValue],
        backgroundColor: ["#003f88", "#e0e0e0"],
        hoverBackgroundColor: ["#5b9aff", "#cccccc"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Create a chart configuration for monthly data
  const createMonthlyChart = (prefix: string, label: string, color: string) => {
    const data = extractMonthlyData(prefix);

    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: color,
          borderColor: color,
          fill: false,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
  };

  // Generic data visualization for any numeric values
  const createGenericDataView = () => {
    const numericData: { key: string; value: number }[] = [];

    Object.entries(statsData).forEach(([key, value]) => {
      if (typeof value === "number" || !isNaN(parseFloat(value))) {
        numericData.push({
          key: key.replace(/_/g, " ").toUpperCase(),
          value: typeof value === "number" ? value : parseFloat(value),
        });
      }
    });

    // Only show top 10 values for readability
    const topValues = numericData.slice(0, 10);

    return {
      labels: topValues.map((item) => item.key),
      datasets: [
        {
          label: "Values",
          data: topValues.map((item) => item.value),
          backgroundColor: "#4287f5",
        },
      ],
    };
  };

  // Get data about available metrics
  const getAvailableMetrics = () => {
    const metrics = [];

    if (currentDataType === DATA_TYPES.POLLUTION) {
      if (Object.keys(statsData).some((key) => key.includes("no2"))) {
        metrics.push({
          id: "no2",
          name: "Nitrogen Dioxide (NO₂)",
          color: "#4caf50",
          description:
            "Nitrogen dioxide is a harmful gas mainly produced by vehicle emissions and industrial activities.",
        });
      }

      if (Object.keys(statsData).some((key) => key.includes("so2"))) {
        metrics.push({
          id: "so2",
          name: "Sulfur Dioxide (SO₂)",
          color: "#ff5722",
          description:
            "Sulfur dioxide is primarily emitted from burning fossil fuels and industrial processes.",
        });
      }

      if (Object.keys(statsData).some((key) => key.includes("pm10"))) {
        metrics.push({
          id: "pm10",
          name: "Particulate Matter (PM10)",
          color: "#9c27b0",
          description:
            "PM10 includes particles with a diameter of 10 micrometers or less that can be inhaled into the lungs.",
        });
      }

      if (Object.keys(statsData).some((key) => key.includes("pm25"))) {
        metrics.push({
          id: "pm25",
          name: "Fine Particulate Matter (PM2.5)",
          color: "#e91e63",
          description:
            "PM2.5 includes fine particles with a diameter of 2.5 micrometers or less, which can penetrate deep into the lungs.",
        });
      }
    }

    if (currentDataType === DATA_TYPES.CLIMATE) {
      if (Object.keys(statsData).some((key) => key.includes("temp"))) {
        metrics.push({
          id: "temp",
          name: "Temperature",
          color: "#f44336",
          description: "Average temperature measurements throughout the year.",
        });
      }

      if (Object.keys(statsData).some((key) => key.includes("rainfall"))) {
        metrics.push({
          id: "rainfall",
          name: "Rainfall",
          color: "#2196f3",
          description: "Precipitation measurements throughout the year.",
        });
      }
    }

    return metrics;
  };

  // Render different content based on the detected data type
  const renderContent = () => {
    switch (currentDataType) {
      case DATA_TYPES.ACCESS_INDEX:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Doughnut data={accessChartData} options={doughnutOptions} />
              <div className="mt-4 text-gray-700">
                <div>
                  <strong>Access Index Percentage:</strong>{" "}
                  <span className="text-4xl font-bold text-blue-800">
                    {typeof accessValue === "number"
                      ? accessValue.toFixed(2)
                      : "0.00"}
                    %
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-bold text-blue-600">
                    What this means:
                  </h2>
                  <p className="mt-2 text-sm">
                    Accessibility Index measures how easily people can reach
                    facilities, considering factors like travel time, distance,
                    road networks, and transportation options. It helps identify
                    underserved areas where residents may face challenges in
                    accessing timely service delivery.
                    <br />
                    <br />
                    By analyzing this index, policymakers and planners can
                    better allocate resources, improve infrastructure, and
                    ensure that services are equitably distributed across
                    regions.
                    <br />
                    <br />
                    You have a{" "}
                    <span className="font-bold text-blue-700">
                      {typeof accessValue === "number"
                        ? accessValue.toFixed(2)
                        : "0.00"}
                      %
                    </span>{" "}
                    chance of accessing the selected service if you live in this
                    area.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <strong>Max Value:</strong>
                    <br />
                    {statsData.max_access_index || "N/A"}
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <strong>Min Value:</strong>
                    <br />
                    {statsData.min_access_index || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case DATA_TYPES.POLLUTION:
        const metrics = getAvailableMetrics();

        return (
          <div className="space-y-8">
            <div className="flex space-x-2 border-b">
              <button
                className={`px-3 py-2 ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 font-bold"
                    : ""
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  className={`px-3 py-2 ${
                    activeTab === metric.id
                      ? "border-b-2 border-blue-500 font-bold"
                      : ""
                  }`}
                  onClick={() => setActiveTab(metric.id)}
                >
                  {metric.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {activeTab === "overview" ? (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Pollution Overview</h3>
                <p className="text-sm text-gray-600">
                  This area has data for {metrics.length} pollution metrics.
                  Select a specific tab to see detailed information for each
                  pollutant.
                </p>

                {metrics.map((metric) => {
                  const data = extractMonthlyData(metric.id);
                  const stats = calculateStats(data);

                  return (
                    <div key={metric.id} className="p-4 border rounded-lg">
                      <h4 className="font-bold">{metric.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {metric.description}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <div className="text-gray-500">Max</div>
                          <div className="font-bold">
                            {stats.max.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <div className="text-gray-500">Min</div>
                          <div className="font-bold">
                            {stats.min.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <div className="text-gray-500">Avg</div>
                          <div className="font-bold">
                            {stats.avg.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              metrics.map((metric) => {
                if (activeTab !== metric.id) return null;

                const chartData = createMonthlyChart(
                  metric.id,
                  metric.name,
                  metric.color
                );

                const data = extractMonthlyData(metric.id);
                const stats = calculateStats(data);

                return (
                  <div key={metric.id} className="space-y-4">
                    <h3 className="text-lg font-bold">{metric.name}</h3>
                    <p className="text-sm text-gray-600">
                      {metric.description}
                    </p>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <div className="text-sm text-gray-500">Maximum</div>
                          <div className="text-xl font-bold">
                            {stats.max.toFixed(2)} µg/m³
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Minimum</div>
                          <div className="text-xl font-bold">
                            {stats.min.toFixed(2)} µg/m³
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Average</div>
                          <div className="text-xl font-bold">
                            {stats.avg.toFixed(2)} µg/m³
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Monthly Trend</h4>
                      <Bar data={chartData} options={chartOptions} />
                      <Line data={chartData} options={chartOptions} />
                      <div className="text-sm text-gray-500 mt-2">
                        These charts show monthly variations of{" "}
                        {metric.name.toLowerCase()} levels throughout the year.
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case DATA_TYPES.DEMOGRAPHICS:
        // Handle demographic data
        // Fix for the first code snippet (Demographic Information section)
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Demographic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(statsData)
                .filter(
                  (
                    [, value] // Using underscore to indicate unused variable
                  ) => typeof value === "number" || !isNaN(parseFloat(value))
                )
                .map(([key, value]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-500">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className="text-xl font-bold">
                      {typeof value === "number"
                        ? value.toFixed(2)
                        : parseFloat(value).toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
            <Bar data={createGenericDataView()} options={chartOptions} />
          </div>
        );

      case DATA_TYPES.CLIMATE:
        // Handle climate data
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Climate Data</h3>
            <div className="space-y-8">
              {getAvailableMetrics().map((metric) => {
                const chartData = createMonthlyChart(
                  metric.id,
                  metric.name,
                  metric.color
                );

                return (
                  <div key={metric.id} className="space-y-2">
                    <h4 className="font-medium">{metric.name}</h4>
                    <p className="text-sm text-gray-600">
                      {metric.description}
                    </p>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                );
              })}
            </div>
          </div>
        );

      case DATA_TYPES.GENERIC:
      default:
        // Default view for any data
        // Fix for the second code snippet (Data Overview section)
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Data Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(statsData)
                .filter(
                  (
                    [, value] // Using underscore to indicate unused variable
                  ) => typeof value === "number" || !isNaN(parseFloat(value))
                )
                .slice(0, 6) // Limit to 6 items for this view
                .map(([key, value]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-500">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className="text-xl font-bold">
                      {typeof value === "number"
                        ? value.toFixed(2)
                        : parseFloat(value).toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-blue-800 hover:bg-blue-500">Analyse</Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>{areaName} Statistics</SheetTitle>
            <SheetDescription>
              {currentDataType.replace("_", " ").charAt(0).toUpperCase() +
                currentDataType.replace("_", " ").slice(1)}{" "}
              data for {areaName}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">{renderContent()}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
