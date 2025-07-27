
# Sentiment Analysis Backend

This is the backend service for the Sentiment Analysis application. It provides API endpoints for sentiment analysis, explanation, and counterfactual analysis.

## Setup

1. Install the required packages:

```bash
pip install -r requirements.txt
```

2. Add your model files to the `models` directory:
   - `bert_roberta_sentiment_updated.pth`: The trained model file
   - `label_encoder.pkl`: The label encoder used for training

## Additional Dependencies

If you want to run the counterfactual analysis, you'll need to install:

```bash
pip install sentence-transformers
pip install lime
```

## Running the Server

To run the server:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /predict`: Perform sentiment analysis on a text
- `POST /explain`: Generate a LIME explanation for a text
- `POST /counterfactual`: Generate a counterfactual example by replacing the most negative word

## Example Request

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"text": "This product is amazing!"}'
```

## Troubleshooting

If you encounter this error with the `/explain` endpoint: `'NoneType' object is not subscriptable`, make sure that:

1. Your model files are correctly loaded
2. The LIME explainer is properly initialized
3. The `top_labels` parameter is set correctly in the `explain_instance` method

This error typically occurs when the explanation doesn't have top labels or when the prediction has an unexpected shape.

## CORS Issues

If you're experiencing CORS issues, check that the CORS middleware is properly configured in main.py:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
