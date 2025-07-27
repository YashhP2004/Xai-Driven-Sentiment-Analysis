
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AiAnimation } from "@/components/home/AiAnimation";

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Understand Your AI&apos;s Decisions with Crystal Clarity
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Transform complex AI decisions into intuitive, actionable insights. Our XAI Dashboard makes machine learning interpretable for everyone.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/dashboard">
                <Button size="lg" className="gap-1.5 group">
                  Start Exploring
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full md:h-[420px] lg:h-[450px]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg">
                <AiAnimation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
