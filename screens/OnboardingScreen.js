import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.gradient} />
      
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.logo}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Get things done.</Text>
          <Text style={styles.subtitle}>
            Just a click away from planning your tasks
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decorationCircle} />
      <View style={[styles.decorationCircle, styles.decorationCircle2]} />
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.7,
    backgroundColor: '#4158D0',
    opacity: 0.05,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    // alignContent: 'flex-end',
    justifyContent: 'center',
    right:0
  },
  buttonText: {
    color: 'white',
    fontSize: 34,
    textAlign:'center',
    fontWeight: '600',
  },
  decorationCircle: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#4158D0',
    opacity: 0.05,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  decorationCircle2: {
    width: width * 0.4,
    height: width * 0.4,
    bottom: -width * 0.1,
    left: -width * 0.1,
    top: undefined,
    right: undefined,
    backgroundColor: '#6C63FF',
  },
});