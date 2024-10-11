import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const Final = () => {
  const route = useRoute();
  const { songId } = route.params;
  const [songDetails, setSongDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchSongDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('library')
          .select('*')
          .eq('id', songId)
          .single();

        if (error) {
          console.error('Error fetching song details:', error);
        } else {
          setSongDetails(data);
        }
      } catch (error) {
        console.error('Error fetching song details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [songId]);

  const openWebView = (url) => {
    setWebViewUrl(url);
    setIsWebViewVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeWebView = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsWebViewVisible(false);
      setWebViewUrl('');
    });
  };

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songDetails?.title + ' ' + songDetails?.artiste)}`;
  const tubidyDownloadUrl = `https://tubidy.ws/search/${songDetails?.title.replace(/ /g, '-')}-${songDetails?.artiste.replace(/ /g, '-')}`;
  const vkMusicBotUrl = `https://t.me/vkmusic_bot?start=${encodeURIComponent(songDetails?.title + ' ' + songDetails?.artiste)}`;

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" />;
  }

  if (!songDetails) {
    return <Text style={styles.errorText}>Song not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => {/* Handle back navigation */}}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.imageContainer}>
          {songDetails.album_art_url && (
            <Image source={{ uri: songDetails.album_art_url }} style={styles.albumArt} />
          )}
        </View>

        <View style={styles.metadataContainer}>
          <Text style={styles.title}>{songDetails.title}</Text>
          <Text style={styles.text}>Artist: {songDetails.artiste}</Text>
          <Text style={styles.text}>Album: {songDetails.album}</Text>
          <Text style={styles.text}>Release Date: {songDetails.release_date}</Text>
          <Text style={styles.text}>Genre: {songDetails.genre}</Text>
          <Text style={styles.lyricsText}>Lyrics:</Text>
          <Text style={styles.lyrics}>{songDetails.lyrics}</Text>

          <TouchableOpacity onPress={() => openWebView(youtubeSearchUrl)} style={styles.clickToPlay}>
            <Text style={styles.iconText}>YouTube</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openWebView(tubidyDownloadUrl)} style={styles.clickToPlay}>
            <Text style={styles.iconText}>Download from Tubidy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openWebView(vkMusicBotUrl)} style={styles.clickToPlay}>
            <Text style={styles.iconText}>VK Music</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* WebView Modal */}
      <Modal visible={isWebViewVisible} onRequestClose={closeWebView} transparent={true}>
        <Animated.View style={[styles.webViewContainer, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1000, 0] }) }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeWebView}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <WebView source={{ uri: webViewUrl }} style={styles.webView} />
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  albumArt: {
    width: width - 40,
    height: width - 40,
    borderRadius: 10,
  },
  metadataContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  text: {
    color: '#ccc',
    marginBottom: 5,
  },
  lyricsText: {
    color: '#ccc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lyrics: {
    color: '#fff',
    fontSize: 16,
  },
  clickToPlay: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 16,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  closeButton: {
    padding: 20,
    alignItems: 'flex-end',
  },
  webView: {
    flex: 1,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Final;
