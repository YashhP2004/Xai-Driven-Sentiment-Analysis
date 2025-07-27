
import { useState, useEffect } from "react";
import { Download, Share2, Info, BarChart3, Layers, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PredictionOverview } from "@/components/dashboard/results/PredictionOverview";
import { FeatureAnalysis } from "@/components/dashboard/results/FeatureAnalysis";
import { DetailedExplanations } from "@/components/dashboard/results/DetailedExplanations";
import { WhatIfScenarios } from "@/components/dashboard/results/WhatIfScenarios";
import { toast } from "sonner";
import { SentimentResult } from "@/utils/sentimentAnalysis";
import { CounterfactualApiResponse } from "@/services/sentimentApiService";

interface ResultsPanelProps {
  analysisResult?: SentimentResult;
}

export function ResultsPanel({ analysisResult }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [enhancedResult, setEnhancedResult] = useState<SentimentResult | undefined>(analysisResult);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [counterfactualResult, setCounterfactualResult] = useState<CounterfactualApiResponse | null>(null);
  
  // Listen for explanation updates
  useEffect(() => {
    // Update state when initial results come in
    setEnhancedResult(analysisResult);
    
    // If we have a result but no key features, show loading state for explanation
    if (analysisResult && (!analysisResult.keyFeatures || analysisResult.keyFeatures.length === 0)) {
      setIsLoadingExplanation(true);
    } else {
      setIsLoadingExplanation(false);
    }
    
    // Listen for explanation updates
    const handleExplanationReady = (event: Event) => {
      const customEvent = event as CustomEvent<SentimentResult>;
      setEnhancedResult(customEvent.detail);
      setIsLoadingExplanation(false);
      
      // Show a toast notification when explanation is ready
      toast.success("Explanation ready", {
        description: "The detailed explanation for this text has been generated"
      });
    };

    // Listen for counterfactual analysis results
    const handleCounterfactualReady = (event: Event) => {
      const customEvent = event as CustomEvent<CounterfactualApiResponse>;
      setCounterfactualResult(customEvent.detail);
      console.log("Counterfactual result stored in state:", customEvent.detail);
    };
    
    // Listen for analysis start event to reset counterfactual
    const handleAnalysisStarted = () => {
      setIsLoadingExplanation(true);
      // Don't clear counterfactual result yet, wait for the new one
    };
    
    document.addEventListener('sentiment-explanation-ready', handleExplanationReady);
    document.addEventListener('counterfactual-analysis-ready', handleCounterfactualReady);
    document.addEventListener('sentiment-analysis-started', handleAnalysisStarted);
    
    // Cleanup
    return () => {
      document.removeEventListener('sentiment-explanation-ready', handleExplanationReady);
      document.removeEventListener('counterfactual-analysis-ready', handleCounterfactualReady);
      document.removeEventListener('sentiment-analysis-started', handleAnalysisStarted);
    };
  }, [analysisResult]);
  
  const handleExport = () => {
    // Ensure we have keyFeatures when exporting
    const exportData = analysisResult ? {
      ...analysisResult,
      keyFeatures: analysisResult.keyFeatures || []
    } : {
      timestamp: new Date().toISOString(),
      sentiment: "positive",
      confidence: 0.85,
      reviewText: "The product was great and exceeded my expectations.",
      keyFeatures: [
        { word: "great", importance: 0.65, sentiment: "positive" },
        { word: "exceeded", importance: 0.45, sentiment: "positive" },
        { word: "expectations", importance: 0.30, sentiment: "neutral" }
      ]
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    
    const blob = new Blob([dataStr], { type: "application/json" });
    
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "sentiment-analysis-results.json";
    
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Results downloaded successfully", {
      description: "Your analysis results have been downloaded as JSON"
    });
  };
  
  const handleShare = () => {
    const shareableLink = `${window.location.origin}/shared-result?id=${Date.now()}`;
    
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success("Link copied to clipboard", {
          description: "Share this link with others to view your analysis results"
        });
      })
      .catch(() => {
        toast.error("Failed to copy link", {
          description: "Please try again or copy the URL manually"
        });
      });
  };

  // Create a modified result with guaranteed keyFeatures for components that require it
  const analysisResultWithKeyFeatures = enhancedResult ? {
    ...enhancedResult,
    keyFeatures: enhancedResult.keyFeatures || [],
    sentiment: enhancedResult.sentiment,
    confidences: enhancedResult.confidences,
    text: enhancedResult.text
  } : undefined;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sentiment Analysis Results</CardTitle>
          <CardDescription>
            {enhancedResult?.text 
              ? `Analysis for: "${enhancedResult.text.length > 50 
                ? enhancedResult.text.substring(0, 50) + '...' 
                : enhancedResult.text}"`
              : "Understand the sentiment of your review"}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download results as JSON</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy shareable link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex gap-1 items-center">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex gap-1 items-center">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Word Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="explanations" className="flex gap-1 items-center">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Explanations</span>
            {isLoadingExplanation && <span className="ml-1 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
          </TabsTrigger>
          <TabsTrigger value="whatif" className="flex gap-1 items-center">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Counterfactual</span>
          </TabsTrigger>
        </TabsList>
        <CardContent className="flex-1 pt-6 overflow-auto">
          <TabsContent value="overview" className="mt-0 h-full">
            <PredictionOverview analysisResult={analysisResultWithKeyFeatures} />
          </TabsContent>
          <TabsContent value="features" className="mt-0 h-full">
            {enhancedResult ? (
              <FeatureAnalysis 
                analysisResult={{
                  keyFeatures: enhancedResult.keyFeatures || []
                }} 
                isLoading={isLoadingExplanation}
              />
            ) : (
              <FeatureAnalysis analysisResult={undefined} isLoading={false} />
            )}
          </TabsContent>
          <TabsContent value="explanations" className="mt-0 h-full">
            <DetailedExplanations 
              analysisResult={enhancedResult} 
              isLoading={isLoadingExplanation}
            />
          </TabsContent>
          <TabsContent value="whatif" className="mt-0 h-full">
            <WhatIfScenarios 
              counterfactualResult={counterfactualResult}
              isLoading={isLoadingExplanation} 
              inputText={enhancedResult?.text}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
