import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        console.log('Fetched activities:', data); // Log the fetched data
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

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
                source={{ uri: item.imageUri }} // Ensure this is the correct field for the image
                style={styles.activityImage}
                onError={() => console.log('Error loading image:', item.imageUri)}
                resizeMode="cover"
              />
              <Text style={styles.activityName}>{item.name}</Text>
              <Text>{item.date}</Text>
              <Text>{item.location}</Text>
              <Text>{item.description}</Text>
              <Button
                title="Details"
                onPress={() => navigation.navigate('ActivityDetailsVolunteer', {
                  activity: item,
                  userId: userId,
                  name: username,
                })}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

// ProfileScreen Component with Logout Button
const ProfileScreen = ({ username, userId, password }) => {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('ProfileScreen - username:', username, 'userId:', userId, 'password:', password);
  }, [username, userId, password]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId'); 
      await AsyncStorage.removeItem('username');
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.profileText}>Profile: {username}</Text>
      <Button title="Logout" onPress={handleLogout} color="#FF3D3D" />
    </View>
  );
};

// Tab Navigator
const Tab = createBottomTabNavigator();

const DashboardScreenVolunteer = ({ route }) => {
  const { username, userId, password } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        children={() => <HomeScreen username={username} userId={userId} />} 
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
        children={() => <ProfileScreen username={username} userId={userId} password={password} />} 
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
  profileText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default DashboardScreenVolunteer;