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
    [key: string]: any; // This will accept any data object
  };
  areaName: string;
}

export function SheetComponent({ statsData, areaName }: SheetComponentProps) {
  // Check if `access_index_percent` is available
  const accessIndexPercent = statsData.mean_access_index_percent
    ? parseFloat(statsData.mean_access_index_percent)
    : null;

  // Data for doughnut chart if `access_index_percent` exists
  const chartData = accessIndexPercent
    ? {
        labels: ["Access Index (%)", "Remaining"],
        datasets: [
          {
            data: [accessIndexPercent, 100 - accessIndexPercent],
            backgroundColor: ["#003f88", "#e0e0e0"],
            hoverBackgroundColor: ["#5b9aff", "#cccccc"],
            borderWidth: 0,
          },
        ],
      }
    : null;

  // Chart options
  const chartOptions = {
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

  // Bar chart data for NO2 monthly stats
  const barData = {
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
        label: "NO2 Monthly Mean",
        data: [
          statsData.mean_no2_janmea,
          statsData.mean_no2_febmea,
          statsData.mean_no2_marmea,
          statsData.mean_no2_aprmea,
          statsData.mean_no2_maymea,
          statsData.mean_no2_junmea,
          statsData.mean_no2_julmea,
          statsData.mean_no2_augmea,
          statsData.mean_no2_sepmea,
          statsData.mean_no2_octmea,
          statsData.mean_no2_novmea,
          statsData.mean_no2_decmea,
        ],
        backgroundColor: "#4caf50",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
  };

  // Bar chart data for NO2 monthly stats
  const barData_so2 = {
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
        label: "SO2 Monthly Mean",
        data: [
          statsData.mean_so2_janmea,
          statsData.mean_so2_febmea,
          statsData.mean_so2_marmea,
          statsData.mean_so2_aprmea,
          statsData.mean_so2_maymea,
          statsData.mean_so2_junmea,
          statsData.mean_so2_julmea,
          statsData.mean_so2_augmea,
          statsData.mean_so2_sepmea,
          statsData.mean_so2_octmea,
          statsData.mean_so2_novmea,
          statsData.mean_so2_decmea,
        ],
        backgroundColor: "#ff5722",
      },
    ],
  };

  const barOptions_so2 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
  };

  // Line chart data for SO2 monthly stats
  const lineData = {
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
        label: "SO2 Monthly Mean",
        data: [
          statsData.mean_so2_janmea,
          statsData.mean_so2_febmea,
          statsData.mean_so2_marmea,
          statsData.mean_so2_aprmea,
          statsData.mean_so2_maymea,
          statsData.mean_so2_junmea,
          statsData.mean_so2_julmea,
          statsData.mean_so2_augmea,
          statsData.mean_so2_sepmea,
          statsData.mean_so2_octmea,
          statsData.mean_so2_novmea,
          statsData.mean_so2_decmea,
        ],
        borderColor: "#ff5722",
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          {/* <Button color="#3E63DD">Analyse</Button> */}
          <Button className="bg-blue-800 hover:bg-blue-500">Analyse</Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>{areaName} Statistics Overview</SheetTitle>
            <SheetDescription>
              Visualizing the key statistics of the data.
            </SheetDescription>
          </SheetHeader>

          <div style={{ marginTop: "20px", textAlign: "end" }}>
            {/* Render doughnut chart if access_index_percent exists */}
            {accessIndexPercent !== null ? (
              <>
                <Doughnut data={chartData!} options={chartOptions} />
                <div style={{ marginTop: "10px", color: "#555" }}>
                  <strong>Average Access Index Percentage:</strong>{" "}
                  {accessIndexPercent.toFixed(2)}%
                  <br />
                  <strong>Max Value:</strong>{" "}
                  {statsData.max_access_index || "N/A"}
                  <br />
                  <strong>Min Value:</strong>{" "}
                  {statsData.min_access_index || "N/A"}
                </div>
              </>
            ) : (
              <div style={{ marginTop: "20px" }}>
                <h3>Monthly Statistics</h3>

                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "10px",
                    }}
                  >
                    Nitrogen dioxide (NO<sub>2</sub>) is a harmful gas mainly
                    produced by vehicle emissions and industrial activities. It
                    can irritate the respiratory system and contribute to the
                    formation of ground-level ozone and smog.
                  </p>
                  <Bar data={barData} options={barOptions} />
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "10px",
                    }}
                  >
                    Sulfur dioxide (SO<sub>2</sub>) is primarily emitted from
                    burning fossil fuels and industrial processes. It can cause
                    respiratory problems and contributes to the formation of
                    acid rain, affecting ecosystems and human health.
                  </p>
                  <Bar data={barData_so2} options={barOptions_so2} />
                </div>
              </div>
            )}

            {/* Display all the stats in a list */}
            <ul
              style={{ marginTop: "20px", paddingLeft: "20px", color: "#555" }}
            >
              {Object.entries(statsData).map(([key, value]) => (
                <li
                  key={key}
                  style={{ marginBottom: "10px", fontSize: "10px" }}
                >
                  <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                  {typeof value === "number" ? value.toFixed(2) : value}
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
