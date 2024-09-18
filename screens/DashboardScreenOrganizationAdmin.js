import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert, FlatList, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

// HomeScreen component
const HomeScreen = () => (
  <View style={styles.screenContainer}>
    {/* Add any content or components for the HomeScreen here */}
  </View>
);

// DiscoverScreen component with form functionality
const DiscoverScreen = ({ navigation }) => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [activities, setActivities] = useState([]);

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
        <Text style={styles.activityDescription}>{item.description}</Text>
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
const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Implement your logout logic here
    // For example, clearing user session or navigating to the login screen
    navigation.navigate('SignIn'); // Assuming you have a 'LoginScreen' defined in your navigator
  };

  return (
    <View style={styles.screenContainer}>
      {/* Add any content or components for the ProfileScreen here */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const DashboardScreenOrganizationAdmin = () => {
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
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
    margin: 20,
  },
  formContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    backgroundColor: '#547DBE',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    marginLeft: 10,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#00BFAE',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  activityImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  activityDetails: {
    flex: 1,
    marginLeft: 10,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityLocation: {
    fontSize: 14,
    color: '#888',
  },
  activityDate: {
    fontSize: 14,
    color: '#888',
  },
  activityDescription: {
    fontSize: 14,
    color: '#333',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF6347', // Or any color that fits your design
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreenOrganizationAdmin;
