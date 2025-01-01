import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Volunteer');
  const [interest, setInterest] = useState('');
  const [strength, setStrength] = useState('');
  const [previousExperiences, setPreviousExperiences] = useState('');
  const strengthOptions = [
    { id: 'Empathy', name: 'Empathy' },
    { id: 'Adaptability', name: 'Adaptability' },
    { id: 'Leadership', name: 'Leadership' },
    { id: 'Conflict Resolution', name: 'Conflict Resolution' },
    { id: 'Problem-Solving', name: 'Problem-Solving' },
    { id: 'Public Speaking', name: 'Public Speaking' },
    { id: 'Time Management', name: 'Time Management' },
    { id: 'Others', name: 'Others' },
  ];

  const handleStrengthChange = (selectedItems) => {
    if (selectedItems.length > 3) {
      Alert.alert('Limit Exceeded', 'You can only select up to 3 strengths.');
      return;
    }
    setStrength(selectedItems);
  };

  const handleInterestChange = (selectedItems) => {
    if (selectedItems.length > 3) {
      Alert.alert('Limit Exceeded', 'You can only select up to 3 interests.');
      return;
    }
    setInterest(selectedItems);
  };

  const handleSignUp = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role, 
          interest: role === 'Volunteer' ? interest : undefined,
          strength: Array.isArray(strength) ? strength : [strength],
          previous_experiences: previousExperiences || ''
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.message === 'User registered successfully') {
        Alert.alert('Success', 'Registration successful!');
        navigation.navigate('SignIn');
      } else {
        Alert.alert('Sign-up failed', data.message);
      }
    } catch (error) {
      Alert.alert('Sign-up Error', 'There was a problem with registration.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.headerText}>Create your account</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Volunteer" value="Volunteer" />
                <Picker.Item label="Organization Admin" value="Organization Admin" />
              </Picker>
            </View>
          </View>

          {role === 'Volunteer' && (
            <>
              <View style={styles.inputSection}>
                <Text style={styles.label}>Interest</Text>
                <MultiSelect
                  items={[
                    { id: 'Community Service', name: 'Community Service' },
                    { id: 'Education', name: 'Education' },
                    { id: 'Health Support', name: 'Health Support' },
                    { id: 'Environmental Conservation', name: 'Environmental Conservation' },
                    { id: 'Animal Welfare', name: 'Animal Welfare' },
                    { id: 'Disaster Relief', name: 'Disaster Relief' },
                    { id: 'Climate Action', name: 'Climate Action' },
                    { id: 'Others', name: 'Others' },
                  ]}
                  uniqueKey="id"
                  onSelectedItemsChange={handleInterestChange}
                  selectedItems={interest}
                  selectText="Pick your interests"
                  searchInputPlaceholderText="Search interests..."
                  tagRemoveIconColor="#CCC"
                  tagBorderColor="#CCC"
                  tagTextColor="#333"
                  selectedItemTextColor="#547DBE"
                  selectedItemIconColor="#547DBE"
                  itemTextColor="#000"
                  displayKey="name"
                  searchInputStyle={{ color: '#CCC' }}
                  hideSubmitButton
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>Strength</Text>
                <MultiSelect
                  items={strengthOptions}
                  uniqueKey="id"
                  onSelectedItemsChange={handleStrengthChange}
                  selectedItems={strength}
                  selectText="Pick your strengths"
                  searchInputPlaceholderText="Search strengths..."
                  tagRemoveIconColor="#CCC"
                  tagBorderColor="#CCC"
                  tagTextColor="#333"
                  selectedItemTextColor="#547DBE"
                  selectedItemIconColor="#547DBE"
                  itemTextColor="#000"
                  displayKey="name"
                  searchInputStyle={{ color: '#CCC' }}
                  hideSubmitButton
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>Previous Experiences</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your previous experiences"
                  value={previousExperiences}
                  onChangeText={setPreviousExperiences}
                />
              </View>
            </>
          )}

          <Button title="Sign Up" onPress={handleSignUp} color="#547DBE" />

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}> SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 30, // Add padding to push everything down
    backgroundColor: '#F5F5F5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30, // Space below the text
    marginTop: 50, // Add space above the header text to move it downward
    color: '#333',
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8, // Slightly increase margin for more spacing
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16, // Increase bottom margin
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16, // Increase bottom margin
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 60,
  },
  picker: {
    height: '100%',
    width: '100%',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24, // Push Sign-In text further down
  },
  signInText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  signInLink: {
    fontSize: 16,
    color: '#00BFAE',
    fontWeight: 'bold',
  },
  multiSelect: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 60,
    paddingHorizontal: 8,
    marginBottom: 16, // Consistent spacing
  },
});

export default SignUpScreen;
