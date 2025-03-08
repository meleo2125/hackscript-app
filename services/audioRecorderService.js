import { Platform } from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";

// Safely import RNFS with a fallback
let RNFS;
try {
  RNFS = require("react-native-fs");
} catch (error) {
  console.warn("Failed to load react-native-fs:", error);
  // Provide a mock implementation
  RNFS = {
    CachesDirectoryPath: "cache",
    exists: async () => false,
    readFile: async () => "",
  };
}

class AudioRecorderService {
  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.socket = null;
    this.isRecording = false;
    this.onStatusChange = null;
    this.onAnalysisReceived = null;
    this.analysisInterval = 3000; // Analysis every 3 seconds
    
    // Define audioPath with safe fallback
    this.audioPath = Platform.select({
      ios: "audio_recording.wav", // Using WAV for raw PCM
      android: `${RNFS.CachesDirectoryPath || "cache"}/audio_recording.wav`,
    });
    this.sampleRate = 16000; // 16kHz for model compatibility
  }

  connectSocket() {
    if (this.socket) return;

    // Use native WebSocket instead of socket.io
    const wsUrl = `${API_URL.replace(/^http/, "ws")}/ws`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received analysis result:", data);
        if (this.onAnalysisReceived) {
          this.onAnalysisReceived(data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    this.socket.onerror = (error) => {
      console.error("Socket error:", error);
    };
  }

  disconnectSocket() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
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

      console.log("Starting recording to path:", this.audioPath);

      // Configure for raw PCM audio
      const result = await this.audioRecorderPlayer.startRecorder(
        this.audioPath,
        {
          // Use PCM format instead of compressed formats
          AudioEncoderAndroid: AudioRecorderPlayer.AudioEncoderAndroid.PCM_16BIT,
          AudioSourceAndroid: AudioRecorderPlayer.AudioSourceAndroid.MIC,
          AVEncoderAudioQualityKeyIOS: AudioRecorderPlayer.AVEncoderAudioQualityIOSType.high,
          AVNumberOfChannelsKeyIOS: 1,
          // Use PCM format on iOS
          AVFormatIDKeyIOS: AudioRecorderPlayer.AVEncodingOption.lpcm,
          OutputFormatAndroid: AudioRecorderPlayer.OutputFormatAndroid.MPEG_4,
          SampleRateAndroid: this.sampleRate,
          SampleRateIOS: this.sampleRate,
        }
      );

      console.log("Recording started:", result);

      this.isRecording = true;
      if (this.onStatusChange) {
        this.onStatusChange({ isRecording: true });
      }

      // Set up interval to send audio data every 3 seconds
      this.recordInterval = setInterval(async () => {
        try {
          // Read the audio file that's being recorded
          if (await RNFS.exists(this.audioPath)) {
            const audioData = await RNFS.readFile(this.audioPath, "base64");

            // Send the audio data to the server
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              this.socket.send(
                JSON.stringify({
                  audio: audioData,
                  format: "pcm", // Explicitly label as PCM
                  sampleRate: this.sampleRate,
                  bitsPerSample: 16,
                  channels: 1
                })
              );
            }
          }
        } catch (err) {
          console.error("Error reading audio file:", err);
        }
      }, this.analysisInterval);

      // Set up audio metering
      this.audioRecorderPlayer.addRecordBackListener((e) => {
        // Just for UI updates if needed
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording() {
    if (!this.isRecording) return;

    try {
      clearInterval(this.recordInterval);

      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();

      console.log("Recording stopped:", result);

      this.isRecording = false;
      if (this.onStatusChange) {
        this.onStatusChange({ isRecording: false });
      }

      return result;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  }
}

// Create a singleton instance
const audioRecorderService = new AudioRecorderService();
export default audioRecorderService;