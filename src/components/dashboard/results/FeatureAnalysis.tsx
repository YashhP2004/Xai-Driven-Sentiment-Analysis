import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for feature analysis
interface Feature {
  word: string;
  importance: number;
  sentiment: string;
}

interface FeatureAnalysisProps {
  analysisResult?: {
    keyFeatures?: Feature[];
  };
  isLoading?: boolean;
}

export function FeatureAnalysis({ analysisResult, isLoading = false }: FeatureAnalysisProps) {
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");
  
  // Group features by sentiment
  const getFeaturesBySentiment = () => {
    if (!analysisResult?.keyFeatures) return { positive: [], negative: [], neutral: [] };
    
    const positive = analysisResult.keyFeatures.filter(f => f.sentiment === 'positive');
    const negative = analysisResult.keyFeatures.filter(f => f.sentiment === 'negative');
    const neutral = analysisResult.keyFeatures.filter(f => f.sentiment === 'neutral');
    
    return { positive, negative, neutral };
  };
  
  const featureGroups = getFeaturesBySentiment();
  
  // Prepare data for the chart
  const getChartData = () => {
    if (!analysisResult?.keyFeatures) return [];
    
    return analysisResult.keyFeatures
      .slice(0, 10) // Take top 10 features
      .map(feature => ({
        name: feature.word,
        value: feature.importance,
        sentiment: feature.sentiment
      }))
      .sort((a, b) => b.value - a.value); // Sort by importance
  };
  
  const chartData = getChartData();
  
  // Get color for a sentiment
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#22c55e'; // green-500
      case 'negative': return '#ef4444'; // red-500
      case 'neutral': return '#f97316';  // orange-500
      default: return '#a3a3a3';         // gray-400
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>
              Analyzing important words in your text...
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex justify-center items-center h-72">
              <div className="space-y-4 w-full">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!analysisResult?.keyFeatures || analysisResult.keyFeatures.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">No Feature Data Available</h3>
          <p className="text-muted-foreground">
            There are no key features to display. Try analyzing a different text.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Key Features</CardTitle>
              <CardDescription>
                Top words that influence the sentiment
              </CardDescription>
            </div>
            <Tabs
              defaultValue={viewMode}
              onValueChange={(value) => setViewMode(value as "chart" | "list")}
              className="ml-4"
            >
              <TabsList className="bg-secondary rounded-md p-1">
                <TabsTrigger value="chart" className="data-[state=active]:bg-secondary-foreground data-[state=active]:text-secondary-foreground">
                  Chart
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-secondary-foreground data-[state=active]:text-secondary-foreground">
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "chart" ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />
                  ))}
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisResult.keyFeatures.map((feature) => (
                <div key={feature.word} className="p-4 rounded-md shadow-sm border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{feature.word}</span>
                    <Badge variant="secondary">{feature.importance.toFixed(2)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Sentiment: {feature.sentiment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Positive Words</CardTitle>
            <CardDescription>Words that contribute to positive sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-none pl-0">
              {featureGroups.positive.map((feature) => (
                <li key={feature.word} className="py-2 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span>{feature.word}</span>
                    <span className="text-muted-foreground text-sm">{feature.importance.toFixed(2)}</span>
                  </div>
                </li>
              ))}
              {featureGroups.positive.length === 0 && (
                <li className="text-center py-2 text-muted-foreground">No positive words found.</li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Negative Words</CardTitle>
            <CardDescription>Words that contribute to negative sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-none pl-0">
              {featureGroups.negative.map((feature) => (
                <li key={feature.word} className="py-2 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span>{feature.word}</span>
                    <span className="text-muted-foreground text-sm">{feature.importance.toFixed(2)}</span>
                  </div>
                </li>
              ))}
              {featureGroups.negative.length === 0 && (
                <li className="text-center py-2 text-muted-foreground">No negative words found.</li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Neutral Words</CardTitle>
            <CardDescription>Words with a neutral sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-none pl-0">
              {featureGroups.neutral.map((feature) => (
                <li key={feature.word} className="py-2 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span>{feature.word}</span>
                    <span className="text-muted-foreground text-sm">{feature.importance.toFixed(2)}</span>
                  </div>
                </li>
              ))}
              {featureGroups.neutral.length === 0 && (
                <li className="text-center py-2 text-muted-foreground">No neutral words found.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
