// // Notebooks.tsx
// import React, { useState } from "react";
// import {
//   Home,
//   List,
//   LayoutDashboard,
//   TimerReset,
//   ArrowLeft,
//   Menu,
//   Search,
// } from "lucide-react";
// import NotebookList from "../components/NotebookList";
// import NotebookDetail from "../components/NotebookDetail";
// import { useNavigate } from "react-router-dom";
// interface Notebook {
//   id: number;
//   title: string;
//   file: string;
//   created_at: string;
//   notebook_html: string;
// }

// const Notebooks: React.FC = () => {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isClicked, setIsClicked] = useState(false);
//   const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(
//     null
//   );

//   const handleSelectNotebook = (notebook: Notebook) => {
//     setSelectedNotebook(notebook);
//   };

//   const handleBackToList = () => {
//     setSelectedNotebook(null);
//   };

//   return (
//     <div className="flex flex-row md:flex-row h-screen bg-white">
//       <aside
//         className={`fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out ${
//           isSidebarOpen ? "w-64" : "w-20"
//         }`}
//       >
//         {/* Logo Area */}
//         <div className="flex items-center justify-between p-4 border-b border-blue-700/50">
//           {isSidebarOpen && (
//             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
//               Mtaa Wetu
//             </h1>
//           )}
//           <button
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             className="p-2 rounded-md hover:bg-blue-700/50 transition-colors"
//             aria-label="Toggle sidebar"
//           >
//             {isSidebarOpen ? <ArrowLeft size={20} /> : <Menu size={20} />}
//           </button>
//         </div>
//         {isSidebarOpen && (
//           <div className="flex items-center w-full p-3 rounded-lg transition-colors">
//             <Search size={20} />
//             <span className="ml-2 text-sm font-medium">Search</span>
//           </div>
//         )}
//         <nav className="flex-1 p-4">
//           <div className={`space-y-1 ${isSidebarOpen ? "mt-2" : "mt-6"}`}>
//             <button className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors">
//               <Home
//                 size={isSidebarOpen ? 18 : 22}
//                 className={`${!isSidebarOpen && "mx-auto"}`}
//               />
//               {isSidebarOpen && <span className="ml-3 font-medium">Home</span>}
//             </button>
//             <button
//               className={`flex items-center w-full p-3 rounded-lg transition-colors ${
//                 isClicked ? "bg-blue-700/70" : "hover:bg-blue-700/50"
//               }`}
//             >
//               <TimerReset
//                 size={isSidebarOpen ? 18 : 22}
//                 className={`${!isSidebarOpen && "mx-auto"}`}
//               />
//               {isSidebarOpen && (
//                 <span className="ml-3 font-medium">Time Series</span>
//               )}
//             </button>
//             <button
//               onClick={() => {
//                 navigate("/map");
//               }}
//               className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
//             >
//               <List
//                 size={isSidebarOpen ? 18 : 22}
//                 className={`${!isSidebarOpen && "mx-auto"}`}
//               />
//               {isSidebarOpen && (
//                 <span className="ml-3 font-medium">List View</span>
//               )}
//             </button>
//             <button className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700/50 transition-colors">
//               <LayoutDashboard
//                 size={isSidebarOpen ? 18 : 22}
//                 className={`${!isSidebarOpen && "mx-auto"}`}
//               />
//               {isSidebarOpen && (
//                 <span className="ml-3 font-medium">Dashboard</span>
//               )}
//             </button>
//           </div>
//         </nav>
//       </aside>
//       <div className="flex-1 ps-20 overflow-y-auto">
//         <div className="flex flex-col md:flex-row h-1/4 w-full bg-gray-500">
//           <h2 className="flex items-center justify-center w-full h-1/4 text-2xl md:text-2xl font-bold mt-10 ps-5 text-white">
//             Find your notebooks here
//           </h2>
//         </div>
//         <div className="p-4">
//           {!selectedNotebook ? (
//             <NotebookList onSelect={handleSelectNotebook} />
//           ) : (
//             <NotebookDetail
//               notebook={selectedNotebook}
//               onBack={handleBackToList}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Notebooks;
