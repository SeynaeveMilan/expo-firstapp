import { StyleSheet, Platform, View, Button, Text } from 'react-native';
import { Image } from 'expo-image';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImageManipulator from 'expo-image-manipulator';
import { useState, useEffect, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
export default function HomeScreen() {
  const [pixelatedImageUri, setPixelatedImageUri] = useState<string | null>(null);
  const [pixelValue, setPixelValue] = useState(17);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [todayStepCount, setTodayStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [number, onChangeNumber] = React.useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // pixelate image using ImageManipulator from expo
  const pixelateImage = async (value: number) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        'https://images.pexels.com/photos/978629/pexels-photo-978629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        [{ resize: { width: value, height: value } }], // Resize to 16x16 pixels to pixelate
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      setPixelatedImageUri(manipResult.uri); // Save the pixelated image URI to state
    } catch (error) {
      console.log('Error pixelating image:', error);
    }
  };

  const handleAddPixel = () => {
    if (pixelValue >= 500) {
      return; // Prevent the pixel value from going above 500
    }
    setPixelValue((prevValue) => prevValue + 50); // Increment the current pixel value by 50
  };
  // Download the image use expo-file-system

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);
  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  const subscribe = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    if (isAvailable) {
      // Watch real-time step count updates
      return Pedometer.watchStepCount((result) => {
        setCurrentStepCount(result.steps); // Set the current step count (since the subscription started)
        setTodayStepCount((prevStepCount) => prevStepCount + result.steps); // Add to today's total step count
      });
    }
  };

  useEffect(() => {
    subscribe().then((subscription) => {
      return () => {
        subscription?.remove();
      };
    });
  }, []);

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

  const handleSubtractPixel = () => {
    if (pixelValue <= 17) {
      return; // Prevent the pixel value from going below 16
    }
    setPixelValue((prevValue) => Math.max(prevValue - 50, 1)); // Decrease the value by 50, but prevent it from going below 1
  };

  useEffect(() => {
    pixelateImage(pixelValue); // Pixelate the image when the component mounts
    console.log('pixelValue:', pixelValue);
    // loadData();
  }, [pixelValue]);

  useFocusEffect(
    useCallback(() => {
      loadData(); // Reload the data when the screen is focused
    }, [])
  );

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <View>
        <Text>Steps taken today: {todayStepCount}</Text>
        {/* Todays goal, set in the settings page */}
        <Text>Todays goal: {number} </Text>
        <Text>{text}</Text>
      </View>
      <View>
        {pixelatedImageUri ? (
          <Image
            // Display the pixelated image
            source={{ uri: pixelatedImageUri }}
            style={{ width: 300, height: 300, alignSelf: 'center' }}
          />
        ) : (
          <ThemedText>Loading...</ThemedText>
        )}
      </View>
      <View>
        <Button title="+" onPress={handleAddPixel} />
      </View>
      <View>
        <Button title="-" onPress={handleSubtractPixel} />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
