# server/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sockets import Sockets
import json
import numpy as np
import torch
import librosa
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import io
import base64
import logging
import wave
import struct
import os
import gevent
from geventwebsocket.handler import WebSocketHandler
from gevent import pywsgi

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
sockets = Sockets(app)

# Configure CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Emotion mapping
emotion_labels = {
    0: "neutral",
    1: "happy",
    2: "angry",
    3: "sad",
    4: "surprised",
    5: "fearful"
}

# Load pre-trained model
try:
    logger.info("Loading speech emotion model...")
    
    # Use a model specifically fine-tuned for speech emotion recognition
    model_name = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    
    # Load processor and model
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
    model = AutoModelForAudioClassification.from_pretrained(model_name)
    
    # Move model to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    model.eval()
    
    logger.info(f"Model loaded successfully on {device}")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    # For development, continue without the model
    feature_extractor = None
    model = None
    logger.warning("Using mock emotion detection instead")

def base64_to_wav(audio_base64, sample_rate=16000, bits_per_sample=16, channels=1):
    """
    Convert base64 encoded PCM audio to a numpy array without using FFmpeg
    """
    try:
        # Decode base64 audio data
        audio_bytes = base64.b64decode(audio_base64)
        
        # If the format is PCM, directly convert bytes to numpy array
        if len(audio_bytes) % 2 == 0:  # Ensure even number of bytes for 16-bit samples
            # Convert raw PCM bytes to numpy array (16-bit signed integer format)
            audio_array = np.frombuffer(audio_bytes, dtype=np.int16)
            
            # Normalize to float between -1 and 1
            waveform = audio_array.astype(np.float32) / 32768.0
            
            return waveform
        else:
            logger.warning(f"Audio data length is not compatible with 16-bit PCM: {len(audio_bytes)} bytes")
            return None
    except Exception as e:
        logger.error(f"Error converting base64 to WAV: {str(e)}")
        return None

def process_audio(audio_base64, format_type, sample_rate=16000, bits_per_sample=16, channels=1):
    """Process audio data and detect emotion without using FFmpeg."""
    try:
        # Convert audio data to waveform
        if format_type.lower() == 'pcm':
            # Direct PCM conversion
            waveform = base64_to_wav(audio_base64, sample_rate, bits_per_sample, channels)
        else:
            # Use librosa for other formats
            audio_bytes = base64.b64decode(audio_base64)
            with io.BytesIO(audio_bytes) as buf:
                waveform, _ = librosa.load(buf, sr=sample_rate, mono=True)
        
        if waveform is None or len(waveform) == 0:
            logger.error("Failed to convert audio data to waveform")
            return 0, 0.5
        
        # Ensure proper format
        waveform = waveform.astype(np.float32)
        
        # If model is available, perform actual detection
        if model is not None and feature_extractor is not None:
            # Make model input
            inputs = feature_extractor(
                waveform, 
                sampling_rate=sample_rate, 
                return_tensors="pt",
                padding=True
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
            
            # Get predicted emotion and confidence
            probabilities = torch.softmax(logits, dim=1)[0]
            predicted_class = torch.argmax(probabilities).item()
            confidence = probabilities[predicted_class].item()
            
            logger.info(f"Detected emotion: {emotion_labels.get(predicted_class, 'unknown')} with confidence {confidence:.2f}")
            
            return predicted_class, confidence
        else:
            # Mock emotion detection for development
            logger.info("Using mock emotion detection")
            emotion = np.random.randint(0, 6)
            confidence = float(np.random.random() * 0.5 + 0.5)  # Between 0.5 and 1.0
            
            return emotion, confidence
            
    except Exception as e:
        logger.error(f"Error in audio processing: {str(e)}")
        # Return neutral with low confidence on error
        return 0, 0.5

@sockets.route('/ws')
def websocket_endpoint(ws):
    logger.info("WebSocket connection established")
    
    try:
        while not ws.closed:
            # Receive message
            message = ws.receive()
            if message is None:
                continue
            
            # Parse the message
            data = json.loads(message)
            
            if 'audio' in data:
                logger.info("Received audio data")
                emotion, confidence = process_audio(
                    data['audio'],
                    data.get('format', 'pcm'),
                    data.get('sampleRate', 16000),
                    data.get('bitsPerSample', 16),
                    data.get('channels', 1)
                )
            else:
                # Handle heartbeat or messages without audio
                logger.info(f"Received data without audio: {data}")
                continue
            
            # Send analysis results back to client
            result = {
                "emotion": int(emotion),
                "emotion_label": emotion_labels.get(emotion, "unknown"),
                "confidence": float(confidence)
            }
            
            logger.info(f"Sending result: {result}")
            ws.send(json.dumps(result))
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        logger.info("WebSocket connection closed")

@app.route('/')
def root():
    return jsonify({"message": "Support Call Analyzer API", "status": "running"})

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None and feature_extractor is not None
    })

if __name__ == "__main__":
    # Use gevent server with WebSocket support
    server = pywsgi.WSGIServer(('0.0.0.0', 5000), app, handler_class=WebSocketHandler)
    logger.info("Starting server on port 5000")
    server.serve_forever()