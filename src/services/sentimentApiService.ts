
/**
 * Service for communicating with the sentiment analysis API backend
 */

export interface SentimentApiResponse {
  sentiment: string;
  confidence: number;
  text?: string;
  error?: string;
}

export interface ExplanationApiResponse {
  text: string;
  explanation: {
    keyFeatures: Array<{
      word: string;
      importance: number;
      sentiment: 'positive' | 'negative' | 'neutral';
      contributes_to?: string;
    }>;
    topClass: string;
  };
  error?: string;
}

export interface CounterfactualApiResponse {
  original_sentence: string;
  target_word: string;
  counterfactual_sentence: string;
  original_sentiment: string;
  original_prob: number;
  counterfactual_sentiment: string;
  counterfactual_prob: number;
  sentiment_change: number;
  error?: string;
}

export interface SentimentApiError {
  detail: string;
}

export interface SentimentApiRequest {
  text: string;
}

// API base URL - change this to match your backend deployment
const API_BASE_URL = "http://localhost:8000";

/**
 * Send a text to the backend API for sentiment analysis
 * @param text The text to analyze
 * @returns Promise with the sentiment analysis result
 */
export async function analyzeSentimentWithApi(text: string): Promise<SentimentApiResponse> {
  try {
    console.log("Sending text to API:", text);
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json() as SentimentApiError;
      throw new Error(errorData.detail || 'Failed to analyze sentiment');
    }

    const result = await response.json() as SentimentApiResponse;
    console.log("API response:", result);
    return result;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

/**
 * Get explanations for a sentiment prediction from the API
 * @param text The text to explain
 * @returns Promise with the explanation data
 */
export async function getExplanationFromApi(text: string): Promise<ExplanationApiResponse> {
  try {
    console.log("Requesting explanation for:", text);
    
    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      // Set a longer timeout as explanations take more time
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json() as SentimentApiError;
      throw new Error(errorData.detail || 'Failed to get explanation');
    }

    const result = await response.json() as ExplanationApiResponse;
    console.log("Explanation response:", result);
    return result;
  } catch (error) {
    console.error('Explanation API error:', error);
    throw error;
  }
}

/**
 * Get counterfactual analysis for a text from the API
 * @param text The text to analyze
 * @returns Promise with the counterfactual analysis data
 */
export async function getCounterfactualFromApi(text: string): Promise<CounterfactualApiResponse> {
  try {
    console.log("Requesting counterfactual analysis for:", text);
    
    const response = await fetch(`${API_BASE_URL}/counterfactual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentence: text }),
      // Set a longer timeout as counterfactual analysis takes more time
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json() as SentimentApiError;
      throw new Error(errorData.detail || 'Failed to get counterfactual analysis');
    }

    const result = await response.json() as CounterfactualApiResponse;
    console.log("Counterfactual response:", result);
    return result;
  } catch (error) {
    console.error('Counterfactual API error:', error);
    throw error;
  }
}

/**
 * Convert API response to our internal SentimentResult format
 */
export function mapApiResponseToSentimentResult(
  text: string, 
  apiResponse: SentimentApiResponse
) {
  // Map to our application's sentiment label format
  const mapSentimentLabel = (apiSentiment: string) => {
    // Convert from API format to our format if needed
    // Assuming API returns: "positive", "negative", "neutral", etc.
    switch(apiSentiment.toLowerCase()) {
      case 'positive': return 'Positive';
      case 'very positive': return 'Very Positive';
      case 'negative': return 'Negative';
      case 'very negative': return 'Very Negative';
      case 'neutral': return 'Neutral';
      default: return 'Neutral';
    }
  };

  // Generate confidences object with the main sentiment having the highest value
  const generateConfidences = (sentiment: string, confidence: number) => {
    const result: Record<string, number> = {
      'Very Positive': 0.0,
      'Positive': 0.0,
      'Neutral': 0.0,
      'Negative': 0.0,
      'Very Negative': 0.0,
    };
    
    // Set the main sentiment confidence
    result[sentiment] = confidence;
    
    // Distribute remaining confidence among other sentiments
    const remainingConfidence = 1 - confidence;
    const otherSentiments = Object.keys(result).filter(s => s !== sentiment);
    otherSentiments.forEach(sentiment => {
      result[sentiment] = remainingConfidence / otherSentiments.length;
    });
    
    return result;
  };

  const mappedSentiment = mapSentimentLabel(apiResponse.sentiment);
  
  // Create empty keyFeatures array since we'll fetch this separately
  // This will be populated later by the explanation API call
  return {
    text,
    sentiment: mappedSentiment,
    confidences: generateConfidences(mappedSentiment, apiResponse.confidence),
    keyFeatures: [] // Empty array that will be filled later by the explanation
  };
}
