
# Model Files Directory

Place the following files in this directory:

1. `bert_roberta_sentiment_updated.pth` - The trained PyTorch model
2. `label_encoder.pkl` - The scikit-learn label encoder

These files are required for the sentiment analysis backend to function properly.

## Required Dependencies

To run the backend with optimized LIME explanations and counterfactual analysis, you'll need to install these Python packages:

```bash
pip install fastapi uvicorn torch transformers scikit-learn joblib lime numpy sentence-transformers
```

You can also use the requirements.txt file in the parent directory.

## Performance Optimizations

The backend uses several optimizations for better user experience:

### LIME Explanations
- Reduced MAX_LEN from 512 to 128 for faster tokenization
- Reduced num_samples from 100 to 30 for faster explanation generation
- Uses batching for more efficient processing of multiple examples
- Prediction results are returned immediately, with explanations following asynchronously

### Counterfactual Analysis
- Uses sentence-transformers to find semantically opposite words
- Identifies the most negative influential word using LIME
- Replaces the word with its semantic opposite to flip the sentiment
- Implements an efficient prediction workflow with batched inference
- Returns counterfactual examples asynchronously after initial predictions

These optimizations help provide a better user experience by showing prediction results right away,
while explanations and counterfactual examples are generated in the background.
