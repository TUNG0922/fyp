import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const Chatbox = ({ route }) => {
  // Destructure the activity object from route.params
  const { activity } = route.params || {}; 

  // Correctly extract activityId from the _id field
  const { _id: activityId, userId, name, role } = activity || {};

  const [messages, setMessages] = useState([]); // State to store messages
  const [newMessage, setNewMessage] = useState(''); // State to store new message
  const [loading, setLoading] = useState(false); // Loading state for fetching messages
  const [sending, setSending] = useState(false); // Sending state for message sending
  const [error, setError] = useState(null); // Error state for API or sending errors

  const flatListRef = useRef(); // Reference to FlatList to scroll to the bottom

  // Fetch messages from backend
  const fetchMessages = async () => {
    setLoading(true);
    setError(null); // Reset error before new request
    try {
      if (!activityId || !userId) {
        setError('Activity ID or User ID is missing');
        console.log('Error: Missing activityId or userId');
        return;
      }

      const url = `http://10.0.2.2:5000/api/getMessages/${activityId}/${userId}`;
      console.log(`Fetching messages from: ${url}`); // Debug: log the URL

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched messages:', data); // Debug: log the response

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setError('Invalid message data format');
        console.log('Error: Invalid data format', data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

 // Handle sending a new message
const handleSendMessage = async () => {
  if (!newMessage.trim()) {
    Alert.alert('Message required', 'Please enter a message before sending.');
    return;
  }

  setSending(true);

  // Set the default role explicitly
  const messageData = {
    userId,
    activityId,
    message: newMessage,
    name,
    role: 'Organization Admin', // Explicitly set the role as a default
    createdAt: new Date().toISOString(),
  };

  console.log('Sending message data to server:', messageData); // Log the payload

  try {
    const response = await fetch('http://10.0.2.2:5000/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });

    const data = await response.json();

    if (data.success) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, createdAt: new Date().toISOString() },
      ]);
      setNewMessage(''); // Clear the input field
      flatListRef.current.scrollToEnd({ animated: true });
    } else {
      setError(data.error || 'Failed to send message');
      Alert.alert('Error', data.error || 'Failed to send message');
    }
  } catch (err) {
    console.error('Error sending message:', err);
    setError('Error sending message');
    Alert.alert('Error', 'An error occurred while sending the message');
  } finally {
    setSending(false);
  }
};

  // Rendering each message
  const renderMessage = ({ item }) => {
    const isOrganizationAdmin = item.role === 'Organization Admin'; // Check if the role is 'Organization Admin'

    return (
      <View
        style={[
          styles.messageItem,
          {
            alignSelf: isOrganizationAdmin ? 'flex-end' : 'flex-start',  // Display organization admin's messages on the right (flex-end), and volunteer's on the left (flex-start)
            backgroundColor: isOrganizationAdmin ? '#00BFAE' : '#f1f1f1',  // Set background color based on role
          },
        ]}
      >
        <Text style={[styles.messageAuthor, { textAlign: isOrganizationAdmin ? 'right' : 'left' }]}>{item.name}</Text>
        <Text style={[styles.messageText, { textAlign: isOrganizationAdmin ? 'right' : 'left' }]}>{item.message}</Text>
        <Text style={[styles.messageDate, { textAlign: isOrganizationAdmin ? 'right' : 'left' }]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  // Fetch messages when activityId and userId are available
  useEffect(() => {
    console.log('activityId:', activityId); // Log activityId
    console.log('userId:', userId); // Log userId
    if (activityId && userId) {
      fetchMessages(); // Fetch messages when activityId and userId are available
    } else {
      console.log('Missing activityId or userId');
    }
  }, [activityId, userId]); // Re-fetch if activityId or userId changes

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFAE" />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage} // Render each message
        keyExtractor={(item) => item._id} // Assuming each message has a unique _id
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage} // Update new message state
      />
      <Button
        title={sending ? 'Sending...' : 'Send'}
        onPress={handleSendMessage} // Trigger send message
        color="#00BFAE"
        disabled={sending} // Disable send button while sending
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  messageItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    maxWidth: '95%',
  },
  messageAuthor: {
    fontWeight: 'bold',
    color: '#333',
  },
  messageText: {
    color: '#444',
    fontSize: 16,
    lineHeight: 20,
  },
  messageDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    paddingLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default Chatbox;
