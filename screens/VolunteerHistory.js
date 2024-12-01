import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const VolunteerHistory = ({ route }) => {
  const { userId } = route.params;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('UserId passed:', userId);

    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/past_activities?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.activityText}>{item.activity_name}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      <Text style={[styles.statusText, { color: item.status === 'Completed' ? '#4CAF50' : '#FF5722' }]}>
        {item.status}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#547DBE" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.historyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContainer: {
    marginVertical: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  locationText: {
    fontSize: 14,
    color: '#888',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VolunteerHistory;
