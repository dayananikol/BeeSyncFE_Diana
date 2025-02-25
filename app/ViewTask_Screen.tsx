//The userID is used to fetch the user's information and 
// tasks from the API.

// this file errors (aside from the userID ) because the API linked here is just a placeholder.

// remove the example data, uncomment the fetch function (need a major fix since im not sure if this really works)

import React, { useLayoutEffect, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import SpecificTask from "../components/SpecificTask";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

type RouteParams = {
  userId: number;
};

const ViewTask_Screen  = () => {
  const [fontsLoaded] = useFonts({
    myCustomFont: require("../assets/fonts/WorkSans-Regular.ttf"),
  });

  // if (!fontsLoaded) return null; // Prevent rendering until fonts are loaded

  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>(); 
  const { userId } = route.params || { userId: null }; // Add default value

  // const id = userId;

  console.log('userId:', userId);

  const [user, setUser] = useState<{ user_name: string; img_path: string } | null>(null);
  const [tasks, setTasks] = useState<{ title: string; due_time: string, img_path:string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const fetchUserDetails = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');

      if (!jwtToken) {
        Alert.alert('Error', 'No JWT token found. Please log in again.');
        return;
      }

      const userResponse = await fetch(`http://192.168.1.33:8080/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const userData = await userResponse.json();
      console.log('User data: ', userData);

      // Extract only the necessary fields
      const { user_name, img_path } = userData;
      setUser({ user_name, img_path });
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details.');
    }
  };

  const fetchTasks = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');

      if (!jwtToken) {
        Alert.alert('Error', 'No JWT token found. Please log in again.');
        return;
      }

      const tasksResponse = await fetch(`http://192.168.1.33:8080/tasks/get_byUserId/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!tasksResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const tasksData = await tasksResponse.json();
      console.log(tasksData);

      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchTasks();
  }, [userId]);

  const handleClosePress = () => {
    router.push('/AllTask_Screen');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: "#FFefa4" },
      headerTitleStyle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#61646b",
        paddingTop: 20,
      },
      headerTitleAlign: "center",
      headerTitle: "Task",
      headerLeft: () => (
        <TouchableOpacity onPress={handleClosePress} style={{ paddingLeft: 20 }}>
          <Image
            source={require("../assets/images/closeBtn.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#FFD100" />
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  // if (error) {
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>{error}</Text>
  //     </View>
  //   );
  // }

  const defaultImageUrl = 'http://192.168.1.33/uploads/defaultImg.png';
  const userImageUrl = user && user.img_path ? `http://192.168.1.33/uploads/${user.img_path}` : defaultImageUrl;
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Image source={require("../assets/images/bee-pattern-bg.png")} style={styles.bgImage} />
        <ScrollView>
          <View style={styles.profileContainer}>
            {user && (
              <> 
                <Image source={{ uri: userImageUrl }} style={styles.profileImage} />
                <Text style={styles.profileName}>{user.user_name}</Text>
              </>
            )}
          </View>
          <View style={styles.memberTaskContainer}>
            <Text style={styles.currentActiveTaskText}>Current Active Task</Text>
          </View>
        
            {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <SpecificTask key={index} task={task} />
            ))
            ) : (
            <Text style={styles.noTasksText}>No tasks available</Text>
            )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: "100%", 
    backgroundColor: "#fffcf0" 
  },
  profileContainer: {
    margin: 15,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.5,
    zIndex: -1,
    backgroundColor: "#fffcf0",
  },
  profileImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    borderWidth:2, 
    borderColor:'black' 
  },
  profileName: { 
    fontFamily: "myCustomFont", 
    fontWeight: "bold", 
    fontSize: 20, 
    color: "#61646b" 
  },
  memberTaskContainer: { 
    paddingHorizontal: 15 
  },
  currentActiveTaskText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 19,
    color: "#61646b",
    paddingBottom: 10,
  },
  noTasksText: {
    fontFamily: "myCustomFont",
    fontSize: 16,
    color: "#61646b",
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default ViewTask_Screen;