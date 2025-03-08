import React from "react";
import { Stack } from "expo-router";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { View, ActivityIndicator, StatusBar } from "react-native";

export default function AppLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_Regular: Montserrat_400Regular,
    Montserrat_Bold: Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4a6da7" />
      </View>
    );
  }

  return (
    <>
      {/* Hide the status bar */}
      <StatusBar hidden={true} />
      
      <Stack screenOptions={{ 
        headerShown: false,
        animation: "fade" 
      }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
}
