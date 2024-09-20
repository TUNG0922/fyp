import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDetailsVolunteer = () => {
  const route = useRoute();
  const { activity, userId, name } = route.params || {};

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
        console.log(`Fetching reviews for activity ID: ${activity._id}`);
        const response = await fetch(`http://10.0.2.2:5000/api/get_reviews?activityId=${activity._id}`);
        const result = await response.json();
        console.log('Fetch result:', result);
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
    { id: '1', type: 'image', uri: activity.imageUri },
    { id: '2', type: 'details' },
    { id: '3', type: 'ratings' },
    { id: '4', type: 'reviewsSection' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'image':
              return <Image source={{ uri: item.uri }} style={styles.image} />;
            case 'details':
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
            case 'ratings':
              return (
                <View style={styles.ratingsSection}>
                  <Text style={styles.ratingsTitle}>Add a Review:</Text>
                  <AirbnbRating
                    count={5}
                    reviews={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
                    size={20}
                    onFinishRating={(rating) => setRating(rating)}
                  />
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Write your review"
                    value={reviewText}
                    onChangeText={setReviewText}
                  />
                  <Button title="Submit Review" onPress={handleAddReview} />
                </View>
              );
            case 'reviewsSection':
              return (
                <View>
                  <Text style={styles.reviewsTitle}>Reviews:</Text>
                  <FlatList
                    data={reviews}
                    renderItem={renderReview}
                    keyExtractor={(item) => item._id}
                  />
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
    borderColor: '#ddd',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: '#555',
  },
  date: {
    fontSize: 14,
    color: '#777',
  },
  description: {
    fontSize: 14,
    marginTop: 10,
  },
  ratingsSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  reviewInput: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: '#777',
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  joinedText: {
    color: 'green',
    marginTop: 10,
  },
});

export default ActivityDetailsVolunteer;