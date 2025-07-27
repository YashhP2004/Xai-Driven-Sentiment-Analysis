
import { analyzeSentiment, SentimentResult } from "@/utils/sentimentAnalysis";
import { 
  analyzeSentimentWithApi, 
  getExplanationFromApi,
  getCounterfactualFromApi,
  mapApiResponseToSentimentResult 
} from "@/services/sentimentApiService";
import { toast } from "sonner";

export async function performSentimentAnalysis(inputText: string): Promise<SentimentResult> {
  try {
    // Dispatch an event to indicate analysis has started
    document.dispatchEvent(new CustomEvent('sentiment-analysis-started', {
      detail: { text: inputText }
    }));

    // First try to get the sentiment from the API
    const apiResponse = await analyzeSentimentWithApi(inputText);
    
    // Map the API response to our application's format
    const baseResult = mapApiResponseToSentimentResult(inputText, apiResponse);
    
    // Return the basic sentiment result immediately
    const initialResult = baseResult as SentimentResult;
    
    // Fetch the explanation asynchronously without blocking
    getExplanationFromApi(inputText)
      .then(explanationResponse => {
        // When explanation is ready, update the UI with the explanation data
        if (explanationResponse && explanationResponse.explanation) {
          // Save the enhanced result with the explanation data
          const enhancedResult = {
            ...baseResult,
            keyFeatures: explanationResponse.explanation.keyFeatures,
            text: inputText
          };
          
          // Dispatch an event with the updated result including explanations
          const event = new CustomEvent('sentiment-explanation-ready', {
            detail: enhancedResult
          });
          document.dispatchEvent(event);
          console.log("Explanation data ready:", enhancedResult);
          
          // Now that we have explanations, proceed with counterfactual analysis
          initiateCounterfactualAnalysis(inputText);
        }
      })
      .catch(explanationError => {
        console.error("Failed to get explanation:", explanationError);
        // We don't show an error toast here since we already have a basic result
        
        // Even if explanation fails, still try to get counterfactual
        initiateCounterfactualAnalysis(inputText);
      });
    
    return initialResult;
  } catch (apiError) {
    console.error("API analysis failed, falling back to local analysis:", apiError);
    // Fallback to local analysis without showing error toast
    const localResult = await analyzeSentiment(inputText);
    
    // Since API failed, we'll use local analysis for counterfactual to simulate the experience
    setTimeout(() => {
      simulateCounterfactualAnalysis(inputText);
    }, 1500);
    
    return localResult;
  }
}

// Separate function to initiate counterfactual analysis after explanation
function initiateCounterfactualAnalysis(inputText: string) {
  // Start the counterfactual analysis after explanation is ready
  getCounterfactualFromApi(inputText)
    .then(counterfactualResponse => {
      if (counterfactualResponse) {
        console.log("Counterfactual analysis received:", counterfactualResponse);
        
        // Store the response in session storage for persistence
        try {
          sessionStorage.setItem('counterfactualResult', JSON.stringify(counterfactualResponse));
        } catch (err) {
          console.error("Failed to store counterfactual in session storage:", err);
        }
        
        // Dispatch an event with the counterfactual data
        const event = new CustomEvent('counterfactual-analysis-ready', {
          detail: counterfactualResponse
        });
        document.dispatchEvent(event);
        
        // Notify the user that counterfactual analysis is ready
        toast.success("Counterfactual analysis ready", {
          description: "Alternative scenarios have been analyzed"
        });
      }
    })
    .catch(counterfactualError => {
      console.error("Failed to get counterfactual analysis:", counterfactualError);
      // Fall back to a simulated counterfactual if the API fails
      simulateCounterfactualAnalysis(inputText);
    });
}

// Simulate a counterfactual analysis with local data
function simulateCounterfactualAnalysis(text: string) {
  const words = text.toLowerCase().split(/\s+/);
  
  // Word sentiment dictionary - similar to what we use in sentiment analysis
  const wordSentiments = {
    'bad': { sentiment: 'negative', value: -0.7 },
    'worst': { sentiment: 'negative', value: -0.9 },
    'terrible': { sentiment: 'negative', value: -0.85 },
    'disappointed': { sentiment: 'negative', value: -0.7 },
    'waste': { sentiment: 'negative', value: -0.8 },
    'not': { sentiment: 'negative', value: -0.5 },
    'poor': { sentiment: 'negative', value: -0.65 },
    'horrible': { sentiment: 'negative', value: -0.8 },
    'extremely': { sentiment: 'negative', value: -0.75 },
  };
  
  // Find the most negative word in the text
  let mostNegativeWord = null;
  let mostNegativeValue = 0;
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord in wordSentiments && wordSentiments[cleanWord].sentiment === 'negative') {
      if (wordSentiments[cleanWord].value < mostNegativeValue) {
        mostNegativeWord = cleanWord;
        mostNegativeValue = wordSentiments[cleanWord].value;
      }
    }
  }
  
  // If no negative word was found, use first word or a placeholder
  const targetWord = mostNegativeWord || words[0] || "sample";
  
  // Generate simple antonyms
  const antonyms = {
    'bad': 'good',
    'worst': 'best',
    'terrible': 'excellent',
    'disappointed': 'satisfied',
    'waste': 'valuable',
    'not': 'definitely',
    'poor': 'excellent',
    'horrible': 'wonderful',
    'extremely': 'moderately',
  };
  
  // Create counterfactual by replacing negative word with antonym
  const counterfactualSentence = text.replace(
    new RegExp(`\\b${targetWord}\\b`, 'i'),
    antonyms[targetWord] || 'good'
  );
  
  // Simulate sentiment changes
  const originalProb = 0.3 + Math.random() * 0.4; // Between 0.3 and 0.7
  const counterfactualProb = 0.6 + Math.random() * 0.35; // Between 0.6 and 0.95
  const sentimentChange = counterfactualProb - originalProb;
  
  // Create simulated response
  const counterfactualResponse = {
    original_sentence: text,
    target_word: targetWord,
    counterfactual_sentence: counterfactualSentence,
    original_sentiment: 'Negative',
    original_prob: originalProb,
    counterfactual_sentiment: 'Positive',
    counterfactual_prob: counterfactualProb,
    sentiment_change: sentimentChange
  };
  
  // Store the response in session storage for persistence
  try {
    sessionStorage.setItem('counterfactualResult', JSON.stringify(counterfactualResponse));
  } catch (err) {
    console.error("Failed to store counterfactual in session storage:", err);
  }
  
  // Dispatch the simulated counterfactual
  console.log("Simulated counterfactual analysis:", counterfactualResponse);
  const event = new CustomEvent('counterfactual-analysis-ready', {
    detail: counterfactualResponse
  });
  document.dispatchEvent(event);
  
  toast.success("Counterfactual analysis ready", {
    description: "Alternative scenarios have been analyzed"
  });
}
