import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setErrors({});

    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email' }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      // sign in 
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('Login successful!', user);
      navigation.navigate('Home'); // navigate to home after login
    } catch (error) {
      // error handling
      let errorMessage = 'An error occurred. Please try again.';

      if (error && error.message) {
        errorMessage = error.message; 
      } else if (error && error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'The supplied auth credential is incorrect or malformed.';
            break;
          default:
            errorMessage = 'Login failed. Please try again.';
            break;
        }
      }

      Alert.alert(errorMessage); 
      console.error('Login failed:', errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email Address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: null }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: null }));
        }}
        secureTextEntry
        editable={!loading}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

        {/* navigate to sign up if new user */}
      <Text style={styles.footerText}>
        Don’t have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          Get Started
        </Text>
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#eaeaea',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 5,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a8a8a8',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
    color: '#666',
  },
  link: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});