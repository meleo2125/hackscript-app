import { Slot } from "expo-router";
import { View, StatusBar } from "react-native";
import 'expo-router/entry';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden={true} />
      <Slot />
    </View>
  );
}