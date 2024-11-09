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
      const response = await axios.delete(`http://10.0.2.2:5000/api/reject_activity/${activityId}`);
      if (response.data.message === 'Activity rejected successfully') {
        Alert.alert('Rejected', 'The activity has been rejected successfully!');
        setJoinedActivities((prevActivities) => prevActivities.filter((activity) => activity._id !== activityId));
      }
    } catch (error) {
      console.error('Error rejecting activity:', error);
      Alert.alert('Error', 'Failed to reject the activity. Please try again.');
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

  // Fetch activities from the API
  const fetchActivities = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/activities');
      const data = await response.json();
      if (response.ok) {
        setActivities(data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
      Alert.alert('Error', 'Failed to fetch activities');
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
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item._id}
      />

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
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
            <Text style={styles.imagePickerText}>Pick an Image</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button title="Submit" onPress={handleSubmit} color="#00BFAE" />
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {!isFormVisible && (
        <TouchableOpacity style={styles.addButton} onPress={() => setFormVisible(true)}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// ProfileScreen component with Logout button
const ProfileScreen = ({ route, navigation }) => {
  const { username, userId, password, email, role } = route.params;

  const handleLogout = () => {
    // Implement your logout logic here
    navigation.navigate('SignIn'); // Assuming you have a 'LoginScreen' defined in your navigator
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Name: {username}</Text>
      <Text style={styles.screenText}>Email: {email}</Text>
      <Text style={styles.screenText}>Role: {role}</Text>

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
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  screenText: {
    fontSize: 24, // Increase the font size for better visibility
    fontWeight: 'bold', // Make the header bold
    marginBottom: 20, // More space below the title
    textAlign: 'center', // Center the title
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15, // Increased padding for a more spacious look
    backgroundColor: '#fff',
    borderRadius: 10, // More rounded corners
    marginBottom: 15, // More space between items
    elevation: 2, // Slightly increased shadow for depth
  },
  activityImage: {
    width: 60, // Slightly larger image
    height: 60,
    borderRadius: 10, // Match the rounding of activityItem
    borderColor: '#e1e1e1', // Add border color for contrast
    borderWidth: 1, // Border width for a clearer separation
  },
  activityDetails: {
    flex: 1,
    marginLeft: 15, // Increased margin for spacing
  },
  activityName: {
    fontSize: 18, // Increased font size for visibility
    fontWeight: 'bold',
  },
  activityLocation: {
    fontSize: 15,
    color: '#666',
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  userNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userEmailText: {
    fontSize: 12,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 5,
    paddingVertical: 8, // Consistent padding
    paddingHorizontal: 10, // Consistent padding
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15, // Increased margin for better spacing
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Align text to the top of the area
  },
  formLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  imagePickerButton: {
    backgroundColor: '#00BFAE',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#00BFAE',
    borderRadius: 50,
    padding: 10,
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5, // Add shadow for depth
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginHorizontal: 5, // Use horizontal margin for consistent spacing
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 5,
  },
  logoutButton: {
    backgroundColor: '#FF4B4B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreenOrganizationAdmin;