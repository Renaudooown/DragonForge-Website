import { Hero } from "@/components/hero/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Principles } from "@/components/Principles";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Principles />
      <SiteFooter />
    </main>
  );
}
