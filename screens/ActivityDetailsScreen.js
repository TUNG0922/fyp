import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, FlatList } from 'react-native';
import { Rating } from 'react-native-ratings';

const ActivityDetailsScreen = ({ route, navigation }) => {
  const { activity } = route.params;
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/get_reviews?activityId=${activity._id}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
      } else {
        Alert.alert('Error', data.error || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      Alert.alert('Error', 'Failed to load reviews');
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <Rating
        type='star'
        startingValue={item.rating}
        readonly
        imageSize={20}
        style={styles.rating}
      />
      <Text style={styles.reviewText}>{item.comment}</Text>
      <Text style={styles.reviewAuthor}>- {item.volunteerName}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {activity.imageUri ? (
        <Image source={{ uri: activity.imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{activity.name}</Text>
        <Text style={styles.location}>{activity.location}</Text>
        <Text style={styles.date}>{activity.date}</Text>
        <Text style={styles.description}>{activity.description}</Text>
      </View>
      
      <View style={styles.reviewContainer}>
        <Text style={styles.reviewTitle}>Volunteer Reviews</Text>
        {reviews.length > 0 ? (
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item._id}
            style={styles.reviewList}
          />
        ) : (
          <Text>No reviews available for this activity.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginBottom: 15,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
  reviewContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewList: {
    marginBottom: 15,
  },
  reviewItem: {
    marginBottom: 15,
  },
  rating: {
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default ActivityDetailsScreen;
