import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDetailsVolunteer = () => {
  const route = useRoute();
  const { activity, userId, name, email } = route.params || {};

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

  useEffect(() => {
    const checkJoinStatus = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/check_join_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, activity_id: activity._id }),
        });

        const result = await response.json();
        if (response.ok) {
          setHasJoined(result.hasJoined);
        } else {
          Alert.alert('Error', result.message || 'Error checking join status.');
        }
      } catch {
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
      } catch {
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
    if (hasJoined) {
      Alert.alert('Notice', 'You have already joined this activity.');
      return;
    }

    if (!name || name.trim() === '') {
      Alert.alert('Error', 'Your username is missing. Please log in again.');
      return;
    }
    if (!email || email.trim() === '') {
      Alert.alert('Error', 'Your email is missing. Please log in again.');
      return;
    }

    const joinData = {
      user_id: userId,
      username: name,
      email,
      activity_id: activity._id,
      activity_name: activity.name,
      location: activity.location,
      date: activity.date,
      image: activity.imageUri,
    };

    try {
      const response = await fetch('http://10.0.2.2:5000/api/join_activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinData),
      });

      const result = await response.json();
      if (response.ok) {
        setHasJoined(true);
      } else {
        Alert.alert('Error', result.message || 'Error joining activity.');
      }
    } catch {
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
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  location: {
    fontSize: 18,
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
  },
  details: {
    marginBottom: 20,
  },
  ratingsSection: {
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#ff0000',
  },
  joinedText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ActivityDetailsVolunteer;
