import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';

const NotificationOrganizationAdmin = ({ route }) => {
  const { userId } = route.params; // Get userId from params
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/notifications/organization_admin/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      Alert.alert('Error', 'Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications(); // Call fetchNotifications on component mount
  }, []);

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  notificationItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
});

export default NotificationOrganizationAdmin;
