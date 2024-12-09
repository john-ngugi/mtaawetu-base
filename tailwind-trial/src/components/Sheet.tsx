
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the props interface
interface SheetComponentProps {
  statsData: {
    [key: string]: any; // This will accept any data object
  };
  
}

export function SheetComponent({ statsData }: SheetComponentProps) {
  // Check if `access_index_percent` is available
  const accessIndexPercent = statsData.mean_access_index_percent
    ? parseFloat(statsData.mean_access_index_percent)
    : null;

  // Chart data for doughnut chart (only if `access_index_percent` exists)
  const chartData = accessIndexPercent
    ? {
        labels: ["Access Index (%)", "Remaining"],
        datasets: [
          {
            data: [accessIndexPercent, 100 - accessIndexPercent],
            backgroundColor: ["#003f88", "#e0e0e0"], // navy for percentage, gray for remaining
            hoverBackgroundColor: ["#5b9aff", "#cccccc"], // Brighter red and gray on hover
            borderWidth: 0,
          },
        ],
      }
    : null;

  // Chart options
  const chartOptions = {
    responsive: true,
    cutout: "70%", // Inner circle size for doughnut
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
      animateRotate: true, // Enables smooth rotation animation
      animateScale: true,  // Enables scale-up animation
    },
  };

  return (
    <div>
      <Sheet>
      <SheetTrigger asChild>
        <Button>View Stats</Button>
      </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Statistics Overview</SheetTitle>
            <SheetDescription>
              Visualizing the key statistics of the data.
            </SheetDescription>
          </SheetHeader>

          <div style={{ marginTop: "20px", textAlign: "end" }}>
            {/* Render chart if access_index_percent exists */}
            {accessIndexPercent !== null ? (
              <>
                <Doughnut data={chartData!} options={chartOptions} />
                <div style={{ marginTop: "10px", color: "#555" }}>
                  <strong>Average Access Index Percentage:</strong>{" "}
                  {accessIndexPercent.toFixed(2)}%
                  <br />
                  <strong>Max Value:</strong> {statsData.max_access_index || "N/A"}
                  <br />
                  <strong>Min Value:</strong> {statsData.min_access_index || "N/A"}
                </div>
              </>
            ) : (
              <div style={{ marginTop: "20px", color: "#666" }}>
                <p>
                  <strong>No Access Index Data Available</strong>
                </p>
                <p>Please provide statistics containing an `access_index_percent` value.</p>
              </div>
            )}

            {/* Display all the stats in a list */}
            <ul style={{ marginTop: "20px", paddingLeft: "20px", color: "#555" }}>
              {Object.entries(statsData).map(([key, value]) => (
                <li key={key} style={{ marginBottom: "10px", fontSize:"10px" }}>
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
