import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreenVolunteer from './screens/DashboardScreenVolunteer';
import DashboardScreenPlatformAdmin from './screens/DashboardScreenPlatformAdmin';
import DashboardScreenOrganizationAdmin from './screens/DashboardScreenOrganizationAdmin';
import ActivityDetailsVolunteer from './screens/ActivityDetailsVolunteer';
import ActivityDetailsScreen from './screens/ActivityDetailsScreen'; 
import NotificationVolunteer from './screens/NotificationVolunteer'; 
import EditProfileVolunteer from './screens/EditProfileVolunteer'; 
import ChatActivity from './screens/ChatActivity'; // Import the ChatActivity screen
import ViewList from './screens/ViewList';  // Import the new ViewList screen

const Stack = createStackNavigator();

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
        screenOptions={{
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
        }}
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
          name="EditProfileVolunteer"
          component={EditProfileVolunteer}
          options={{ 
            headerTitle: 'Edit Profile',
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
        <Stack.Screen
          name="ChatActivity"  // Add the ChatActivity screen here
          component={ChatActivity}
          options={{
            headerTitle: 'Chat',
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
        <Stack.Screen
          name="ViewList"  // Add the ViewList screen here
          component={ViewList}
          options={{
            headerTitle: 'View List',
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
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
