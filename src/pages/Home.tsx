
import { HeroSection } from "@/components/home/HeroSection";
import { StepsSection } from "@/components/home/StepsSection";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { Layout } from "@/components/layout/Layout";

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <StepsSection />
      <UseCasesSection />
    </Layout>
  );
}
