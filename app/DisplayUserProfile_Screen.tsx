import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { ToastAndroid, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from "expo-font";
import { router } from "expo-router";
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from "date-fns";



const DisplayUserProfile_Screen: React.FC = () => {
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(''); 
  const [firstName, setFirstName] = useState<string>(''); 
  const [lastName, setLastName] = useState<string>(''); 
  const [emailAddress, setEmailAddress] = useState<string>(''); 
  const [password, setPassword] = useState<string>(''); 
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isRecoveryCodeModalVisible, setIsRecoveryCodeModalVisible] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [storedRecoveryCode, setStoredRecoveryCode] = useState('');
  const [isRecoveryCodeVisible, setIsRecoveryCodeVisible] = useState(false);
  const [isPasswordBeforeRecoveryCodeVisible, setIsPasswordBeforeRecoveryCodeVisible] = useState(false);
  const [modalPassword, setModalPassword] = useState<string>(''); 

  const [fontsLoaded] = useFonts({ myCustomFont: require("../assets/fonts/WorkSans-Regular.ttf") });
  const navigation = useNavigation();

  const handleBackPress = () => {
    router.push('/CalendarView'); // change to main menu screen
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

  //for display  of user profile
  const fetchUserProfile = async () => {
    try {

      const jwtToken = await AsyncStorage.getItem('jwtToken');

      if (!jwtToken) {
        Alert.alert('Error', 'No JWT token found. Please log in again.');
        return;
      }

      const response = await fetch('http://192.168.1.33:8080/users/profile', {
            headers: {
              'Authorization': `Bearer ${jwtToken}`
            }
          });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const userData = await response.json();

      const defaultImageUrl = 'http://192.168.1.33/uploads/defaultImg.png';
      const userImageUrl = userData && userData.img_path ? `http://192.168.1.33/uploads/${userData.img_path}` : defaultImageUrl;

      console.log('User Data:', userData);
      setUserProfileImage(userImageUrl);
      setUsername(userData.user_name);
      setFirstName(userData.first_name);
      setLastName(userData.last_name);
      setEmailAddress(userData.user_email);
      setPassword(userData.user_password);
      setStoredRecoveryCode(userData.recovery_code); 
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user profile data.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  // to pass the data to edit user profile screen
  const editUserProfilePress = async () => {
    router.push({
      pathname: '/EditUserProfile_Screen',
      params: {
        userProfileImage,
        username,
        firstName,
        lastName,
        emailAddress,
      },
    });
  };

  const resetPassForm = () => {
    setCurrentPassword(''),
    setNewPassword(''),
    setConfirmPassword('')
    // setPassword('')
  };

  const resetVerifyRecoveryCodeForm = () => {
    setRecoveryCode('');
  };

  const resetModalPassword = () => {
    setModalPassword('');
  }

  const handleSeeRecoveryCode = () =>{
    setIsPasswordBeforeRecoveryCodeVisible(true);
    // setIsRecoveryCodeVisible(false);
  }

  // Password before recovery code
  const handlePasswordBeforeRecoveryCode = async () => {

    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    else if(modalPassword !== password){
      Alert.alert('Error', 'Invalid Password');
      return;
    } else {
      setIsRecoveryCodeVisible(true);
      setIsPasswordBeforeRecoveryCodeVisible(false);
      resetModalPassword();
    }
    
  }

  const handleChangePasswordPress = () => {
    setIsRecoveryCodeModalVisible(true);
  };


  // verify code first
  const handleVerifyRecoveryCode = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
  
      if (!recoveryCode) {
        Alert.alert('Error', 'Please enter the recovery code.');
        return;
      }
  
      const response = await fetch('http://192.168.1.33:8080/auth/verify-recovery-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ recovery_code: recoveryCode }),
      });
  
      const responseText = await response.text();
  
      if (response.ok) {
        Alert.alert('Verification Successful', 'You may now change your password.', [
          {
            text: 'OK',
            onPress: () => {
              setIsRecoveryCodeModalVisible(false);
              setIsChangePasswordModalVisible(true);
              resetVerifyRecoveryCodeForm();
            },
          },
        ]);
      } else {
        Alert.alert('Error', responseText || 'Invalid recovery code.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while verifying the recovery code.');
    }
  };
  



  // save password func
  const handleSavePassword = async () => {
    if (!currentPassword) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please type in your current password.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Please type in your current password.');
      }
      return;
    } else if (!newPassword) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please enter your new password.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Please enter your new password.');
      }
      return;
    } else if (!confirmPassword) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please confirm your new password.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Please confirm your new password.');
      }
      return;
    } else if (currentPassword === newPassword) {
      if (Platform.OS === 'android') {
        ToastAndroid.show("You can't use your current password.", ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', "You can't use your current password.");
      }
      return;
  
      
    } else if (newPassword !== confirmPassword) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Passwords do not match.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Passwords do not match.');
      }
      return;
    }

    const passwordData = {
      currentPassword: currentPassword,
      newPassword: newPassword
    }

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      
      console.log('Task data being sent:', passwordData);
      const response = await fetch('http://192.168.1.33:8080/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        Alert.alert('Success', ' Sucessfully Change Password!');
        setIsChangePasswordModalVisible(false); // change to main menu screen
        resetPassForm();
      } else {
        const errorMessage = await response.text(); // Get backend error message if available
        Alert.alert('Error', `Failed to change password: ${errorMessage}`);
        // resetPassForm();
      }
    } catch (error) {
      Alert.alert('Error', `An error occured: ${(error as any).message}`);
  }
  };


  
  const handleCancelChangePassword = () => {
    setIsChangePasswordModalVisible(false);
    resetPassForm()
  };

  const handleCancelVerifyRecoveryCode = () => {
    setIsRecoveryCodeModalVisible(false);
    resetVerifyRecoveryCodeForm()
  };

  const handleBackRecoveryCode = () =>{
    setIsRecoveryCodeVisible(false);
  }

  const handleCancelPasswordInput = () =>{
    setIsPasswordBeforeRecoveryCodeVisible(false);
    resetModalPassword();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Image source={require("../assets/images/bee-pattern-bg.png")} style={styles.bgImage} />
        <ScrollView style={styles.scrollview}>
          <View style={styles.profileContainer}>
            <Text style={styles.userProfileText}>User Profile</Text>
            <TouchableOpacity onPress={handleSeeRecoveryCode}>
              <Text style={styles.recoveryCodeText}>See Recovery Code</Text>
            </TouchableOpacity>
            <View style={styles.topProfile}>
              {userProfileImage && (
                <Image source={{ uri: userProfileImage }}
                  style={styles.profileImage}
                />
              )}
              <Text style={styles.profileNameText}>{username}</Text>
              <TouchableOpacity style={styles.editUserProfileBtn} onPress={editUserProfilePress}>
                <Text style={styles.editUserProfileText}>Edit User Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={styles.userLabels}>Username</Text>
              <Text style={styles.profileInfoValue}>{username}</Text>
              <Text style={styles.userLabels}>First Name</Text>
              <Text style={styles.profileInfoValue}>{firstName}</Text>
              <Text style={styles.userLabels}>Last Name</Text>
              <Text style={styles.profileInfoValue}>{lastName}</Text>
              <Text style={styles.userLabels}>Email Address</Text>
              <Text style={styles.profileInfoValue}>{emailAddress}</Text>
            </View>
            <Text style={[styles.userLabels, { marginTop: 15 }]}>Password</Text>
            <TouchableOpacity style={styles.changePasswordBtn} onPress={handleChangePasswordPress}>
              <Text style={styles.changePasswordText}>Change </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>


        {/* Password before See Recovery Modal*/}
        <Modal
          isVisible={isPasswordBeforeRecoveryCodeVisible}
          animationIn="fadeIn"
          animationOut={"slideOutDown"}
          onBackdropPress={handleCancelPasswordInput}
          onBackButtonPress={handleCancelPasswordInput}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter your password</Text>
            <TextInput
              style={styles.userEditProfileValue}
              placeholder="Password"
              value={modalPassword}
              onChangeText={setModalPassword}
              secureTextEntry={true}/>
            <View style={styles.twoBtns}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPasswordInput}>
                <Text style={styles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handlePasswordBeforeRecoveryCode}>
                <Text style={styles.saveButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* See Recovery Code Modal*/}
        <Modal
          isVisible={isRecoveryCodeVisible}
          onBackdropPress={handleCancelVerifyRecoveryCode}
          onBackButtonPress={handleCancelVerifyRecoveryCode}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Recovery Code</Text>
            <Text style={styles.storedRecoveryValue}>{storedRecoveryCode}</Text>
            <View style={styles.twoBtns}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleBackRecoveryCode}>
                <Text style={styles.cancelButtonText} >Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

       {/* Recovery Code before Change Password Modal*/}
        <Modal
          isVisible={isRecoveryCodeModalVisible}
          animationIn="slideInUp"
          animationOut={"slideOutDown"}
          onBackdropPress={handleCancelVerifyRecoveryCode}
          onBackButtonPress={handleCancelVerifyRecoveryCode}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Recovery Code</Text>
            <TextInput
              style={styles.userEditProfileValue}
              placeholder="Recovery Code"
              value={recoveryCode}
              onChangeText={setRecoveryCode}
              
            />
            <View style={styles.twoBtns}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelVerifyRecoveryCode}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleVerifyRecoveryCode}>
                <Text style={styles.saveButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Chnage Password Modal */}
        <Modal
          isVisible={isChangePasswordModalVisible}
          animationIn="slideInUp"
          onBackdropPress={handleCancelChangePassword}
          onBackButtonPress={handleCancelChangePassword}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update your Password</Text>
            <Text style={[styles.userLabels, { fontSize: 15 }]}>Current </Text>
            <TextInput
              style={styles.userEditProfileValue}
              value={currentPassword}
              secureTextEntry={true}
              onChangeText={setCurrentPassword}
            />
            <Text style={[styles.userLabels, { fontSize: 15 }]}>New </Text>
            <TextInput
              style={styles.userEditProfileValue}
              value={newPassword}
              secureTextEntry={true}
              onChangeText={setNewPassword}
            />
            <Text style={[styles.userLabels, { fontSize: 15 }]}>Confirm </Text>
            <TextInput
              style={styles.userEditProfileValue}
              value={confirmPassword}
              secureTextEntry={true}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.twoBtns}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelChangePassword}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    minHeight: '100%' 
  },
  scrollview: {
    flexGrow: 1,
    minHeight: '100%',
    
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
    justifyContent: "center",
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
  recoveryCodeText:{
    fontFamily:'myCustomFont',
    color:'gray'
  },
  storedRecoveryValue:{
    fontFamily:'myCustomFont',
    borderWidth:1,
    backgroundColor:'white',
    borderColor:"gray",
    padding:10,
    borderRadius: 5,
  },
  topProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 15,
    // backgroundColor:'black'
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    borderColor: '#7C7C7C',
    borderWidth: 2,
  },
  profileNameText: {
    fontFamily: "myCustomFont",
    fontWeight: "regular",
    fontSize: 17,
    color: "#61646b",
    textAlign: 'left',
    width: '40%'
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
    marginLeft: 15
  },
  editUserProfileText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 10,
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
  profileInfoValue: {
    fontFamily: "myCustomFont",
    fontSize: 16,
    color: "#61646b",
    marginBottom: 15,
  },
  changePasswordBtn: {
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
    marginTop: 10
  },
  changePasswordText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 13,
    color: "white",
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    padding: 20,
    
  },
  modalTitle: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 20,
    color: "#61646b",
    marginBottom: 20,
    textAlign: 'center',
  },
  userEditProfileValue: {
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
  twoBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignContent:'center',
    gap: 50
  },
  saveButton: {
    backgroundColor: '#FFDB36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: 'black',
    width: 150,
    shadowOffset: { width: 0, height: 5 }, // Only apply shadow to the bottom
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Shadow for Android
  },
  saveButtonText: {
    fontFamily: "myCustomFont",
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    fontFamily: "myCustomFont",
    fontSize: 16,
    color: "#61646b",

  },
});

export default DisplayUserProfile_Screen;