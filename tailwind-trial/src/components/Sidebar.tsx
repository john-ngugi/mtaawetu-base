import React from "react";
import { NavLink } from "react-router-dom";

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-slate-300 h-screen flex flex-col">
      <div className="flex items-center justify-center h-16 bg-slate-300">
        <span className="text-white text-2xl">Logo</span>
      </div>
      <nav className="mt-10 flex-grow px-4 space-y-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-800 text-white block py-2.5 px-4 rounded transition duration-200"
              : "text-indigo-300 block py-2.5 px-4 rounded hover:bg-indigo-800 hover:text-white transition duration-200"
          }
        >
          <i className="fas fa-home mr-2"></i> Dashboard
        </NavLink>
        <NavLink
          to="/team"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-800 text-white block py-2.5 px-4 rounded transition duration-200"
              : "text-indigo-300 block py-2.5 px-4 rounded hover:bg-indigo-800 hover:text-white transition duration-200"
          }
        >
          <i className="fas fa-users mr-2"></i> Team
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-800 text-white block py-2.5 px-4 rounded transition duration-200"
              : "text-indigo-300 block py-2.5 px-4 rounded hover:bg-indigo-800 hover:text-white transition duration-200"
          }
        >
          <i className="fas fa-folder mr-2"></i> Projects
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-800 text-white block py-2.5 px-4 rounded transition duration-200"
              : "text-indigo-300 block py-2.5 px-4 rounded hover:bg-indigo-800 hover:text-white transition duration-200"
          }
        >
          <i className="fas fa-calendar mr-2"></i> Calendar
        </NavLink>
        <NavLink
          to="/documents"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-800 text-white block py-2.5 px-4 rounded transition duration-200"
              : "text-indigo-300 block py-2.5 px-4 rounded hover:bg-indigo-800 hover:text-white transition duration-200"
          }
        >
          <i className="fas fa-file-alt mr-2"></i> Documents
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-800 text-white block py-2.5 px-4 rounded transition duration-200"
              : "text-indigo-300 block py-2.5 px-4 rounded hover:bg-indigo-800 hover:text-white transition duration-200"
          }
        >
          <i className="fas fa-chart-pie mr-2"></i> Reports
        </NavLink>
      </nav>
      <div className="flex flex-col p-4">
        <span className="text-indigo-300 text-sm mb-2">Your teams</span>
        <div className="flex space-x-2">
          <button className="w-8 h-8 bg-indigo-800 text-white rounded-full">
            H
          </button>
          <button className="w-8 h-8 bg-indigo-800 text-white rounded-full">
            T
          </button>
          <button className="w-8 h-8 bg-indigo-800 text-white rounded-full">
            W
          </button>
        </div>
      </div>
      <div className="p-4 mt-auto">
        <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-800 transition">
          Settings
        </button>
      </div>
    </div>
  );
};
