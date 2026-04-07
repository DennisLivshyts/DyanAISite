import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import WhyUs from "@/components/WhyUs";
import FounderSection from "@/components/FounderSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-navy-900">
      <Nav />
      <Hero />
      <Services />
      <HowItWorks />
      <WhyUs />
      <FounderSection />
      <Contact />
      <Footer />
    </main>
  );
}
