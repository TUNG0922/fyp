import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDetailsVolunteer = () => {
  const route = useRoute();
  const { activity, userId, name } = route.params || {};

  console.log('Activity:', activity);
  console.log('User ID:', userId);
  console.log('Name:', name);

  if (!activity || !activity._id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Activity not found.</Text>
      </View>
    );
  }

  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const checkJoinStatus = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/check_join_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, activity_id: activity._id }),
        });

        const result = await response.json();
        if (response.ok) {
          setHasJoined(result.hasJoined);
        } else {
          Alert.alert('Error', result.message || 'Error checking join status.');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Please try again later.');
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/get_reviews?activityId=${activity._id}`);
        const result = await response.json();
        if (response.ok) {
          setReviews(result.reviews);
        } else {
          Alert.alert('Error', result.message || 'Error fetching reviews.');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Please try again later.');
      }
    };

    fetchReviews();
    checkJoinStatus();
  }, [activity._id, userId]);

  const handleAddReview = async () => {
    if (reviewText.trim()) {
      const newReview = {
        text: reviewText,
        date: new Date().toLocaleDateString(),
        rating,
        activity_id: activity._id,
        user_id: userId,
        name,
      };

      try {
        const response = await fetch('http://10.0.2.2:5000/api/add_review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReview),
        });

        const result = await response.json();

        if (response.ok) {
          setReviews((prevReviews) => [...prevReviews, newReview]);
          setReviewText('');
          setRating(0);
          Alert.alert('Success', 'Review added successfully!');
        } else {
          Alert.alert('Error', result.message || 'Error adding review.');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Please try again later.');
      }
    } else {
      Alert.alert('Error', 'Review text cannot be empty.');
    }
  };

  const handleJoinActivity = async () => {
    if (hasJoined) {
      Alert.alert('Notice', 'You have already joined this activity.');
      return;
    }

    if (!name || name.trim() === '') {
      Alert.alert('Error', 'Your name is missing. Please try logging in again.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/api/join_activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          activity_id: activity._id,
          name,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setHasJoined(true);
        setJoinMessage('You have successfully joined the activity!');
      } else {
        Alert.alert('Error', result.message || 'Error joining activity.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again later.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Review ID is missing.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/api/delete_review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_id: id }),
      });

      const result = await response.json();

      if (response.ok) {
        setReviews((prevReviews) => prevReviews.filter(review => review._id !== id));
        Alert.alert('Success', 'Review deleted successfully!');
      } else {
        Alert.alert('Error', result.message || 'Error deleting review.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again later.');
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.reviewDate}>{item.date}</Text>
      <AirbnbRating
        size={20}
        isDisabled
        showRating={false}
        defaultRating={item.rating}
        starContainerStyle={styles.ratingStars}
      />
      <TouchableOpacity onPress={() => handleDeleteReview(item._id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => {
    if (item.type === 'image') {
      return <Image source={{ uri: item.uri }} style={styles.image} />;
    } else if (item.type === 'details') {
      return (
        <View style={styles.details}>
          <Text style={styles.title}>{activity.name}</Text>
          <Text style={styles.location}>{activity.location}</Text>
          <Text style={styles.date}>{activity.date}</Text>
          <Text style={styles.description}>{activity.description}</Text>
          {!hasJoined && (
            <Button title="Join Activity" onPress={handleJoinActivity} color="#00BFAE" />
          )}
          {hasJoined && (
            <Text style={styles.joinedText}>You have joined this activity!</Text>
          )}
          {joinMessage && (
            <Text style={styles.joinedText}>{joinMessage}</Text>
          )}
        </View>
      );
    } else if (item.type === 'ratings') {
      return (
        <View style={styles.ratingsSection}>
          <Text style={styles.ratingsTitle}>Rate the Activity</Text>
          <AirbnbRating
            size={20}
            showRating
            onFinishRating={setRating}
            ratingCount={5}
            defaultRating={rating}
            starContainerStyle={styles.ratingStars}
          />
          <TextInput
            style={styles.input}
            placeholder="Write a review..."
            value={reviewText}
            onChangeText={setReviewText}
          />
          <Button title="Add Review" onPress={handleAddReview} color="#547DBE" />
        </View>
      );
    } else if (item.type === 'reviewsSection') {
      return (
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(review) => review._id}
            contentContainerStyle={styles.reviewsList}
          />
        </View>
      );
    }
    return null;
  };

  const data = [
    { id: '1', type: 'image', uri: activity.imageUri },
    { id: '2', type: 'details' },
    { id: '3', type: 'ratings' },
    { id: '4', type: 'reviewsSection' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

// Styles for ActivityDetailsVolunteer
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  details: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
  },
  ratingsSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
  },
  ratingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  reviewsSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewsList: {
    paddingBottom: 10,
  },
  reviewItem: {
    marginBottom: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
  joinedText: {
    color: '#27ae60',
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorText: {
    fontSize: 20,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default ActivityDetailsVolunteer;
