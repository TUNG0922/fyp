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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  ratingContainer: {
    marginBottom: 5,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  commentContainer: {
    marginTop: 5,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ActivityDetailsScreen;
