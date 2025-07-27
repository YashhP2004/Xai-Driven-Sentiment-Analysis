// This file simulates the sentiment analysis that would be performed by your Python model
// In a real application, you would need a backend service to run the Python model

export type SentimentLabel = 'Very Negative' | 'Negative' | 'Neutral' | 'Positive' | 'Very Positive';

export interface SentimentResult {
  text: string;
  sentiment: SentimentLabel;
  confidences: Record<SentimentLabel, number>;
  keyFeatures?: Array<{
    word: string;
    importance: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    contributes_to?: string; // What class this feature contributes to
  }>;
}

interface WordSentiment {
  sentiment: 'positive' | 'negative' | 'neutral';
  value: number;
  contributes_to?: string;
}

// Mock sentiment analysis function - in a real app, this would call your backend API
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // This is a simplified simulation of your model's behavior
  const words = text.toLowerCase().split(/\s+/);
  
  // Simple word sentiment dictionary for demo purposes - expanded to include contribution info
  const wordSentiments: Record<string, WordSentiment> = {
    'love': { sentiment: 'positive', value: 0.9, contributes_to: 'NOT Neutral' },
    'great': { sentiment: 'positive', value: 0.8, contributes_to: 'NOT Neutral' },
    'good': { sentiment: 'positive', value: 0.7, contributes_to: 'NOT Neutral' },
    'nice': { sentiment: 'positive', value: 0.6, contributes_to: 'NOT Neutral' },
    'excellent': { sentiment: 'positive', value: 0.85, contributes_to: 'NOT Neutral' },
    'amazing': { sentiment: 'positive', value: 0.82, contributes_to: 'NOT Neutral' },
    'happy': { sentiment: 'positive', value: 0.8, contributes_to: 'NOT Neutral' },
    'bad': { sentiment: 'negative', value: 0.7, contributes_to: 'NOT Neutral' },
    'worst': { sentiment: 'negative', value: 0.9, contributes_to: 'Negative' },
    'terrible': { sentiment: 'negative', value: 0.85, contributes_to: 'Negative' },
    'disappointed': { sentiment: 'negative', value: 0.7, contributes_to: 'Negative' },
    'waste': { sentiment: 'negative', value: 0.8, contributes_to: 'Negative' },
    'okay': { sentiment: 'neutral', value: 0.6, contributes_to: 'Neutral' },
    'average': { sentiment: 'neutral', value: 0.5, contributes_to: 'Neutral' },
    'expected': { sentiment: 'neutral', value: 0.4, contributes_to: 'Neutral' },
    'but': { sentiment: 'neutral', value: 0.3, contributes_to: 'Neutral' },
    'however': { sentiment: 'neutral', value: 0.35, contributes_to: 'Neutral' },
    'food': { sentiment: 'neutral', value: 0.5, contributes_to: 'Neutral' },
    'too': { sentiment: 'neutral', value: 0.2, contributes_to: 'Neutral' },
    'serve': { sentiment: 'neutral', value: 0.4, contributes_to: 'NOT Neutral' },
    'service': { sentiment: 'neutral', value: 0.45, contributes_to: 'NOT Neutral' },
    'really': { sentiment: 'neutral', value: 0.1, contributes_to: 'NOT Neutral' },
    'was': { sentiment: 'neutral', value: 0.12, contributes_to: 'NOT Negative' },
  };
  
  // Calculate overall sentiment score (-1 to 1)
  let sentimentSum = 0;
  let matchedWords = 0;
  
  const keyFeatures: Array<{word: string; importance: number; sentiment: 'positive' | 'negative' | 'neutral'; contributes_to?: string}> = [];
  
  // Find sentiment-carrying words and their importance
  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord in wordSentiments) {
      const { sentiment, value, contributes_to } = wordSentiments[cleanWord];
      const importance = value;
      
      if (sentiment === 'positive') {
        sentimentSum += importance;
      } else if (sentiment === 'negative') {
        sentimentSum -= importance;
      }
      
      keyFeatures.push({
        word: cleanWord,
        importance: sentiment === 'negative' ? -importance : importance,
        sentiment,
        contributes_to
      });
      
      matchedWords++;
    }
  });
  
  // Normalize sentiment score
  const normalizedScore = matchedWords > 0 ? sentimentSum / matchedWords : 0;
  
  // Determine sentiment category based on score
  let sentiment: SentimentLabel;
  if (normalizedScore <= -0.6) sentiment = 'Very Negative';
  else if (normalizedScore <= -0.2) sentiment = 'Negative';
  else if (normalizedScore <= 0.2) sentiment = 'Neutral';
  else if (normalizedScore <= 0.6) sentiment = 'Positive';
  else sentiment = 'Very Positive';
  
  // Calculate confidence scores similar to the Python model output
  const confidences: Record<SentimentLabel, number> = {
    'Very Negative': 0.01,
    'Negative': text.toLowerCase().includes('bad') ? 0.39 : 0.03,
    'Neutral': text.toLowerCase().includes('but') ? 0.58 : 0.05,
    'Positive': text.toLowerCase().includes('good') ? 0.37 : 0.02,
    'Very Positive': 0.00
  };
  
  // For "food was really amazing but service was too bad" example
  if (text.toLowerCase().includes('food') && 
      text.toLowerCase().includes('bad') && 
      text.toLowerCase().includes('service')) {
    confidences['Negative'] = 0.39;
    confidences['Neutral'] = 0.58;
    confidences['Positive'] = 0.02;
    confidences['Very Negative'] = 0.01;
    confidences['Very Positive'] = 0.00;
  }
  
  // Sort key features by importance (absolute value)
  keyFeatures.sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    text,
    sentiment,
    confidences,
    keyFeatures: keyFeatures.slice(0, 10) // Return top 10 important words
  };
}

// Sample analysis to demonstrate the expected format
export const sampleAnalysisResult: SentimentResult = {
  text: "Food was really amazing but service was too bad",
  sentiment: "Neutral",
  confidences: {
    "Very Positive": 0.0000,
    "Positive": 0.02,
    "Neutral": 0.58,
    "Negative": 0.39,
    "Very Negative": 0.01
  },
  keyFeatures: [
    { word: "bad", importance: -0.7, sentiment: "negative", contributes_to: "NOT Neutral" },
    { word: "food", importance: 0.5, sentiment: "neutral", contributes_to: "Neutral" },
    { word: "service", importance: 0.45, sentiment: "neutral", contributes_to: "NOT Neutral" },
    { word: "amazing", importance: 0.82, sentiment: "positive", contributes_to: "NOT Neutral" },
    { word: "but", importance: 0.3, sentiment: "neutral", contributes_to: "Neutral" },
    { word: "really", importance: 0.1, sentiment: "neutral", contributes_to: "NOT Neutral" },
    { word: "was", importance: 0.12, sentiment: "neutral", contributes_to: "NOT Negative" },
    { word: "too", importance: 0.2, sentiment: "neutral", contributes_to: "Neutral" }
  ]
};
