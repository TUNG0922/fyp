import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NotificationOrganizationAdmin from './NotificationOrganizationAdmin'; // Import the NotificationOrganizationAdmin component
import { Picker } from '@react-native-picker/picker'; // Import Picker for dropdown
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import the filter icon
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ route }) => {
  const { userId, username, email } = route.params; // Destructure userName and userEmail
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add a console.log here
  console.log('Params:', { userId, username, email });
  console.log('Initial state:', { joinedActivities, loading });

  const handleAnalyze = async (activityId, username, email) => {
    try {
        console.log('Starting to fetch interest and strength for:', {
            activityId,
            username,
            email
        });

        // Fetch interest and strength from the backend
        const response = await fetch('http://10.0.2.2:5000/api/get_interest_strength', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activity_id: activityId, username, email }),
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Interest:', data.interest, 'Strength:', data.strength);
            // Additional debug log to ensure values are correct
            console.log('Debug - Retrieved Interest and Strength:', { interest: data.interest, strength: data.strength });

            // Pass these values to the /predict endpoint
            const predictResponse = await fetch('http://10.0.2.2:5000/api/predict_genre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interest: data.interest, strength: data.strength }),
            });

            const predictData = await predictResponse.json();

            if (predictResponse.ok) {
                console.log('Predicted Genre:', predictData.genre);
                // Display a popup with the recommended genre
                alert(`The recommended genre for the user based on their interests and strengths is: ${predictData.genre}`);
            } else {
                console.error(predictData.error);
            }
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error('Error fetching interest and strength:', error);
    }
};

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
      // Error is already handled through alert
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchJoinedActivities();
  }, []);

  const handleAccept = async (activityId) => {
    try {
        console.log("Sending activityId:", activityId); // Confirm the ID being sent

        if (!activityId) {
            Alert.alert('Error', 'No activity ID provided.');
            return; // Exit the function early instead of throwing an error
        }

        const response = await axios.post(
            'http://10.0.2.2:5000/api/accept_activity',
            { join_activity_id: activityId }, // Ensure the key matches the backend
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('Response:', response.data);

        if (response.data.message === 'Activity moved to completed') {
            Alert.alert('Accepted', 'The activity has been accepted successfully!');
            setJoinedActivities((prevActivities) =>
                prevActivities.filter((activity) => activity.activity_id !== activityId) // Correct field name
            );
        }
    } catch (error) {
        console.error('Error accepting activity:', error);

        if (error.response) {
            Alert.alert('Error', error.response.data.message || 'Server error. Please try again.');
        } else if (error.request) {
            Alert.alert('Error', 'Network error. Please check your connection.');
        } else {
            Alert.alert('Error', 'Unexpected error occurred.');
        }
    }
};

  const handleReject = async (activityId) => {
    try {
      if (!activityId) {
        throw new Error('Activity ID is missing');
      }
      console.log('Rejecting activity with ID:', activityId);

      const response = await axios.post('http://10.0.2.2:5000/api/reject_activity', {
        join_activity_id: activityId, // Pass the ID as expected by the backend
      });

      if (response.data.message === 'Activity rejected successfully') {
        Alert.alert('Rejected', 'The activity has been rejected successfully!');
        setJoinedActivities((prevActivities) =>
          prevActivities.filter((activity) => activity.activity_id !== activityId)  // Correct field name
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

  const handleCardPress = async (username, email) => {
    try {
        // Log input data for debugging purposes
        console.log('Username:', username);
        console.log('Email:', email);

        // API request to fetch activity details
        const response = await axios.post('http://10.0.2.2:5000/api/get_joined_activity_details', {
            username,
            email,
        });

        // Log the response data
        console.log('API Response:', response.data);

        // Check if the response contains valid data
        const { strength, previous_experiences, interest } = response.data;
        console.log("Fetched activities:", response.data);

        // Ensure interest is an array before joining it into a string
        const interestString = Array.isArray(interest) ? interest.join(', ') : 'No interest data';

        if (strength !== undefined && previous_experiences !== undefined && interestString !== undefined) {
            // Display activity details in an alert
            Alert.alert(
                'Volunteer Details',
                `Strength: ${strength}\nPrevious Experiences: ${previous_experiences}\nInterest: ${interestString}`,
                [{ text: 'OK' }]
            );
        } else {
            // Handle cases where data is missing
            Alert.alert(
                'No Data',
                'The volunteer details could not be retrieved. Please try again later.',
                [{ text: 'OK' }]
            );
        }
    } catch (error) {
        // Log and handle errors
        console.error('Error fetching volunteer details:', error);

        // Inform the user about the error
        Alert.alert(
            'Error',
            'An error occurred while retrieving volunteer details. Please try again later.',
            [{ text: 'OK' }]
        );
    }
};

if (loading) {
  return (
    <View style={styles.mainContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

return (
  <View style={styles.mainContainer}>
    <FlatList
      data={joinedActivities}
      keyExtractor={(item) => item.activity_id?.toString() || Math.random().toString()}
      renderItem={({ item }) => {
        console.log("Item data:", item); // Log the full item object for debugging
        console.log('Activity Genre:', item.genre); // Log the genre of the activity
        console.log("Rendering activity with ID:", item.activity_id);  // Log to confirm field name
        return (
          <TouchableOpacity onPress={() => handleCardPress(item.username, item.email)}>
            <View style={styles.cardContainer}>
              <Image 
                source={{ uri: item.image || 'default_image_url' }}  // Fallback image if undefined
                style={styles.cardImage} 
              />
              <View style={styles.cardDetails}>
                <Text style={styles.cardLabel}>Activity Name</Text>
                <Text style={styles.cardName}>{item.activity_name || 'Unknown Activity'}</Text>
                <Text style={styles.cardLabel}>Location</Text>
                <Text style={styles.cardLocation}>{item.location || 'Unknown Location'}</Text>
                <Text style={styles.cardLabel}>Date</Text>
                <Text style={styles.cardDate}>{item.date || 'Unknown Date'}</Text>
      
                {/* Name Label and Value */}
                <Text style={styles.cardLabel}>Name</Text>
                <Text style={styles.cardUsername}>{item.username || 'Unknown User'}</Text>
      
                {/* Email Label and Value */}
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardEmail}>{item.email || 'Unknown Email'}</Text>
              </View>
              
              <View style={styles.cardButtonGroup}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(item.activity_id)}
                >
                  <Text style={styles.cardButtonText}>Accept</Text>
                </TouchableOpacity>
      
                <TouchableOpacity 
                  style={styles.rejectButton} 
                  onPress={() => handleReject(item.activity_id)} 
                >
                  <Text style={styles.cardButtonText}>Reject</Text>
                </TouchableOpacity>
      
                <TouchableOpacity 
                  style={styles.analyzeButton} 
                  onPress={() => handleAnalyze(item.activity_id, item.username, item.email)} 
                >
                  <Text style={styles.cardButtonText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}           
      ListEmptyComponent={<Text>No activities available for response.</Text>}
    />
  </View>
);
};

const DiscoverScreen = ({ route, navigation }) => {
  const { username, userId, role } = route.params; // Passed from the previous screen
  console.log(`Username: ${username}`);
  console.log(`User ID: ${userId}`);
  console.log(`Role: ${role}`);
  const [isFormVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [genre, setGenre] = useState(''); // State for the genre field
  const [isFilterVisible, setFilterVisible] = useState(false); // Manage filter visibility
  const [selectedGenres, setSelectedGenres] = useState([]); // Store selected genres

  // Fetch activities specific to Organization Admin
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/activities?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setActivities(data);
        setFilteredActivities(data); // Reset filtered list
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch activities');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchActivities();
    }, [userId]) // Refetch when screen gains focus or `userId` changes
  );

  // Handle search text input
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredActivities(activities); // Reset to all activities when search is cleared
    } else {
      const filtered = activities.filter((activity) =>
        activity.name.toLowerCase().includes(text.toLowerCase()) ||
        activity.location.toLowerCase().includes(text.toLowerCase()) ||
        activity.date.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredActivities(filtered);
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
          genre, // Include genre in the request body
          imageUri,
          userId,
        }),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Activity added successfully');
        handleCancel(); // Reset form and close it
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Something went wrong');
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
    setGenre(''); // Reset genre
    setImageUri(null);
    setFormVisible(false);
  };

  // Select an image using the ImagePicker
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);  // Save the image URI
    }
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
      username,
      role,
    });
  };

  // Toggle filter visibility
  const handleFilterPress = () => {
    setFilterVisible((prev) => !prev);
  };

  // Handle genre checkbox toggle
  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      // Remove genre if already selected
      setSelectedGenres(selectedGenres.filter((item) => item !== genre));
    } else {
      // Add genre to selected list
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Apply the genre filter
  const applyFilters = () => {
    if (selectedGenres.length === 0) {
      setFilteredActivities(activities); // Reset to all activities if no genre is selected
    } else {
      const filtered = activities.filter((activity) =>
        selectedGenres.includes(activity.genre?.toLowerCase() || '')
      );
      setFilteredActivities(filtered);
    }
    setFilterVisible(false); // Hide the filter panel after applying
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedGenres([]);
    setFilteredActivities(activities);
    setFilterVisible(false); // Hide the filter panel
  };

  // Render each activity item
  const renderActivityItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleActivityPress(item)}>
      <View style={styles.activityCard}>
        {/* Image Section */}
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.activityImage} />
        )}
        <View style={styles.activityContent}>
          {/* Activity Name */}
          <Text style={styles.activityTitle}>{item.name}</Text>
          {/* Activity Details */}
          <View style={styles.activityInfo}>
            <Ionicons name="location" size={16} color="#555" />
            <Text style={styles.activityText}>{item.location}</Text>
          </View>
          <View style={styles.activityInfo}>
            <Ionicons name="calendar" size={16} color="#555" />
            <Text style={styles.activityText}>{item.date}</Text>
          </View>
          {item.genre && (
            <View style={styles.activityInfo}>
              <Ionicons name="pricetag-outline" size={16} color="#555" />
              <Text style={styles.activityGenre}>{item.genre}</Text>
            </View>
          )}
          {/* Delete Button (Visible only to the creator) */}
          {item.userId === userId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      {/* Search Bar with Search and Filter Icon */}
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name, location, or date..."
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Filter Icon */}
      <TouchableOpacity
          style={styles.filterIconContainer}
          onPress={handleFilterPress}
        >
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {isFilterVisible && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filter by Genre:</Text>
          {['philanthropy', 'service learning', 'community service', 'social action'].map(
            (genre) => (
              <TouchableOpacity
                key={genre}
                style={styles.checkboxContainer}
                onPress={() => handleGenreToggle(genre)}
              >
                <Ionicons
                  name={
                    selectedGenres.includes(genre) ? 'checkbox' : 'square-outline'
                  }
                  size={24}
                  color="#000"
                />
                <Text style={styles.checkboxLabel}>{genre}</Text>
              </TouchableOpacity>
            )
          )}
          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    {loading ? (
      <ActivityIndicator size="large" color="#00BFAE" />
    ) : (
      <FlatList
        data={filteredActivities}
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
        {/* Activity Name */}
        <Text style={styles.formLabel}>Activity Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter activity name"
          placeholderTextColor="#000"
          value={name}
          onChangeText={setName}
        />

        {/* Location */}
        <Text style={styles.formLabel}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor="#000"
          value={location}
          onChangeText={setLocation}
        />

        {/* Date */}
        <Text style={styles.formLabel}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter date (ex: 22 Sep 2024)"
          placeholderTextColor="#000"
          value={date}
          onChangeText={setDate}
        />

        {/* Description */}
        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description"
          placeholderTextColor="#000"
          value={description}
          onChangeText={setDescription}
        />

        {/* Genre Picker */}
        <Text style={styles.formLabel}>Genre</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={genre}
            onValueChange={(itemValue) => setGenre(itemValue)}
          >
            <Picker.Item label="Select Genre" value="" />
            <Picker.Item label="Philanthropy" value="philanthropy" />
            <Picker.Item label="Service Learning" value="service-learning" />
            <Picker.Item label="Community Service" value="community-service" />
            <Picker.Item label="Social Action" value="social-action" />
          </Picker>
        </View>

        {/* Image Picker Button */}
      <TouchableOpacity onPress={handlePickImage} style={styles.imagePickerButton}>
        <Text style={styles.imagePickerButtonText}>Pick an Image</Text>
      </TouchableOpacity>

      {/* Display Image Preview if selected */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {/* Cancel and Submit Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    )}
    </SafeAreaView>
  );
};

// ProfileScreen component with Logout button
const ProfileScreen = ({ route, navigation }) => {
  const { username, userId, email, role } = route.params;

  const handleLogout = async () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to log out?',
      [
        { 
          text: 'Yes', 
          onPress: async () => {
            try {
              // Clear any stored user data
              await AsyncStorage.clear();
              
              // Navigate to the SignInScreen
              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'An error occurred while logging out. Please try again.');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to EditProfileOrganizationAdmin screen with the current user details
    navigation.navigate('EditProfileOrganizationAdmin', { username, userId, email, role });
  };

  return (
    <View style={styles.container}>
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>Name: <Text style={styles.value}>{username}</Text></Text>
      <Text style={styles.infoText}>Email: <Text style={styles.value}>{email}</Text></Text>
      <Text style={styles.infoText}>Role: <Text style={styles.value}>{role}</Text></Text>
    </View>

    <View style={styles.buttonsRow}>
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#FFFFFF', // Ensures text color is white for visibility
      },
      tabBarActiveTintColor: '#00BFAE', // Active icon/text color
      tabBarInactiveTintColor: '#CCCCCC', // Inactive icon/text color
      tabBarStyle: {
        backgroundColor: '#2C3E50', // Darker background color for visibility
        borderTopWidth: 0,
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
      initialParams={{ username, userId, role, email }}
    />
    <Tab.Screen
      name="Discover"
      component={DiscoverScreen}
      options={{ headerShown: false }}
      initialParams={{ username, userId, role }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
      initialParams={{ username, userId, password, email, role }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationOrganizationAdmin}
      options={{ headerShown: false }}
      initialParams={{ username, userId }}
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
  
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  screenContainer: {
    flex: 1,
  },

  searchBar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
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
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  
  // Activity Image
  activityImage: {
    width: '100%',
    height: undefined,  // Height is undefined so it scales based on aspect ratio
    aspectRatio: 16/9,  // You can set this ratio based on your image's aspect ratio
    resizeMode: 'contain',  // 'contain' ensures the image fits within the given width/height without distortion
    borderRadius: 8, // Optional: for rounded corners
  },

  activityContent: {
    padding: 15,
  },

  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  
  // Activity Details Container
  activityDetails: {
    marginTop: 10,
  },

  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },

  activityText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  activityGenre: {
    fontSize: 14,
    color: '#007BFF',
    marginLeft: 5,
    fontStyle: 'italic',
  },

  activityLocation: {
    fontSize: 16,
  },

  activityDate: {
    fontSize: 16,
  },
  
  // User Info Text
  userNameText: {
    fontSize: 16,
    color: '#555',
  },

  userEmailText: {
    fontSize: 16,
    color: '#555',
  },
  
  // Delete Button Styles
  deleteButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FF6F61',
    alignSelf: 'flex-start',
  },
  
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
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
    padding: 10,
    borderWidth: 1,           // Adds the border
    borderColor: '#000',      // Border color
    borderRadius: 5,          // Rounded corners
    marginBottom: 15,         // Space between fields
    fontSize: 16,             // Text size
    color: '#333',            // Text color
    textAlign: 'left',        // Ensures text is aligned to the left
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  formLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000', // Ensures the label text is black
  },
  
  // Image Picker Styles
  imagePickerButton: {
    backgroundColor: '#00BFAE',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 15, // Reduced vertical space
    marginBottom: 10, // Reduced margin to pull buttons closer
  },

  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Floating Add Button
  addButton: {
    backgroundColor: '#00BFAE',
    borderRadius: 8,  // Slightly rounded corners
    paddingVertical: 10,  // Vertical padding
    paddingHorizontal: 20,  // Horizontal padding
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 8,                // Increased shadow elevation
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Button Container for Layout
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Cancel Button
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 10,
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
    backgroundColor: '#FF6347',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
  },

  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  // Edit Button
  editButton: {
    backgroundColor: '#547DBE',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },

  editButtonText: {
    color: '#fff',  // White text color for contrast
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  submitButton: {
    backgroundColor: '#547DBE',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
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

  formContainer: {
    paddingVertical: 30, // Increase vertical padding for better space
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1, // Allows ScrollView to expand vertically
  },
  formLabel: {
    fontSize: 18, // Larger font size
    marginBottom: 8,
    color: '#333',
  },

  pickerContainer: {
    borderWidth: 1,            // Set the width of the border
    borderColor: '#000',       // Set the border color
    borderRadius: 5,           // Optionally round the corners
    paddingHorizontal: 10,     // Add horizontal padding inside the box
    paddingVertical: 5,       // Add vertical padding inside the box
    marginBottom: 10,         // Space below the Picker
  },

  filterIconContainer: {
    padding: 5,
  },

  filterPanel: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },

  filterTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
  },

  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },

  clearButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },

  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },

  infoContainer: {
    marginBottom: 30,
  },

  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },

  value: {
    fontWeight: 'bold',
  },

  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Green for accept
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336', // Red for reject
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 5,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#2196F3', // Blue for analyze
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background for better readability
    padding: 10,
  },
  cardContainer: {
    backgroundColor: '#ffffff', // White background for the card
    borderRadius: 8,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000', // Subtle shadow for a lifted card effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardDetails: {
    marginBottom: 15,
  },
  cardName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 5,
  },
  cardUsername: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardEmail: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  cardButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});

export default DashboardScreenOrganizationAdmin;