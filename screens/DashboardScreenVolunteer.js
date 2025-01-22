import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Modal,  TextInput, Share, TouchableOpacity, Alert, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationVolunteer from './NotificationVolunteer'; // Import the Notification component
import axios from 'axios'; // Ensure axios is imported
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import the filter icon

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

  const renderActivity = ({ item }) => {
    console.log('Rendering Activity:', item);
  
    return (
      <View style={styles.activityCardStyle}>
        {item.image ? (
          // Ensure you are passing the local file URI as the source
          <Image source={{ uri: item.image }} style={styles.activityImageStyle} />
        ) : (
          <View style={styles.noImageContainerStyle}>
            <Text style={styles.noImageTextStyle}>No Image Available</Text>
          </View>
        )}
        <View style={styles.activityDetailsStyle}>
          <Text style={styles.activityNameStyle}>{item.activity_name || 'Unknown Activity'}</Text>
          <Text style={styles.activityLocationStyle}>{item.location || 'Unknown Location'}</Text>
          <Text style={styles.activityDateStyle}>{item.date || 'Unknown Date'}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={pendingActivities}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderActivity}
          ListEmptyComponent={
            <View style={styles.noPendingContainer}>
              <Text style={styles.noPendingText}>No pending activities found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// Upcoming Activities Component
const UpcomingActivities = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed activities for the specific userId
  const fetchCompletedActivities = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:5000/api/completed_joined_activity/${userId}`);
      setActivities(response.data);
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
        fetchCompletedActivities();  // Refresh the list after completion
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      Alert.alert('Error', 'Failed to complete the activity. Please try again.');
    }
  };

  // Render each activity in the list
  const renderActivity = ({ item }) => (
    <View style={styles.activityCardStyle}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.activityImageStyle} />
      ) : (
        <View style={styles.noImageContainerStyle}>
          <Text style={styles.noImageTextStyle}>No Image Available</Text>
        </View>
      )}
      <View style={styles.activityDetailsStyle}>
        <Text style={styles.activityNameStyle}>{item.activity_name || 'Unknown Activity'}</Text>
        <Text style={styles.activityLocationStyle}>{item.location || 'Unknown Location'}</Text>
        <Text style={styles.activityDateStyle}>{item.date || 'Unknown Date'}</Text>
        <TouchableOpacity 
          style={styles.completeButtonStyle}
          onPress={() => handleComplete(item._id)}
        >
          <Text style={styles.completeButtonTextStyle}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    fetchCompletedActivities();
  }, [userId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderActivity}
          ListEmptyComponent={
            <View style={styles.noUpcomingActivitiesContainer}>
              <Text style={styles.noUpcomingActivitiesTextStyle}>No upcoming activities found.</Text>
            </View>
          }
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
  <View style={styles.activityCardCompleted}>
    {/* Display Image */}
    {item.image ? (
      <Image
        source={{ uri: item.image }}
        style={styles.activityImageCompleted}
        onError={() => console.error('Failed to load image:', item.image)}
      />
    ) : (
      <View style={styles.noImageContainerCompleted}>
        <Text style={styles.noImageTextCompleted}>No Image Available</Text>
      </View>
    )}

    {/* Activity Details */}
    <View style={styles.activityDetailsCompleted}>
      <Text style={styles.activityNameCompleted}>{item.activity_name || 'Unknown Activity'}</Text>
      <Text style={styles.activityGenreCompleted}>🎭 Genre: {item.genre || 'N/A'}</Text>
      <Text style={styles.activityLocationCompleted}>📍 {item.location || 'Unknown Location'}</Text>
      <Text style={styles.activityDateCompleted}>📅 {item.date || 'Unknown Date'}</Text>
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
          ListEmptyComponent={
            <View style={styles.noUpcomingActivitiesContainer}>
              <Text style={styles.noActivitiesText}>No completed activities available.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const DiscoverScreen = ({ username, userId, email, role, strength, previous_experiences, interest}) => {
  console.log('DiscoverScreen Props:');
  console.log('Username:', username);
  console.log('User ID:', userId);
  console.log('Email:', email);
  console.log('Role:', role);
  console.log('Strength:', strength);
  console.log('Previous Experiences:', previous_experiences);
  console.log('Interest:', interest);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedGenres, setSelectedGenres] = useState([]); // State to track selected genres
  const navigation = useNavigation();
  const [isFilterVisible, setFilterVisible] = useState(false); // State to control filter visibility

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

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };
  
  const applyFilters = () => {
    // Check if any genres are selected; if none are selected, show all activities
    if (selectedGenres.length === 0) {
      setFilteredActivities(activities); // Reset to show all activities
    } else {
      const filtered = activities.filter(activity =>
        selectedGenres.some(genre =>
          activity.genre?.toLowerCase().includes(genre.toLowerCase())
        )
      );
      setFilteredActivities(filtered); // Update the filtered activities state
    }
  
    setFilterVisible(false); // Hide the filter modal or UI
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setFilteredActivities(activities);
    setFilterVisible(false);
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
            console.log('Search Query Changed:', text); // Logs the search query
            handleSearch(text);
          }}
        />

        {/* Filter Icon */}
        <TouchableOpacity
          style={styles.filterIconContainer}
          onPress={() => setFilterVisible(true)} // Fixed this line
        >
          <Icon name="filter" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      {isFilterVisible && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filter by Genre:</Text>
          {['philanthropy', 'service-learning', 'community service', 'social action'].map(
            (genre) => (
              <TouchableOpacity
                key={genre}
                style={styles.checkboxContainer}
                onPress={() => handleGenreToggle(genre)}
              >
                <Ionicons
                  name={selectedGenres.includes(genre) ? 'checkbox' : 'square-outline'}
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
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#547DBE" />
      ) : (
        <FlatList
  data={filteredActivities}
  keyExtractor={(item) => item._id}
  renderItem={({ item }) => (
    <View style={styles.activityCard}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.activityImage}
        onError={(e) =>
          console.log('Error loading image:', item.imageUri, e.nativeEvent.error)
        }
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityDate}>📅 {item.date}</Text>
        <Text style={styles.activityLocation}>📍 {item.location}</Text>
        <Text style={styles.activityGenre}>
          🎭 {item.genre || 'No genre specified'}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              const activityUserId = item.userId;
              console.log('Navigating to ActivityDetailsVolunteer with:', {
                activity: item,
                userId: activityUserId,
                name: username,
                email: email,
                image: item.imageUri,
                role: role,
                strength: strength,
                previous_experiences: previous_experiences,
              });
              navigation.navigate('ActivityDetailsVolunteer', {
                activity: item,
                userId: userId,
                name: username,
                email: email,
                image: item.imageUri,
                role: role,
                strength: strength,
                previous_experiences: previous_experiences,
                interest: interest,
              });
            }}
          >
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              console.log('Sharing Item:', item);
              handleShare(item);
            }}
          >
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )}
/>
      )}
    </View>
  );
};

const ProfileScreen = ({ username, userId, password, email, role }) => {
  const navigation = useNavigation();
  const [avatarUri, setAvatarUri] = useState(null); // State to hold the avatar URI

  // Function to handle image selection
  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false, // You can set to true if you need base64 encoding
      },
      (response) => {
        if (response.didCancel) {
          console.log('User canceled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorCode);
        } else {
          // Update avatar URI with the selected image URI
          setAvatarUri(response.assets[0].uri);
        }
      }
    );
  };

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
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileInfoContainer}>
        {/* Avatar Section */}
        <TouchableOpacity onPress={selectImage}>
          <Image
            source={{
              uri: avatarUri || 'https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png', // Default avatar if no image is selected
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        {/* User Info */}
        <Text style={styles.profileText}>Username: {username}</Text>
        <Text style={styles.userInfo}>Email: {email}</Text>
        <Text style={styles.userInfo}>Role: {role}</Text>
      </View>
      <View style={styles.buttonContainerStyle}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() =>
            navigation.navigate('EditProfileVolunteer', { userId, username, email, password, role })
          }
        >
          <Text style={styles.buttonTextStyle}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => navigation.navigate('VolunteerHistory', { userId })}
        >
          <Text style={styles.buttonTextStyle}>Volunteer History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.buttonTextStyle}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tab Navigator
const Tab = createBottomTabNavigator();

const DashboardScreenVolunteer = ({ route }) => {
  const { userId, username, password, email, role, strength, interest, previous_experiences } = route.params;

  // Log details for verification
  console.log("DashboardScreenVolunteer - userId:", userId);
  console.log('Username:', username);
  console.log('UserId:', userId);
  console.log('Email:', email);
  console.log('Role:', role); // Log the role
  console.log('Strength:', strength); // Log strength
  console.log('Interest:', interest); // Log strength
  console.log('Previous Experiences:', previous_experiences); // Log previous experiences

  return (
    <Tab.Navigator initialRouteName="Discover">
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
        children={() => <DiscoverScreen username={username} userId={userId} email={email} strength={strength} previous_experiences={previous_experiences} interest={interest}  role={role}/>} 
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
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    padding: 15,
  },
  // Image style for each activity card
  activityImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  // Style for activity name
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  // Button container for action buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  detailsButton: {
    backgroundColor: '#547DBE',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  // Specific style for the share button (yellow)
  shareButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
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
    backgroundColor: '#ff5252',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Profile info container
  profileInfoContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  // Profile header text (name or title)
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // User information text style
  userInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  // Empty activity state text style
  emptyStateText: {
    fontSize: 16,
    color: '#888', // Grey for empty state
    textAlign: 'center',
    marginTop: 30, // Add margin top for spacing
  },
  filterIconContainer: {
    marginLeft: 10,
  },
  filterPanel: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: '#547DBE',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  activityCardStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  activityImageStyle: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  noImageContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  noImageTextStyle: {
    fontSize: 16,
    color: '#888',
  },
  activityDetailsStyle: {
    padding: 16,
  },
  activityNameStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  activityLocationStyle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDateStyle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  completeButtonStyle: {
    backgroundColor: '#00BFAE',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButtonTextStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  activityDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  activityLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  activityGenre: {
    fontSize: 14,
    color: '#2e8b57', // Dark green for genre text
    marginBottom: 6,
  },
  buttonContainerStyle: {
    marginTop: 20,
  },
  buttonTextStyle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonStyle: {
    backgroundColor: '#4CAF50', // A vibrant green color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // Add a subtle shadow for depth
  },
  activityCardCompleted: {
    backgroundColor: '#d8f3dc', // Pastel green for completed activities
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  activityImageCompleted: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  noImageContainerCompleted: {
    width: '100%',
    height: 160,
    backgroundColor: '#b7b7a4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageTextCompleted: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityDetailsCompleted: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#cce3de', // Subtle line for separation
  },
  activityNameCompleted: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4332', // Dark green for title
    marginBottom: 6,
  },
  activityGenreCompleted: {
    fontSize: 14,
    fontWeight: '500',
    color: '#40916c', // Genre-specific light green
    marginBottom: 6,
  },
  activityLocationCompleted: {
    fontSize: 14,
    fontWeight: '400',
    color: '#344e41',
    marginBottom: 6,
  },
  activityDateCompleted: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6c757d', // Neutral gray for date
  },
  noPendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  noPendingText: {
    fontSize: 16, // Smaller font size for compact design
    fontWeight: '500', // Lighter text weight
    color: '#777', // Softer text color for better legibility
    textAlign: 'center',
    marginHorizontal: 20, // To avoid text touching edges
  },
  noUpcomingActivitiesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  noUpcomingActivitiesTextStyle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
    marginHorizontal: 20,
  },

  noActivitiesText:{
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

export default DashboardScreenVolunteer;