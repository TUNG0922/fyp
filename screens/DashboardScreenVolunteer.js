import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TextInput, Share, TouchableOpacity, Alert, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationVolunteer from './NotificationVolunteer'; // Import the Notification component
import axios from 'axios'; // Ensure axios is imported

// Create Top Tab Navigator
const TopTab = createMaterialTopTabNavigator();

const PendingActivities = ({ userId }) => {
  const [pendingActivities, setPendingActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingActivities = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/pending_activities/${userId}`);
        const data = await response.json();
        setPendingActivities(data);
      } catch (error) {
        console.error('Error fetching pending activities:', error);
        Alert.alert('Error', 'An error occurred while fetching activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingActivities();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#547DBE" />;
  }

  return (
    <View style={styles.container}>
      {pendingActivities.length === 0 ? (
        <Text style={styles.noActivitiesText}>No pending activities found.</Text>
      ) : (
        <FlatList
          data={pendingActivities}
          keyExtractor={(item) => item.activity_id}
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <Image
                source={{ uri: item.image }}
                style={styles.activityImage}
                onError={() => console.log('Error loading image:', item.image)}
                resizeMode="cover"
              />
              <Text style={styles.activityName}>{item.activity_name}</Text>
              <Text>Date: {item.date}</Text>
              <Text>Location: {item.location}</Text>
              <Text>Joined By: {item.username}</Text>
              <Text>Email: {item.email}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

// Upcoming Activities Component
const UpcomingActivities = () => {
  // State to store activities
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming/completed activities
  const fetchUpcomingActivities = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:5000/api/completed_joined_activity');
      const completedActivities = response.data;
  
      console.log("Fetched completed activities:", completedActivities);  // Log to inspect structure
  
      if (completedActivities.length > 0) {
        setActivities(completedActivities);
      }
    } catch (error) {
      console.error('Error fetching completed activities:', error);
      Alert.alert('Error', 'Failed to fetch completed activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle completing an activity (move it to past_activity)
  const handleComplete = async (activityId) => {
    try {
      const response = await axios.post(`http://10.0.2.2:5000/api/complete_activity/${activityId}`);

      if (response.status === 200) {
        Alert.alert('Success', 'Activity moved to past activities!');
        fetchUpcomingActivities();  // Refresh the list after completion
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      Alert.alert('Error', 'Failed to complete the activity. Please try again.');
    }
  };

  // Render each activity in the list
  const renderActivity = ({ item }) => {
    return (
      <View style={styles.activityCard}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.activityImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <View style={styles.activityDetails}>
          <Text style={styles.activityName}>{item.activity_name || 'Unknown Activity'}</Text>
          <Text style={styles.activityLocation}>{item.location || 'Unknown Location'}</Text>
          <Text style={styles.activityDate}>{item.date || 'Unknown Date'}</Text>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => handleComplete(item._id)}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  useEffect(() => {
    fetchUpcomingActivities();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderActivity}
          ListEmptyComponent={<Text>No upcoming activities found.</Text>}
        />
      )}
    </View>
  );
};

// Completed Activities Component
const CompletedActivities = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log userId when it changes
  useEffect(() => {
    if (userId) {
      console.log("Received userId in component:", userId); // Log userId to verify if it's being passed correctly
      fetchCompletedActivities(userId); // Fetch activities when userId is set
    } else {
      console.log("userId is undefined or null");
    }
  }, [userId]);

  // Fetch completed activities using the provided userId
  const fetchCompletedActivities = async (userId) => {
    if (!userId) {
      console.log("userId is undefined or null, skipping fetch");
      setActivities([]);  // Ensure state is cleared if userId is invalid
      return;
    }
  
    try {
      console.log("Making API request with userId:", userId);
      
      // Making the API request with the given userId
      const response = await axios.get(`http://10.0.2.2:5000/api/past_activities?user_id=${userId}`);
  
      // Checking if the response status is 200 (OK)
      if (response.status === 200) {
        const fetchedActivities = response.data;
  
        // Check if any activities were returned
        if (Array.isArray(fetchedActivities) && fetchedActivities.length > 0) {
          console.log("Fetched activities:", fetchedActivities);
          setActivities(fetchedActivities); // Update the state with the fetched activities
        } else {
          console.log("No activities found.");
          setActivities([]); // If no activities are found, clear the state
        }
      } else {
        console.error(`API returned an unexpected status: ${response.status}`);
        setActivities([]);  // Clear activities state on API failure
      }
    } catch (error) {
      // Log detailed error for debugging
      console.error("Error fetching completed activities:", error.response ? error.response.data : error.message);
      
      // Reset activities state in case of error
      setActivities([]);
    } finally {
      // Stop loading state regardless of success or failure
      setLoading(false);
    }
  };

  const renderActivity = ({ item }) => (
    <View style={styles.activityCard}>
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.activityImage} 
          onError={() => console.error('Failed to load image:', item.image)} 
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No Image Available</Text>
        </View>
      )}
      <View style={styles.activityDetails}>
        <Text style={styles.activityName}>{item.activity_name || 'Unknown Activity'}</Text>
        <Text style={styles.activityLocation}>{item.location || 'Unknown Location'}</Text>
        <Text style={styles.activityDate}>{item.date || 'Unknown Date'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id}
          renderItem={renderActivity}
          ListEmptyComponent={<Text>No completed activities available.</Text>}  // Display a message if no activities are found
        />
      )}
    </View>
  );
};

// DiscoverScreen Component
const DiscoverScreen = ({ username, userId, email, role }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigation = useNavigation();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/activities');
        setActivities(response.data);
        setFilteredActivities(response.data); // Set the initial filtered activities
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredActivities(activities); // If search is cleared, show all activities
    } else {
      const filteredData = activities.filter(activity =>
        activity.name.toLowerCase().includes(query.toLowerCase()) || 
        activity.location.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredActivities(filteredData);
    }
  };

  const handleShare = async (activity) => {
    try {
      await Share.share({
        message: `Check out this activity: ${activity.name}\nLocation: ${activity.location}\nDate: ${activity.date}`,
      });
    } catch (error) {
      console.error('Error sharing activity:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          value={searchQuery}
          onChangeText={(text) => {
            console.log('Search Query Changed:', text); // Logs the new search query
            handleSearch(text);
          }}
        />
      </View>
  
      {loading ? (
        <ActivityIndicator size="large" color="#547DBE" />
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => {
            console.log('Key Extractor for Item:', item._id); // Logs each item's _id
            return item._id;
          }}
          renderItem={({ item }) => {
            console.log('Rendering Item:', item); // Logs the item being rendered
            return (
              <View style={styles.activityCard}>
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.activityImage}
                  onError={(e) => console.log('Error loading image:', item.imageUri, e.nativeEvent.error)}
                  resizeMode="cover"
                />
                <Text style={styles.activityName}>{item.name}</Text>
                <Text>{item.date}</Text>
                <Text>{item.location}</Text>
                <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    const activityUserId = item.userId; // Extract userId from the activity object
                    console.log('Navigating to ActivityDetailsVolunteer with:', {
                      activity: item,
                      userId: activityUserId, // Use the activity's userId
                      name: username,
                      email: email,
                      image: item.imageUri,
                      role: role,
                    });
                    navigation.navigate('ActivityDetailsVolunteer', {
                      activity: item,
                      userId: activityUserId, // Pass the activity's userId here
                      name: username,
                      email: email,
                      image: item.imageUri,
                      role: role,
                    });
                  }}
                >
                  <Text style={styles.buttonText}>Details</Text>
                </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.shareButton]}
                    onPress={() => {
                      console.log('Sharing Item:', item); // Logs the item being shared
                      handleShare(item);
                    }}
                  >
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

// ProfileScreen Component with Logout Button
const ProfileScreen = ({ username, userId, password, email, role }) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
  Alert.alert(
    'Logout Confirmation',
    'Are you sure you want to log out?',
    [
      { text: 'Cancel', style: 'cancel' },
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
      }
    ]
  );
};

  return (
    <View style={styles.container}>
      <View style={styles.profileInfoContainer}>
        <Text style={styles.profileText}>Profile: {username}</Text>
        <Text style={styles.userInfo}>Email: {email}</Text>
        <Text style={styles.userInfo}>Role: {role}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => 
            navigation.navigate('EditProfileVolunteer', { userId, username, email, password, role })
          }
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('VolunteerHistory', { userId })}
        >
          <Text style={styles.buttonText}>Volunteer History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tab Navigator
const Tab = createBottomTabNavigator();

const DashboardScreenVolunteer = ({ route }) => {
  const { userId, username, password, email, role } = route.params;
  console.log("DashboardScreenVolunteer - userId:", userId);
  // Log the username, userId, email, and role to confirm they are passed correctly
  console.log('Username:', username);
  console.log('UserId:', userId);
  console.log('Email:', email);
  console.log('Role:', role); // Log the role to make sure it's passed in
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        children={() => (
          <TopTab.Navigator>
            <TopTab.Screen name="Pending">
              {() => <PendingActivities userId={userId} />}
            </TopTab.Screen>
            <TopTab.Screen name="Upcoming">
              {() => <UpcomingActivities userId={userId} />}
            </TopTab.Screen>
            <TopTab.Screen name="Completed">
              {() => <CompletedActivities userId={userId} />}
            </TopTab.Screen>
          </TopTab.Navigator>
        )}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="home" size={20} color={color} />
        }} 
      />
      <Tab.Screen 
        name="Discover" 
        children={() => <DiscoverScreen username={username} userId={userId} email={email} />} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="search" size={20} color={color} />
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        children={() => <ProfileScreen username={username} userId={userId} password={password} email={email} role={role} />} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="user" size={20} color={color} />
        }} 
      />
      <Tab.Screen 
        name="Notifications" 
        children={() => <NotificationVolunteer userId={userId} />} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="bell" size={20} color={color} />
        }} 
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // Container for the entire screen
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5', // Light background color
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
  },
  // Card to display each activity
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 15, // Rounded corners
    padding: 15, // More padding for comfortable spacing
    marginVertical: 12, // Increased vertical margin for separation
    shadowColor: '#000', // Subtle shadow effect
    shadowOffset: {
      width: 0,
      height: 4, // Deeper shadow for more depth
    },
    shadowOpacity: 0.1, // Lighter shadow opacity
    shadowRadius: 5, // Softer shadow radius
    elevation: 3, // For Android, adjust elevation for shadow
  },

  // Image style for each activity card
  activityImage: {
    width: '100%',
    height: 180, // Taller image
    borderRadius: 15, // Rounded corners to match card
    marginBottom: 12, // Space between image and text
    resizeMode: 'cover', // Ensure the image covers the area correctly
  },

  // Style for activity name
  activityName: {
    fontSize: 20, // Larger font size for name
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333', // Dark color for readability
  },

  // Button container for action buttons
  buttonContainer: {
    flexDirection: 'column', // Change to column for vertical arrangement
    justifyContent: 'center', // Vertically align the buttons in the center
    marginTop: 15, // Optional: You can adjust the spacing from the top
  },
  
  // Update the button style if you need extra spacing between buttons
  button: {
    backgroundColor: '#547DBE', // Primary button color
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8, // Rounded corners for buttons
    marginVertical: 10, // Added margin between buttons
    alignItems: 'center', // Center button text horizontally
  },

  // Specific style for the share button (yellow)
  shareButton: {
    backgroundColor: '#FFC107', // Yellow for the share button
  },

  // Button text style
  buttonText: {
    color: 'white',
    fontSize: 16, // Slightly larger font for better readability
    textAlign: 'center',
    fontWeight: 'bold', // Bold button text
  },

  // Logout button style
  logoutButton: {
    backgroundColor: '#D9534F', // Red for logout button
    padding: 15,
    borderRadius: 8,
    marginTop: 20, // Space between the last button
  },

  // Logout button text
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16, // Clear text for logout action
  },

  // Profile info container
  profileInfoContainer: {
    marginBottom: 25, // More space after profile details
  },

  // Profile header text (name or title)
  profileText: {
    fontSize: 22, // Larger size for profile title
    fontWeight: 'bold',
    marginBottom: 8, // Add space under the title
    color: '#333', // Dark color for readability
  },

  // User information text style
  userInfo: {
    fontSize: 18, // Slightly larger font for user info
    color: '#555', // Slightly lighter color for info text
  },

  // Empty activity state text style
  emptyStateText: {
    fontSize: 16,
    color: '#888', // Grey for empty state
    textAlign: 'center',
    marginTop: 30, // Add margin top for spacing
  },
});

export default DashboardScreenVolunteer;