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
import ActivityDetailsScreen from './screens/ActivityDetailsScreen'; // Import for ActivityDetailsScreen
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();

function NotificationIcon() {
  return (
    <TouchableOpacity onPress={() => console.log('Notification pressed')} style={styles.notificationButton}>
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
            headerRight: () => <NotificationIcon />,
          }}
        />
        <Stack.Screen
          name="DashboardPlatformAdmin"
          component={DashboardScreenPlatformAdmin}
          options={{ 
            headerTitle: () => <LogoTitle />,
            headerRight: () => <NotificationIcon />,
          }}
        />
        <Stack.Screen
          name="DashboardOrganizationAdmin"
          component={DashboardScreenOrganizationAdmin}
          options={{ 
            headerTitle: () => <LogoTitle />,
            headerRight: () => <NotificationIcon />,
          }}
        />
        <Stack.Screen
          name="ActivityDetailsVolunteer"
          component={ActivityDetailsVolunteer}
          options={{ 
            headerTitle: 'Activity Details',
            headerRight: () => <NotificationIcon />,
            headerLeft: () => null, // Ensures the back button is removed
          }}
        />
        <Stack.Screen
          name="ActivityDetailsScreen"
          component={ActivityDetailsScreen} // Added for organization admin
          options={{ 
            headerTitle: 'Activity Details',
            headerRight: () => <NotificationIcon />,
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
