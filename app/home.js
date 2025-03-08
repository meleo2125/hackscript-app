// app/home.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  
  return (
    <LinearGradient
      colors={["#4a6da7", "#6b8cce"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Support Call Analyzer</Text>
          <FontAwesome name="microphone" size={30} color="white" style={styles.icon} />
        </View>
        
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            Welcome to the Support Call Analyzer app. This tool helps analyze support calls 
            between AI agents and users by detecting emotions through voice analysis.
          </Text>
          
          <Text style={styles.paragraph}>
            Start a new analysis session to record and analyze the emotional tone of a conversation.
            The system uses advanced AI models to detect emotions like neutral, happy, angry, sad,
            and more in real-time.
          </Text>
          
          <TouchableOpacity 
            style={styles.analysisButton}
            onPress={() => router.push("/analysis")}
          >
            <FontAwesome name="bar-chart" size={24} color="white" />
            <Text style={styles.analysisButtonText}>Start Analysis</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
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
    width: "80%",
    maxWidth: 800,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  title: {
    fontFamily: "Montserrat_Bold",
    fontSize: 36,
    color: "white",
    textAlign: "center",
    marginRight: 15,
  },
  icon: {
    marginTop: 5,
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
    alignItems: "center",
  },
  paragraph: {
    fontFamily: "Montserrat_Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 15,
  },
  analysisButton: {
    backgroundColor: "#4a6da7",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 10,
  },
  analysisButtonText: {
    fontFamily: "Montserrat_Bold",
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonText: {
    fontFamily: "Montserrat_Bold",
    fontSize: 16,
    color: "#4a6da7",
  },
});