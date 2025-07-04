import React, { useState, useEffect, useRef } from 'react';

interface Stat {
  id: number;
  name: string;
  value: string;
  numericValue: number;
  suffix: string;
}

interface AnimatedCounterProps {
  end: number;
  suffix: string;
  duration: number;
  isVisible: boolean;
}

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

const stats: Stat[] = [
  { 
    id: 1, 
    name: "Neighbourhoods Covered", 
    value: "100+",
    numericValue: 100,
    suffix: "+"
  },
  { 
    id: 2, 
    name: "Thematic Maps Created", 
    value: "8 Maps",
    numericValue: 8,
    suffix: " Maps"
  },
  { 
    id: 3, 
    name: "Collaborations With Counties", 
    value: "3 Counties",
    numericValue: 3,
    suffix: " Counties"
  },
];

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, suffix, duration, isVisible }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;

      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const progress = Math.min((currentTime - startTimeRef.current) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isVisible, end, duration]);

  return (
    <span className="relative">
      <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent blur-sm opacity-60">
        {count}{suffix}
      </span>
      <span className="relative text-white font-extrabold drop-shadow-lg">
        {count}{suffix}
      </span>
    </span>
  );
};


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

const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.3, ...options }
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

export default function MtaaWetuStats() {
  const [statsRef, isStatsVisible] = useIntersectionObserver();
  console.log("Stats visible?", isStatsVisible);

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 py-24 sm:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <FloatingElement>
            <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-6 py-2 text-sm font-semibold text-white shadow-lg mb-6">
              Our Impact
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Making a Real Difference
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100 max-w-3xl mx-auto">
              See how Mtaa Wetu is transforming communities across Kenya with data-driven insights and collaborative action.
            </p>
          </FloatingElement>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="mx-auto max-w-7xl">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            {stats.map((stat, index) => (
              <FloatingElement key={stat.id} delay={index * 200}>
                <div className="group relative">
                  <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/20">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Number background highlight for better contrast */}
                    <div className="absolute inset-x-0 top-6 h-16 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50"></div>
                    
                    <div className="relative z-10 mx-auto flex max-w-xs flex-col gap-y-4">
                      {/* Animated Number */}
                      <dd className="order-first text-4xl font-bold tracking-tight sm:text-6xl">
                        <AnimatedCounter
                          end={stat.numericValue}
                          suffix={stat.suffix}
                          duration={2000}
                          isVisible={isStatsVisible}
                        />
                      </dd>
                      
                      {/* Label */}
                      <dt className="text-base leading-7 text-blue-100 group-hover:text-white transition-colors duration-300">
                        {stat.name}
                      </dt>
                      
                      {/* Decorative line */}
                      <div className="mx-auto h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </FloatingElement>
            ))}
          </dl>
        </div>

        {/* Bottom CTA */}
        <FloatingElement delay={800}>
          <div className="mt-20 text-center">
            <p className="text-lg text-blue-100 mb-6">
              Ready to be part of these growing numbers?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="relative z-10">Join Our Community</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                Learn More
              </button>
            </div>
          </div>
        </FloatingElement>
      </div>
    </div>
  );
}