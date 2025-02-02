import React, { useLayoutEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from "expo-font";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';


type RouteParams = {
  userProfileImage: string | null;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
};

const EditUserProfile_Screen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { userProfileImage, username, firstName, lastName, emailAddress } = route.params;

  const [updatedUserProfileImage, setUpdatedUserProfileImage] = useState<string | null>(userProfileImage || null);
  const [updatedUsername, setUpdatedUsername] = useState<string>(username || ''); 
  const [updatedFirstName, setUpdatedFirstName] = useState<string>(firstName || ''); 
  const [updatedLastName, setUpdatedLastName] = useState<string>(lastName || ''); 
  const [updatedEmailAddress, setUpdatedEmailAddress] = useState<string>(emailAddress || ''); 

  useFonts({ myCustomFont: require("../assets/fonts/WorkSans-Regular.ttf") });
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
              router.push('/DisplayUserProfile_Screen'); // Navigate to the desired page
              resetInfoForm();
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
        headerTitle: "User Profile",
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
    
  const resetInfoForm = () => {
    setUpdatedUserProfileImage(userProfileImage);
    setUpdatedUsername(username);
    setUpdatedFirstName(firstName);
    setUpdatedLastName(lastName);
    setUpdatedEmailAddress(emailAddress);
  };


  useFocusEffect(
    React.useCallback(() => {
      setUpdatedUserProfileImage(userProfileImage);
      setUpdatedUsername(username);
      setUpdatedFirstName(firstName);
      setUpdatedLastName(lastName);
      setUpdatedEmailAddress(emailAddress);
    }, [userProfileImage, username, firstName, lastName, emailAddress])
  );

  const uploadImage = async (uri: string) => {
    const apiUrl = 'http://192.168.1.33:8080/file/upload';
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
  
    // Read the file into a blob
    const file = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: `${updatedUsername}.${fileType}`,
      type: `image/${fileType}`,
      data: `data:image/${fileType};base64,${file}`,
    } as any);
  
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert('Error', 'No JWT token found. Please log in again.');
        return null;
      }
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
  
      const responseText = await response.text();
      console.log('Raw Response:', responseText);
  
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          const fileName = data.fileName;
          return fileName;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Failed to parse JSON response: ${error.message}`);
          } else {
            throw new Error('Failed to parse JSON response');
          }
        }
      } else {
        throw new Error(`Failed to upload image: ${responseText}`);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  };

const handleSaveChanges = async () => {
  let imagePath = userProfileImage;
  if (updatedUserProfileImage !== userProfileImage) {
    if (updatedUserProfileImage) {
      imagePath = await uploadImage(updatedUserProfileImage);
    }
  }

  const updatedUserData = {
    img_path: imagePath,
    first_name: updatedFirstName,
    last_name: updatedLastName,
    user_name: updatedUsername,
    user_email: updatedEmailAddress,
  };

  console.log("Updated user data: " + updatedUserData);


  try {

    const jwtToken = await AsyncStorage.getItem('jwtToken');

    if (!jwtToken) {
      Alert.alert('Error', 'No JWT token found. Please log in again.');
      return;
    }

    const response = await fetch('http://192.168.1.33:8080/users/profile/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(updatedUserData),
    });

    if (response.ok) {
      Alert.alert('Success', 'Profile updated successfully.');
      router.push('/DisplayUserProfile_Screen')

      //Use the router to navigate and pass parameters via the URL
      router.replace({
        pathname: '/DisplayUserProfile_Screen',
        params: {
          userProfileImage: updatedUserProfileImage,
          username: updatedUsername,
          firstName: updatedFirstName,
          lastName: updatedLastName,
          emailAddress: updatedEmailAddress,
        },
      });
    } else {
      Alert.alert('Error', 'Failed to update profile.');
    }
  } catch (error) {
    Alert.alert('Error', `An error occurred: ${(error as any).message}`);
  }
};


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Image source={require("../assets/images/bee-pattern-bg.png")} style={styles.bgImage} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.profileContainer}>
            <Text style={styles.userProfileText}>Edit User Profile</Text>
            <View style={styles.topProfile}>
              <ProfilePictureUploader imageUri={updatedUserProfileImage} setImageUri={setUpdatedUserProfileImage} size={70} iconSize={25} shape='circle' />
              <TextInput 
                style={styles.profileNameText}
                onChangeText={setUpdatedUsername}
                value={updatedUsername}
                editable={false}
                multiline={true}
                numberOfLines={4}
              />
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userLabels}>Username</Text>
              <TextInput
                style={styles.EditProfileInfoValue}
                onChangeText={setUpdatedUsername}
                value={updatedUsername}
                editable={true}
                multiline={true}
                numberOfLines={4}
                maxLength={255}
              />
              <Text style={styles.userLabels}>First Name</Text>
              <TextInput
                style={styles.EditProfileInfoValue}
                onChangeText={setUpdatedFirstName}
                value={updatedFirstName}
                multiline={true}
                numberOfLines={4}
                maxLength={255}
              />
              <Text style={styles.userLabels}>Last Name</Text>
              <TextInput
                style={styles.EditProfileInfoValue}
                onChangeText={setUpdatedLastName}
                value={updatedLastName}
                multiline={true}
                numberOfLines={4}
                maxLength={255}
              />
              <Text style={styles.userLabels}>Email Address</Text>
              <TextInput
                style={styles.EditProfileInfoValue}
                onChangeText={setUpdatedEmailAddress}
                value={updatedEmailAddress}
                multiline={true}
                numberOfLines={4}
                maxLength={255}
              />
            </View>
            <TouchableOpacity style={styles.saveChangesBtn} onPress={handleSaveChanges}>
              <Text style={styles.saveChangesText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%", 
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  scrollView: {
    flexGrow: 1,
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
  profileContainer: {
    alignSelf: 'center',
    marginHorizontal: 15,
    marginTop: 40,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: 'white',
    width: '90%',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#AFB1B6',
    padding: 20,
  },
  userProfileText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 24,
    color: "#61646b",
    textAlign: 'left',
  },
  topProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15, 
    gap: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: 'black',
  },
  profileNameText: {
    fontFamily: "myCustomFont",
    fontWeight: "regular",
    fontSize: 17,
    color: "#61646b",
    textAlign: 'left',
    width: '70%',
  }, 
  editUserProfileBtn: {
    backgroundColor: '#FFDB36',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: 'black', 
    shadowOffset: { width: 0, height: 5 }, // Only apply shadow to the bottom
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Shadow for Android
  },
  editUserProfileText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 13,
    color: "white",
    textAlign: 'center',
  },
  userInfoContainer: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#EFEFEF',
    width: '100%',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  userLabels: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 17,
    color: "#61646b",
    textAlign: 'left',
  },
  EditProfileInfoValue: {
    fontFamily: "myCustomFont",
    fontSize: 16,
    color: "#61646b",
    marginBottom: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  saveChangesBtn: {
    backgroundColor: '#FFDB36',
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 150,
    borderRadius: 10,
    shadowColor: 'black', 
    shadowOffset: { width: 0, height: 5 }, // Only apply shadow to the bottom
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Shadow for Android
    marginTop: 20,
    alignSelf: 'center',
  },
  saveChangesText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 13,
    color: "white",
    textAlign: 'center',
  },
});

export default EditUserProfile_Screen;