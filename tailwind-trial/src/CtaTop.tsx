import BtnGetStarted from "./components/ButtonGetStarted";
import { ArrowRight} from 'lucide-react';
const CtaTop = () => {
  return (
    <div>
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Data for your{' '}
                <span className="text-blue-200">neighborhood</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Understand community issues and opportunities with curated datasets and analytics that help you make informed decisions about your area.
              </p>
              
              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  'Real-time service quality tracking',
                  'Community satisfaction metrics',
                  'Infrastructure improvement insights',
                  'Neighborhood comparison tools'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-blue-100">
                    <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <BtnGetStarted />
                <button className="text-blue-200 hover:text-white font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-2xl">
                <img
                  src="https://github.com/john-ngugi/Email-Imgs/blob/main/Screenshot%202024-12-11%20230959.png?raw=true"
                  alt="Mtaa Wetu Dashboard"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-400 rounded-full blur-2xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-300 rounded-full blur-xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
export default CtaTop