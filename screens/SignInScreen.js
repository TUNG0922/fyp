import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn } from '../api/auth'; // Import the signIn function

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Volunteer');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const data = await signIn(email, password, role);
      console.log('Sign-in response:', data); // Check the response structure

      if (data && data.message === 'Sign-in successful') {
        const userId = data.userId; // This should now contain the userId
        const username = data.username || 'LOG'; // Use the username or default to 'LOG'

        if (userId) {
          await AsyncStorage.setItem('userId', userId); // Store userId
          await AsyncStorage.setItem('username', username); // Store username
          await AsyncStorage.setItem('password', password); // Store password
          await AsyncStorage.setItem('email', email); // Store email

          // Pass the role to the corresponding dashboard based on the selected role
          if (role === 'Volunteer') {
            navigation.navigate('DashboardVolunteer', { userId, username, password, email, role });
          } else if (role === 'Organization Admin') {
            navigation.navigate('DashboardOrganizationAdmin', { userId, username, password, email, role });
          } else if (role === 'Platform Admin') {
            navigation.navigate('DashboardPlatformAdmin', { userId, username, password, email, role });
          }
        } else {
          Alert.alert('Sign-in Error', 'User ID is missing');
        }
      } else {
        Alert.alert('Sign-in Error', data.message || 'An unknown error occurred');
      }
    } catch (error) {
      console.error('Network request failed:', error);
      Alert.alert('Network Error', 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Community.png')} style={styles.logo} />
      <Text style={styles.heading}>Sign in to your account</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="ex: abc@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        accessibilityLabel="Email input"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="Password input"
      />
      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
          accessibilityLabel="Select your role"
        >
          <Picker.Item label="Volunteer" value="Volunteer" />
          <Picker.Item label="Organization Admin" value="Organization Admin" />
        </Picker>
      </View>
      <Button 
        title="Sign In" 
        onPress={handleSignIn} 
        color="#547DBE" 
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#547DBE" style={styles.loader} />}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpLink}> SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 60,
  },
  picker: {
    height: '100%',
    width: '100%',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signUpText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signUpLink: {
    fontSize: 16,
    color: '#00BFAE',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 16,
  },
});

export default SignInScreen;
