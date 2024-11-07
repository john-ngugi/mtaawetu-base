import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Residents",
    description:
      " Residents can get to know important or interesting information about where they live and make informed choices about residential location.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Neighborhood Associations",
    description:
      "Neighborhood associations can get a good grasp of their surroundings improving situational awareness.",
    icon: LockClosedIcon,
  },
  {
    name: "County Governments",
    description:
      "The county governments can access data information to aid in urban planning and management.",
    icon: ArrowPathIcon,
  },
  {
    name: "Researchers",
    description:
      "Researchers can quickly access data and information to support their discovery of knowledge.",
    icon: FingerPrintIcon,
  },
  {
    name: "Planning Professionals",
    description:
      "Planning professionals and built environment experts have a ready source of information to support their work and assignments.",
    icon: ArrowPathIcon,
  },
  {
    name: "Real Estate Investors",
    description:
      "Real Estate Investors and property developers can get information to assess the feasibility of different sites.",
    icon: FingerPrintIcon,
  },
  {
    name: "Entrepreneurs",
    description:
      "Entrepreneurs and commercial enterprises can utilize Mtaa Wetu to pinpoint the “best bet” locations for business. Location, location, location is the Mtaa Wetu mantra",
    icon: ArrowPathIcon,
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

import { ServerIcon } from "@heroicons/react/20/solid";

const WhatWeDofeatures = [
  {
    name: "Push to deploy.",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "SSL certificates.",
    description:
      "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.",
    icon: LockClosedIcon,
  },
  {
    name: "Database backups.",
    description:
      "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
    icon: ServerIcon,
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
                Deploy faster
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Your Data Journey
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Your data is safe with us. We prioritize your privacy and never
                share your information with anyone. Rest assured, we don't
                collect personal identifiers, so your identity remains
                confidential.
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
            className="w-[48rem] max-w-lg rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
}
