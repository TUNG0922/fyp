import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDetailsVolunteer = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { activity, userId, name, email, image, role = 'Volunteer' } = route.params || {};

  console.log('Name passed in:', name);

  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const checkJoinStatusResponse = await fetch('http://10.0.2.2:5000/api/check_join_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, activity_id: activity._id }),
        });
        const joinStatusResult = await checkJoinStatusResponse.json();
        if (checkJoinStatusResponse.ok) {
          setHasJoined(joinStatusResult.hasJoined);
        } else {
          Alert.alert('Error', joinStatusResult.message || 'Error checking join status.');
        }

        const fetchReviewsResponse = await fetch(`http://10.0.2.2:5000/api/get_reviews?activityId=${activity._id}`);
        const fetchReviewsResult = await fetchReviewsResponse.json();
        if (fetchReviewsResponse.ok) {
          setReviews(fetchReviewsResult.reviews);
        } else {
          Alert.alert('Error', fetchReviewsResult.message || 'Error fetching reviews.');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          headers: { 'Content-Type': 'application/json' },
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
      } catch {
        Alert.alert('Error', 'Network error. Please try again later.');
      }
    } else {
      Alert.alert('Error', 'Review text cannot be empty.');
    }
  };

  const handleJoinActivity = async () => {
    if (!userId || !activity._id || !activity.name || !email || !image || !activity.userId) {
      Alert.alert('Error', 'All required fields must be filled out.');
      return;
    }

    const joinActivityData = {
      user_id: userId,
      username: name,
      email: email,
      activity_id: activity._id,
      activity_name: activity.name,
      location: activity.location,
      date: activity.date,
      image: image,
      activity_user_id: activity.userId,
    };

    try {
      const response = await fetch('http://10.0.2.2:5000/api/join_activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(joinActivityData),
      });

      if (response.ok) {
        Alert.alert('Success', 'You have joined the activity. Please wait for confirmation.');
      } else {
        const result = await response.json();
        Alert.alert('Error', result.message || 'Failed to join the activity.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while joining the activity.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/delete_review/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));
        Alert.alert('Success', 'Review deleted successfully.');
      } else {
        const result = await response.json();
        Alert.alert('Error', result.message || 'Failed to delete review.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the review.');
    }
  };  

  const goToChat = () => {
    // Now the 'name' variable is passed to the ChatActivity screen
    navigation.navigate('ChatActivity', {
      activityId: activity._id,
      userId: userId,
      name: name,  // Pass 'name' correctly here
      role: role,  // Pass 'role' here as well
    });
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.reviewDate}>{item.date}</Text>
      <Text style={styles.reviewAuthor}>{item.name}</Text>
      <AirbnbRating
        size={20}
        isDisabled
        showRating={false}
        defaultRating={item.rating}
        starContainerStyle={styles.ratingStars}
      />
  
      <TouchableOpacity onPress={() => handleDeleteReview(item._id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete Review</Text>
      </TouchableOpacity>
    </View>
  );  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFAE" />
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <View style={styles.container}>
          <Image source={{ uri: image || 'default_image_url_here' }} style={styles.image} />
          <Text style={styles.activityName}>{activity.name}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityLocation}>{activity.location}</Text>
          <Text style={styles.activityDate}>{activity.date}</Text>

          <TouchableOpacity onPress={goToChat} style={styles.chatButton}>
            <Text style={styles.chatButtonText}>Go to Chat</Text>
          </TouchableOpacity>

          {!hasJoined && (
            <TouchableOpacity onPress={handleJoinActivity} style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join Activity</Text>
            </TouchableOpacity>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Rate this Activity</Text>
            <AirbnbRating size={20} onFinishRating={setRating} showRating defaultRating={rating} />
          </View>

          <TextInput
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Write a review..."
          />
          <Button title="Add Review" onPress={handleAddReview} />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  activityDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  activityLocation: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  activityDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  joinButton: {
    backgroundColor: '#00BFAE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  reviewItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ActivityDetailsVolunteer;
