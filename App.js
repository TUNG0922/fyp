// App.js
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
import EditProfileOrganizationAdmin from './screens/EditProfileOrganizationAdmin';
import ChatActivity from './screens/ChatActivity';
import ViewList from './screens/ViewList';
import ViewChat from './screens/ViewChat';
import Chatbox from './screens/Chatbox'; // Register Chatbox.js
import VolunteerHistory from './screens/VolunteerHistory'; // Register VolunteerHistory.js

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
        }}
      >
        {/* Authentication Screens */}
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

        {/* Dashboard Screens */}
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

        {/* Activity Screens */}
        <Stack.Screen
          name="ActivityDetailsVolunteer"
          component={ActivityDetailsVolunteer}
          options={{
            headerTitle: 'Activity Details',
          }}
        />
        <Stack.Screen
          name="ActivityDetailsScreen"
          component={ActivityDetailsScreen}
          options={{
            headerTitle: 'Activity Details',
          }}
        />

        {/* Notification Screens */}
        <Stack.Screen
          name="NotificationVolunteer"
          component={NotificationVolunteer}
          options={{
            headerTitle: 'Notifications',
          }}
        />

        {/* Profile Screens */}
        <Stack.Screen
          name="EditProfileVolunteer"
          component={EditProfileVolunteer}
          options={{
            headerTitle: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="EditProfileOrganizationAdmin"
          component={EditProfileOrganizationAdmin}
          options={{
            headerTitle: 'Edit Profile',
          }}
        />

        {/* Chat Screens */}
        <Stack.Screen
          name="ChatActivity"
          component={ChatActivity}
          options={{
            headerTitle: 'Chat',
          }}
        />
        <Stack.Screen
          name="ViewChat"
          component={ViewChat}
          options={{
            headerTitle: 'Chat',
          }}
        />
        <Stack.Screen
          name="Chatbox"
          component={Chatbox}
          options={({ route }) => ({
            headerTitle: route.params?.name || 'Chatbox', // Use the name from route.params, default to 'Chatbox'
          })}
        />

        {/* Additional Screens */}
        <Stack.Screen
          name="ViewList"
          component={ViewList}
          options={{
            headerTitle: 'View List',
          }}
        />

        {/* Volunteer History Screen */}
        <Stack.Screen
          name="VolunteerHistory"
          component={VolunteerHistory}
          options={{
            headerTitle: 'Volunteer History',
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
