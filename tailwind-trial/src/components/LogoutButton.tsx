import React from "react";
import { useAuth } from "../contexts/AuthContext";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will happen automatically via ProtectedRoute
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
