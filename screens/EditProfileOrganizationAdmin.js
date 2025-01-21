import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const EditProfileOrganizationAdmin = ({ route, navigation }) => {
  const { userId, username, email } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    // Basic validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const updatedData = {
      user_id: userId,
      password: newPassword,
    };

    try {
      const response = await fetch('http://10.0.2.2:5000/api/update_profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const responseText = await response.text();  // Get raw text response
      console.log('Response text:', responseText);  // Log the raw response

      // Try parsing it as JSON
      const data = JSON.parse(responseText);

      if (response.ok) {
        Alert.alert('Success', 'Password updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.infoText}>{username}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.infoText}>{email}</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>Change Password</Text>

      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm New Password"
        secureTextEntry
        placeholderTextColor="#888"
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
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#DADADA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    color: '#34495E',
  },
  button: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileOrganizationAdmin;
