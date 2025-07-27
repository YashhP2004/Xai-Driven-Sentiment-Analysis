
import { Check } from "lucide-react";

export function UseCasesSection() {
  const useCases = [
    {
      title: "Financial Services",
      description:
        "Explain loan approval decisions and detect fraud patterns with complete transparency.",
      features: [
        "Credit scoring explanations",
        "Regulatory compliance reporting",
        "Risk assessment visualization",
      ],
    },
    {
      title: "Healthcare",
      description:
        "Interpret patient diagnostics and treatment recommendations with confidence.",
      features: [
        "Diagnostic reasoning paths",
        "Treatment efficacy analysis",
        "Patient outcome predictions",
      ],
    },
    {
      title: "Manufacturing",
      description:
        "Uncover quality control insights and optimize production processes.",
      features: [
        "Defect prediction analysis",
        "Maintenance scheduling optimization",
        "Production efficiency insights",
      ],
    },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Success Stories
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              See how organizations are achieving better outcomes with explainable AI
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
          {useCases.map((useCase, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-bold">{useCase.title}</h3>
              <p className="text-muted-foreground">{useCase.description}</p>
              <ul className="space-y-2">
                {useCase.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-accent shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
