import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Chatbox = ({ route }) => {
  const { activity, userId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
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

    const messageData = {
      userId,
      activityId: activity._id,
      message: newMessage,
      name: activity.name,
      role: 'Organization Admin',
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
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageItem,
        item.role === 'Organization Admin' ? styles.rightAlign : styles.leftAlign,
      ]}
    >
      <Text style={styles.messageAuthor}>{item.name}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageDate}>
        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageItem: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
  },
  leftAlign: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  rightAlign: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084FF',
  },
  messageAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  messageDate: {
    fontSize: 12,
    color: '#B0B0B0',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#0084FF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default Chatbox;