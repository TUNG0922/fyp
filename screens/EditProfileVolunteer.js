import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const EditProfileVolunteer = ({ route, navigation }) => {
  const { userId, username, email, password, role } = route.params;

  const [newUsername, setNewUsername] = useState(username);
  const [newEmail, setNewEmail] = useState(email);
  const [newPassword, setNewPassword] = useState(password);

  const handleSave = async () => {
    // Prepare the update payload
    const updatedData = {
      user_id: userId,
      ...(newUsername !== username && { name: newUsername }),
      ...(newEmail !== email && { email: newEmail }),
      ...(newPassword && { password: newPassword }), // Include password only if it's changed
    };

    try {
      const response = await fetch('http://10.0.2.2:5000/api/update_profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Failed to update profile', data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        value={newUsername}
        onChangeText={setNewUsername}
        placeholder="Username"
      />
      <TextInput
        style={styles.input}
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#547DBE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditProfileVolunteer;
