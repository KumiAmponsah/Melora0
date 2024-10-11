import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import * as Device from 'expo-device';
import moment from 'moment';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory(); // Fetch history every time the screen is focused
    }, [])
  );

  const fetchHistory = async () => {
    setLoading(true); // Start loading while fetching
    const deviceID = `${Device.deviceName}-${Device.osBuildId}`; // Generate unique device ID

    try {
      const { data: historyData, error: historyError } = await supabase
        .from('library')
        .select('*')
        .eq('device_id', deviceID); // Fetch history based on device ID

      if (historyError) {
        console.error('Error fetching history:', historyError);
      } else {
        setHistory(historyData || []); // If no history, set an empty array
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false); // Stop loading once the fetch is complete
    }
  };

  if (loading) {
    return <Text>Loading...</Text>; // Show loading message
  }

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You have no history</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {history.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.historyItem}
          onPress={() => navigation.navigate('Final', { songId: item.id })} // Navigate to Final.js with the song ID
        >
          {item.album_art_url ? (
            <Image source={{ uri: item.album_art_url }} style={styles.albumArt} />
          ) : (
            <View style={styles.placeholderImage} /> // Placeholder if no image URL
          )}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.artist}>{item.artiste}</Text>
            <Text style={styles.timestamp}>
              {moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc', // Placeholder color
  },
  detailsContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
});

export default History;
