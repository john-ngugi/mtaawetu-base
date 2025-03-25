import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TryAIButtonProps {
  onClick: () => void; // Accepts an onClick prop
}

export default function TryAIButton({ onClick }: TryAIButtonProps) {
  return (
    <motion.button
      id="searchWidgetTrigger" // Keeps the AI trigger functionality
      onClick={onClick} // Handles button click
      className="relative flex items-center gap-2 px-6 py-3 rounded-full m-4 w-3/4 text-white font-semibold transition-all duration-300 shadow-lg overflow-hidden focus:outline-none"
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: "100% 50%" }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "linear-gradient(90deg, #4A00E0, #8E2DE2, #FF416C, #FF4B2B)",
        backgroundSize: "200% 200%",
      }}
    >
      <Sparkles size={20} />
      Try AI
    </motion.button>
  );
}
