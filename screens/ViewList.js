import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const ViewList = ({ route }) => {
  const { activity, userId, username } = route.params; // Destructure passed parameters
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Activity ID:', activity._id);
    console.log('User ID:', userId);
    console.log('Username:', username);
    fetchUsers();
  }, [activity._id]); // Dependency array to re-fetch on parameter change

  const fetchUsers = async () => {
    setLoading(true); // Ensure loading state is active during fetch
    setError(null); // Reset error before a new fetch
    try {
      const response = await fetch(
        `http://10.0.2.2:5000/api/getList?activityId=${activity._id}`
      );
      const data = await response.json();

      console.log('User List Response:', data); // Debug response

      if (response.ok) {
        setUsers(data.list || []); // Fallback to empty array if no users found
      } else {
        setError(data.error || 'Failed to load user list');
      }
    } catch (fetchError) {
      setError('An error occurred while fetching the user list.');
      console.error('Fetch Error:', fetchError); // Debug fetch error
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>Username: {item.username}</Text>
      <Text style={styles.userEmail}>Email: {item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#007BFF" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && users.length > 0 && (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item, index) => index.toString()} // Unique key for each user
        />
      )}
      {!loading && !error && users.length === 0 && (
        <Text style={styles.noUsersText}>No users found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  userItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, // For Android
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#D9534F',
    textAlign: 'center',
    marginTop: 20,
  },
  noUsersText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewList;
