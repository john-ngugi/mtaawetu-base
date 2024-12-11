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

const features = [
  {
    name: "Residents",
    description:
      " Residents can get to know important or interesting information about where they live and make informed choices about residential location.",
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
      "Entrepreneurs and commercial enterprises can utilize Mtaa Wetu to pinpoint the “best bet” locations for business. Location, location, location is the Mtaa Wetu mantra",
    icon: BanknotesIcon,
  },
];

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            report issues
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Connect, report, improve—Mtaa Wetu.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join us in transforming our neighborhoods—report issues, share
            experiences, and foster positive change together. Every voice
            matters in creating a thriving community.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

// import { ServerIcon } from "@heroicons/react/20/solid";

const WhatWeDofeatures = [
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

export function WhatWeDo() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Citizen Focused
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Community Insights
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover trends and insights about your neighborhood through visualized data. Understand what matters most to your community and collaborate for impactful change. Knowledge is power, and we’re sharing it with you.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {WhatWeDofeatures.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src="https://github.com/john-ngugi/Email-Imgs/blob/main/Screenshot%20(70)_new.png?raw=true"
            width={2432}
            height={1442}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
      <div className="bg-white py-16 px-6 md:px-12 lg:px-20">
  <div className="max-w-7xl mx-auto">
    {/* <!-- Heading Section --> */}
    <div className="text-center">
      <h2 className="text-lg font-semibold text-purple-600">Everything You Need</h2>
      <h1 className="mt-2 p-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        No Technical Skills? No Problem.
      </h1>
      <p className="mt-4 p-3 text-gray-600">
        Mtaa Wetu makes it easy for anyone to report issues, track progress, and engage with their community.
        Our AI-powered agents are here to guide you every step of the way. Whether you’re pinning a problem on the map or leaving feedback, 
        our smart assistants ensure everything runs smoothly.
      </p>
    </div>

    {/* <!-- Content Section --> */}
    <div className="mt-10  items-center">
      {/* <!-- Left Content --> */}
      {/* <div>
        <ul className="space-y-4">
          <li className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 7.75h.008v.008H9.75V7.75zm4.5 0h.008v.008h-.008V7.75zm0 4.5h.008v.008h-.008v-.008zm-4.5 0h.008v.008H9.75v-.008zM6 11.25h.008v.008H6v-.008zM3 11.25h.008v.008H3v-.008zm6 6.75h.008v.008H9v-.008zm12 0h.008v.008H21v-.008zm-12-9h.008v.008H9v-.008zm3 12h.008v.008H12v-.008zM3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zm18-1a3 3 0 01.879 5.876A4.494 4.494 0 0120.5 10 4.5 4.5 0 0123 15a4.5 4.5 0 01-1.621 3.449M17.5 15v.008h-.008v-.008h.008z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">AI-Powered Assistance</h4>
              <p className="mt-1 text-gray-600">Get step-by-step guidance on reporting and tracking issues with our intelligent assistants.</p>
            </div>
          </li>
          <li className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 7.75h.008v.008H9.75V7.75zm4.5 0h.008v.008h-.008V7.75zm0 4.5h.008v.008h-.008v-.008zm-4.5 0h.008v.008H9.75v-.008zM6 11.25h.008v.008H6v-.008zM3 11.25h.008v.008H3v-.008zm6 6.75h.008v.008H9v-.008zm12 0h.008v.008H21v-.008zm-12-9h.008v.008H9v-.008zm3 12h.008v.008H12v-.008zM3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zm18-1a3 3 0 01.879 5.876A4.494 4.494 0 0120.5 10 4.5 4.5 0 0123 15a4.5 4.5 0 01-1.621 3.449M17.5 15v.008h-.008v-.008h.008z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">No Learning Curve</h4>
              <p className="mt-1 text-gray-600">Our intuitive design ensures anyone can use the platform without prior experience.</p>
            </div>
          </li>
        </ul>
      </div> */}

      {/* <!-- Right Content --> */}
      <div>
        <div className="border border-gray-300 shadow-md rounded-md overflow-hidden">
        <img
                alt=""
                src="https://github.com/john-ngugi/Email-Imgs/blob/main/Screenshot%202024-12-11%20230959.png?raw=true"
                className="w-full"
              />
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}
