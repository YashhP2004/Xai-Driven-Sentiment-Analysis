import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if backend directory exists
const backendDir = path.join(__dirname, '..', 'backend');
if (!fs.existsSync(backendDir)) {
  console.error('\x1b[31mBackend directory not found! Create the backend directory first.\x1b[0m');
  process.exit(1);
}

// Check if Python is installed
const pythonProcess = spawn('python', ['--version']);
pythonProcess.on('error', (err) => {
  console.error('\x1b[31mPython is not installed or not in PATH.\x1b[0m');
  process.exit(1);
});

pythonProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('\x1b[31mFailed to check Python version.\x1b[0m');
    process.exit(1);
  }
  
  console.log('\x1b[34mStarting the sentiment analysis backend...\x1b[0m');
  
  // Create models directory if it doesn't exist
  const modelsDir = path.join(backendDir, 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
    console.log('\x1b[32mCreated models directory\x1b[0m');
  }
  
  // Check if model files exist
  const modelPath = path.join(modelsDir, 'bert_roberta_sentiment_updated.pth');
  const encoderPath = path.join(modelsDir, 'label_encoder.pkl');
  
  if (!fs.existsSync(modelPath)) {
    console.warn('\x1b[33mWarning: Model file not found at ' + modelPath + '\x1b[0m');
    console.warn('\x1b[33mYou need to add this file manually for the model to work properly.\x1b[0m');
  }
  
  if (!fs.existsSync(encoderPath)) {
    console.warn('\x1b[33mWarning: Label encoder file not found at ' + encoderPath + '\x1b[0m');
    console.warn('\x1b[33mYou need to add this file manually for the model to work properly.\x1b[0m');
  }
  
  // Start the backend server
  const server = spawn('python', ['-m', 'uvicorn', 'main:app', '--reload'], {
    cwd: backendDir,
    stdio: 'inherit'
  });
  
  server.on('error', (err) => {
    console.error('\x1b[31mFailed to start the backend server: ' + err.message + '\x1b[0m');
    process.exit(1);
  });
  
  process.on('SIGINT', () => {
    console.log('\x1b[34mStopping the backend server...\x1b[0m');
    server.kill('SIGINT');
    process.exit(0);
  });
});