
# Sentiment Analysis Application with Python Backend

This application uses a React frontend and a Python FastAPI backend to analyze sentiment in text.

## Directory Structure

- `src/` - React frontend code
- `backend/` - Python FastAPI backend
  - `models/` - Directory where model files should be placed
  - `main.py` - FastAPI server
  - `requirements.txt` - Python dependencies

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a Python virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Add model files to the `backend/models/` directory:
   - Place `bert_roberta_sentiment_updated.pth` in the models directory
   - Place `label_encoder.pkl` in the models directory

6. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

The API will be available at http://localhost:8000

### Frontend Setup

The frontend is already set up to communicate with the backend API.

1. Start the frontend development server:
   ```
   npm start
   ```

2. Open http://localhost:3000 in your browser

## Using the Application

1. Enter a review or text in the input field on the left panel
2. Make sure "API" is selected as the analysis method
3. Click "Analyze Sentiment"
4. The results will appear in the right panel

## Troubleshooting

- If the API connection fails, make sure the backend server is running at http://localhost:8000
- Check the browser console for any error messages
- Verify that your model files are correctly placed in the `backend/models/` directory
