# server/app.py
from fastapi import FastAPI, WebSocket
import uvicorn
import asyncio
import json
import numpy as np
import torch
import librosa
from transformers import Wav2Vec2Processor, Wav2Vec2ForSpeechClassification
import io
from pydub import AudioSegment
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load emotion detection model
try:
    logger.info("Loading speech emotion model...")
    model_name = "superb/wav2vec2-large-xlsr-53"  # Replace with emotion-specific model if available
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    model = Wav2Vec2ForSpeechClassification.from_pretrained(model_name)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise

# Define emotion mapping
emotion_labels = {
    0: "neutral",
    1: "happy",
    2: "angry",
    3: "sad",
    4: "surprised",
    5: "fearful"
}

# Mock function to simulate emotion detection (since the actual model might need modifications)
def analyze_emotion(audio_data):
    # In a real implementation, you would:
    # 1. Convert the audio data to the right format
    # 2. Process through the model
    # 3. Return the emotion and confidence
    
    # For this example, we'll return random emotions
    # In production, replace this with actual model inference
    emotion = np.random.randint(0, 6)
    confidence = np.random.random() * 0.5 + 0.5  # Random confidence between 0.5 and 1.0
    
    # Actual implementation would look like:
    # audio = preprocess_audio(audio_data)
    # inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
    # with torch.no_grad():
    #     logits = model(**inputs).logits
    # emotion = torch.argmax(logits, dim=1).item()
    # probabilities = torch.softmax(logits, dim=1)
    # confidence = probabilities[0][emotion].item()
    
    return emotion, confidence

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive audio stream chunk
            data = await websocket.receive_json()
            
            # For now, we'll use mock emotion detection
            # In a real implementation, you would process the actual audio data
            emotion, confidence = analyze_emotion(data)
            
            # Send analysis results back to client
            await websocket.send_json({
                "emotion": int(emotion),
                "emotion_label": emotion_labels.get(emotion, "unknown"),
                "confidence": float(confidence)
            })
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        logger.info("WebSocket connection closed")

@app.get("/")
async def root():
    return {"message": "Support Call Analyzer API"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)