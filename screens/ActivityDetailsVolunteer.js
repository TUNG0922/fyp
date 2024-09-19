import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation } from '@react-navigation/native';

const ActivityDetailsVolunteer = ({ route }) => {
  const { activity } = route.params;
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkJoinStatus = async () => {
      try {
        const userId = '66e0681ef929b768de1a3392'; // Replace with actual user ID
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
          Alert.alert('Error', result.message || 'An error occurred while checking join status.');
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
          Alert.alert('Error', result.message || 'An error occurred while fetching reviews.');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Please try again later.');
      }
    };

    fetchReviews();
    checkJoinStatus();
  }, [activity._id]);

  const handleAddReview = async () => {
    if (reviewText.trim()) {
      const newReview = {
        text: reviewText,
        date: new Date().toLocaleDateString(),
        rating,
        activity_id: activity._id,
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
          Alert.alert('Error', result.message || 'An error occurred while adding the review.');
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

    try {
      const userId = '66e0681ef929b768de1a3392'; // Replace with actual user ID
      const activityId = activity._id;

      const response = await fetch('http://10.0.2.2:5000/api/join_activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          activity_id: activityId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setHasJoined(true);
        navigation.navigate('NotificationVolunteer', { activity: activity });
      } else {
        Alert.alert('Error', result.message || 'An error occurred while joining the activity.');
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

    const isValidId = /^[0-9a-fA-F]{24}$/.test(id);

    if (!isValidId) {
      Alert.alert('Error', 'Invalid review ID format.');
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
        Alert.alert('Error', result.message || 'An error occurred while deleting the review.');
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
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.description}>{item.description}</Text>
          {!hasJoined && (
            <Button title="Join Activity" onPress={handleJoinActivity} color="#00BFAE" />
          )}
          {hasJoined && (
            <Text style={styles.joinedText}>You have joined this activity!</Text>
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
    { id: '2', type: 'details', name: activity.name, location: activity.location, date: activity.date, description: activity.description },
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
    elevation: 2,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  ratingsSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  ratingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingStars: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  reviewsSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  joinedText: {
    fontSize: 16,
    color: '#00BFAE',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default ActivityDetailsVolunteer;
