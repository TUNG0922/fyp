import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Share, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Top Tab Navigator
const TopTab = createMaterialTopTabNavigator();

// Pending Activities Component
const PendingActivities = () => {
  return (
    <View style={styles.container}>
      <Text>Pending Activities</Text>
      {/* Fetch and display pending activities here */}
    </View>
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
const DiscoverScreen = ({ username, userId }) => {
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
  console.log('User Role:', role);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId'); 
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.profileText}>Profile: {username}</Text>
      <Text style={styles.userInfo}>Email: {email}</Text>
      <Text style={styles.userInfo}>Role: {role}</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
            <TopTab.Screen name="Pending" component={PendingActivities} />
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
        children={() => <DiscoverScreen username={username} userId={userId} />} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="search" size={20} color={color} />
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        children={() => <ProfileScreen username={username} userId={userId} password={password} email={email} role={role} />} // Pass role here
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
  },
  placeholderText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#547DBE',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#00BFAE',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3D3D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreenVolunteer;
