
import { ArrowRightLeft, BarChart3, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StepsSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Get started with XAI Dashboard in three simple steps
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 mt-12">
          <Card className="relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-secondary/10 flex items-start justify-end p-3">
              <span className="font-bold text-lg text-secondary">1</span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-secondary" />
                Upload Your Data
              </CardTitle>
              <CardDescription>
                Easily import your dataset through our intuitive interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drag and drop your files or use our API to connect your data sources. We support various formats including CSV, JSON, and direct database connections.
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-secondary/10 flex items-start justify-end p-3">
              <span className="font-bold text-lg text-secondary">2</span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Review Predictions
              </CardTitle>
              <CardDescription>
                Understand how your model is making decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See your model's predictions alongside comprehensive visualizations of feature importance, allowing you to understand exactly what factors drive each decision.
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-secondary/10 flex items-start justify-end p-3">
              <span className="font-bold text-lg text-secondary">3</span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-secondary" />
                Test Alternatives
              </CardTitle>
              <CardDescription>
                Explore what-if scenarios to optimize outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Experiment with different input values to see how they affect your model's output. Generate counterfactual explanations to understand how to achieve desired outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
