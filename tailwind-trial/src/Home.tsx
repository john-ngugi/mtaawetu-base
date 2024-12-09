import Header from "./Header";
import Features from "./Features";
import { WhatWeDo } from "./Features";
import CTASection from "./Cta";
import Team from "./Team";
import Stats from "./Stats";
import Footer from "./Footer";
function Home() {
  return (
    <div className="w-screen overflow-x-hidden">
      <Header />
      <div className="w-screen">
        <Features />
        <WhatWeDo />
        <CTASection />
        <Stats />
        <Team />
        <Footer />
      </div>
    </div>
  );
}

export default Home;
