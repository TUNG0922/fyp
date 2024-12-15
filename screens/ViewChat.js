import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { FontAwesome5 } from '@expo/vector-icons'; // Add icons for a better design

const ViewChat = ({ route }) => {
  const { activity } = route.params; // Get the activity details passed from the previous screen
  const navigation = useNavigation(); // Hook for navigation

  const [messages, setMessages] = useState([]); // To store chat messages
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    console.log("Activity passed to ViewChat:", activity); // Log the activity data passed to the component

    // Fetch chat messages for the activity
    fetchMessages();

    // Set up a timer to refresh messages every second
    const interval = setInterval(() => {
        fetchMessages();
    }, 8000);

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, [activity._id]); // Dependency array ensures this runs when activity._id changes

  // Function to fetch messages for the activity
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
  
    try {
      console.log(`Fetching messages for activityId: ${activity._id}`);
  
      const response = await fetch(
        `http://10.0.2.2:5000/api/getMessagesList?activityId=${activity._id}`
      );
      const data = await response.json();
  
      if (response.ok) {
        console.log("Fetched messages:", data); // Log the entire response to verify `userId`
        setMessages(data.messages || []);
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (fetchError) {
      setError('An error occurred while fetching messages.');
      console.error('Fetch Error:', fetchError);
    } finally {
      setLoading(false);
    }
  };  

  // Navigation to Chatbox with userId, messages, and activity
  const handleNavigateToChatbox = (userId) => {
    console.log("Navigating to Chatbox with details:");
    console.log("Selected UserId:", userId); // Verify the userId is passed correctly
    console.log("Activity:", activity);
    console.log("Messages:", messages);
  
    navigation.navigate('Chatbox', {
      activity,  // Pass the entire activity object
      messages,  // Pass the messages object or array
      userId,    // Pass the userId for the selected message
    });
  };

  // Render each message in the list
  const renderMessageItem = ({ item }) => {
    console.log("Rendering message item with userId:", item.userId || item.user_id); // Check for alternative key names
  
    return (
      <TouchableOpacity
        onPress={() => {
          console.log("Selected UserId:", item.userId || item.user_id); // Log the userId
          handleNavigateToChatbox(item.userId || item.user_id); // Pass the userId to the function
        }}
        style={styles.messageItem}
      >
        <FontAwesome5 name="user-circle" size={36} color="#4CAF50" style={styles.messageIcon} />
        <View style={styles.messageContent}>
          <Text style={styles.messageName}>{item.name || 'Anonymous'}</Text>
          <Text style={styles.messageText}>View message</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id || Math.random().toString()} // Ensure unique keys
          style={styles.messagesList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f3f4f6',
  },
  messagesList: {
    marginBottom: 15,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  messageIcon: {
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewChat;