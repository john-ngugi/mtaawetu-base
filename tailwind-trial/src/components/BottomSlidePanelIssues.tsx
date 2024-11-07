import React, { useState } from "react";
import maplibregl from "maplibre-gl";
import KisiiForm from "../components/KisiiForm";

interface props {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lng: number, lat: number) => void;
  isVisible: boolean;
  onClose: () => void;
}
function BottomSlidePanel({
  lat,
  lng,
  isVisible,
  onLocationSelect,
  onClose,
}: props) {
  const [location, setLocation] = useState<maplibregl.LngLat>(
    new maplibregl.LngLat(0, 0)
  ); // Initial values

  const [isPopVisible, setIsPopVisible] = useState(false); // State to manage visibility

  const handleClose = () => {
    setIsPopVisible(false); // Hide the message when the button is clicked
  };

  const handleMapClick = (lng: number, lat: number) => {
    setLocation(new maplibregl.LngLat(lng, lat));
    onLocationSelect(lng, lat); // Center map to the clicked location
  };

  return (
    <>
      <div
        className={`w-full md:right-0 md:w-1/2  z-10 fixed bottom-0  md:h-1/2 h-72 bg-white shadow-lg transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <section className="issues-form-section rounded h-full">
          {" "}
          {/* Make this full height */}
          <div className=" w-full h-full p-5">
            <div
              className="flex justify-between items-center"
              id="issues-header"
            >
              <h3
                className="title-name text-gray-700 text-lg font-semibold"
                id="issues-title"
              >
                Location: {lat} <span className="mr-2">{lng}</span>
              </h3>
              <button
                className="text-center outline pl-2 pr-2 outline-1 rounded outline-gray-400 close-button text-gray-400 hover:text-white hover:bg-green-600"
                onClick={onClose}
                aria-label="Close"
              >
                <span className="close-icon text-2xl text-center">&times;</span>
              </button>
            </div>
            <hr className="my-2" />
            {isPopVisible && ( // Render the div conditionally based on the state
              <div className=" rounded-sm message-info-popup p-1 md:p-3 bg-green-700 flex flex-row justify-between">
                <p className="text-sm text-white md:text-base">
                  Your issues were submitted successfully
                </p>
                <button
                  className="text-center   outline p-1 m-1 md:pl-2 md:pr-2 outline-1 rounded outline-white close-button  text-white hover:text-white hover:bg-green-600"
                  onClick={handleClose} // Call the function on click
                  aria-label="Close"
                >
                  <span className="close-icon md:text-2xl text-center">
                    &times;
                  </span>
                </button>
              </div>
            )}
            {/* Adjust the scrolling area */}
            <div className=" rounded overflow-y-auto h-full bg-white">
              {" "}
              {/* Set height relative to the panel */}
              <form
                id="popupForm"
                className="flex flex-col p-2 text-gray-700 font-semibold"
              >
                <div className="flex flex-col  md:justify-around">
                  <div>
                    <KisiiForm
                      options={[
                        "Residents",
                        "Traders",
                        "project implementer",
                        "Funding Agencies",
                        "Other Interested Parties",
                      ]}
                      heading="Category of Complaint"
                    />
                    <KisiiForm
                      options={[
                        "Service Related",
                        "project Related",
                        "Enforcement Related",
                        "Revenue Related",
                        "Approval related",
                      ]}
                      heading="Category of Grivance"
                    />
                  </div>
                  <div className="ml-2">
                    <h3 className="mt-2 mb-2 font-bold text-lg font-Nunito">
                      Grivance Description
                    </h3>
                    <label className="block mb-1 text-sm text-slate-800 mt-2">
                      What are the three main problems in this neighbourhood
                      (choose any three)
                    </label>
                    {[
                      "Poor roads",
                      "Water availability (hakuna maji)",
                      "Sewer and sanitation",
                      "Solid Waste (taka taka)",
                      "Noise (kelele)",
                      "Crime (wizi)",
                      "Air pollution (hewa mbaya)",
                      "Transport (hakuna matatu karibu)",
                      "Illegal / unplanned development (nyumba haramu)",
                    ].map((issue) => (
                      <div
                        className="font-Nunito text-md text-gray-700"
                        key={issue}
                      >
                        <input
                          className="issues-checkbox mr-2"
                          type="checkbox"
                          id={issue.replace(/\s+/g, "")}
                          value={issue}
                        />
                        <label
                          className="text-sm md:text-base "
                          htmlFor={issue.replace(/\s+/g, "")}
                        >
                          {issue}
                        </label>
                      </div>
                    ))}
                    <div className="flex flex-col">
                      <label
                        htmlFor="otherIssues"
                        className="text-gray-700 mt-2 mb-2"
                      >
                        Other (please specify in the space below)
                      </label>
                      <textarea
                        className="p-2 text-sm w-full rounded h-28 text-gray-600 outline outline-1 outline-gray-300"
                        id="otherIssues"
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="w-full flex justify-center align-middle mt-3">
                  <input
                    className="w-full rounded-md px-1 p-3 text-sm text-white bg-blue-500 hover:bg-blue-700 md:w-1/2 mt-3 issues-submit-btn"
                    type="button"
                    value="Submit"
                    onClick={() => {
                      // Handle form submission logic here
                      // alert("Form submitted!");
                      setIsPopVisible(true);
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default BottomSlidePanel;
