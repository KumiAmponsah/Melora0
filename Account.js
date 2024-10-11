import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Account = ({ navigation, theme }) => {
  const [logoScale] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 1500,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <Image source={require('./assets/logo7.png')} style={styles.logo} />
      </Animated.View>

      <Text style={[styles.title, { color: theme.textColor }]}>Welcome to Our App!</Text>
      <Text style={[styles.subtitle, { color: theme.textColor }]}>
        Sign in to access your account or create a new one to join our community. Experience the best with us!
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#4f83cc' }]} onPress={() => navigation.navigate('SignIn')}>
          <Ionicons name="log-in-outline" size={24} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#4f83cc' }]} onPress={() => navigation.navigate('SignUp')}>
          <Ionicons name="person-add-outline" size={24} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '80%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Account;
