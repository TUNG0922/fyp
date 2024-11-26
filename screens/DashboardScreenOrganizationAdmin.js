import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NotificationOrganizationAdmin from './NotificationOrganizationAdmin'; // Import the NotificationOrganizationAdmin component

// HomeScreen component
const HomeScreen = ({ route }) => {
  const { userId, userName, userEmail } = route.params; // Destructure userName and userEmail
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJoinedActivities = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:5000/api/joined_activities/${userId}`);
      const userJoinedActivities = response.data;
  
      console.log("Fetched activities data:", userJoinedActivities);  // Log full data to check structure
  
      if (userJoinedActivities.length === 0) {
        Alert.alert('Info', 'No joined activities found for this user.');
      } else {
        setJoinedActivities(userJoinedActivities);
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchJoinedActivities();
  }, []);

  const handleAccept = async (activityId) => {
    try {
      console.log("Sending activityId:", activityId);  // Confirm the ID being sent
      if (!activityId) {
        throw new Error("Activity ID is missing");
      }
  
      const response = await axios.post(
        'http://10.0.2.2:5000/api/accept_activity',
        { join_activity_id: activityId },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.data.message === 'Activity moved to completed') {
        Alert.alert('Accepted', 'The activity has been accepted successfully!');
        setJoinedActivities((prevActivities) =>
          prevActivities.filter((activity) => activity.activity_id !== activityId)  // Update to correct field name
        );
      }
    } catch (error) {
      console.error('Error accepting activity:', error);
      Alert.alert('Error', 'Failed to accept the activity. Please try again.');
    }
  };  

  const handleReject = async (activityId) => {
    try {
      if (!activityId) {
        throw new Error('Activity ID is missing');
      }
      console.log('Rejecting activity with ID:', activityId);
  
      // Send POST request with the activity ID in the request body
      const response = await axios.post('http://10.0.2.2:5000/api/reject_activity', {
        join_activity_id: activityId, // Pass the ID as expected by the backend
      });
  
      if (response.data.message === 'Activity rejected successfully') {
        Alert.alert('Rejected', 'The activity has been rejected successfully!');
        setJoinedActivities((prevActivities) =>
          prevActivities.filter((activity) => activity._id !== activityId)
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reject the activity.');
      }
    } catch (error) {
      console.error('Error rejecting activity:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to reject the activity. Please try again.'
      );
    }
  };  

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
      data={joinedActivities}
      keyExtractor={(item) => item.activity_id?.toString() || Math.random().toString()}
      renderItem={({ item }) => {
        console.log("Rendering activity with ID:", item.activity_id);  // Log to confirm field name
        return (
          <View style={styles.activityItem}>
            <Image 
              source={{ uri: item.image || 'default_image_url' }}  // Fallback image if undefined
              style={styles.activityImage} 
            />
            <View style={styles.activityDetails}>
              <Text style={styles.activityName}>{item.activity_name || 'Unknown Activity'}</Text>
              <Text style={styles.activityLocation}>{item.location || 'Unknown Location'}</Text>
              <Text style={styles.activityDate}>{item.date || 'Unknown Date'}</Text>
              <Text style={styles.userNameText}>{item.username || 'Unknown User'}</Text>
              <Text style={styles.userEmailText}>{item.email || 'Unknown Email'}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#4CAF50', marginRight: 10 }]} // Green color for Accept
                onPress={() => handleAccept(item.activity_id)}  // Use correct ID field
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#FF4B4B' }]} // Red color for Reject
                onPress={() => handleReject(item.activity_id)}  // Use correct ID field
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={<Text>No activities available for response.</Text>}
    />
    </View>
  );
};

const DiscoverScreen = ({ route, navigation }) => {
  const { username, userId } = route.params; // Passed from previous screen
  const [isFormVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch activities specific to Organization Admin
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/activities?userId=${userId}`);
      const data = await response.json();
      console.log("Fetched Data:", data); // Check the fetched data here
      if (response.ok) {
        setActivities(data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
      Alert.alert('Error', 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchActivities();
  }, []);

  // Handle image picker
  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick an image');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/add_activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          location,
          date,
          description,
          imageUri,
          userId, // Include userId in the body
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Activity added successfully');
        handleCancel(); // Clear form and close it
        fetchActivities(); // Refresh activities list
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // Clear form fields and hide the form
  const handleCancel = () => {
    setName('');
    setLocation('');
    setDate('');
    setDescription('');
    setImageUri(null);
    setFormVisible(false);
  };

  // Delete an activity
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/delete_activity/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Activity deleted successfully');
        fetchActivities(); // Refresh the activity list
      } else {
        Alert.alert('Error', data.error || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete activity');
    }
  };

  // Navigate to ActivityDetailsScreen on click
  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetailsScreen', {
      activity,
      userId,
      username
    });
  };

  // Render each activity item
  const renderActivityItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleActivityPress(item)}>
      <View style={styles.activityItem}>
        {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.activityImage} />}
        <View style={styles.activityDetails}>
          <Text style={styles.activityName}>{item.name}</Text>
          <Text style={styles.activityLocation}>{item.location}</Text>
          <Text style={styles.activityDate}>{item.date}</Text>
        </View>

        {item.userId === userId && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#00BFAE" />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item._id}
        />
      )}
  
      {/* Floating Button to Open the Form */}
      {!isFormVisible && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setFormVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Activity</Text>
        </TouchableOpacity>
      )}
  
      {isFormVisible && (
        <ScrollView style={styles.formContainer}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.selectedImage} />}
          <Text style={styles.formLabel}>Activity Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter activity name"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.formLabel}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.formLabel}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter date"
            value={date}
            onChangeText={setDate}
          />
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
            <Text style={styles.imagePickerButtonText}>Pick an image</Text>
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
                </ScrollView>
              )}
    </SafeAreaView>
  );
};

// ProfileScreen component with Logout button
const ProfileScreen = ({ route, navigation }) => {
  const { username, userId, password, email, role } = route.params;

  const handleLogout = () => {
    // Implement your logout logic here
    navigation.navigate('SignIn'); // Assuming you have a 'SignIn' screen defined in your navigator
  };

  const handleEditProfile = () => {
    // Navigate to EditProfileOrganizationAdmin screen with the current user details
    navigation.navigate('EditProfileOrganizationAdmin', { username, userId, email, role });
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Name: {username}</Text>
      <Text style={styles.screenText}>Email: {email}</Text>
      <Text style={styles.screenText}>Role: {role}</Text>

      <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const DashboardScreenOrganizationAdmin = ({ route }) => {
  const { username, userId, password, email, role } = route.params;

  return (
    <Tab.Navigator
      initialRouteName="Discover"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Discover') {
            iconName = 'compass';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Notifications') {
            iconName = 'bell';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00BFAE',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#547DBE',
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
        initialParams={{ username, userId }} // Passing username and userId
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ headerShown: false }}
        initialParams={{ username, userId }} // Passing username and userId
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
        initialParams={{ username, userId, password, email, role }} // Passing profile details
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationOrganizationAdmin}
        options={{ headerShown: false }}
        initialParams={{ username, userId }} // Passing username and userId
      />
    </Tab.Navigator>
  );
};

// Define styles for the component
const styles = StyleSheet.create({
  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light background color for the whole screen
    padding: 20,
  },
  
  // Text styles
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Dark text color for better readability
  },
  
  // Activity Item Layout (Card style)
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff', // White card background
    borderRadius: 15,
    marginBottom: 15,
    elevation: 5, // Adding shadow to make it pop
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  
  // Activity Image
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderColor: '#e1e1e1',
    borderWidth: 1,
    marginRight: 15, // Spacing between image and text
  },
  
  // Activity Details Container
  activityDetails: {
    flex: 1,
  },
  
  // Activity Text Styles
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Dark text color for better readability
  },
  activityLocation: {
    fontSize: 15,
    color: '#777', // Light gray for less important text
  },
  activityDate: {
    fontSize: 13,
    color: '#999', // Lighter color for date
  },
  
  // User Info Text
  userNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#333',
  },
  userEmailText: {
    fontSize: 12,
    color: '#555',
  },
  
  // Delete Button Styles
  deleteButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Form Styles
  formContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    height: 800, // Fixed height in pixels (adjust this value as needed)
    marginBottom: 20, // Add bottom margin to make it look less cramped
  },  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fafafa', // Lighter background for input fields
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333', // Dark text color for labels
  },
  
  // Image Picker Styles
  imagePickerButton: {
    backgroundColor: '#00BFAE',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Floating Add Button
  addButton: {
    backgroundColor: '#00BFAE',
    borderRadius: 50,
    padding: 15,
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Button Container for Layout
  buttonContainer: {
    flexDirection: 'row', // Align buttons horizontally
    justifyContent: 'space-between', // Space the buttons evenly
    marginTop: 20, // Adds top margin to separate from the form
    width: '100%', // Ensures buttons take up full width for alignment
  },   
  
  // Cancel Button
  cancelButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Selected Image
  selectedImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  
  // Logout Button
  logoutButton: {
    backgroundColor: '#FF4B4B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Edit Profile Button
  editProfileButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  editProfileButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#00BFAE', // Vibrant green color
    borderRadius: 12, // Rounded corners for a modern look
    paddingVertical: 15, // Increased padding for better spacing
    paddingHorizontal: 30, // Horizontal padding to make the button wider
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Adds shadow for depth
    shadowColor: '#000', // Shadow color for better contrast
    shadowOpacity: 0.2, // Slightly stronger shadow opacity
    shadowOffset: { width: 0, height: 4 }, // Shadow offset to make it look elevated
    shadowRadius: 5, // Shadow blur radius
    flex: 1, // Ensures buttons have equal width
    marginHorizontal: 5, // Small margin between buttons
  },
  submitButtonText: {
    color: '#fff', // White text for contrast
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger font size
  },
  
  cancelButton: {
    backgroundColor: '#FF4B4B', // Vibrant red color for cancel action
    borderRadius: 12, // Rounded corners for consistency
    paddingVertical: 15, // Increased padding for better spacing
    paddingHorizontal: 30, // Horizontal padding to make the button wider
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Adds shadow to make it pop
    shadowColor: '#000', // Shadow color for depth
    shadowOpacity: 0.2, // Slightly stronger shadow opacity
    shadowOffset: { width: 0, height: 4 }, // Shadow offset for better visual effect
    shadowRadius: 5, // Shadow blur radius
    flex: 1, // Ensures buttons have equal width
    marginHorizontal: 5, // Small margin between buttons
  },
  cancelButtonText: {
    color: '#fff', // White text for contrast
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger font size
  },
});

export default DashboardScreenOrganizationAdmin;