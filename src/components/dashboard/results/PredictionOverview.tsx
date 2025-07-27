
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PredictionOverviewProps {
  analysisResult?: {
    text: string;
    sentiment: string;
    confidences: Record<string, number>;
    keyFeatures: Array<{
      word: string;
      importance: number;
      sentiment: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

export function PredictionOverview({ analysisResult }: PredictionOverviewProps) {
  // Default data if no analysis result is provided
  const predictionData = analysisResult ? {
    sentiment: analysisResult.sentiment,
    confidence: Object.entries(analysisResult.confidences)
      .find(([label]) => label === analysisResult.sentiment)?.[1] || 0,
    modelType: "Sentiment Analysis Model",
    executionTime: "245ms",
  } : {
    sentiment: "Positive",
    confidence: 0.87,
    modelType: "Sentiment Analysis Model",
    executionTime: "245ms",
  };
  
  // Colors for different sentiments
  const sentimentColors = {
    "Very Positive": "#22C55E", // bright green
    "Positive": "#4ADE80", // green
    "Neutral": "#3B82F6", // blue
    "Negative": "#F97316", // orange
    "Very Negative": "#EF4444", // red
  };
  
  const pieData = [
    { name: "Confidence", value: predictionData.confidence },
    { name: "Uncertainty", value: 1 - predictionData.confidence },
  ];
  
  const COLORS = [
    sentimentColors[predictionData.sentiment as keyof typeof sentimentColors], 
    "#E2E8F0"
  ];

  // Prepare confidence data for display
  const confidenceData = analysisResult ? 
    Object.entries(analysisResult.confidences)
      .map(([label, value]) => ({
        name: label,
        value: Number(value),
        color: sentimentColors[label as keyof typeof sentimentColors]
      }))
      .sort((a, b) => b.value - a.value) : 
    [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Sentiment Result</CardTitle>
            <CardDescription>Overall sentiment of the review</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div 
              className="text-4xl font-bold mb-2"
              style={{ color: sentimentColors[predictionData.sentiment as keyof typeof sentimentColors] }}
            >
              {predictionData.sentiment}
            </div>
            <div className="text-sm text-muted-foreground">
              with {(predictionData.confidence * 100).toFixed(1)}% confidence
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Model Details</CardTitle>
            <CardDescription>Information about the analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model Type:</span>
                <span className="font-medium">{predictionData.modelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Execution Time:</span>
                <span className="font-medium">{predictionData.executionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Text Length:</span>
                <span className="font-medium">{analysisResult?.text.length || 0} characters</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Confidence Analysis</CardTitle>
          <CardDescription>
            Visualization of model's confidence in its sentiment prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Confidence Breakdown</CardTitle>
            <CardDescription>Confidence levels for each sentiment category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confidenceData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm">{(item.value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${item.value * 100}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Key insights from the sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The model predicts a <strong>{predictionData.sentiment}</strong> sentiment with 
            {analysisResult?.confidences ? ' ' : ' high '}confidence based primarily on the following factors:
          </p>
          <ul className="space-y-2">
            {analysisResult?.keyFeatures ? (
              analysisResult.keyFeatures.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span 
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ 
                      backgroundColor: feature.sentiment === 'positive' 
                        ? sentimentColors["Positive"] 
                        : feature.sentiment === 'negative' 
                          ? sentimentColors["Negative"] 
                          : sentimentColors["Neutral"] 
                    }}
                  ></span>
                  <span>
                    <strong>"{feature.word}"</strong>: 
                    {feature.sentiment === 'positive' 
                      ? ' Contributes positively to the sentiment.' 
                      : feature.sentiment === 'negative'
                        ? ' Contributes negatively to the sentiment.'
                        : ' Has a neutral impact on the sentiment.'}
                  </span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span 
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ backgroundColor: sentimentColors[predictionData.sentiment as keyof typeof sentimentColors] }}
                  ></span>
                  <span>
                    <strong>Positive Language</strong>: The review contains several positive terms and phrases.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ backgroundColor: sentimentColors[predictionData.sentiment as keyof typeof sentimentColors] }}
                  ></span>
                  <span>
                    <strong>Context Analysis</strong>: The overall context of the review indicates satisfaction.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ backgroundColor: sentimentColors[predictionData.sentiment as keyof typeof sentimentColors] }}
                  ></span>
                  <span>
                    <strong>Semantic Analysis</strong>: The tone and structure of the text suggest a favorable opinion.
                  </span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
