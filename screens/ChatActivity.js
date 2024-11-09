import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

const ChatActivity = ({ route, navigation }) => {
  const { activityId, userId } = route.params; // Receive activityId and userId from route params
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch existing messages for this activity (chat messages)
    setLoading(true);
    fetch(`http://10.0.2.2:5000/api/getMessages/${activityId}`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      });
  }, [activityId]); // This useEffect depends on activityId

  const handleSendMessage = async () => {
    if (!newMessage) {
      return; // Don't send empty messages
    }
  
    setLoading(true);
    const messageData = {
      userId,
      activityId,
      message: newMessage,
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
          { ...messageData, createdAt: new Date() },
        ]);
        setNewMessage(''); // Clear the message input after sending
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <FlatList
      data={messages}
      renderItem={({ item }) => (
        <View style={styles.messageItem}>
          <Text style={styles.messageAuthor}>{item.name}</Text> {/* Display the name */}
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.messageDate}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      inverted // Invert list to show new messages at the bottom
    />

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <Button title="Send" onPress={handleSendMessage} color="#00BFAE" />
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
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  messageAuthor: {
    fontWeight: 'bold',
    color: '#333',
  },
  messageText: {
    color: '#444',
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
});

export default ChatActivity;