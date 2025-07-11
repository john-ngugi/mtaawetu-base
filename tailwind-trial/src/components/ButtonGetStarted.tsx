import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function BtnGetStarted() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/login")}
      className="relative group px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-10"
    >
      <span className="relative z-10">Get Started</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}

export default BtnGetStarted;
