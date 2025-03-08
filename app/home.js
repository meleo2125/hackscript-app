import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";

export default function Home() {
  return (
    <LinearGradient
      colors={["#4a6da7", "#6b8cce"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to IPR App</Text>
          <FontAwesome name="home" size={30} color="white" style={styles.icon} />
        </View>
        
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            This is a demonstration of the IPR application interface. Our platform is designed to 
            streamline intellectual property rights management with an intuitive user experience.
            Navigate through the application to explore features related to patent submissions,
            trademark registration, and copyright protection services.
          </Text>
          
          <Text style={styles.paragraph}>
            In the full version, you'll have access to comprehensive tools for managing your 
            intellectual property portfolio, tracking application status, and receiving timely 
            notifications about important deadlines and updates.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Explore Features</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.buttonText}>Learn More</Text>
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
  },
  paragraph: {
    fontFamily: "Montserrat_Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 15,
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