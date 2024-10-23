import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, TextInput } from 'react-native';
import Toast from 'react-native-root-toast';

const TextInputComponent = () => {
  const [number, onChangeNumber] = React.useState('');

  const loadData = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key');
      if (value !== null) {
        onChangeNumber(value);
      }
    } catch (e) {
      // loading error
      console.log('Error loading data', e);
    }
  };

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('@storage_Key', value);
      Toast.show('Daily goal saved!');
      console.log('Data saved');
    } catch (e) {
      // saving error
      console.log('Error saving data', e);
      Toast.show('Error saving data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTextChange = (value: string) => {
    onChangeNumber(value);
    // storeData(value);
  };

  return (
    <SafeAreaView>
      <TextInput style={styles.input} onChangeText={handleTextChange} value={number} placeholder="Enter daily goal" keyboardType="numeric" />
      <Button title="Save goal" onPress={() => storeData(number)} />
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
