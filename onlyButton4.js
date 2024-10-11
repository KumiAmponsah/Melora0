import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';  // Import FontAwesome
import { supabase } from './supabaseClient'; // Make sure to import your Supabase client
import * as Device from 'expo-device'; // Import expo-device for device ID

const { width, height } = Dimensions.get('window');

export default function OnlyButton4() {
  const [recording, setRecording] = useState(null);
  const [message, setMessage] = useState("");
  const [metadata, setMetadata] = useState(null);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    startRippleAnimation();
    startButtonRotation();
    startRecording();
  }, []);

  useEffect(() => {
    if (metadata) {
      saveSongToHistory(metadata);
      navigation.navigate('ShowDisplay1', { metadata });
    }
  }, [metadata]);

  const startRippleAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1.5,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
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

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recordingObject = new Audio.Recording();

        try {
          await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
          await recordingObject.startAsync();
          setRecording(recordingObject);
          setMessage("Recording started...");

          // Automatically stop recording after 15 seconds
          setTimeout(async () => {
            if (recordingObject) {
              await stopRecording(recordingObject);
            } else {
              console.warn('Recording was not properly initialized.');
              setMessage("Recording was not started properly.");
            }
          }, 15000);
        } catch (error) {
          console.error('Failed to start recording:', error);
          setMessage("Error starting recording.");
        }
      } else {
        setMessage("Please grant permission to access the microphone.");
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
      setMessage("Error starting recording.");
    }
  };

  const stopRecording = async (recordingObject) => {
    if (recordingObject) {
      try {
        await recordingObject.stopAndUnloadAsync();
        const fileUri = recordingObject.getURI();

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
          // Navigate to 'resultsNotFound' if there is an error in the response data
          navigation.navigate('resultsNotFound');
        } else {
          setMetadata(response.data);
          setMessage("");
        }
      } catch (err) {
        // Handle errors from the API request
        // console.error('Failed to stop recording or process request:', err);
        setMessage("Error occurred.");
        navigation.navigate('resultsNotFound'); // Navigate to 'resultsNotFound' on API request error
      }
    } else {
      console.warn('No active recording to stop.');
      setMessage("Recording was not started properly.");
    }
  };

  
  const saveSongToHistory = async (metadata) => {
    const deviceID = Device.deviceName + '-' + Device.osBuildId; 
    const { title, artist, album, song_preview_url, album_art_url, release_date, lyrics, genre } = metadata; 

    try {
      const { data: history, error: historyError } = await supabase
        .from('library')
        .insert({
          created_at: new Date().toISOString(),
          artiste: artist,
          title: title,
          album: album,
          album_art_url: album_art_url,
          release_date: release_date, 
          lyrics: lyrics, 
          genre: genre,
          device_id: deviceID,
          song_preview_url: song_preview_url 
        });

      if (historyError) {
        console.error('Error saving history:', historyError);
      }
    } catch (error) {
      console.error('Error saving song to history:', error);
    }
  };

  const handleClose = async () => {
    if (recording) {
      await stopRecording(recording);
    }
    navigation.navigate('Home');
  };

  const buttonRotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient 
      colors={['#5e16ec', '#0d1f4e']} 
      style={styles.viewContainer}
    >
      <View style={styles.viewContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <FontAwesome name="times" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Animated.View style={[styles.button, { transform: [{ rotate: buttonRotation }] }]}>
            <View style={styles.rippleBox}>
              <Animated.View
                style={[
                  styles.ripple,
                  {
                    transform: [{ scale: scaleValue }],
                    opacity: opacityValue,
                  },
                ]}
              />
              <View style={styles.logoContainer}>
                <Image
                  source={require('./assets/meloraImage.png')}
                  style={styles.logo}
                />
              </View>
            </View>
          </Animated.View>
        </View>
        <View style={styles.listeningTextContainer}>
          <Text style={styles.listeningText}>Listening</Text>
          <Text style={styles.listeningSubText}>Make sure your device can hear the song clearly</Text>
        </View>
        {message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  closeButton: {
    position: 'absolute',
    top: 70,
    right: 250,
    zIndex: 2,
  },
});
