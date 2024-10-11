import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, Dimensions, PanResponder, Animated, Easing } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

import OnlyButton4 from './onlyButton4';
import resultsNotFound from './resultsNotFound';
import ShowDisplay1 from './ShowDisplay1';
import Final from './Final';
import History from './History';
import Stats from './Stats';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(onFinish, 1500); // Show splash screen for an additional 1.5 seconds
    });
  }, [fadeAnim]);

  return (
    <View style={styles.splashContainer}>
      <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>
        Let's discover with Melora
      </Animated.Text>
    </View>
  );
};

function HomeScreen() {
  const navigation = useNavigation();
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
    
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Breathing animation
  useEffect(() => {
    const breatheInOut = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1, // Scale up
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Scale down
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => breatheInOut()); // Repeat
    };

    breatheInOut();
  }, [scaleAnim]);

  return (
    <LinearGradient
      colors={['#5e16ec', '#121212']}
      style={styles.viewContainer}
    >
      <View {...panResponder.panHandlers}>
        <View style={styles.libraryAndConcert}>
          <TouchableOpacity style={styles.libraryContainer} onPress={() => navigation.navigate('Stats')}>
            <Image source={require('./assets/analytics.png')} style={styles.drawerIcon} />
            <Text style={styles.libraryText}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.concertContainer} onPress={() => navigation.navigate('History')}>
            <Image source={require('./assets/history (1).png')} style={styles.drawerIcon1} />
            <Text style={styles.concertText}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OnlyButton4')}>
              <Image source={require('./assets/meloraImage.png')} style={styles.logo} />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.meloraText}>Discover With Melora</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const Stack = createStackNavigator();

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  return (
    <NavigationContainer>
      {isSplashVisible ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <Stack.Navigator initialRouteName="Home">

          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OnlyButton4" component={OnlyButton4} options={{ headerShown: false }} />
          <Stack.Screen name="resultsNotFound" component={resultsNotFound} options={{ headerShown: false }}/>
         <Stack.Screen name="ShowDisplay1" component={ShowDisplay1} options={{ headerShown: false }} />
          <Stack.Screen name="Final" component={Final} options={{ headerShown: false }} />
          <Stack.Screen name="History" component={History} options={{ headerShown: true }} />
          <Stack.Screen name="Stats" component={Stats} options={{ headerShown: true }} />
          
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerIcon: {
    width: 40,
    height: 40,
  },
  drawerIcon1: {
    width: 34,
    height: 34,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#195497',
  },
  splashText: {
    fontSize: width * 0.1,
    color: '#ffffff',
    fontWeight: '900',
  },
  viewContainer: {
    flex: 1,
    padding: width * 0.05,
  },
  libraryAndConcert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.08,
    marginTop: height * 0.05,
  },
  libraryContainer: {
    alignItems: 'center',
  },
  concertContainer: {
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    top: height * 0.15,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c1c',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    marginBottom: height * 0.09,
  },
  logo: {
    width: width * 0.58,
    height: (width * 0.58) * 0.94,
  },
  meloraText: {
    fontSize: width * 0.05,
    color: '#ffffff',
  },
});
