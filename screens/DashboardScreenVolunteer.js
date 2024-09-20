import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';

// HomeScreen Component
function HomeScreen({ userId }) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'pending', title: 'Pending' },
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'completed', title: 'Completed' },
  ]);

  const renderScene = SceneMap({
    pending: () => (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Pending Activities</Text>
        {/* Add your pending activities rendering logic here */}
      </View>
    ),
    upcoming: () => (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Upcoming Activities</Text>
        {/* Add your upcoming activities rendering logic here */}
      </View>
    ),
    completed: () => (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Completed Activities</Text>
        {/* Add your completed activities rendering logic here */}
      </View>
    ),
  });

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 300 }} // Adjust based on your design
      />
    </View>
  );
}

// ProfileScreen Component with Logout Button
function ProfileScreen({ userId }) {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId'); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>User ID: {userId}</Text>
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#00BFAE" />
      </View>
    </View>
  );
}

// DiscoverScreen Component
function DiscoverScreen({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/activities?userId=${userId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          console.error('Unexpected data structure:', data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return <Text style={styles.loadingText}>Loading activities...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => navigation.navigate('ActivityDetailsVolunteer', { activityId: item._id, userId })}
          >
            <Image source={{ uri: item.imageUri }} style={styles.activityImage} />
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>{item.name}</Text>
              <Text style={styles.activityDate}>{item.date}</Text>
              <Text style={styles.activityLocation}>{item.location}</Text>
              <Text style={styles.activityDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No activities to display.</Text>}
        contentContainerStyle={activities.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
}

// Tab Navigator for Volunteer Dashboard
const Tab = createBottomTabNavigator();

const DashboardScreenVolunteer = ({ route }) => {
  const { userId } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        children={() => <HomeScreen userId={userId} />} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Discover" 
        children={() => <DiscoverScreen userId={userId} />} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        children={() => <ProfileScreen userId={userId} />} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
          ),
          headerShown: false
        }} 
      />
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    marginLeft: 10,
  },
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  logoutButtonContainer: {
    marginTop: 20,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    elevation: 2,
  },
  activityImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  activityDate: {
    fontSize: 16,
    color: '#888',
  },
  activityLocation: {
    fontSize: 16,
    color: '#888',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
});

export default DashboardScreenVolunteer;
