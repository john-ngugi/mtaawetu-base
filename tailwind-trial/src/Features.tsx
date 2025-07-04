import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  HomeIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  MapIcon,
  HomeModernIcon,
  BanknotesIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
}

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

interface GradientCardProps {
  feature: Feature;
  index: number;
}

const features: Feature[] = [
  {
    name: "Residents",
    description:
      "Residents can get to know important or interesting information about where they live and make informed choices about residential location.",
    icon: HomeIcon,
  },
  {
    name: "Neighborhood Associations",
    description:
      "Neighborhood associations can get a good grasp of their surroundings improving situational awareness.",
    icon: BuildingOfficeIcon,
  },
  {
    name: "County Governments",
    description:
      "The county governments can access data information to aid in urban planning and management.",
    icon: BuildingLibraryIcon,
  },
  {
    name: "Researchers",
    description:
      "Researchers can quickly access data and information to support their discovery of knowledge.",
    icon: MagnifyingGlassIcon,
  },
  {
    name: "Planning Professionals",
    description:
      "Planning professionals and built environment experts have a ready source of information to support their work and assignments.",
    icon: MapIcon,
  },
  {
    name: "Real Estate Investors",
    description:
      "Real Estate Investors and property developers can get information to assess the feasibility of different sites.",
    icon: HomeModernIcon,
  },
  {
    name: "Entrepreneurs",
    description:
      "Entrepreneurs and commercial enterprises can utilize Mtaa Wetu to pinpoint the best bet locations for business. Location, location, location is the Mtaa Wetu mantra",
    icon: BanknotesIcon,
  },
];

const WhatWeDofeatures: Feature[] = [
  {
    name: "Interactive Maps",
    description:
      "Bring your neighborhood to life with our dynamic maps. Highlight problem areas, view detailed feedback, and explore community ratings—all in one place. Where maps meet meaningful action.",
    icon: HomeIcon,
  },
  {
    name: "User-Friendly Design",
    description:
      "Our intuitive platform ensures anyone can report problems, track updates, and contribute. No technical skills required—just a commitment to making a difference. Simple, yet powerful.",
    icon: DevicePhoneMobileIcon,
  },
  {
    name: "AI-Powered Insights",
    description:
      "Get predictive analytics on recurring issues in your area. Discover trends and potential problems before they happen. Cutting-edge technology, making neighborhoods smarter.",
    icon: BoltIcon,
  },
];

const FloatingElement: React.FC<FloatingElementProps> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      {children}
    </div>
  );
};

const GradientCard: React.FC<GradientCardProps> = ({ feature, index }) => (
  <FloatingElement delay={index * 150}>
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-blue-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
          <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h3 className="mt-6 text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
          {feature.name}
        </h3>
        <p className="mt-4 text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {feature.description}
        </p>
      </div>
    </div>
  </FloatingElement>
);

export default function WhatWeDo() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <FloatingElement>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2 text-sm font-semibold text-white shadow-lg">
                <BoltIcon className="h-4 w-4 mr-2" />
                Report Issues
              </div>
            </FloatingElement>
            
            <FloatingElement delay={200}>
              <h1 className="mt-8 text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Connect, Report, Improve
              </h1>
            </FloatingElement>
            
            <FloatingElement delay={400}>
              <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
                Join us in transforming our neighborhoods—report issues, share experiences, and foster positive change together. Every voice matters in creating a thriving community.
              </p>
            </FloatingElement>
            
            <FloatingElement delay={600}>
              <div className="mt-10 flex items-center justify-center gap-4">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
                  Learn More
                </button>
              </div>
            </FloatingElement>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <FloatingElement>
              <h2 className="text-lg font-semibold text-blue-600">Who We Serve</h2>
              <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
                Built for Everyone
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                From residents to researchers, our platform serves diverse communities with tailored insights and tools.
              </p>
            </FloatingElement>
          </div>
          
          <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <GradientCard key={feature.name} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="py-24 sm:py-32 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
            <div className="lg:pr-8">
              <FloatingElement>
                <div className="lg:max-w-lg">
                  <h2 className="text-lg font-semibold text-blue-200">
                    Citizen Focused
                  </h2>
                  <p className="mt-4 text-4xl font-bold tracking-tight text-white">
                    Community Insights
                  </p>
                  <p className="mt-6 text-lg leading-8 text-blue-100">
                    Discover trends and insights about your neighborhood through visualized data. Understand what matters most to your community and collaborate for impactful change.
                  </p>
                  
                  <div className="mt-10 space-y-8">
                    {WhatWeDofeatures.map((feature, index) => (
                      <FloatingElement key={feature.name} delay={index * 200}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                              <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {feature.name}
                            </h3>
                            <p className="mt-2 text-blue-100">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </FloatingElement>
                    ))}
                  </div>
                </div>
              </FloatingElement>
            </div>
            
            <FloatingElement delay={400}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-2xl opacity-30"></div>
                <img
                  alt="Product screenshot"
                  src="https://github.com/john-ngugi/Email-Imgs/blob/main/Screenshot%20(70)_new.png?raw=true"
                  className="relative w-full rounded-3xl shadow-2xl ring-1 ring-white/20"
                />
              </div>
            </FloatingElement>
          </div>
        </div>
      </div>

      {/* AI Section */}
      <div className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <FloatingElement>
              <h2 className="text-lg font-semibold text-blue-600">Everything You Need</h2>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                No Technical Skills? No Problem.
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
                Mtaa Wetu makes it easy for anyone to report issues, track progress, and engage with their community. Our AI-powered agents are here to guide you every step of the way.
              </p>
            </FloatingElement>
          </div>

          <FloatingElement delay={600}>
            <div className="mt-16">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"></div>
                <img
                  alt="AI Dashboard"
                  src="https://github.com/john-ngugi/Email-Imgs/blob/main/Screenshot%202024-12-11%20230959.png?raw=true"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </FloatingElement>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 sm:py-32 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="mx-auto max-w-4xl text-center px-6 lg:px-8">
          <FloatingElement>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to Transform Your Community?
            </h2>
            <p className="mt-6 text-xl text-gray-300">
              Join thousands of residents already making a difference in their neighborhoods.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="relative z-10">Start Reporting</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                Watch Demo
              </button>
            </div>
          </FloatingElement>
        </div>
      </div>
    </div>
  );
}