import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

// Helper function to calculate percentage visualization
const calculatePercentage = (averageRating) => {
  return averageRating ? (averageRating / 5) * 100 : 0; 
};

const ViewReport = ({ route }) => {
  const { activity, userId, username } = route.params;

  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ensure activity._id exists before making the request
  useEffect(() => {
    const fetchActivityAnalysis = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/reviews/average', {
          params: { activity_id: activity._id },
        });
  
        console.log("API Response Data:", response.data); // Log for debugging
  
        // Directly compare response.data with the given activity ID
        if (response.data && response.data.activityId === activity._id) {
          setAverageRating(response.data.averageRating);
          setReviewCount(response.data.reviewCount);
        } else {
          setError('No reviews for this activity');
        }
      } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        setError('Unable to fetch data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchActivityAnalysis();
  }, [activity._id]);  

  const percentageRating = calculatePercentage(averageRating);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Report Card Header Section */}
      <View style={styles.card}>
        <Text style={styles.title}>Activity Report</Text>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Activity Name:</Text>
          <Text style={styles.value}>{activity?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{activity?.location || 'Unknown'}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{activity?.date || 'Unknown'}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Submitted by:</Text>
          <Text style={styles.value}>{username || 'Unknown'}</Text>
        </View>
      </View>

      {/* Dynamic Ratings Visualization Section */}
      <View style={styles.ratingsContainer}>
        <Text style={styles.ratingsTitle}>Average Rating: {averageRating.toFixed(1)} / 5</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${percentageRating}%` },
            ]}
          />
        </View>
        <Text style={styles.reviewCount}>Total Reviews: {reviewCount}</Text>
      </View>

      {/* Additional Info Section */}
      <View style={styles.additionalSection}>
        <Text style={styles.additionalText}>Report Generated Successfully!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  card: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 20,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  ratingsContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressBar: {
    height: 20,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#547DBE',
  },
  reviewCount: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
  },
  additionalSection: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 5,
  },
  additionalText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ViewReport;
