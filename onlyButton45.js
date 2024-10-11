// onlyButton4.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function OnlyButton4() {
  const [isSearching, setIsSearching] = useState(true);
  const [recording, setRecording] = useState(null);
  const [message, setMessage] = useState("");
  const [metadata, setMetadata] = useState(null);
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);
  const rotateValue = new Animated.Value(0);

  const navigation = useNavigation();

  useEffect(() => {
    if (isSearching) {
      startRippleAnimation();
      startButtonRotation();
      startRecording();
    } else {
      stopAnimations();
    }
  }, [isSearching]);

  useEffect(() => {
    if (metadata) {
      navigation.navigate('ShowDisplay1', { metadata });
    }
  }, [metadata]);

  const startRippleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.5,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startButtonRotation = () => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    Animated.timing(scaleValue).stop();
    Animated.timing(opacityValue).stop();
    Animated.timing(rotateValue).stop();
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        console.log('Recording started successfully:', recording);
        setRecording(recording);
        setMessage("Recording started...");

        // Automatically stop recording after 15 seconds
        setTimeout(async () => {
          if (recording) {
            console.log('Stopping recording after timeout...');
            await stopRecording(recording);
          } else {
            console.warn('Recording was not properly initialized.');
            setMessage("Recording was not started properly.");
          }
        }, 15000);
      } else {
        setMessage("Please grant permission to access the microphone.");
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
      setMessage("Error starting recording.");
    }
  };

  const stopRecording = async (currentRecording) => {
    if (currentRecording) {
      try {
        await currentRecording.stopAndUnloadAsync();
        const fileUri = currentRecording.getURI();

        console.log('Recording stopped. File URI:', fileUri);

        setRecording(null);
        setMessage("Identifying song...");

        // Upload the recorded audio for fingerprinting
        const formData = new FormData();
        formData.append('song', {
          uri: fileUri,
          type: 'audio/3gp', // Match this with the actual type if different
          name: 'recording.3gp'
        });

        const response = await axios.post('http://192.168.132.193:5000/match', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        if (response.data.error) {
          setMetadata(null);
          setMessage("No result found.");
        } else {
          setMetadata(response.data);
          setMessage("");
        }
      } catch (err) {
        console.error('Failed to stop recording:', err);
        setMessage("Error occurred.");
      }
    } else {
      console.warn('No active recording to stop.');
      setMessage("Recording was not started properly.");
    }
  };

  const buttonRotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.viewContainer}>
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Animated.View style={[styles.button, { transform: [{ rotate: buttonRotation }] }]}>
            <View style={styles.rippleBox}>
              {isSearching && (
                <Animated.View
                  style={[
                    styles.ripple,
                    {
                      transform: [{ scale: scaleValue }],
                      opacity: opacityValue,
                    },
                  ]}
                />
              )}
              <View style={styles.logoContainer}>
                <Image
                  source={require('./assets/meloraImage.png')}
                  style={styles.logo}
                />
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
      {isSearching && (
        <View style={styles.listeningTextContainer}>
          <Text style={styles.listeningText}>Listening</Text>
          <Text style={styles.listeningSubText}>Make sure your device can hear the song clearly</Text>
        </View>
      )}
      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#132b47'
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    position: 'relative',
  },
  button: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  rippleBox: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  listeningTextContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    alignSelf: 'center',
    alignItems: 'center'
  },
  listeningText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  listeningSubText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
  messageContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignSelf: 'center',
    alignItems: 'center'
  },
  messageText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
});
