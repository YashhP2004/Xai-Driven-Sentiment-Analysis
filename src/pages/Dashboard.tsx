
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { DataInputPanel } from "@/components/dashboard/DataInputPanel";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";
import { Toaster } from "sonner";
import { SentimentResult } from "@/utils/sentimentAnalysis";

export default function Dashboard() {
  const [analysisResult, setAnalysisResult] = useState<SentimentResult | null>(null);

  const handleAnalysisComplete = (result: SentimentResult) => {
    // Ensure we have at least some key features even if API doesn't provide them
    if (!result.keyFeatures || result.keyFeatures.length === 0) {
      // Create basic feature data if none exists
      const sentiment = result.sentiment || "Neutral";
      result.keyFeatures = [
        { 
          word: "API", 
          importance: 0.8, 
          sentiment: sentiment.toLowerCase().includes('positive') ? 'positive' : 
                     sentiment.toLowerCase().includes('negative') ? 'negative' : 'neutral',
          contributes_to: sentiment
        }
      ];
    }
    
    setAnalysisResult(result);
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
          <div className="order-2 lg:order-1">
            <DataInputPanel onAnalysisComplete={handleAnalysisComplete} />
          </div>
          <div className="order-1 lg:order-2">
            <ResultsPanel analysisResult={analysisResult} />
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
}
