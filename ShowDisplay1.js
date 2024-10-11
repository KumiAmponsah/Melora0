import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, ScrollView, BackHandler, Alert, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function ShowDisplay1({ route, navigation }) {
  const { metadata } = route.params;
  const [albumImageUrl, setAlbumImageUrl] = useState(metadata.album_art_url);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');

  const [slideAnim] = useState(new Animated.Value(height)); // Initial value for slide animation

  useEffect(() => {
    const fetchAlbumImage = async () => {
      if (!metadata.album_art_url) {
        try {
          const artist = encodeURIComponent(metadata.artist.replace(/ /g, '+'));
          const album = encodeURIComponent(metadata.album.replace(/ /g, '+'));

          const response = await axios.get(`https://itunes.apple.com/search?term=${artist}+${album}&entity=album`);
          const results = response.data.results;

          if (results.length > 0) {
            const hdImageUrl = results[0].artworkUrl100.replace('100x100', '1000x1000');
            setAlbumImageUrl(hdImageUrl);
          } else {
            setAlbumImageUrl(null);
          }
        } catch (err) {
          console.error('Failed to fetch album image:', err);
          setAlbumImageUrl(null);
        }
      }
      setLoading(false);
    };

    const fetchLyrics = async () => {
      if (metadata.artist && metadata.title) {
        try {
          const response = await axios.get(`https://api.lyrics.ovh/v1/${metadata.artist}/${metadata.title}`);
          if (response.data.lyrics) {
            setLyrics(response.data.lyrics);
          } else {
            setLyrics('Lyrics not found');
          }
        } catch (error) {
          // console.error('Error fetching lyrics:', error.message);
          setLyrics('Lyrics not found');
        }
      }
    };
    

    fetchAlbumImage();
    fetchLyrics();
  }, [metadata]);

  const openURL = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  const togglePlayback = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else {
      if (metadata.preview_url) {
        const { sound } = await Audio.Sound.createAsync({ uri: metadata.preview_url });
        setSound(sound);
        setIsPlaying(true);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = async () => {
        await stopPlayback();
        navigation.navigate('Home');
        return true; // Return true to prevent default back action
      };

      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
        stopPlayback();
      };
    }, [navigation, sound])
  );

  const handleBackPress = async () => {
    await stopPlayback();
    navigation.navigate('Home');
    return true; // Return true to prevent default back action
  };

  const handleCopySongInfo = () => {
    const songInfo = `${metadata.title}\n ${metadata.artist}`;
    Clipboard.setStringAsync(songInfo).then(() => {
      Alert.alert('Copied', 'Song info copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy song info:', err);
    });
  };

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(metadata.title + ' ' + metadata.artist)}`;
  const vkMusicBotUrl = `https://t.me/vkmusic_bot?start=${encodeURIComponent(metadata.title + ' ' + metadata.artist)}`;

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

  const handlePress = () => {
    handleCopySongInfo();
    openWebView(vkMusicBotUrl);
  };

  return (
    <LinearGradient colors={['#121212', '#1c1c1c']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : albumImageUrl ? (
          <Image source={{ uri: albumImageUrl }} style={styles.albumArt} resizeMode="cover" />
        ) : (
          <Text style={styles.noImageText}>No Image Available</Text>
        )}
      </View>
      <LinearGradient colors={['#121212', '#5e16ec']} style={styles.metadataContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>{metadata.title}</Text>
          <Text style={styles.text}>Artist: {metadata.artist}</Text>
          <Text style={styles.text}>Album: {metadata.album}</Text>
          <Text style={styles.text}>Release Date: {metadata.release_date}</Text>
          <Text style={styles.text}>Genre: {metadata.genre}</Text>
          {metadata.preview_url ? (
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <FontAwesome name={isPlaying ? "pause-circle" : "play-circle"} size={60} color="white" />
              <Text style={styles.previewText}>Preview</Text>
            </TouchableOpacity>
          ) : null}

          {metadata.song_url ? (
            <TouchableOpacity onPress={() => openWebView(metadata.song_url)} style={styles.clickToPlay}>
              <Image source={require('./assets/AppleMusic.png')} style={styles.icon2} />
              <Text style={styles.iconText}>Apple Music</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={() => openWebView(`https://tubidy.ws/search/${metadata.title.replace(/ /g, '-')}-${metadata.artist.replace(/ /g, '-')}`)} style={styles.clickToPlay}>
            <Image source={require('./assets/Download.png')} style={styles.icon2} />
            <Text style={styles.iconText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openWebView(youtubeSearchUrl)} style={styles.clickToPlay}>
            <Image source={require('./assets/youtube.png')} style={styles.icon2} />
            <Text style={styles.iconText}>YouTube</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePress} style={styles.clickToPlay}>
            <Image source={require('./assets/Telegram.png')} style={styles.icon2} />
            <Text style={styles.iconText}>VK Music</Text>
          </TouchableOpacity>

          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricssubText}>Lyrics</Text>
            <Text style={styles.lyricsText}>{lyrics}</Text>
          </View>
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
}

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
  playButton: {
    alignItems: 'center',
    marginVertical: 20,
  },
  previewText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 2,
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
    borderRadius: 5,
    marginTop: 10,
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight:'500',
  },
  lyricsContainer: {
    marginTop: 20,
    padding: 10,
  },
  lyricssubText: {
    fontSize: 25,
    fontWeight:'500',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  lyricsText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  icon2: {
    width: 30,
    height: 30,
    marginRight: 'auto',
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
 