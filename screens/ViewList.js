import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const ViewList = ({ route }) => {
  const { activity, userId, username } = route.params; // Destructure passed parameters
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Activity ID:', activity._id);
    console.log('User ID:', userId);
    console.log('Username:', username);
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://10.0.2.2:5000/api/getMessages?activityId=${activity._id}`
      );
      const data = await response.json();
      
      // Log the response to debug
      console.log('Messages Response:', data);
      
      if (response.ok) {
        setMessages(data.messages); // Save the retrieved messages
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (error) {
      setError('Failed to load messages');
      console.error('Fetch Error:', error); // Log the fetch error for debugging
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageItem}>
      {/* Ensure all text is wrapped inside Text component */}
      <Text style={styles.messageName}>Name: {item.name}</Text>
      <Text style={styles.messageContent}>Message: {item.message}</Text>
      <Text style={styles.messageDate}>Date: {new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Show loading indicator while messages are being fetched */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {/* Show error if there was an issue fetching messages */}
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {/* Display messages if successfully loaded */}
      {!loading && !error && messages.length > 0 && (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => index.toString()} // Use index as fallback for unique keys
        />
      )}
      
      {/* Show a message if no messages were found */}
      {!loading && !error && messages.length === 0 && (
        <Text style={styles.noMessagesText}>No messages found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  messageItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  messageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContent: {
    fontSize: 16,
    color: '#555',
  },
  messageDate: {
    fontSize: 14,
    color: '#777',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noMessagesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewList;
