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
        // Sort notifications by timestamp in descending order (latest first)
        const sortedNotifications = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setNotifications(sortedNotifications);
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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No notifications available</Text>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyComponent} // Display message when no notifications
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

export default NotificationOrganizationAdmin;