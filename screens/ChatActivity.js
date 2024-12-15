import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const ChatActivity = ({ route }) => {
  const { activity, activityId, userId, name, role } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Reference to FlatList to scroll to the bottom
  const flatListRef = useRef();

  // Ensure activity_user_id is set correctly
  const activity_user_id = activity.userId;  // Assuming userId represents the activity_user_id

  // Fetch messages from the backend
  const fetchMessages = async () => {
    setLoading(true);
    setError(null); // Reset the error before new request
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/getMessages/${activityId}/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setError('Invalid message data format');
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
    const messageData = {
      userId,
      activityId,
      activity_user_id,
      message: newMessage,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

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
    const isVolunteer = item.role === 'Volunteer';
  
    return (
      <View
        style={[
          styles.messageItem,
          {
            alignSelf: isVolunteer ? 'flex-end' : 'flex-start',
            backgroundColor: isVolunteer ? '#00BFAE' : '#f1f1f1',
          },
        ]}
      >
        <Text style={[styles.messageAuthor, { textAlign: isVolunteer ? 'right' : 'left' }]}>
          {item.name}
        </Text>
        <Text style={[styles.messageText, { textAlign: isVolunteer ? 'right' : 'left' }]}>
          {item.message}
        </Text>
        <Text style={[styles.messageDate, { textAlign: isVolunteer ? 'right' : 'left' }]}>
          {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };  

  useEffect(() => {
    if (activityId && userId) {
      fetchMessages();
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
        renderItem={renderMessage}
        keyExtractor={(item) => item._id} // Assuming each message has a unique _id
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <Button
        title={sending ? 'Sending...' : 'Send'}
        onPress={handleSendMessage}
        color="#00BFAE"
        disabled={sending}
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

export default ChatActivity;
