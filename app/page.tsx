import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Capabilities from "@/components/Capabilities";
import HowItWorks from "@/components/HowItWorks";
import WhyUs from "@/components/WhyUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// Scroll order follows the flyby in the logo: approach (Hero) → capture
// (Capabilities) → periapsis, the closest pass, on the Work → exit (Process)
// → punch-through (Contact).
export default function Home() {
  return (
    <main className="relative z-[1] min-h-screen">
      <Nav />
      <Hero />
      <Capabilities />
      <Work />
      <HowItWorks />
      <WhyUs />
      <Contact />
      <Footer />
    </main>
  );
}
