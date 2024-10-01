import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList, ActivityIndicator, Button, Modal, TextInput } from 'react-native';
import { Rating } from 'react-native-ratings';

const ActivityDetailsScreen = ({ route }) => {
  const { activity } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedActivity, setEditedActivity] = useState({ ...activity });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/get_reviews?activityId=${activity._id}`);
      const data = await response.json();
  
      if (response.ok) {
        setReviews(data.reviews); // Ensure data.reviews has user_name
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
      const response = await fetch(`http://10.0.2.2:5000/api/reply_to_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: currentReviewId, replyText })
      });
      const data = await response.json();

      if (response.ok) {
        setReplyModalVisible(false);
        setReplyText('');
        fetchReviews(); // Refresh reviews
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
  
    console.log('Sending activity data:', activityData); // Log the data being sent
  
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/edit_activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
  
      const data = await response.json(); // Parse the response
  
      console.log('Response data:', data); // Log the response data
  
      if (response.ok) {
        Alert.alert('Success', 'Activity updated successfully');
        setEditModalVisible(false);
        fetchReviews(); // Refresh reviews if needed
      } else {
        Alert.alert('Error', data.error || 'Failed to update activity');
      }
    } catch (error) {
      console.log('Error:', error); // Log any error from the fetch call
      Alert.alert('Error', 'Failed to update activity');
    }
  };    

  // Render reviews in the FlatList
const renderReview = ({ item }) => (
  <View style={styles.reviewItem}>
    <View style={styles.ratingContainer}>
      <Rating
        type='star'
        startingValue={item.rating}
        readonly
        imageSize={20}
        style={styles.rating}
      />
    </View>
    <View style={styles.commentContainer}>
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.reviewAuthor}>- {item.user_name}</Text>
    </View>
    <Button title="Reply" onPress={() => handleReplyPress(item._id)} />
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
          <Button title="Edit" onPress={handleEditPress} />
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
      <Modal
        visible={replyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to Review</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Write your reply..."
              multiline
              value={replyText}
              onChangeText={setReplyText}
            />
            <View style={styles.modalButtons}>
              <Button title="Submit Reply" onPress={handleReplySubmit} />
              <Button title="Cancel" onPress={() => setReplyModalVisible(false)} />
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Activity Name"
              value={editedActivity.name}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, name: text })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Location"
              value={editedActivity.location}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, location: text })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Date"
              value={editedActivity.date}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, date: text })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Description"
              value={editedActivity.description}
              onChangeText={(text) => setEditedActivity({ ...editedActivity, description: text })}
            />
            <View style={styles.modalButtons}>
              <Button title="Submit Edit" onPress={handleEditSubmit} />
              <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
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
    backgroundColor: '#F5F5F5',
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
  reviewItem: {
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    marginRight: 10,
  },
  commentContainer: {
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ActivityDetailsScreen;