import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const Chatbox = ({ route }) => {
  const { activity, userId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activity && userId) {
      fetchMessages(activity._id, userId);

      const interval = setInterval(() => {
        fetchMessages(activity._id, userId);
      }, 1000); // Refresh messages every 1 second

      return () => clearInterval(interval);
    }
  }, [activity, userId]);

  const fetchMessages = async (activityId, userId) => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/getMessages/${activityId}/${userId}`);
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Error fetching messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Message required', 'Please enter a message before sending.');
      return;
    }

    setSending(true);
    const messageData = {
      userId,
      activityId: activity._id,
      message: newMessage,
      name: activity.name,
      role: 'Organization Admin',
      createdAt: new Date().toISOString(),
      activity_user_id: activity.userId  
    };

    try {
      const response = await fetch('http://10.0.2.2:5000/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages(activity._id, userId);
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

  const renderMessage = ({ item }) => (
    <View style={[styles.messageItem, item.role === 'Organization Admin' ? styles.rightAlign : styles.leftAlign]}>
      <Text style={styles.messageAuthor}>{item.name}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageDate}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {sending && <ActivityIndicator size="large" color="#00BFAE" />}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
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
    backgroundColor: '#fff' 
  },

  messageItem: { 
    padding: 12, 
    marginBottom: 12, 
    borderRadius: 8, 
    backgroundColor: '#f1f1f1' 
  },

  messageAuthor: { 
    fontWeight: 'bold', 
    color: '#333' 
  },

  messageText: { 
    color: '#444', 
    fontSize: 16 
  },

  messageDate: { 
    fontSize: 12, 
    color: '#888', 
    marginTop: 5 
  },

  input: { 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 5, 
    marginVertical: 10, 
    paddingLeft: 10, 
    fontSize: 16 
  },

  errorText: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 10 
  },

  leftAlign: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },

  rightAlign: {
    alignSelf: 'flex-end',
    backgroundColor: '#00BFAE',
    color: '#fff',
  },
});

export default Chatbox;