//The userID is used to fetch the user's information and 
// tasks from the API.

// this file errors (aside from the userID ) because the API linked here is just a placeholder.

// remove the example data, uncomment the fetch function (need a major fix since im not sure if this really works)

import React, { useLayoutEffect, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import SpecificTask from "../components/SpecificTask";

const ViewTask_Screen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    myCustomFont: require("../assets/fonts/WorkSans-Regular.ttf"),
  });

  // if (!fontsLoaded) return null; // Prevent rendering until fonts are loaded

  const navigation = useNavigation();
  const route = useRoute();
  // const { userId } = route.params || { userId: null }; // Add default value

  const [user, setUser] = useState<{ name: string; profileImage: string } | null>(null);
  const [tasks, setTasks] = useState<{ title: string; dueTime: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if (!userId) {
    //   setError('User ID is missing.');
    //   setIsLoading(false);
    //   return;
    // }

    const fetchUserData = async () => {
      // try {
      //   const userResponse = await fetch(`https://your-api-endpoint.com/users/${userId}`);
      //   if (!userResponse.ok) {
      //     throw new Error('Network response was not ok');
      //   }
      //   const userData = await userResponse.json();
      //   setUser(userData);

      //   const tasksResponse = await fetch(`https://your-api-endpoint.com/tasks?userId=${userId}`);
      //   if (!tasksResponse.ok) {
      //     throw new Error('Network response was not ok');
      //   }
      //   const tasksData = await tasksResponse.json();

        // Example data
        const exampleTasks = [
          { title: "Example Task 1", dueTime: "10:00 AM" },
          { title: "Example Task 2", dueTime: "02:00 PM" },
          { title: "Example Task 3", dueTime: "04:00 PM" },
          { title: "Example Task 1", dueTime: "10:00 AM" },
          { title: "Example Task 2", dueTime: "02:00 PM" },
          { title: "Example Task 3", dueTime: "04:00 PM" },
          { title: "Example Task 1", dueTime: "10:00 AM" },
          { title: "Example Task 2", dueTime: "02:00 PM" },
          { title: "Example Task 3", dueTime: "04:00 PM" },
        ];

        // Combine fetched data with example data
        // const combinedTasks = [...tasksData, ...exampleTasks];
        // setTasks(combinedTasks);
        // setTasks(taskData);
        setTasks(exampleTasks);
  //     } catch (error) {
  //       setError('Error fetching data. Please try again later.');
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
    };

    fetchUserData();
  // }, [userId]);
      }, []);

  const handleClosePress = () => {
    navigation.goBack();
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Image source={require("../assets/images/bee-pattern-bg.png")} style={styles.bgImage} />
        <ScrollView>
          <View style={styles.profileContainer}>
            {user && (
              <>
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                <Text style={styles.profileName}>{user.name}</Text>
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