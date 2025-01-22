import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';

const ActivityDetailsVolunteer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);
  
  // State to handle chat button visibility
  const [chatButtonBottom, setChatButtonBottom] = useState(16);
  const { activity, userId, name, email, image, role = 'Volunteer', strength, previous_experiences, interest } = route.params || {};
  console.log('User ID:', userId);  // Add this line
  console.log("Interest", interest);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState({});  // State to store replies by review ID
  const [rating, setRating] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleScroll = (event) => {
      const contentHeight = event.nativeEvent.contentSize.height;
      const layoutHeight = event.nativeEvent.layoutMeasurement.height;
      const offsetY = event.nativeEvent.contentOffset.y;

      const distanceFromBottom = contentHeight - (layoutHeight + offsetY);
      
      // Adjust chat button's position to follow the bottom of the screen
      if (distanceFromBottom < 100) { // 100 is a buffer
        setChatButtonBottom(16 + distanceFromBottom); // Stick near the bottom
      } else {
        setChatButtonBottom(16); // Reset to default
      }
    };

    flatListRef.current?.addEventListener('scroll', handleScroll);

    return () => {
      flatListRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

        // Fetch replies for each review
        const repliesData = {};
        for (const review of fetchReviewsResult.reviews) {
          const repliesResponse = await fetch(`http://10.0.2.2:5000/api/get_replies?reviewId=${review._id}`);
          const repliesResult = await repliesResponse.json();
          if (repliesResponse.ok) {
            repliesData[review._id] = repliesResult.replies;
          }
        }
        setReplies(repliesData);

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

  const handleDeleteReview = async (reviewId) => {
    try {
      // Optimistically update the UI
      setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));
  
      const response = await fetch(`http://10.0.2.2:5000/api/delete_review/${reviewId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Review deleted successfully');
      } else {
        alert(data.message || 'Failed to delete the review');
        // If deletion fails, re-add the review to the state
        fetchReviews(); // Refresh the list to reflect the correct state
      }
    } catch (error) {
      alert('An error occurred while deleting the review');
      console.error(error);
      fetchReviews(); // Refresh the list to recover the state
    }
  };  

  const handleJoinActivity = async () => {
    // Check for all required fields
    if (!userId || !activity._id || !activity.name || !email || !image || !activity.userId || !strength || !interest || !activity.genre) {
      Alert.alert('Error', 'All required fields must be filled out.');
      return;
    }
  
    // Include strength and interest in joinActivityData
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
      genre: activity.genre, // Add genre
      strength: strength, // Add strength
      interest: interest, // Add interest
      previous_experiences: previous_experiences, // Add previous_experiences
    };
  
    // Log the payload before sending the request
    console.log('Join Activity Payload:', joinActivityData);
  
    try {
      const response = await fetch('http://10.0.2.2:5000/api/join_activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(joinActivityData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setHasJoined(true); // Update join status immediately after success
        Alert.alert('Success', 'You have joined the activity. Please wait for confirmation.');
      } else {
        Alert.alert('Error', result.message || 'Failed to join the activity.');
      }
    } catch (error) {
      console.error('Join Activity Error:', error);
      Alert.alert('Error', 'An error occurred while joining the activity.');
    }
  };  

  const goToChat = () => {
    navigation.navigate('ChatActivity', {
      activity: activity, // Pass the entire activity object
      activityId: activity._id,
      userId: userId,
      name: name,
      role: role,
      defaultMessage: 'What can I help you?' // Default message
    });
  };

  const renderReview = ({ item }) => {
    const reviewReplies = replies[item._id] || [];

    return (
      <View style={styles.reviewContainer}>
        {/* Review Content */}
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewAuthor}>{item.name}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <Text style={styles.reviewText}>{item.text}</Text>
        <AirbnbRating
          size={16}
          isDisabled
          showRating={false}
          defaultRating={item.rating}
          starContainerStyle={styles.ratingStars}
        />
  
        {/* Delete Button */}
        <TouchableOpacity 
          onPress={() => handleDeleteReview(item._id ? item._id : null)} 
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete Review</Text>
        </TouchableOpacity>
  
        {/* Replies Section */}
        {reviewReplies.length > 0 && (
          <View style={styles.repliesContainer}>
            <Text style={styles.repliesHeader}>Replies:</Text>
            {reviewReplies.map((reply) => (
              <View key={reply.replyId} style={styles.replyItem}>
                <Text style={styles.replyAuthor}>{reply.author}</Text>
                <Text style={styles.replyText}>{reply.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFAE" />
        </View>
      ) : (
        <>
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={
              <View style={styles.container}>
                <Image source={{ uri: image || 'default_image_url_here' }} style={styles.image} />
  
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityLocation}>📍 {activity.location}</Text>
                <Text style={styles.activityDate}>📅 {activity.date}</Text>
  
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
                  placeholderTextColor="#aaa"
                  multiline
                />
                <TouchableOpacity onPress={handleAddReview} style={styles.addReviewButton}>
                  <Text style={styles.addReviewButtonText}>Add Review</Text>
                </TouchableOpacity>
              </View>
            }
            contentContainerStyle={styles.listContainer}
          />
  
          {/* Chat Button Positioned at Bottom-Right */}
          <TouchableOpacity onPress={goToChat} style={styles.chatButton}>
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Background color for the entire screen
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    paddingBottom: 100, // Space to avoid overlapping with the chat button
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
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
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingSection: {
    backgroundColor: '#f9f9f9', // Light background for separation
    borderRadius: 10,           // Rounded corners
    padding: 20,                // Padding for inner spacing
    marginVertical: 20,         // Space above and below the section
    shadowColor: '#000',        // Shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,               // Elevation for Android shadow
  },
  ratingLabel: {
    fontSize: 16,               // Clear, readable font size
    color: '#333',              // Text color for good contrast
    fontWeight: 'bold',         // Bold for emphasis
    marginBottom: 10,           // Space below the label
    textAlign: 'center',        // Center align text
  },
  reviewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
    color: '#333',
  },
  reviewItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888888',
  },
  reviewText: {
    fontSize: 14,
    color: '#555555',
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  repliesContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  repliesHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  replyItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    padding: 10,
    marginVertical: 4,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555555',
  },
  replyText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  ratingStars: {
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  chatButtonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 10,
  },
  chatButton: {
    position: 'absolute', // Fixes the button on the screen
    bottom: 20,           // 20 pixels from the bottom
    right: 20,            // 20 pixels from the right
    backgroundColor: '#007BFF', // Blue background
    padding: 15,
    borderRadius: 30,     // Circular button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,         // Adds shadow effect on Android
  },
  chatButtonText: {
    color: '#fff', // White text color
    fontWeight: 'bold',
    fontSize: 16,
  },
  addReviewButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActivityDetailsVolunteer;