
import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SentimentResult } from "@/utils/sentimentAnalysis";
import { Skeleton } from "@/components/ui/skeleton";

interface DetailedExplanationsProps {
  analysisResult?: SentimentResult;
  isLoading?: boolean;
}

// Define the interface for counterfactual explanation
interface CounterfactualExplanation {
  currentClass: string;
  oppositeClass: string;
  changes: {
    feature: string;
    current: string;
    target: string;
    change: string;
  }[];
}

export function DetailedExplanations({ analysisResult, isLoading = false }: DetailedExplanationsProps) {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showWordDetails, setShowWordDetails] = useState(false);
  
  // Generate prediction probabilities for all classes
  const getClassProbabilities = () => {
    if (!analysisResult || !analysisResult.confidences) {
      return [
        { class: "Very Negative", value: 0.01 },
        { class: "Negative", value: 0.39 },
        { class: "Neutral", value: 0.58 },
        { class: "Positive", value: 0.02 },
        { class: "Very Positive", value: 0.00 }
      ];
    }
    
    const confidences = analysisResult.confidences;
    return Object.entries(confidences).map(([className, value]) => ({
      class: className,
      value: value as number
    })).sort((a, b) => {
      const order = ["Very Negative", "Negative", "Neutral", "Positive", "Very Positive"];
      return order.indexOf(a.class) - order.indexOf(b.class);
    });
  };
  
  // Simulate LIME data from our analysis result
  const getLimeExplanation = () => {
    if (!analysisResult) return null;
    
    const keyFeatures = analysisResult.keyFeatures || [];
    const reviewText = analysisResult.text || "";
    
    const tokens = reviewText.split(/\b/).filter(token => token.trim().length > 0);
    
    const tokenImportances = tokens.map(token => {
      const matchingFeature = keyFeatures.find(
        feature => token.toLowerCase().includes(feature.word.toLowerCase())
      );
      
      return {
        token,
        importance: matchingFeature ? matchingFeature.importance : 0,
        sentiment: matchingFeature ? matchingFeature.sentiment : 'neutral',
        contributes_to: matchingFeature ? matchingFeature.contributes_to : null
      };
    });
    
    const notNeutralFeatures = keyFeatures.filter(f => f.contributes_to === 'NOT Neutral');
    const neutralFeatures = keyFeatures.filter(f => f.contributes_to === 'Neutral');
    const notNegativeFeatures = keyFeatures.filter(f => f.contributes_to === 'NOT Negative');
    const negativeFeatures = keyFeatures.filter(f => f.contributes_to === 'Negative');
    
    return {
      tokens: tokenImportances,
      features: keyFeatures,
      notNeutralFeatures,
      neutralFeatures,
      notNegativeFeatures,
      negativeFeatures
    };
  };
  
  const limeExplanation = getLimeExplanation();
  
  // Generate counterfactual explanation based on the analysis result
  const getCounterfactualExplanation = (): CounterfactualExplanation | null => {
    if (!analysisResult) return null;
    
    const sentiment = analysisResult.sentiment || "Neutral";
    
    const getOpposite = (sentiment: string): string => {
      if (sentiment.includes("Positive")) return "Negative";
      if (sentiment.includes("Negative")) return "Positive";
      return "Negative";
    };
    
    const oppositeClass = getOpposite(sentiment);
    
    const changes = (analysisResult.keyFeatures || [])
      .slice(0, 3)
      .map(feature => {
        const isPositive = feature.sentiment === 'positive';
        const changeDirection = isPositive ? 'Removed' : 'Added';
        const oppositeValue = isPositive ? 'negative context' : 'positive context';
        
        return {
          feature: feature.word,
          current: feature.sentiment,
          target: isPositive ? 'negative' : 'positive',
          change: `${changeDirection} or changed to ${oppositeValue}`
        };
      });
    
    return {
      currentClass: sentiment,
      oppositeClass,
      changes
    };
  };
  
  const counterfactualExplanation = getCounterfactualExplanation();
  
  // Get color class for a token based on its contribution
  const getTokenColorClass = (token: any) => {
    if (!token || token.importance === 0) return "";
    
    if (token.contributes_to === 'NOT Neutral') {
      return "bg-cyan-400 text-black";
    } else if (token.contributes_to === 'Neutral') {
      return "bg-orange-400 text-black";
    } else if (token.contributes_to === 'NOT Negative') {
      return "bg-cyan-400 text-black";
    } else if (token.contributes_to === 'Negative') {
      return "bg-blue-400 text-black";
    }
    
    const absImportance = Math.abs(token.importance);
    if (absImportance < 0.1) return "";
    
    if (token.sentiment === 'neutral') {
      return "bg-orange-400 text-black";
    } else if (token.sentiment === 'positive') {
      return "bg-cyan-400 text-black";
    } else {
      return "bg-blue-400 text-black";
    }
  };
  
  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">No Analysis Data</h3>
          <p className="text-muted-foreground">Run a sentiment analysis to see detailed explanations.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Generating Explanations</AlertTitle>
          <AlertDescription>
            Please wait while we generate detailed explanations for your text. This may take a moment.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>LIME Explanation</CardTitle>
            <CardDescription>Loading explanation data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>Identifying important words...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getSelectedWordDetails = () => {
    if (!selectedWord || !limeExplanation) return null;
    
    const wordFeature = limeExplanation.features.find(
      f => f.word.toLowerCase() === selectedWord.toLowerCase()
    );
    
    if (!wordFeature) return null;
    
    return {
      word: wordFeature.word,
      importance: wordFeature.importance,
      sentiment: wordFeature.sentiment,
      contributes_to: wordFeature.contributes_to || 'Unknown',
      impact: Math.abs(wordFeature.importance) > 0.5 ? 'High' : 
             Math.abs(wordFeature.importance) > 0.2 ? 'Medium' : 'Low'
    };
  };
  
  const selectedWordDetails = getSelectedWordDetails();
  
  // Format number for display
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || isNaN(num)) return "0.000";
    return num.toFixed(3);
  };
  
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Explanation Methods</AlertTitle>
        <AlertDescription>
          Multiple explanation techniques are provided to give you a comprehensive understanding of the model's decision process.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Text with highlighted words</CardTitle>
          <CardDescription>
            Each word is highlighted based on its contribution to the sentiment prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-md border leading-relaxed">
            {limeExplanation?.tokens.map((item, index) => {
              const colorClass = getTokenColorClass(item);
              
              return (
                <span 
                  key={index}
                  className={cn(
                    "px-0.5 py-0.5 rounded cursor-pointer transition-all",
                    colorClass,
                    selectedPart === index ? "ring-2 ring-black dark:ring-white" : ""
                  )}
                  onClick={() => {
                    setSelectedPart(selectedPart === index ? null : index);
                    if (item.importance !== 0) {
                      setSelectedWord(item.token.toLowerCase());
                      setShowWordDetails(true);
                    }
                  }}
                  title={`Importance: ${typeof item.importance === 'number' ? item.importance.toFixed(2) : 'N/A'}`}
                >
                  {item.token}
                </span>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 inline-block bg-cyan-400 rounded"></span>
              <span className="text-sm">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 inline-block bg-orange-400 rounded"></span>
              <span className="text-sm">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 inline-block bg-blue-400 rounded"></span>
              <span className="text-sm">Negative</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="lime">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lime">LIME</TabsTrigger>
          <TabsTrigger value="shap">SHAP</TabsTrigger>
          <TabsTrigger value="counterfactual">Counterfactual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lime" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Local Interpretable Model-Agnostic Explanations</CardTitle>
              <CardDescription>
                LIME explains which words contribute most to the model's prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-800 text-white rounded-md mb-6">
                <h3 className="font-bold text-lg">LIME Explanation:</h3>
                
                <div className="mb-6 mt-4">
                  <h4 className="text-sm font-medium mb-2">Prediction probabilities</h4>
                  <div className="space-y-2">
                    {getClassProbabilities().map((prob, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-24 text-sm">{prob.class}</div>
                        <div className="flex-1 h-6 bg-gray-700 rounded-sm overflow-hidden relative">
                          <div 
                            className={`h-full ${
                              prob.class === "Neutral" ? "bg-orange-400" : 
                              prob.class.includes("Positive") ? "bg-green-500" : 
                              prob.class === "Negative" ? "bg-blue-400" : "bg-red-400"
                            }`}
                            style={{ width: `${Math.min((prob.value || 0) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-sm">{prob.value?.toFixed(2) || "0.00"}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-center text-cyan-400">NOT Neutral</h4>
                    <div className="space-y-2">
                      {limeExplanation?.notNeutralFeatures.slice(0, 5).map((feature, idx) => {
                        const absValue = Math.abs(feature.importance);
                        const width = `${Math.min(absValue * 100, 100)}%`;
                        
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <div className="w-16 text-right text-xs">{feature.word}</div>
                            <div className="w-10 text-right text-xs">{absValue.toFixed(2)}</div>
                            <div 
                              className="h-4 bg-cyan-400"
                              style={{ width }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-center text-orange-400">Neutral</h4>
                    <div className="space-y-2">
                      {limeExplanation?.neutralFeatures.slice(0, 5).map((feature, idx) => {
                        const absValue = Math.abs(feature.importance);
                        const width = `${Math.min(absValue * 100, 100)}%`;
                        
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <div className="w-16 text-right text-xs opacity-0">spacer</div>
                            <div 
                              className="h-4 bg-orange-400 ml-auto"
                              style={{ width }}
                            ></div>
                            <div className="w-10 text-left text-xs">{absValue.toFixed(2)}</div>
                            <div className="w-16 text-left text-xs">{feature.word}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Text with highlighted words</h4>
                  <div className="p-3 bg-slate-900 rounded-md leading-relaxed">
                    {limeExplanation?.tokens.map((item, index) => {
                      const colorClass = getTokenColorClass(item);
                      
                      return (
                        <span 
                          key={index}
                          className={cn(
                            "px-0.5 py-0.5 rounded cursor-pointer transition-all",
                            colorClass,
                            selectedPart === index ? "ring-2 ring-white" : ""
                          )}
                          onClick={() => {
                            setSelectedPart(selectedPart === index ? null : index);
                            if (item.importance !== 0) {
                              setSelectedWord(item.token.toLowerCase());
                              setShowWordDetails(true);
                            }
                          }}
                          title={`Importance: ${typeof item.importance === 'number' ? item.importance.toFixed(2) : 'N/A'}`}
                        >
                          {item.token}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mt-8">Contrastive LIME Explanation:</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-center text-cyan-400">NOT Very Negative</h4>
                    <div className="space-y-2">
                      {limeExplanation?.notNeutralFeatures.slice(0, 3).map((feature, idx) => {
                        const absValue = Math.abs(feature.importance);
                        const width = `${Math.min(absValue * 150, 100)}%`;
                        
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <div className="w-14 text-right text-xs">{feature.word}</div>
                            <div className="w-8 text-right text-xs">{absValue.toFixed(2)}</div>
                            <div 
                              className="h-4 bg-cyan-400"
                              style={{ width }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-center text-red-400">Very Negative</h4>
                    <div className="space-y-2">
                      {limeExplanation?.neutralFeatures.slice(0, 3).map((feature, idx) => {
                        const absValue = Math.abs(feature.importance);
                        const width = `${Math.min(absValue * 150, 100)}%`;
                        
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <div 
                              className="h-4 bg-red-400 ml-auto"
                              style={{ width }}
                            ></div>
                            <div className="w-8 text-left text-xs">{absValue.toFixed(2)}</div>
                            <div className="w-14 text-left text-xs">{feature.word}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-center text-cyan-400">NOT Negative</h4>
                    <div className="space-y-2">
                      {limeExplanation?.notNegativeFeatures.slice(0, 3).map((feature, idx) => {
                        const absValue = Math.abs(feature.importance);
                        const width = `${Math.min(absValue * 150, 100)}%`;
                        
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <div className="w-14 text-right text-xs">{feature.word}</div>
                            <div className="w-8 text-right text-xs">{absValue.toFixed(2)}</div>
                            <div 
                              className="h-4 bg-cyan-400"
                              style={{ width }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-center text-blue-400">Negative</h4>
                    <div className="space-y-2">
                      {limeExplanation?.negativeFeatures.slice(0, 3).map((feature, idx) => {
                        const absValue = Math.abs(feature.importance);
                        const width = `${Math.min(absValue * 150, 100)}%`;
                        
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <div 
                              className="h-4 bg-blue-400 ml-auto"
                              style={{ width }}
                            ></div>
                            <div className="w-8 text-left text-xs">{absValue.toFixed(2)}</div>
                            <div className="w-14 text-left text-xs">{feature.word}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Text with highlighted words</h4>
                  <div className="p-3 bg-slate-900 rounded-md leading-relaxed">
                    {limeExplanation?.tokens.map((item, index) => {
                      const colorClass = getTokenColorClass(item);
                      
                      return (
                        <span 
                          key={index}
                          className={cn(
                            "px-0.5 py-0.5 rounded cursor-pointer transition-all",
                            colorClass
                          )}
                          onClick={() => {
                            setSelectedPart(index);
                            if (item.importance !== 0) {
                              setSelectedWord(item.token.toLowerCase());
                              setShowWordDetails(true);
                            }
                          }}
                        >
                          {item.token}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shap" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shapley Additive Explanations</CardTitle>
              <CardDescription>
                SHAP assigns each feature an importance value for a particular prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md mb-4">
                <h4 className="font-semibold mb-2">How SHAP Works:</h4>
                <p className="text-sm text-muted-foreground">
                  SHAP uses game theory to calculate the marginal contribution of each feature to the prediction. It analyzes what happens when each feature is present or absent, considering all possible combinations to fairly distribute the impact among features.
                </p>
              </div>
              
              <div className="bg-card border rounded-md p-6">
                <h3 className="font-medium text-lg mb-4 text-center">SHAP Force Plot</h3>
                <div className="h-40 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-destructive rounded-l-md"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-secondary rounded-r-md"></div>
                  
                  <div className="absolute left-4 right-4 top-1/2 h-1 bg-gray-300 -translate-y-1/2"></div>
                  
                  <div className="absolute left-[40%] top-1/2 -translate-y-1/2 h-8 w-1 bg-gray-500"></div>
                  <div className="absolute left-[40%] top-[calc(50%-20px)] -translate-x-1/2 text-xs">Base value</div>
                  
                  <div className="absolute right-[25%] top-1/2 -translate-y-1/2 h-8 w-2 bg-black"></div>
                  <div className="absolute right-[25%] top-[calc(50%+20px)] -translate-x-1/2 text-xs font-medium">
                    Prediction<br />
                    {analysisResult?.sentiment ? `(${analysisResult.sentiment})` : "(0.87)"}
                  </div>
                  
                  <div className="absolute left-[45%] w-[35%] top-1/2 h-6 -translate-y-1/2 bg-gradient-to-r from-red-200 via-yellow-100 to-secondary-300"></div>
                  
                  {analysisResult?.keyFeatures ? (
                    analysisResult.keyFeatures.slice(0, 5).map((feature, idx) => {
                      const isPositive = feature.sentiment === 'positive';
                      const verticalPos = isPositive ? 10 + (idx * 15) : 70 + (idx * 15);
                      const horizontalPos = 45 + (idx * 5);
                      
                      return (
                        <div 
                          key={idx} 
                          className="absolute text-xs"
                          style={{
                            left: `${horizontalPos}%`,
                            top: `${verticalPos}%`
                          }}
                        >
                          {feature.word}
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="absolute left-[42%] top-[30%] text-xs">Income Ratio</div>
                      <div className="absolute left-[52%] top-[20%] text-xs">Credit History</div>
                      <div className="absolute left-[62%] top-[10%] text-xs">Payment History</div>
                      <div className="absolute left-[45%] top-[70%] text-xs">Applications</div>
                      <div className="absolute left-[55%] top-[80%] text-xs">Current Debt</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="counterfactual" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Counterfactual Explanations</CardTitle>
              <CardDescription>
                Shows what changes would be needed to get a different outcome
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md mb-4">
                <h4 className="font-semibold mb-2">How Counterfactuals Work:</h4>
                <p className="text-sm text-muted-foreground">
                  Counterfactual explanations identify the smallest changes to feature values that would change the prediction to a desired outcome. They answer the question: "What would need to be different to get a different result?"
                </p>
              </div>
              
              <div className="bg-card border rounded-md p-6">
                {counterfactualExplanation ? (
                  <>
                    <h3 className="font-medium text-lg mb-4">
                      To Change the Prediction from "{counterfactualExplanation.currentClass}" to "{counterfactualExplanation.oppositeClass}":
                    </h3>
                    
                    <div className="space-y-4">
                      {counterfactualExplanation.changes.map((change, idx) => (
                        <div key={idx} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{change.feature}</span>
                              <div className="flex items-center mt-1">
                                <span className={`text-sm ${counterfactualExplanation.currentClass.includes('Positive') ? 'text-secondary' : counterfactualExplanation.currentClass.includes('Negative') ? 'text-destructive' : 'text-yellow-500'}`}>
                                  {change.current}
                                </span>
                                <span className="text-sm mx-2">→</span>
                                <span className={`text-sm ${counterfactualExplanation.oppositeClass.includes('Positive') ? 'text-secondary' : counterfactualExplanation.oppositeClass.includes('Negative') ? 'text-destructive' : 'text-yellow-500'}`}>
                                  {change.target}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm px-2 py-1 bg-muted rounded-full">
                              Change Required: {change.change}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-lg mb-4">To Change the Prediction from "Approved" to "Denied":</h3>
                    
                    <div className="space-y-4">
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">Income to Debt Ratio</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-secondary">72%</span>
                              <span className="text-sm mx-2">→</span>
                              <span className="text-sm text-destructive">28%</span>
                            </div>
                          </div>
                          <div className="text-sm px-2 py-1 bg-muted rounded-full">
                            Change Required: -44%
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">Recent Applications</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-yellow-500">3</span>
                              <span className="text-sm mx-2">→</span>
                              <span className="text-sm text-destructive">7</span>
                            </div>
                          </div>
                          <div className="text-sm px-2 py-1 bg-muted rounded-full">
                            Change Required: +4
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">Payment History</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-secondary">95%</span>
                              <span className="text-sm mx-2">→</span>
                              <span className="text-sm text-destructive">68%</span>
                            </div>
                          </div>
                          <div className="text-sm px-2 py-1 bg-muted rounded-full">
                            Change Required: -27%
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Any one of these changes would be sufficient to change the prediction.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showWordDetails} onOpenChange={setShowWordDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Word Influence Details</DialogTitle>
            <DialogDescription>
              How this word impacts the model's decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedWordDetails && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Word:</span>
                <span className="text-lg">{selectedWordDetails.word}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Sentiment Type:</span>
                <span className={`px-2 py-1 rounded ${
                  selectedWordDetails.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  selectedWordDetails.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedWordDetails.sentiment.charAt(0).toUpperCase() + selectedWordDetails.sentiment.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Contributes To:</span>
                <span className={`px-2 py-1 rounded ${
                  selectedWordDetails.contributes_to.includes('NOT') ? 'bg-cyan-100 text-cyan-800' :
                  selectedWordDetails.contributes_to === 'Neutral' ? 'bg-orange-100 text-orange-800' :
                  selectedWordDetails.contributes_to === 'Negative' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {selectedWordDetails.contributes_to}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Importance Score:</span>
                <span className="font-mono">{formatNumber(selectedWordDetails.importance)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Impact Level:</span>
                <span className={`px-2 py-1 rounded ${
                  selectedWordDetails.impact === 'High' ? 'bg-red-100 text-red-800' :
                  selectedWordDetails.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedWordDetails.impact}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
          <CardTitle>Decision Path</CardTitle>
          <CardDescription>
            Visual representation of the model's decision process
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 relative">
            <div className="absolute left-1/2 top-0 w-32 h-16 -translate-x-1/2 border-2 border-primary rounded-md flex items-center justify-center bg-primary/5">
              <div className="text-center text-sm">
                <div className="font-medium">Start</div>
                <div className="text-xs text-muted-foreground">Evaluation</div>
              </div>
            </div>
            
            <svg className="absolute left-1/2 top-16 -translate-x-1/2" width="2" height="20" xmlns="http://www.w3.org/2000/svg">
              <line x1="1" y1="0" x2="1" y2="20" stroke="currentColor" strokeDasharray="4" />
            </svg>
            
            <div className="absolute left-1/2 top-36 -translate-x-1/2 w-80 grid grid-cols-3 gap-4">
              {analysisResult?.keyFeatures ? (
                analysisResult.keyFeatures.slice(0, 3).map((feature, idx) => (
                  <div 
                    key={idx} 
                    className={`border-2 rounded-md p-2 flex flex-col items-center justify-center h-20 ${
                      feature.sentiment === 'positive' ? 'border-secondary bg-secondary/5' : 
                      feature.sentiment === 'negative' ? 'border-destructive bg-destructive/5' : 
                      'border-yellow-500 bg-yellow-100/5'
                    }`}
                  >
                    <div className="font-medium text-sm">{feature.word}</div>
                    <div className="text-xs mt-1">{feature.sentiment}</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="border-2 border-secondary bg-secondary/5 rounded-md p-2 flex flex-col items-center justify-center h-20">
                    <div className="font-medium text-sm">Income</div>
                    <div className="text-xs mt-1">positive impact</div>
                  </div>
                  <div className="border-2 border-yellow-500 bg-yellow-100/5 rounded-md p-2 flex flex-col items-center justify-center h-20">
                    <div className="font-medium text-sm">Applications</div>
                    <div className="text-xs mt-1">neutral impact</div>
                  </div>
                  <div className="border-2 border-destructive bg-destructive/5 rounded-md p-2 flex flex-col items-center justify-center h-20">
                    <div className="font-medium text-sm">Debt</div>
                    <div className="text-xs mt-1">negative impact</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
