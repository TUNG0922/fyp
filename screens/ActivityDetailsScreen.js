// git status
// git add <file>
// git commit -m "message"
// git push

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Rating } from 'react-native-ratings';

const ActivityDetailsScreen = ({ route, navigation }) => {
  const { activity, userId, username } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedActivity, setEditedActivity] = useState({ ...activity });

  console.log("ActivityDetailsScreen params:", route.params);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/get_reviews?activityId=${activity._id}`);
      const data = await response.json();
  
      if (response.ok) {
        const reviewsWithReplies = await Promise.all(data.reviews.map(async (review) => {
          const repliesResponse = await fetch(`http://10.0.2.2:5000/api/get_replies?reviewId=${review._id}`);
          const repliesData = await repliesResponse.json();
          return { ...review, replies: repliesData.replies };
        }));
        setReviews(reviewsWithReplies);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (error) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };  

  const handleReplyPress = (reviewId) => {
    setCurrentReviewId(reviewId);
    setReplyModalVisible(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Reply cannot be empty');
      return;
    }
    try {
      const response = await fetch('http://10.0.2.2:5000/api/reply_to_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: currentReviewId, replyText: replyText.trim() }),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Reply submitted successfully');
        setReplyModalVisible(false);
        setReplyText('');
        fetchReviews(); // Refresh reviews after adding a reply
      } else {
        Alert.alert('Error', data.error || 'Failed to submit reply');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit reply');
    }
  };  

  const handleEditPress = () => {
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    const activityData = {
      _id: activity._id,
      name: editedActivity.name,
      location: editedActivity.location,
      date: editedActivity.date,
      description: editedActivity.description,
    };
  
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/edit_activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Update the state with the new activity details to reflect immediately in the UI
        setEditedActivity({ ...editedActivity });
        setEditModalVisible(false);
        setLoading(true);
        fetchReviews(); // Re-fetch the reviews if needed
        Alert.alert('Success', 'Activity updated successfully');
      } else {
        Alert.alert('Error', data.error || 'Failed to update activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update activity');
    }
  };

  const handleViewListPress = () => {
    navigation.navigate('ViewList', {
      activity: activity, // Pass the entire activity object
      userId: userId, // Pass userId
      username: username, // Pass username
    });
  };  

  const handleViewChatPress = () => {
    // Navigate to the chat screen and pass the necessary parameters
    navigation.navigate('ViewChat', {
      activity: activity, // Pass the entire activity object
      userId: userId, // Pass userId
      username: username, // Pass username
    });
  };

  const handleViewReportPress = () => {
    navigation.navigate('ViewReport', {
      activity: activity, // Pass the entire activity object
      userId: userId, // Pass userId
      username: username, // Pass username
    });
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.ratingContainer}>
        <Rating 
          type="star" 
          startingValue={item.rating} 
          readonly 
          imageSize={20} 
          style={styles.rating} 
        />
      </View>
      <View style={styles.commentContainer}>
        <Text style={styles.reviewText}>{item.text}</Text>
        <Text style={styles.reviewAuthor}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setCurrentReviewId(item._id);
          setReplyModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Reply</Text>
      </TouchableOpacity>
  
      {/* Display replies under each review */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply, index) => (
            <View key={index} style={styles.replyItem}>
              <Text style={styles.replyAuthor}>{reply.author}:</Text>
              <Text style={styles.replyText}>{reply.text}</Text>
              <Text style={styles.replyTimestamp}>
                {new Date(reply.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    if (item.type === 'activity') {
      return (
        <View style={styles.detailsContainer}>
          {activity.imageUri ? (
            <Image source={{ uri: activity.imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          <Text style={styles.name}>{activity.name}</Text>
          <Text style={styles.location}>{activity.location}</Text>
          <Text style={styles.date}>{activity.date}</Text>
          <Text style={styles.description}>{activity.description}</Text>
          <TouchableOpacity style={styles.button} onPress={handleEditPress}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleViewListPress}>
            <Text style={styles.buttonText}>View List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleViewChatPress}>
            <Text style={styles.buttonText}>View Chat</Text>
          </TouchableOpacity>
          {/* View Report Button */}
          <TouchableOpacity style={styles.button} onPress={handleViewReportPress}>
            <Text style={styles.buttonText}>View Report</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'reviews') {
      return (
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Volunteer Reviews</Text>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.emptyText}>No reviews available for this activity.</Text>}
          />
        </View>
      );
    }
  };

  const data = [
    { id: '1', type: 'activity' },
    { id: '2', type: 'reviews' }
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Modal visible={replyModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to Review</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline={true}
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleReplySubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setReplyModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Activity Name"
              value={editedActivity.name}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location"
              value={editedActivity.location}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, location: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Date"
              value={editedActivity.date}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, date: text })}
            />
            <TextInput
              style={[styles.modalInput, styles.descriptionInput]}
              placeholder="Description"
              value={editedActivity.description}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, description: text })}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleEditSubmit}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ccc',
    borderRadius: 10,
  },
  detailsContainer: {
    padding: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 18,
    color: '#555',
  },
  date: {
    fontSize: 16,
    color: '#777',
  },
  description: {
    fontSize: 16,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  reviewContainer: {
    padding: 15,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  ratingContainer: {
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff', // White background
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  repliesContainer: {
    paddingLeft: 20,
    marginTop: 5,
  },
  replyText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  modalInput: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#4CAF50', // Green color for submit
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F44336', // Red color for cancel
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Green for Save
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
});

export default ActivityDetailsScreen;
