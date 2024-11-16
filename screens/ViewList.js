import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const ViewList = ({ route }) => {
  const { activity, userId, username } = route.params; // Destructure all passed parameters
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities on mount and log the passed parameters for debugging
  useEffect(() => {
    console.log('ViewList Activity:', activity);
    console.log('User ID:', userId);
    console.log('Username:', username);
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Append userId and username to the API request for personalized data
      const response = await fetch(
        `http://10.0.2.2:5000/api/get_activities?userId=${userId}&username=${username}`
      );
      const data = await response.json();

      if (response.ok) {
        setActivities(data.activities || []); // Assuming 'activities' is the response data
      } else {
        setError(data.error || 'Failed to load activities');
      }
    } catch (error) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityName}>{item.name}</Text>
      <Text style={styles.activityLocation}>{item.location}</Text>
      <Text style={styles.activityDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && activities.length > 0 && (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item._id}
        />
      )}
      {!loading && !error && activities.length === 0 && (
        <Text style={styles.noActivitiesText}>No activities found.</Text>
      )}
      {/* Display passed activity and user details */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsHeader}>Passed Data:</Text>
        <Text style={styles.detailsText}>Activity: {activity?.name}</Text>
        <Text style={styles.detailsText}>Location: {activity?.location}</Text>
        <Text style={styles.detailsText}>Date: {activity?.date}</Text>
        <Text style={styles.detailsText}>User ID: {userId}</Text>
        <Text style={styles.detailsText}>Username: {username}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  activityItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityLocation: {
    fontSize: 16,
    color: '#555',
  },
  activityDate: {
    fontSize: 14,
    color: '#777',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  detailsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eaeaea',
    borderRadius: 8,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});

export default ViewList;
