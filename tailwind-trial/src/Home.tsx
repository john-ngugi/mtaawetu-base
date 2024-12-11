import Header from "./Header";
import Features from "./Features";
import { WhatWeDo } from "./Features";
import CTASection from "./Cta";
import Team from "./Team";
import Stats from "./Stats";
import Footer from "./Footer";
function Home() {
  return (
<>
      <Header />
      
        <Features />
        <WhatWeDo />
        <CTASection />
        <Stats />
        <Team />
        <Footer />
        </>
  
  );
}

export default Home;
