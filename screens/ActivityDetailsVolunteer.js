import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { AirbnbRating } from 'react-native-ratings'; // Import the rating component

const ActivityDetailsVolunteer = ({ route }) => {
  const { activity } = route.params;
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(activity.reviews || []); // Initialize with existing reviews
  const [rating, setRating] = useState(0); // State to handle the star rating

  const handleAddReview = () => {
    if (reviewText.trim()) {
      const newReview = {
        id: Math.random().toString(), // Generate a unique ID for the review
        text: reviewText,
        date: new Date().toLocaleDateString(), // Current date
        rating, // Include the rating
      };
      setReviews((prevReviews) => [...prevReviews, newReview]);
      setReviewText(''); // Clear review input
      setRating(0); // Reset rating after adding review
    }
  };

  const handleJoinActivity = () => {
    // Handle joining the activity here
    console.log('Activity joined:', activity.name);
  };

  const handleDeleteReview = (id) => {
    setReviews((prevReviews) => prevReviews.filter(review => review.id !== id));
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
      <TouchableOpacity onPress={() => handleDeleteReview(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReply = ({ item }) => (
    <View style={styles.replyItem}>
      <Text style={styles.replyText}>{item.text}</Text>
      <Text style={styles.replyDate}>{item.date}</Text>
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
          <Button title="Join Activity" onPress={handleJoinActivity} color="#00BFAE" />
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
            keyExtractor={(review) => review.id}
            contentContainerStyle={styles.reviewsList}
          />
        </View>
      );
    } else if (item.type === 'repliesSection') {
      return (
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>Replies</Text>
          <FlatList
            data={activity.replies || []} // Assuming `activity.replies` contains the third-party replies
            renderItem={renderReply}
            keyExtractor={(reply) => reply.id}
            contentContainerStyle={styles.repliesList}
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
    { id: '5', type: 'repliesSection' },
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
    marginBottom: 15,
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
  },
  reviewDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  ratingStars: {
    marginBottom: 10,
  },
  repliesSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  repliesList: {
    marginBottom: 15,
  },
  replyItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  replyText: {
    fontSize: 16,
    color: '#333',
  },
  replyDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ActivityDetailsVolunteer;
