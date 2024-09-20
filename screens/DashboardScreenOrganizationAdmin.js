import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert, FlatList, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

// HomeScreen component
const HomeScreen = ({ route }) => {
  const { username, userId } = route.params;

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Welcome, {username}!</Text>
      <Text style={styles.screenText}>Your User ID: {userId}</Text>
      {/* Add any additional content or components for the HomeScreen here */}
    </View>
  );
};

// DiscoverScreen component with form functionality
const DiscoverScreen = ({ route, navigation }) => {
  const { username, userId } = route.params;
  const [isFormVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [activities, setActivities] = useState([]);
  // Now you can use username and userId in your DiscoverScreen
  console.log('Username:', username);
  console.log('User ID:', userId);

  useEffect(() => {
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

    fetchActivities();
  }, []);

  const handleAddButtonPress = () => {
    setFormVisible(true);
  };

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

  const handleCancelButtonPress = () => {
    setFormVisible(false);
    setName('');
    setLocation('');
    setDate('');
    setDescription('');
    setImageUri(null);
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting data:', { name, location, date, description, imageUri });
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
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        Alert.alert('Success', 'Activity added successfully');
        handleCancelButtonPress();
        fetchActivities();
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => navigation.navigate('ActivityDetailsScreen', { activity: item })} // Navigates to ActivityDetailsScreen with activity data
    >
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.activityImage} />}
      <View style={styles.activityDetails}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityLocation}>{item.location}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
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
        <View style={styles.formContainer}>
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
            <Button title="Submit" onPress={handleSubmit} />
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelButtonPress}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isFormVisible && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
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
    // For example, clearing user session or navigating to the login screen
    navigation.navigate('SignIn'); // Assuming you have a 'LoginScreen' defined in your navigator
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Name: {username}</Text>
      <Text style={styles.screenText}>User ID: {userId}</Text>
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
        initialParams={{ username, userId }} // Passing username and userId to DiscoverScreen
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
        initialParams={{ username, userId, password, email, role }} // Passing all params to ProfileScreen
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    margin: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#00BFAE',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  imagePickerButton: {
    backgroundColor: '#00BFAE',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#999',
  },
  cancelButton: {
    backgroundColor: '#f44',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreenOrganizationAdmin;
