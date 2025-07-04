import React, { useState, useEffect } from 'react';

interface Person {
  name: string;
  role: string;
  imageUrl: string;
}

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

const people: Person[] = [
  {
    name: "James Gachanja",
    role: "Lead Designer",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/james.png?raw=true",
  },
  {
    name: "John Ngugi",
    role: "Lead Developer",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/john.png?raw=true",
  },
  {
    name: "Nashon Adero",
    role: "Community Liaison",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/adero.png?raw=true",
  },
  {
    name: "Ivy Muriuki",
    role: "Data Analyst",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/ivy.png?raw=true",
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

const TeamMemberCard: React.FC<{ person: Person; index: number }> = ({ person, index }) => (
  <FloatingElement delay={index * 150}>
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-blue-100">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Profile Image */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300 scale-110"></div>
            <img
              alt={person.name}
              src={person.imageUrl}
              className="relative h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg group-hover:ring-blue-200 transition-all duration-300 grayscale hover:grayscale-0"
            />
          </div>
          
          {/* Name */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
            {person.name}
          </h3>
          
          {/* Role */}
          <p className="mt-2 text-sm font-semibold text-blue-600 group-hover:text-cyan-600 transition-colors duration-300">
            {person.role}
          </p>
          
          {/* Decorative element */}
          <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  </FloatingElement>
);

export default function MtaaWetuTeam() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-24 sm:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Header Section */}
          <div className="max-w-2xl">
            <FloatingElement>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg mb-6">
                Our Team
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Meet The Team
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                We're a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our community.
              </p>
              
              {/* Stats */}
              <div className="mt-8 flex flex-wrap gap-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-blue-600">4+</span>
                  <span className="text-sm text-gray-500">Team Members</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-cyan-600">100%</span>
                  <span className="text-sm text-gray-500">Dedicated</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-purple-600">24/7</span>
                  <span className="text-sm text-gray-500">Support</span>
                </div>
              </div>
            </FloatingElement>
          </div>

          {/* Team Grid */}
          <div className="lg:col-span-2">
            <div className="grid gap-8 sm:grid-cols-2">
              {people.map((person, index) => (
                <TeamMemberCard key={person.name} person={person} index={index} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        {/* <FloatingElement delay={600}>
          <div className="mt-20 text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-lg text-gray-600 mb-6">
                Want to join our amazing team?
              </p>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="relative z-10">We're Hiring!</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </FloatingElement> */}
      </div>
    </div>
  );
}