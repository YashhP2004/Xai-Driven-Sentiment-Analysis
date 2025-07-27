
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import joblib
import numpy as np
from transformers import BertTokenizer, RobertaTokenizer
import lime.lime_text

# Define paths relative to the current file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models/bert_roberta_sentiment_updated.pth")
LABEL_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "models/label_encoder.pkl")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SentimentRequest(BaseModel):
    text: str

class CounterfactualRequest(BaseModel):
    sentence: str

class BertRobertaSentimentClassifier(nn.Module):
    def __init__(self):
        super(BertRobertaSentimentClassifier, self).__init__()
        self.bert = torch.hub.load('huggingface/pytorch-transformers', 'model', 'bert-base-uncased')
        self.roberta = torch.hub.load('huggingface/pytorch-transformers', 'model', 'roberta-base')
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(self.bert.config.hidden_size + self.roberta.config.hidden_size, 5)

    def forward(self, input_ids_bert, attention_mask_bert, input_ids_roberta, attention_mask_roberta):
        bert_output = self.bert(input_ids_bert, attention_mask=attention_mask_bert).last_hidden_state[:, 0, :]
        roberta_output = self.roberta(input_ids_roberta, attention_mask=attention_mask_roberta).last_hidden_state[:, 0, :]
        combined_output = torch.cat((bert_output, roberta_output), dim=1)
        combined_output = self.dropout(combined_output)
        return self.fc(combined_output)

# Initialize model and tokenizers globally
model = None
label_encoder = None
bert_tokenizer = None
roberta_tokenizer = None
explainer = None

@app.on_event("startup")
async def startup_event():
    global model, label_encoder, bert_tokenizer, roberta_tokenizer, explainer
    
    # Check if model files exist
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at {MODEL_PATH}. Please add it manually.")
    
    if not os.path.exists(LABEL_ENCODER_PATH):
        print(f"Label encoder file not found at {LABEL_ENCODER_PATH}. Please add it manually.")
    
    try:
        # Import here to avoid loading at module level
        from transformers import BertTokenizer, RobertaTokenizer
        
        # Load tokenizers
        bert_tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        roberta_tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
        
        # Load label encoder if file exists
        if os.path.exists(LABEL_ENCODER_PATH):
            label_encoder = joblib.load(LABEL_ENCODER_PATH)
            # Initialize LIME explainer
            explainer = lime.lime_text.LimeTextExplainer(class_names=label_encoder.classes_)
        
        # Load model if file exists
        if os.path.exists(MODEL_PATH):
            model = BertRobertaSentimentClassifier().to(device)
            model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
            model.eval()
            print("Model loaded successfully")
    except Exception as e:
        print(f"Error during startup: {e}")

# Faster predict_proba function for LIME with batching and shorter max_length
def predict_proba_wrapper(texts):
    global model, label_encoder, bert_tokenizer, roberta_tokenizer
    
    if not isinstance(texts, list):
        texts = [texts]
    
    MAX_LEN = 128  # Reduced from 512 for faster processing
    
    input_ids_bert, attention_masks_bert = [], []
    input_ids_roberta, attention_masks_roberta = [], []
    
    for text in texts:
        bert_enc = bert_tokenizer(text, padding="max_length", truncation=True, max_length=MAX_LEN, return_tensors="pt")
        roberta_enc = roberta_tokenizer(text, padding="max_length", truncation=True, max_length=MAX_LEN, return_tensors="pt")
        
        input_ids_bert.append(bert_enc["input_ids"])
        attention_masks_bert.append(bert_enc["attention_mask"])
        input_ids_roberta.append(roberta_enc["input_ids"])
        attention_masks_roberta.append(roberta_enc["attention_mask"])
    
    input_ids_bert = torch.cat(input_ids_bert).to(device)
    attention_masks_bert = torch.cat(attention_masks_bert).to(device)
    input_ids_roberta = torch.cat(input_ids_roberta).to(device)
    attention_masks_roberta = torch.cat(attention_masks_roberta).to(device)
    
    with torch.no_grad():
        logits = model(input_ids_bert, attention_masks_bert, input_ids_roberta, attention_masks_roberta)
        probs = torch.nn.functional.softmax(logits, dim=1)
    
    return probs.cpu().numpy()

def select_most_negative_word(word_weights):
    negative_words = [(word, weight) for word, weight in word_weights if weight < 0]
    if negative_words:
        # Sort by most negative weight
        negative_words.sort(key=lambda x: x[1])
        return negative_words[0][0]  # Return the most negative word
    return None

def generate_counterfactual(sentence, target_word):
    # Simple approach: replace negative word with antonyms
    antonyms = {
        'bad': 'good',
        'terrible': 'excellent',
        'awful': 'great',
        'poor': 'rich',
        'horrible': 'wonderful',
        'ugly': 'beautiful',
        'dirty': 'clean',
        'wrong': 'right',
        'difficult': 'easy',
        'boring': 'interesting',
        'unhappy': 'happy',
        'sad': 'happy',
        'disappointed': 'pleased',
        'negative': 'positive',
        'worst': 'best',
        'hate': 'love',
        'dislike': 'like',
        'angry': 'calm',
        'furious': 'delighted',
        'unpleasant': 'pleasant',
        'extremely': 'moderately',  # Added more antonyms
        'never': 'always',
        'worthless': 'valuable',
        'useless': 'useful',
    }
    
    # Check if target word has an antonym
    replacement = antonyms.get(target_word.lower(), None)
    
    # If no direct antonym, replace with generic positive word
    if replacement is None:
        replacement = 'good'
    
    # Replace word in sentence
    words = sentence.split()
    for i, word in enumerate(words):
        # Handle word boundaries
        if word.lower() == target_word.lower():
            words[i] = replacement
    
    return ' '.join(words)

@app.post("/predict")
def predict_sentiment(request: SentimentRequest):
    global model, label_encoder, bert_tokenizer, roberta_tokenizer
    
    # Check if model and tokenizers are loaded
    if model is None or label_encoder is None or bert_tokenizer is None or roberta_tokenizer is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(LABEL_ENCODER_PATH):
            # Return a fallback response if model files aren't available
            return {
                "sentiment": "Neutral", 
                "confidence": 0.5,
                "error": "Model files not found. Using fallback prediction."
            }
        else:
            raise HTTPException(status_code=500, detail="Model initialization failed")
    
    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Empty text provided")

    try:
        with torch.no_grad():
            bert_encoded = bert_tokenizer(text, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
            roberta_encoded = roberta_tokenizer(text, padding="max_length", truncation=True, max_length=128, return_tensors="pt")

            input_ids_bert = bert_encoded["input_ids"].to(device)
            attention_mask_bert = bert_encoded["attention_mask"].to(device)
            input_ids_roberta = roberta_encoded["input_ids"].to(device)
            attention_mask_roberta = roberta_encoded["attention_mask"].to(device)

            output = model(input_ids_bert, attention_mask_bert, input_ids_roberta, attention_mask_roberta)
            probabilities = torch.softmax(output, dim=1)
            confidence, predicted_class = torch.max(probabilities, dim=1)

        sentiment = label_encoder.inverse_transform([predicted_class.item()])[0]
        
        # Create response with more detailed information for UI
        response = {
            "sentiment": sentiment,
            "confidence": round(confidence.item(), 4),
            "text": text
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/explain")
def explain_sentiment(request: SentimentRequest):
    global model, label_encoder, bert_tokenizer, roberta_tokenizer, explainer
    
    # Check if model and tools are loaded
    if model is None or label_encoder is None or explainer is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(LABEL_ENCODER_PATH):
            # Return a fallback response if model files aren't available
            return {
                "error": "Model files not found. Cannot generate explanation."
            }
        else:
            raise HTTPException(status_code=500, detail="Model initialization failed")
    
    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Empty text provided")

    try:
        # Generate LIME explanation with optimized parameters
        num_features = min(len(text.split()), 10)  # Use at most 10 features or number of words
        
        # Generate prediction with proper shape
        num_classes = len(label_encoder.classes_)
        
        # Get prediction for the top class
        prediction = predict_proba_wrapper(text)
        
        # Check that prediction has the right shape before proceeding
        if prediction.shape[0] == 0 or prediction.shape[1] != num_classes:
            # Handle invalid prediction shape
            raise ValueError(f"Invalid prediction shape: {prediction.shape}, expected second dimension {num_classes}")
        
        # Get the top predicted class
        top_class_idx = np.argmax(prediction[0])
        
        # Generate LIME explanation
        explanation = explainer.explain_instance(
            text, 
            predict_proba_wrapper,
            num_features=num_features,
            num_samples=30,
            top_labels=1  # Focus on just the top predicted class
        )
        
        # Ensure explanation has valid top_labels before accessing
        if not hasattr(explanation, 'top_labels') or len(explanation.top_labels) == 0:
            raise ValueError("LIME explanation has no top labels")
        
        # Extract word features and their weights
        word_features = explanation.as_list(label=explanation.top_labels[0])
        
        # Transform word features into format needed by frontend
        key_features = []
        for word, weight in word_features:
            sentiment_type = "positive" if weight > 0 else "negative" if weight < 0 else "neutral"
            
            # Determine which class this feature contributes to
            contributes_to = None
            if abs(weight) > 0.01:  # Only consider significant weights
                # Get the label name for the top class
                class_name = explanation.class_names[top_class_idx]
                if weight > 0:
                    contributes_to = class_name
                else:
                    # For negative contributions we're contributing against this class
                    contributes_to = f"NOT {class_name}"
            
            key_features.append({
                "word": word,
                "importance": abs(weight),  # Use absolute value for importance
                "sentiment": sentiment_type,
                "contributes_to": contributes_to
            })
        
        # Sort by importance
        key_features.sort(key=lambda x: x["importance"], reverse=True)
        
        # Create response
        response = {
            "text": text,
            "explanation": {
                "keyFeatures": key_features,
                "topClass": explanation.class_names[top_class_idx]
            }
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")

@app.post("/counterfactual")
def counterfactual_analysis(request: CounterfactualRequest):
    global model, label_encoder, bert_tokenizer, roberta_tokenizer, explainer
    
    # Check if model and explainer are loaded
    if model is None or label_encoder is None or explainer is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(LABEL_ENCODER_PATH):
            raise HTTPException(status_code=404, detail="Model files not found. Cannot perform counterfactual analysis.")
        else:
            raise HTTPException(status_code=500, detail="Model initialization failed")
    
    sentence = request.sentence
    if not sentence:
        raise HTTPException(status_code=400, detail="Empty text provided")
    
    try:
        # Get prediction for the top class
        prediction = predict_proba_wrapper(sentence)
        
        # Get the top predicted class
        top_class_idx = np.argmax(prediction[0])
        
        # Get LIME explanation
        explanation = explainer.explain_instance(
            sentence, 
            predict_proba_wrapper,
            num_features=len(sentence.split()),
            num_samples=30,
            top_labels=1
        )
        
        # Ensure we have valid top_labels
        if not hasattr(explanation, 'top_labels') or len(explanation.top_labels) == 0:
            raise ValueError("LIME explanation has no top labels")
        
        # Get word weights for the top class
        word_weights = explanation.as_list(label=explanation.top_labels[0])
        
        # Find the most negative word
        target_word = select_most_negative_word(word_weights)
        
        # If no negative word found, use a default one
        if not target_word:
            # Use the word with the least positive impact
            word_weights.sort(key=lambda x: x[1])
            target_word = word_weights[0][0] if word_weights else sentence.split()[0]
        
        # Generate counterfactual by replacing the target word
        counterfactual_sentence = generate_counterfactual(sentence, target_word)
        
        # Get sentiment for original sentence
        with torch.no_grad():
            # Original sentence
            bert_encoded = bert_tokenizer(sentence, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
            roberta_encoded = roberta_tokenizer(sentence, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
            
            input_ids_bert = bert_encoded["input_ids"].to(device)
            attention_mask_bert = bert_encoded["attention_mask"].to(device)
            input_ids_roberta = roberta_encoded["input_ids"].to(device)
            attention_mask_roberta = roberta_encoded["attention_mask"].to(device)
            
            output = model(input_ids_bert, attention_mask_bert, input_ids_roberta, attention_mask_roberta)
            probabilities = torch.softmax(output, dim=1)
            confidence_orig, predicted_class_orig = torch.max(probabilities, dim=1)
            
            # Counterfactual sentence
            bert_encoded = bert_tokenizer(counterfactual_sentence, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
            roberta_encoded = roberta_tokenizer(counterfactual_sentence, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
            
            input_ids_bert = bert_encoded["input_ids"].to(device)
            attention_mask_bert = bert_encoded["attention_mask"].to(device)
            input_ids_roberta = roberta_encoded["input_ids"].to(device)
            attention_mask_roberta = roberta_encoded["attention_mask"].to(device)
            
            output = model(input_ids_bert, attention_mask_bert, input_ids_roberta, attention_mask_roberta)
            probabilities = torch.softmax(output, dim=1)
            confidence_counter, predicted_class_counter = torch.max(probabilities, dim=1)
        
        # Get sentiment labels
        original_sentiment = label_encoder.inverse_transform([predicted_class_orig.item()])[0]
        counterfactual_sentiment = label_encoder.inverse_transform([predicted_class_counter.item()])[0]
        
        # Calculate sentiment change
        sentiment_change = confidence_counter.item() - confidence_orig.item()
        
        # Prepare response
        response = {
            "original_sentence": sentence,
            "target_word": target_word,
            "counterfactual_sentence": counterfactual_sentence,
            "original_sentiment": original_sentiment,
            "original_prob": confidence_orig.item(),
            "counterfactual_sentiment": counterfactual_sentiment,
            "counterfactual_prob": confidence_counter.item(),
            "sentiment_change": sentiment_change
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Counterfactual analysis error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# If running this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
