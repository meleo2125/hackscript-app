// app/analysis.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import audioRecorderService from "../services/audioRecorderService";

export default function Analysis() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState(null);

  // Map emotion codes to human-readable labels and colors
  const emotionMap = {
    0: { label: "Neutral", color: "#9e9e9e" },
    1: { label: "Happy", color: "#4caf50" },
    2: { label: "Angry", color: "#f44336" },
    3: { label: "Sad", color: "#2196f3" },
    4: { label: "Surprised", color: "#ff9800" },
    5: { label: "Fearful", color: "#9c27b0" }
  };

  useEffect(() => {
    // Set up listeners for the audio recorder service
    audioRecorderService.setOnStatusChange((status) => {
      setIsRecording(status.isRecording);
    });
    
    audioRecorderService.setOnAnalysisReceived((data) => {
      const emotion = data.emotion;
      setCurrentEmotion(emotion);
      
      // Add analysis result with timestamp
      setAnalysisResults(prevResults => [
        {
          timestamp: new Date().toLocaleTimeString(),
          emotion: emotion,
          confidence: data.confidence || 0.0
        },
        ...prevResults
      ].slice(0, 20)); // Keep only the 20 most recent results
    });
    
    return () => {
      // Clean up when component unmounts
      if (isRecording) {
        audioRecorderService.stopRecording();
      }
      audioRecorderService.disconnectSocket();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      audioRecorderService.stopRecording();
    } else {
      audioRecorderService.startRecording();
    }
  };

  const getEmotionStyle = (emotion) => {
    const emotionData = emotionMap[emotion] || { label: "Unknown", color: "#9e9e9e" };
    return {
      backgroundColor: emotionData.color,
    };
  };

  return (
    <LinearGradient
      colors={["#4a6da7", "#6b8cce"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Call Analysis</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.recordingSection}>
            <Text style={styles.sectionTitle}>Real-time Voice Analysis</Text>
            
            <View style={styles.emotionDisplay}>
              {currentEmotion !== null && (
                <>
                  <View 
                    style={[
                      styles.emotionIndicator, 
                      getEmotionStyle(currentEmotion)
                    ]} 
                  />
                  <Text style={styles.emotionText}>
                    Current Emotion: {emotionMap[currentEmotion]?.label || "Processing..."}
                  </Text>
                </>
              )}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.recordButton, 
                isRecording ? styles.recordButtonActive : {}
              ]}
              onPress={toggleRecording}
            >
              <FontAwesome 
                name={isRecording ? "stop-circle" : "microphone"} 
                size={40} 
                color={isRecording ? "#f44336" : "white"} 
              />
              <Text style={styles.recordButtonText}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Analysis History</Text>
            
            <ScrollView style={styles.historyList}>
              {analysisResults.length > 0 ? (
                analysisResults.map((result, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={[styles.emotionDot, getEmotionStyle(result.emotion)]} />
                    <Text style={styles.historyTimestamp}>{result.timestamp}</Text>
                    <Text style={styles.historyEmotion}>
                      {emotionMap[result.emotion]?.label || "Unknown"}
                    </Text>
                    <Text style={styles.historyConfidence}>
                      {Math.round(result.confidence * 100)}%
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  No analysis data yet. Start recording to begin analyzing voice emotions.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    maxWidth: 800,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontFamily: "Montserrat_Bold",
    fontSize: 32,
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 25,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: "Montserrat_Bold",
    fontSize: 20,
    color: "#4a6da7",
    marginBottom: 20,
  },
  emotionDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emotionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  emotionText: {
    fontFamily: "Montserrat_Bold",
    fontSize: 18,
    color: "#333",
  },
  recordButton: {
    backgroundColor: "#4a6da7",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  recordButtonActive: {
    backgroundColor: "#f44336",
  },
  recordButtonText: {
    fontFamily: "Montserrat_Bold",
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
  historySection: {
    flex: 1,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emotionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  historyTimestamp: {
    fontFamily: "Montserrat_Regular",
    fontSize: 14,
    color: "#666",
    width: 100,
  },
  historyEmotion: {
    fontFamily: "Montserrat_Bold",
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  historyConfidence: {
    fontFamily: "Montserrat_Regular",
    fontSize: 14,
    color: "#666",
    width: 50,
    textAlign: "right",
  },
  noDataText: {
    fontFamily: "Montserrat_Regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
  }
});