import Header from "./Header";
// import Features from "./Features";
import WhatWeDo from "./Features";
// import CTASection from "./Cta";
import Team from "./Team";
import Stats from "./Stats";
import Footer from "./Footer";
// import CtaTop from "./CtaTop";
// import CtaTop from "./CtaTop";
import UrbanDataHub from "./components/LocationForData";
import PricingComponent from "./components/Pricing";

function Home() {
  return (
    <>
      <Header />
      {/* <Features />
      <CtaTop /> */}
      <WhatWeDo />
      {/* <CTASection /> */}
      <UrbanDataHub />
      <Stats />
      <PricingComponent />
      <Team />
      <Footer />
    </>
  );
}

export default Home;
