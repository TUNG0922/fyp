import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing icons

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

  const renderHistoryItem = ({ item }) => {
    return (
      <View style={styles.historyItem}>
        <Text style={styles.activityText}>{item.activity_name}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={20} color="#666" style={styles.icon} />
            <Text style={styles.dateText}>Date: {item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#666" style={styles.icon} />
            <Text style={styles.locationText}>Location: {item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="local-offer" size={20} color="#666" style={styles.icon} />
            <Text style={styles.genreText}>Genre: {item.genre || 'No Genre Available'}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.statusText,
            { color: item.status === 'Completed' ? '#4CAF50' : '#FF5722' },
          ]}
        >
          {item.status}
        </Text>
      </View>
    );
  };

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
        keyExtractor={(item) => item._id.$oid}
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
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 10,
  },
  activityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsContainer: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Adjust space between details
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  genreText: {
    fontSize: 14,
    color: '#666',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    width: 150,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VolunteerHistory;