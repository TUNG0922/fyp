import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Volunteer');
  const [loading, setLoading] = useState(false);

  // Handle Sign-In
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Sign-in successful:', data);

      if (data.message === 'Sign-in successful') {
        // Navigate to the appropriate dashboard based on the role
        switch (role) {
          case 'Volunteer':
            navigation.navigate('DashboardVolunteer');
            break;
          case 'Organization Admin':
            navigation.navigate('DashboardOrganizationAdmin');
            break;
          case 'Platform Admin':
            navigation.navigate('DashboardPlatformAdmin');
            break;
          default:
            Alert.alert('Role Error', 'Invalid role selected');
        }
      } else {
        Alert.alert('Sign-in Error', data.message);
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
      <Image 
        source={require('../assets/Community.png')} 
        style={styles.logo}
      />
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
          <Picker.Item label="Platform Admin" value="Platform Admin" />
        </Picker>
      </View>
      <Button 
        title="Sign In" 
        onPress={handleSignIn} 
        color="#547DBE" 
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#547DBE" style={styles.loader} />}
      <Text style={styles.orText}>or sign in with</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} accessibilityLabel="Sign in with Google">
          <Icon name="google" size={24} color="#DD4B39" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} accessibilityLabel="Sign in with Facebook">
          <Icon name="facebook" size={24} color="#3B5998" style={styles.icon} />
        </TouchableOpacity>
      </View>
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
  orText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginVertical: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    textAlign: 'center',
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
