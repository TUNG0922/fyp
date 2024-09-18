import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const NotificationVolunteer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Retrieve the activity data passed through navigation
  const { activity } = route.params || {};

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Your application for the activity "{activity ? activity.name : 'activity'}" is pending, please wait.
      </Text>
      <Button title="Go Back" onPress={handleGoBack} color="#547DBE" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
});

export default NotificationVolunteer;
