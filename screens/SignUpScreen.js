import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker component

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Volunteer'); // Default role
  const [strength, setStrength] = useState(''); // New field
  const [previousExperiences, setPreviousExperiences] = useState(''); // New field

  const handleSignUp = async () => {
    console.log('Sign Up button pressed');
    console.log('Sending sign-up request to backend');
  
    try {
        const response = await fetch('http://10.0.2.2:5000/api/signup', { // Use 'http://localhost:5000/api/signup' for iOS Simulator
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                role, 
                strength: strength || '',  // Handle empty strings
                previous_experiences: previousExperiences || ''  // Handle empty strings
            }),
        });
  
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`HTTP error! status: ${response.status} - ${errorText}`);  // Log HTTP error details
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
  
        const data = await response.json();
        console.log('Response data:', data);
  
        if (data.message === 'User registered successfully') {
            console.log('Sign up successful');
            Alert.alert('Success', 'Registration successful!');
            navigation.navigate('SignIn');
        } else {
            console.log('Sign-up failed:', data.message);
            Alert.alert('Sign-up failed', data.message);
        }
    } catch (error) {
        console.error('Error during sign-up:', error.message);
        Alert.alert('Sign-up Error', 'There was a problem with registration.');
    }
};  

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create your account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Volunteer" value="Volunteer" />
          <Picker.Item label="Organization Admin" value="Organization Admin" />
        </Picker>
      </View>

      {role === 'Volunteer' && (
        <>
          <Text style={styles.label}>Strength</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your strength"
            value={strength}
            onChangeText={setStrength}
          />

          <Text style={styles.label}>Previous Experiences</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your previous experiences"
            value={previousExperiences}
            onChangeText={setPreviousExperiences}
          />
        </>
      )}

      <Button title="Sign Up" onPress={handleSignUp} color="#547DBE" />

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInLink}> SIGN IN</Text>
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signInText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  signInLink: {
    fontSize: 16,
    color: '#00BFAE',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;