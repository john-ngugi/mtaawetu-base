// import React, { useState } from "react";
// import {
//     Home,
//     List,
//     LayoutDashboard,
//     TimerReset,
//   } from "lucide-react";

// const Notebooks: React.FC = () => {
// const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const handleTabClick = () => {
//         setIsTimeSeriesVisible(true);
//       };

//       const handleOtherClick = () => {
//         setIsTimeSeriesVisible(false);
//       };

//       const handleHomeClick = () => {
//         setPanelsVisible(true);
//       };
//     return (
//        <div>
//         {/* Navigation Links */}
//             <nav className="flex-1 p-4">
//               <div className={`space-y-1 ${isSidebarOpen ? "mt-2" : "mt-6"}`}>
//                 <button
//                   onClick={handleHomeClick}
//                   className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
//                 >
//                   <Home
//                     size={isSidebarOpen ? 18 : 22}
//                     className={`${!isSidebarOpen && "mx-auto"}`}
//                   />
//                   {isSidebarOpen && (
//                     <span className="ml-3 font-medium">Home</span>
//                   )}
//                 </button>

//                 <button
//                   onClick={handleTabClick}
//                   className={`flex items-center w-full p-3 rounded-lg transition-colors ${
//                     isTimeSeriesVisible ? "bg-blue-700/70" : "hover:bg-blue-700/50"
//                   }`}
//                 >
//                   <TimerReset
//                     size={isSidebarOpen ? 18 : 22}
//                     className={`${!isSidebarOpen && "mx-auto"}`}
//                   />
//                   {isSidebarOpen && (
//                     <span className="ml-3 font-medium">Time Series</span>
//                   )}
//                 </button>

//                 <button
//                   onClick={handleOtherClick}
//                   className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
//                 >
//                   <List
//                     size={isSidebarOpen ? 18 : 22}
//                     className={`${!isSidebarOpen && "mx-auto"}`}
//                   />
//                   {isSidebarOpen && (
//                     <span className="ml-3 font-medium">List View</span>
//                   )}
//                 </button>

//                 <button
//                   onClick={handleOtherClick}
//                   className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
//                 >
//                   <LayoutDashboard
//                     size={isSidebarOpen ? 18 : 22}
//                     className={`${!isSidebarOpen && "mx-auto"}`}
//                   />
//                   {isSidebarOpen && (
//                     <span className="ml-3 font-medium">Dashboard</span>
//                   )}
//                 </button>
//               </div>
//             </nav>

//             {/* Footer Area */}
//             {isSidebarOpen && (
//               <div className="p-4 border-t border-blue-700/50">
//                 <div className="text-xs text-blue-200/70">GeoViz Platform v2.0</div>
//               </div>
//             )}
//           </aside>
//          </div>
//         )
// }
