import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TextInputComponent from '@/components/TextInputComponent';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function TabTwoScreen() {
  const [goal, setGoal] = useState(''); // State to hold the goal text

  // Function to handle biometric authentication
  const handleSaveGoal = async () => {
    // Check if the device supports biometric authentication
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      Alert.alert('Biometric authentication not supported');
      return;
    }

    if (!isEnrolled) {
      Alert.alert('No biometrics enrolled on this device');
      return;
    }

    // Prompt for biometric authentication
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to save your goal',
      fallbackLabel: 'Use Passcode', // Optional, you can remove this
      cancelLabel: 'Cancel', // Optional, you can remove this
    });

    if (result.success) {
      // If authentication is successful, save the goal
      Alert.alert('Goal saved!', `Your goal: ${goal}`);
      // Here you would save the goal, e.g., to AsyncStorage or your backend
    } else {
      Alert.alert('Authentication failed');
    }
  };

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }} headerImage={<Ionicons size={310} name="settings" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      {/* Text input component with biometric auth to save the goal */}
      <TextInputComponent />
      {/* <Button title="Save Goal" onPress={handleSaveGoal} /> */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
