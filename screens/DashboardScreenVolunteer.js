import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Share, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Top Tab Navigator
const TopTab = createMaterialTopTabNavigator();

const PendingActivities = ({ userId }) => {
  const [pendingActivities, setPendingActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingActivities = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/pending_activities/${userId}`);
        const data = await response.json(); // Parse the JSON response
        setPendingActivities(data); // Set the fetched data to state
      } catch (error) {
        console.error('Error fetching pending activities:', error);
        Alert.alert('Error', 'An error occurred while fetching activities.');
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchPendingActivities();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#547DBE" />;
  }

  return (
    <FlatList
      data={pendingActivities}
      keyExtractor={(item) => item.activity_id} // Use activity_id as key
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
  );
};

// Upcoming Activities Component
const UpcomingActivities = () => {
  return (
    <View style={styles.container}>
      <Text>Upcoming Activities</Text>
      {/* Fetch and display upcoming activities here */}
    </View>
  );
};

// Completed Activities Component
const CompletedActivities = () => {
  return (
    <View style={styles.container}>
      <Text>Completed Activities</Text>
      {/* Fetch and display completed activities here */}
    </View>
  );
};

// HomeScreen Component
const HomeScreen = ({ username, userId }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Welcome to the Home Screen!</Text>
      <Text style={styles.userInfo}>Username: {username}</Text>
      <Text style={styles.userInfo}>User ID: {userId}</Text>
    </View>
  );
};

// DiscoverScreen Component
const DiscoverScreen = ({ username, userId, email }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/activities');
        const data = await response.json();
        console.log('Fetched activities:', data);
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

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
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#547DBE" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <Image 
                source={{ uri: item.imageUri }} 
                style={styles.activityImage}
                onError={() => console.log('Error loading image:', item.imageUri)}
                resizeMode="cover"
              />
              <Text style={styles.activityName}>{item.name}</Text>
              <Text>{item.date}</Text>
              <Text>{item.location}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('ActivityDetailsVolunteer', {
                    activity: item,
                    userId: userId,
                    name: username,
                    email: email, // Pass email here
                  })}
                >
                  <Text style={styles.buttonText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.shareButton]}
                  onPress={() => handleShare(item)}
                >
                  <Text style={styles.buttonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

// ProfileScreen Component with Logout Button
const ProfileScreen = ({ username, userId, password, email, role }) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId'); 
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.removeItem('role');
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
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
          onPress={() => navigation.navigate('EditProfileVolunteer', { userId, username, email, password, role })}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('VolunteerHistory')}
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

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        children={() => (
          <TopTab.Navigator>
            <TopTab.Screen name="Pending">
              {() => <PendingActivities userId={userId} />}
            </TopTab.Screen>
            <TopTab.Screen name="Upcoming" component={UpcomingActivities} />
            <TopTab.Screen name="Completed" component={CompletedActivities} />
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
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'flex-start',
  },
  placeholderText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  profileInfoContainer: {
    marginBottom: 20,
  },
  profileText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  activityCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  activityImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#547DBE',
    alignItems: 'center',
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: '#00BFAE',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3D3D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreenVolunteer;