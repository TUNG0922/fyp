import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const ChatActivity = ({ route }) => {
  const { activityId, userId, name, role } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Reference to FlatList to scroll to the bottom
  const flatListRef = useRef();

  // Log to trace received params
  useEffect(() => {
    console.log("Received params:", { activityId, userId, name, role });
  }, [activityId, userId, name]);

  // Fetch messages when the component mounts or activityId/userId change
  const fetchMessages = () => {
    setLoading(true);
    fetch(`http://10.0.2.2:5000/api/getMessages/${activityId}/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Directly parse as JSON
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setError('Invalid message data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setError('Error fetching messages');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activityId && userId) {
      fetchMessages();
    }
  }, [activityId, userId]);

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

      const data = await response.json(); // Directly parse JSON

      if (data.success) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...messageData, createdAt: new Date().toISOString() },
        ]);
        setNewMessage('');
        // Scroll to the bottom after sending a message
        flatListRef.current.scrollToEnd({ animated: true });
      } else {
        setError(data.error || 'Failed to send message');
        Alert.alert('Error', data.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Error sending message');
      Alert.alert('Error', 'An error occurred while sending the message');
    } finally {
      setSending(false);
    }
  };

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
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageItem,
              {
                alignSelf: role === 'Volunteer' ? 'flex-start' : 'flex-end',
                backgroundColor: role === 'Volunteer' ? '#f1f1f1' : '#00BFAE',
              },
            ]}
          >
            <Text
              style={[
                styles.messageAuthor,
                { textAlign: role === 'Volunteer' ? 'left' : 'right' },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.messageText,
                { textAlign: role === 'Volunteer' ? 'left' : 'right' },
              ]}
            >
              {item.message}
            </Text>
            <Text
              style={[
                styles.messageDate,
                { textAlign: role === 'Volunteer' ? 'left' : 'right' },
              ]}
            >
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        // No need for inverted, newest message is at the bottom naturally
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
