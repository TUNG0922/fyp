import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDetailsVolunteer = () => {
  const route = useRoute();
  const { activity, userId, name, email, image } = route.params || {};

  console.log('User ID:', userId);
  console.log('Activity ID:', activity._id);
  console.log('Activity Name:', activity.name);
  console.log('Email:', email);
  console.log('Image:', image);
  console.log('Activity User ID:', activity.userId);


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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check join status
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

        // Fetch reviews
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
    // Check for all required fields
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

    // Log the joinActivityData to check the userId
    console.log('Joining activity with data:', joinActivityData);

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

            // Add a notification for the volunteer
            const notificationResponse = await fetch('http://10.0.2.2:5000/api/add_notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    message: 'Your application is pending, please wait.',
                }),
            });

            if (!notificationResponse.ok) {
                console.error('Failed to add notification');
            }
        } else {
            const result = await response.json();
            Alert.alert('Error', result.message || 'Failed to join the activity.');
        }
    } catch (error) {
        console.error('Error joining activity:', error);
        Alert.alert('Error', 'An error occurred while joining the activity.');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: id }),
      });

      const result = await response.json();
      if (response.ok) {
        setReviews((prevReviews) => prevReviews.filter(review => review._id !== id));
        Alert.alert('Success', 'Review deleted successfully!');
      } else {
        Alert.alert('Error', result.message || 'Error deleting review.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again later.');
    }
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
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const data = [
    { id: '1', type: 'image', uri: image || 'default_image_url_here' }, // Default image URL if not received
    { id: '2', type: 'details' },
    { id: '3', type: 'ratings' },
    { id: '4', type: 'reviewsSection' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFAE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'image':
              return (
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.image} 
                  onError={(error) => {
                    console.error('Image load error:', error.nativeEvent.error);
                    Alert.alert('Error', 'Failed to load image.');
                  }}
                />
              );
            case 'details':
              return (
                <View style={styles.details}>
                  <Text style={styles.title}>{activity.name}</Text>
                  <Text style={styles.location}>{activity.location}</Text>
                  <Text style={styles.date}>{activity.date}</Text>
                  <Text style={styles.description}>{activity.description}</Text>
                  {!hasJoined ? (
                    <Button title="Join Activity" onPress={handleJoinActivity} color="#00BFAE" />
                  ) : (
                    <Text style={styles.joinedText}>You have joined this activity!</Text>
                  )}
                </View>
              );
            case 'ratings':
              return (
                <View style={styles.ratingsSection}>
                  <Text style={styles.ratingsTitle}>Add a Review:</Text>
                  <AirbnbRating
                    count={5}
                    reviews={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
                    size={20}
                    onFinishRating={setRating}
                  />
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Write your review..."
                    value={reviewText}
                    onChangeText={setReviewText}
                  />
                  <Button title="Submit Review" onPress={handleAddReview} color="#00BFAE" />
                </View>
              );
            case 'reviewsSection':
              return (
                <View style={styles.reviewsSection}>
                  <Text style={styles.reviewsTitle}>Reviews:</Text>
                  {reviews.length ? (
                    <FlatList
                      data={reviews}
                      renderItem={renderReview}
                      keyExtractor={item => item._id}
                    />
                  ) : (
                    <Text>No reviews yet.</Text>
                  )}
                </View>
              );
            default:
              return null;
          }
        }}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  details: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 18,
    color: '#555',
  },
  date: {
    fontSize: 18,
    color: '#555',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  joinedText: {
    fontSize: 16,
    color: 'green',
  },
  ratingsSection: {
    marginVertical: 20,
  },
  ratingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  reviewsSection: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 14,
    color: '#999',
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ActivityDetailsVolunteer;