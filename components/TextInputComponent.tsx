import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, TextInput, Alert } from 'react-native';
import Toast from 'react-native-root-toast';
import * as LocalAuthentication from 'expo-local-authentication';

const TextInputComponent = () => {
  const [number, onChangeNumber] = React.useState('');

  const loadData = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key');
      if (value !== null) {
        onChangeNumber(value);
      }
    } catch (e) {
      console.log('Error loading data', e);
    }
  };

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('@storage_Key', value);
      Toast.show('Daily goal saved!');
      console.log('Data saved');
    } catch (e) {
      console.log('Error saving data', e);
      Toast.show('Error saving data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTextChange = (value: string) => {
    onChangeNumber(value);
  };

  const handleSaveGoal = async () => {
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

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to save your goal',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      await storeData(number);
    } else {
      Alert.alert('Authentication failed');
    }
  };

  return (
    <SafeAreaView>
      <TextInput style={styles.input} onChangeText={handleTextChange} value={number} placeholder="Enter daily goal" keyboardType="numeric" />
      <Button title="Save goal" onPress={handleSaveGoal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default TextInputComponent;
