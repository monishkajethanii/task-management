import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSignup = async () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirm) {
      newErrors.confirm = 'Please confirm your password';
    } else if (password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Firebase Authentication: Create user with email and password
      await auth().createUserWithEmailAndPassword(email, password);

      // Optional: Update user profile (for example, set the display name)
      await auth().currentUser.updateProfile({
        displayName: email.split('@')[0],  // Using email prefix as display name
      });

      // Navigate to the Home screen
      navigation.navigate('Home');
    } catch (error) {
      let errorMessage = 'An error occurred during sign up';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already registered';
          setErrors({ email: errorMessage });
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          setErrors({ email: errorMessage });
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Please enter a stronger password';
          setErrors({ password: errorMessage });
          break;
        default:
          console.error('Sign up error:', error);
      }

      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's get started!</Text>
      
      <View style={styles.inputContainer}>
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

        <TextInput
          style={[styles.input, errors.confirm && styles.inputError]}
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            setErrors((prev) => ({ ...prev, confirm: null }));
          }}
          secureTextEntry
          editable={!loading}
        />
        {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Log in
        </Text>
      </Text>
    </View>
  );
};

export default SignUpScreen;

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
  inputContainer: {
    marginBottom: 20,
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