import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationPlatformAdmin({ route }) {
  const { userId, name, role } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Admin Notifications</Text>
      <Text>User ID: {userId}</Text>
      <Text>Name: {name}</Text>
      <Text>Role: {role}</Text>
      {/* Add the logic to fetch and display platform admin-specific notifications */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
