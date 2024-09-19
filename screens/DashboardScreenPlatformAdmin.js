import React from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// HomeScreen Component
function HomeScreen() {
  return (
    <View style={styles.screen}>
    </View>
  );
}

// DiscoverScreen Component
function DiscoverScreen() {
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/activities');
        const data = await response.json();
        if (response.ok) {
          setActivities(data.activities); // Ensure this matches the structure of your response
        } else {
          console.error('Error fetching activities:', data.message);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const handlePress = (activity) => {
    // Handle activity press
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

// ProfileScreen Component with Logout Button
function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('SignIn'); // Ensure this matches your sign-in screen name
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.logoutButtonContainer}>
        <Button title="Log Out" onPress={handleLogout} color="#00BFAE" />
      </View>
    </View>
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}

// DashboardScreenPlatformAdmin Component
function DashboardScreenPlatformAdmin() {
  return <TabNavigator />;
}

// Styles
const styles = StyleSheet.create({
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
});

export default DashboardScreenPlatformAdmin;