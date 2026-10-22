import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolsSection from "@/components/ToolsSection";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#080B0F]">
      <Navbar user={user ? { email: user.email ?? "" } : null} />
      <Hero />
      <ToolsSection />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
