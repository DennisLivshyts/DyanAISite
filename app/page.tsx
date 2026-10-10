import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Capabilities from "@/components/Capabilities";
import HowItWorks from "@/components/HowItWorks";
import WhyUs from "@/components/WhyUs";
import Contact from "@/components/Contact";
import SignOff from "@/components/SignOff";
import Footer from "@/components/Footer";
import OrbitMount from "@/components/orbit/OrbitMount";
import FlightTracker from "@/components/orbit/FlightTracker";

// Scroll order follows the flyby in the logo: approach (Hero) → capture
// (Capabilities) → periapsis, the closest pass, on the Work → exit (Process)
// → punch-through (Contact) → the mark (SignOff).
export default function Home() {
  return (
    <>
    {/* behind the content: the gravity-assist scene (stars come from the layout) */}
    <OrbitMount />
    <FlightTracker />
    <main className="relative z-[1] min-h-screen">
      <Nav />
      <Hero />
      <Capabilities />
      <Work />
      <HowItWorks />
      <WhyUs />
      <Contact />
      <SignOff />
      <Footer />
    </main>
    </>
  );
}
