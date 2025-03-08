// services/audioRecorderService.js
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { io } from 'socket.io-client';
import { API_URL } from '../api/config';

class AudioRecorderService {
  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.socket = null;
    this.isRecording = false;
    this.onStatusChange = null;
    this.onAnalysisReceived = null;
  }

  connectSocket() {
    if (this.socket) return;
    
    this.socket = io(`${API_URL}`);
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    this.socket.on('analysis_result', (data) => {
      if (this.onAnalysisReceived) {
        this.onAnalysisReceived(data);
      }
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setOnStatusChange(callback) {
    this.onStatusChange = callback;
  }
  
  setOnAnalysisReceived(callback) {
    this.onAnalysisReceived = callback;
  }

  async startRecording() {
    if (this.isRecording) return;
    
    try {
      this.connectSocket();
      
      // Request permission if needed (permissions handling should be done at app level)
      await this.audioRecorderPlayer.startRecorder();
      
      this.isRecording = true;
      if (this.onStatusChange) {
        this.onStatusChange({ isRecording: true });
      }
      
      this.audioRecorderPlayer.addRecordBackListener((e) => {
        const audioData = {
          currentPosition: e.currentPosition,
          currentMetering: e.currentMetering
        };
        
        // Send audio data to backend via WebSocket
        if (this.socket && this.socket.connected) {
          this.socket.emit('audio_stream', audioData);
        }
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopRecording() {
    if (!this.isRecording) return;
    
    try {
      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();
      
      this.isRecording = false;
      if (this.onStatusChange) {
        this.onStatusChange({ isRecording: false });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }
}

// Create a singleton instance
const audioRecorderService = new AudioRecorderService();
export default audioRecorderService;