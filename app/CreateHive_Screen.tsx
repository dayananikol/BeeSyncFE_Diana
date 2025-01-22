//disclaimer: this have its own font, header, and set background image. when merging, just extract 
// the main parts (components) of the page 

import React, { useLayoutEffect, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { router } from "expo-router";

const CreateHive_Screen: React.FC = () => {
  const [hiveProfileImage, setHiveProfileImage] = useState<string | null>(null);
  const [hiveName, setHiveName] = useState<string>('');
  const [fontsLoaded] = useFonts({myCustomFont: require("../assets/fonts/WorkSans-Regular.ttf"),});

  // if (!fontsLoaded) return null; // Prevent rendering until fonts are loaded

  const navigation = useNavigation();

  const handleBackPress = () => {
    Alert.alert(
          'Are you sure?',
          'You have unsaved changes. Are you sure you want to leave?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                resetForm();
                router.push('/CalendarView');
              },
            },
          ],
          { cancelable: true }
        );
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
      headerTitle: "Create Hive",
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress} style={{ paddingLeft: 20 }}>
          <Image
            source={require("../assets/images/backBtn.png")}
            style={{ width: 20, height: 33 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

const handleCreateHivePress = async () => {
  if (!hiveName) {Alert.alert("Hive Name Required", "Please enter a hive name.");
      return;
  } 
        
  // const hiveData = {hiveName, hiveProfileImage};
  const hiveData = {
    hiveName,
    // hiveProfileImage 
  };

    try {
      const response = await fetch('http://192.168.1.33:8080/hive/createHive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hiveData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Hive created successfully',
            [
                {
                  text: "OK",
                  onPress: () => {
                    resetForm();
                    router.push('/ViewTask_Screen'); //should change to main menu screen
                  }
                }
              ]
        );
      } else {
        Alert.alert('Error', 'Failed to create hive' );
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred: ${(error as any).message}`);
    }
  }; 


  const resetForm = () => {
    setHiveName('');
    setHiveProfileImage(null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>

        <Image source={require("../assets/images/bee-pattern-bg.png")} style={styles.bgImage} />
        
        <View style={styles.profileContainer}>
          <ProfilePictureUploader imageUri={hiveProfileImage} setImageUri={setHiveProfileImage} size={150} iconSize={40} shape = 'square' />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.hiveName}>Set your Hive name</Text>
          <TextInput
            style={styles.hivenameInput}
            value={hiveName}
            onChangeText={setHiveName}
            placeholder="Enter hive name"
            placeholderTextColor="#999"
          />
        <TouchableOpacity style={styles.createHiveBtn} activeOpacity={0.6} onPress={handleCreateHivePress}>
            <Text style={styles.createHiveText}>Done</Text>
        </TouchableOpacity>
        </View>

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: "100%", 
    backgroundColor: "#fffcf0",
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
  },
  profileContainer: {
    marginHorizontal: 15,
    marginTop: -100,
    flexDirection: "row",
    justifyContent: "center", // Center the profile picture uploader
    alignItems: "center",
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
  inputContainer: {
    width: '80%',
    gap:15,
  },
  hiveName: { 
    fontFamily: "myCustomFont", 
    fontWeight: "regular", 
    fontSize: 20, 
    color: "#61646b",
    textAlign:'left',
    marginBottom: -10,
  },
  hivenameInput: {
    height: 50,
    width: '100%', // Take the full width of the container
    borderColor: '#61646b',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'white',
  },
  createHiveBtn:{
    borderWidth:1,
    borderRadius:20,
    borderColor:'#AFB1B6',
    backgroundColor:'#ffdb36',
    marginHorizontal:'10%',
    marginVertical:20,
    shadowColor: 'black', 
    elevation: 6, 
    height:60,
    justifyContent:'center',
  },
  createHiveText:{
    paddingVertical:10,
    textAlign:'center',
    fontFamily:'myCustomFont',
    fontWeight:'bold',
    fontSize:20,
    color:'white',
  },
});

export default CreateHive_Screen;