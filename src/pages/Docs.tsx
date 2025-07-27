
import { FileText, Book, HelpCircle, GitMerge, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Docs() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">XAI Dashboard Documentation</h1>
            <p className="text-muted-foreground mb-6">
              Learn how to use and understand explainable AI features
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documentation..." 
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-secondary" />
                  <span>Getting Started</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-secondary hover:underline">Introduction to XAI</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-secondary hover:underline">Dashboard Overview</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-secondary hover:underline">Quick Start Guide</a>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  <span>User Guides</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-secondary hover:underline">Data Input Guide</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-secondary hover:underline">Understanding Visualizations</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-secondary hover:underline">Custom Model Integration</a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Explanation Methods</h2>
          <Card className="mb-10">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-secondary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-secondary">L</span>
                      </div>
                      <span>LIME (Local Interpretable Model-agnostic Explanations)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 text-sm text-muted-foreground space-y-2">
                      <p>
                        LIME creates a simplified, interpretable model that mimics how your complex model behaves around a specific prediction. It works by:
                      </p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Taking a prediction instance to explain</li>
                        <li>Creating perturbed versions of this instance by tweaking feature values</li>
                        <li>Getting predictions from your complex model for these perturbed instances</li>
                        <li>Fitting a simple model (like linear regression) to these predictions</li>
                        <li>Extracting the most important features from this simple model</li>
                      </ol>
                      <p className="mt-2">
                        LIME is especially useful for understanding individual predictions in classification and regression models.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-secondary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-secondary">S</span>
                      </div>
                      <span>SHAP (SHapley Additive exPlanations)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 text-sm text-muted-foreground space-y-2">
                      <p>
                        SHAP uses game theory to calculate the marginal contribution of each feature to a prediction. It provides:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Individual feature importance values that sum to the model's total prediction</li>
                        <li>Consistent and theoretically sound feature attributions</li>
                        <li>Both global and local explanations</li>
                        <li>Support for various model types</li>
                      </ul>
                      <p className="mt-2">
                        SHAP values show how much each feature contributes to pushing the prediction away from the expected value (the average output over the training dataset).
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-secondary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-secondary">C</span>
                      </div>
                      <span>Counterfactual Explanations</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 text-sm text-muted-foreground space-y-2">
                      <p>
                        Counterfactual explanations show the smallest changes needed to feature values to get a different prediction outcome. These explanations:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Are intuitive and easy for non-experts to understand</li>
                        <li>Provide actionable insights for users</li>
                        <li>Focus on "what-if" scenarios rather than complex feature importance</li>
                        <li>Help identify the minimal changes needed to achieve a desired outcome</li>
                      </ul>
                      <p className="mt-2">
                        For example, in a loan application, a counterfactual might show: "If your income was $5,000 higher, your loan would have been approved."
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Card className="mb-10">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <span>What is Explainable AI (XAI)?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Explainable AI refers to methods and techniques that make AI systems' decisions understandable to humans. It addresses the "black box" problem of modern AI by providing insights into why an AI made a specific decision, which features influenced that decision, and how changes to inputs might affect outcomes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Why is XAI important?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      XAI is crucial for several reasons:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2 space-y-1">
                      <li>Regulatory compliance (like GDPR's "right to explanation")</li>
                      <li>Building trust in AI systems</li>
                      <li>Identifying and correcting biases in models</li>
                      <li>Enabling informed decision-making based on AI outputs</li>
                      <li>Debugging and improving AI systems</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Can I integrate my own models with this dashboard?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Yes! Our dashboard supports custom model integration through our API. You can:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2 space-y-1">
                      <li>Connect your trained models using our Python, R, or REST API</li>
                      <li>Generate explanations for any compatible model</li>
                      <li>Even use pre-trained models from popular frameworks like TensorFlow, PyTorch, or scikit-learn</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      See our <a href="#" className="text-secondary hover:underline">API Documentation</a> for detailed integration instructions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <span>How accurate are these explanations?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      The accuracy of explanations depends on several factors:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2 space-y-1">
                      <li>The complexity of your model</li>
                      <li>The explanation method used (LIME, SHAP, etc.)</li>
                      <li>The quality and characteristics of your data</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Our dashboard provides confidence metrics and multiple explanation methods so you can cross-reference and verify explanations. We recommend using several explanation techniques together for the most complete understanding.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <div className="bg-muted rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Need more help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is ready to assist with any questions
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">Contact Support</Button>
              <Button variant="secondary">Community Forum</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
