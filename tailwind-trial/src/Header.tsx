import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Play,
  Star,
  Users,
  MapPin,
  TrendingUp,
} from "lucide-react";
import BtnGetStarted from "./components/ButtonGetStarted";
const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

const stats = [
  { name: "Active Communities", value: "2,500+", icon: Users },
  { name: "Service Reports", value: "45K+", icon: MapPin },
  { name: "Satisfaction Score", value: "4.8/5", icon: Star },
  { name: "Growth Rate", value: "23%", icon: TrendingUp },
];

// Typing Effect Hook
const useTypingEffect = (words: String[], speed = 100, pause = 2000) => {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayText.length < currentWord.length) {
            setDisplayText(currentWord.slice(0, displayText.length + 1));
          } else {
            // Pause before deleting
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          // Deleting
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [displayText, wordIndex, isDeleting, words, speed, pause]);

  return displayText;
};

// Header Component
const Header = () => {
  const typingWords = ["Mtaas", "Neighbourhoods", "Communities", "People"];
  const typedText = useTypingEffect(typingWords, 150, 1500);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background Elements that blend with What We Do section */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-50">
        <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-blue-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="ml-3 text-2xl font-bold text-gray-900">
                    Mtaa Wetu
                  </span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => console.log(`Navigate to ${item.name}`)}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center space-x-4">
                <BtnGetStarted />
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200 z-50 relative"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-blue-100/50 relative z-40">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      console.log(`Navigate to ${item.name}`);
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 w-full text-left"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-4 pb-2 border-t border-blue-100/50">
                  <div className="px-3 py-2">
                    <BtnGetStarted />
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
          <div className="text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-medium mb-8 hover:from-blue-200 hover:to-cyan-200 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              New: Real-time community insights dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Building Better{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
                {typedText}
              </span>
              <br />
              through Shared Insights
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Use Mtaa Wetu to share your satisfaction with public services and
              infrastructure—whether it's the quality of roads, hospital
              experiences, or everyday facilities, your voice shapes your
              community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <BtnGetStarted />
              <button
                onClick={() => console.log("Watch Demo clicked")}
                className="group flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
              >
                <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200 shadow-lg ">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <stat.icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {stat.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;
