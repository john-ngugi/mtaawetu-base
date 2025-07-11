import React, { useState, useEffect, useRef } from "react";
import {
  ChartBarIcon,
  MapPinIcon,
  CubeIcon,
  ChartPieIcon,
  GlobeAltIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CircleStackIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface DataPoint {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

const dataPoints: DataPoint[] = [
  {
    id: 1,
    name: "Demographics",
    description: "Population insights and community profiles",
    icon: ChartPieIcon,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    name: "Accessibility",
    description: "Roads, utilities, and public facilities",
    icon: CubeIcon,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: 3,
    name: "Safety Reports",
    description: "Crime data and security analytics",
    icon: ShieldCheckIcon,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 4,
    name: "Economic Data",
    description: "Business trends and market insights",
    icon: ChartBarIcon,
    color: "from-green-500 to-green-600",
  },
  {
    id: 5,
    name: "Environmental",
    description: "Air quality, green spaces, and sustainability",
    icon: GlobeAltIcon,
    color: "from-emerald-500 to-emerald-600",
  },
];

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transform transition-all duration-1000 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {children}
    </div>
  );
};

const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.2, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting] as const;
};

export default function UrbanDataHub() {
  const [sectionRef, isSectionVisible] = useIntersectionObserver();
  const [activePoint, setActivePoint] = useState<number | null>(null);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 py-24 sm:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-cyan-400 rounded-full animate-pulse opacity-20 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-25 animation-delay-2000"></div>
      </div>

      <div
        ref={sectionRef}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <FloatingElement>
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2 text-sm font-semibold text-white shadow-lg mb-6">
              <CircleStackIcon className="h-4 w-4 mr-2" />
              Data Hub
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              One Location for All Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Urban Data
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Access comprehensive neighborhood insights, from demographics to
              infrastructure, all in one unified platform. Make informed
              decisions with real-time data at your fingertips.
            </p>
          </FloatingElement>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Data Points */}
          <div className="space-y-6">
            {dataPoints.map((point, index) => (
              <FloatingElement key={point.id} delay={index * 100}>
                <div
                  className={`group relative p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                    activePoint === point.id
                      ? "border-blue-300 shadow-blue-100"
                      : "border-transparent hover:border-gray-200"
                  }`}
                  onMouseEnter={() => setActivePoint(point.id)}
                  onMouseLeave={() => setActivePoint(null)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-r ${point.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <point.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {point.name}
                      </h3>
                      <p className="mt-1 text-gray-600 group-hover:text-gray-700 transition-colors">
                        {point.description}
                      </p>
                    </div>
                    <ArrowRightIcon
                      className={`h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-all duration-300 ${
                        activePoint === point.id ? "translate-x-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </FloatingElement>
            ))}
          </div>

          {/* Right Side - Visual */}
          <FloatingElement delay={600}>
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Mtaa Wetu Dashboard
                    </h3>
                    <p className="text-sm text-gray-500">Urban insights</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Live</span>
                  </div>
                </div>

                {/* Mock data visualization */}
                <div className="space-y-4">
                  {/* Map preview */}
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <MapPinIcon className="h-12 w-12 text-blue-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"></div>
                  </div>

                  {/* Stats bars */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Accessibility Score
                        </span>
                        <span className="font-semibold text-green-600">
                          85%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Land Use Entropy</span>
                        <span className="font-semibold text-blue-600">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          style={{ width: "72%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Recent updates */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Recent Updates
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          urban planing report
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          Air Quality improved
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements around the dashboard */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </FloatingElement>
        </div>

        {/* Bottom CTA */}
        <FloatingElement delay={800}>
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Explore Your Data?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Get instant access to comprehensive urban insights and start
                making data-driven decisions for your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="relative z-10">Explore Dashboard</span>
                </button>
                <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        </FloatingElement>
      </div>
    </div>
  );
}
