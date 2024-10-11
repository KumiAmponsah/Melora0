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
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Final = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Use navigation
  const { songId } = route.params;
  const [songDetails, setSongDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [slideAnim] = useState(new Animated.Value(height)); // For sliding web view

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

  const handleBackPress = () => {
    navigation.navigate('History'); // Navigate back to History screen
  };

  const openWebView = (url) => {
    setWebViewUrl(url);
    setIsWebViewVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeWebView = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsWebViewVisible(false);
      setWebViewUrl('');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!songDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Song details not found.</Text>
      </View>
    );
  }

  const tubidyUrl = `https://tubidy.ws/search/${encodeURIComponent(songDetails.title)}-${encodeURIComponent(songDetails.artiste)}`;
  const telegramMusicBotUrl = `https://t.me/vkmusic_bot?start=${encodeURIComponent(songDetails.title + ' ' + songDetails.artiste)}`;

  return (
    <LinearGradient colors={['#121212', '#1c1c1c']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {songDetails.album_art_url ? (
          <Image
            source={{ uri: songDetails.album_art_url }}
            style={styles.albumArt}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.noImageText}>No Image Available</Text>
        )}
      </View>
      <LinearGradient colors={['#121212', '#5e16ec']} style={styles.metadataContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>{songDetails.title}</Text>
          <Text style={styles.text}>Artist: {songDetails.artiste}</Text>
          <Text style={styles.text}>Album: {songDetails.album}</Text>
          <Text style={styles.text}>Release Date: {songDetails.release_date}</Text>
          <Text style={styles.text}>Genre: {songDetails.genre}</Text>

          <TouchableOpacity
            onPress={() => openWebView(`https://www.youtube.com/results?search_query=${encodeURIComponent(songDetails.title + ' ' + songDetails.artiste)}`)}
            style={styles.clickToPlay}
          >
            <Image source={require('./assets/youtube.png')} style={styles.icon2} />
            <Text style={styles.iconText}>YouTube</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openWebView(tubidyUrl)}
            style={styles.clickToPlay}
          >
            <Image source={require('./assets/Download.png')} style={styles.icon2} />
            <Text style={styles.iconText}>Tubidy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openWebView(telegramMusicBotUrl)}
            style={styles.clickToPlay}
          >
            <Image source={require('./assets/Telegram.png')} style={styles.icon2} />
            <Text style={styles.iconText}>VK Music Bot</Text>
          </TouchableOpacity>

          {songDetails.lyrics && (
            <View style={styles.lyricsContainer}>
              <Text style={styles.lyricssubText}>Lyrics</Text>
              <Text style={styles.lyricsText}>{songDetails.lyrics}</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* WebView Modal */}
      <Modal visible={isWebViewVisible} onRequestClose={closeWebView} transparent={true}>
        <Animated.View style={[styles.webViewContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeWebView}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <WebView source={{ uri: webViewUrl }} style={styles.webView} />
        </Animated.View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  imageContainer: {
    marginTop: 60,
    height: height / 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  albumArt: {
    width: width - 40,
    height: height / 3 - 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#121212',
  },
  noImageText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  metadataContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  clickToPlay: {
    textAlign: 'center',
    marginVertical: 10,
    backgroundColor: '#4B10BF',
    height: 50,
    width: 180,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  icon2: {
    width: 30,
    height: 30,
    marginRight: 'auto',
  },
  lyricsContainer: {
    marginTop: 20,
    padding: 10,
  },
  lyricssubText: {
    fontSize: 25,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  lyricsText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  webView: {
    flex: 1,
  },
  closeButton: {
    position: 'relative',
    top: -5,
    right: -312,
    zIndex: 9,
  },
});

export default Final;
