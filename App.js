import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreenVolunteer from './screens/DashboardScreenVolunteer';
import DashboardScreenPlatformAdmin from './screens/DashboardScreenPlatformAdmin';
import DashboardScreenOrganizationAdmin from './screens/DashboardScreenOrganizationAdmin';
import ActivityDetailsVolunteer from './screens/ActivityDetailsVolunteer';
import ActivityDetailsScreen from './screens/ActivityDetailsScreen'; // For ActivityDetailsScreen
import NotificationVolunteer from './screens/NotificationVolunteer'; // For NotificationVolunteer
import EditProfileVolunteer from './screens/EditProfileVolunteer'; // Importing the EditProfileVolunteer
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();

function NotificationIcon({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('NotificationVolunteer')}
      style={styles.notificationButton}
    >
      <Icon name="bell" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('./assets/Community.png')}
        style={styles.logoImage}
      />
      <Text style={styles.logoText}>VolunteerLinks</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: '#547DBE',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => null, // Removes the back button
          headerRight: () => <NotificationIcon navigation={navigation} />,
        })}
      >
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DashboardVolunteer"
          component={DashboardScreenVolunteer}
          options={{ 
            headerTitle: () => <LogoTitle />,
          }}
        />
        <Stack.Screen
          name="DashboardPlatformAdmin"
          component={DashboardScreenPlatformAdmin}
          options={{ 
            headerTitle: () => <LogoTitle />,
          }}
        />
        <Stack.Screen
          name="DashboardOrganizationAdmin"
          component={DashboardScreenOrganizationAdmin}
          options={{ 
            headerTitle: () => <LogoTitle />,
          }}
        />
        <Stack.Screen
          name="ActivityDetailsVolunteer"
          component={ActivityDetailsVolunteer}
          options={{ 
            headerTitle: 'Activity Details',
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
        <Stack.Screen
          name="ActivityDetailsScreen"
          component={ActivityDetailsScreen}
          options={{ 
            headerTitle: 'Activity Details',
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
        <Stack.Screen
          name="NotificationVolunteer"
          component={NotificationVolunteer}
          options={{ 
            headerTitle: 'Notifications',
          }}
        />
        <Stack.Screen
          name="EditProfileVolunteer" // Register the EditProfileVolunteer screen
          component={EditProfileVolunteer}
          options={{ 
            headerTitle: 'Edit Profile',
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
