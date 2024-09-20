import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import ActivityDetailsVolunteer from './ActivityDetailsVolunteer'; 
import { TabView, SceneMap } from 'react-native-tab-view';

// HomeScreen Component with Tabs
function HomeScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'pending', title: 'Pending' },
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'completed', title: 'Completed' },
  ]);

  const renderScene = SceneMap({
    pending: () => <Text style={styles.tabContent}></Text>,
    upcoming: () => <Text style={styles.tabContent}></Text>,
    completed: () => <Text style={styles.tabContent}></Text>,
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
function ProfileScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); 
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
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#00BFAE" />
      </View>
    </View>
  );
}

// DiscoverScreen Component
function DiscoverScreen() {
  const [activities, setActivities] = useState([]);
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
      }
    };

    fetchActivities();
  }, []);

  const handlePress = (activity) => {
    navigation.navigate('ActivityDetailsVolunteer', { activity });
  };

  const renderActivity = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.activityItem}>
      <Image source={{ uri: item.imageUri }} style={styles.activityImage} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityLocation}>{item.location}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={activities}
      renderItem={renderActivity}
      keyExtractor={(item) => item._id.toString()}
      contentContainerStyle={styles.activityList}
    />
  );
}

// Tab Navigator
const Tab = createBottomTabNavigator();
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Discover"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Discover') {
            iconName = 'compass';
          } else if (route.name === 'Profile') {
            iconName = 'user';
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// Main Dashboard Screen with Stack Navigator
const Stack = createStackNavigator();
function DashboardScreenVolunteer() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActivityDetailsVolunteer"
        component={ActivityDetailsVolunteer}
        options={{
          title: 'Activity Details',
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#333',
  },
  activityList: {
    padding: 15,
  },
  activityItem: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  activityImage: {
    width: 100,
    height: 100,
  },
  activityInfo: {
    padding: 10,
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
  },
  activityDate: {
    fontSize: 14,
    color: '#888',
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    padding: 20,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
  },
});

export default DashboardScreenVolunteer;