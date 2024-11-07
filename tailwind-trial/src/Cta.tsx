import BtnGetStarted from "./components/ButtonGetStarted";

const CTASection = () => {
  return (
    <section className="flex flex-col items-center justify-center py-20 bg-white text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl">
        Make your voice heard
        <br />
        Start Using Mtaa Wetu Today.
      </h2>
      <p className="text-gray-500 text-sm md:text-base mb-8 max-w-lg">
        Share your satisfaction with public facilities, infrastructure, and
        services. Whether it's roads, hospitals, or any facility, Mtaa Wetu lets
        you be part of the solution.
      </p>
      <div className="flex space-x-4">
        <BtnGetStarted />
        <a
          href="#learn-more"
          className="text-indigo-600 font-medium flex items-center"
        >
          Learn more &rarr;
        </a>
      </div>
    </section>
  );
};

export default CTASection;
