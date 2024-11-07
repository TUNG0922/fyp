import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
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
        setReviews(data.reviews);
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
  
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/edit_activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', 'Activity updated successfully');
        setEditModalVisible(false);
        fetchReviews();
      } else {
        Alert.alert('Error', data.error || 'Failed to update activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update activity');
    }
  };    

  const handleViewListPress = () => {
    Alert.alert("View List", "This button will show the list of activities.");
  };
  
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
      <TouchableOpacity style={styles.button} onPress={() => handleReplyPress(item._id)}>
        <Text style={styles.buttonText}>Reply</Text>
      </TouchableOpacity>
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
              <TouchableOpacity style={styles.button} onPress={handleReplySubmit}>
                <Text style={styles.buttonText}>Submit Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setReplyModalVisible(false)}>
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
              <TouchableOpacity style={styles.button} onPress={handleEditSubmit}>
                <Text style={styles.buttonText}>Submit Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(false)}>
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
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  location: {
    fontSize: 18,
    marginBottom: 5,
    color: '#666',
  },
  date: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#444',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reviewContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 15,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  commentContainer: {
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    marginBottom: 10,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ActivityDetailsScreen;
