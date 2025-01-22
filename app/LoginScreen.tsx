// temporary login screen, just to test the token

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = async () => {

    const login = {
        user_name: username,
        user_password: password
    }

    try {
      const response = await fetch('http://192.168.1.33:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(login),
      });

      if (response.ok) {
        const data = await response.json();
        const jwtToken = data.token; // Assuming the token is returned in the response

        // Store the JWT token in AsyncStorage
        await AsyncStorage.setItem('jwtToken', jwtToken);

        Alert.alert('Success', 'Logged in successfully!');
        // Navigate to the desired screen
      } else {
        const errorText = await response.text();
        // console.error('Error response:', response.status, errorText);
        Alert.alert('Error', `Failed to log in: ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while logging in.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLoginPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;