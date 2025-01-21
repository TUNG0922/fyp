import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

const NotificationVolunteer = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/notifications/${userId}`);
        const data = await response.json();

        // Sort notifications by timestamp (latest first)
        const sortedNotifications = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#547DBE" />;
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Text style={styles.noNotificationsText}>No notifications available</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.message}</Text>
              {/* Displaying the timestamp only */}
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  // Adjusted style for the "No notifications" message to be positioned at the top with equal left and right margin
  noNotificationsContainer: {
    marginTop: 20, // Space from the top
    alignItems: 'center', // Center horizontally
    paddingVertical: 12,  // Vertical padding
    paddingHorizontal: 24, // Horizontal padding
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  noNotificationsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
    lineHeight: 18,
    marginHorizontal: 20,
  },
});

export default NotificationVolunteer;
