import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface ProfilePictureUploaderProps {
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  size: number; // Add size prop
  iconSize?: number; // Add optional iconSize prop
  shape?: 'circle' | 'square';
}

const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({ imageUri, setImageUri, size, iconSize = 40, shape}) => {

  // Request permissions to access the media library and camera
  const requestPermission = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert('Permission required', 'We need access to your media library and camera to pick or take a photo.');
      return false;
    }
    return true;
  };

  // Handle image picking
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Optional: make image square
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const { uri } = result.assets[0];

      // Optionally, manipulate the image if needed (e.g., resize or crop)
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }], // Resize the image to fit
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImageUri(manipResult.uri); // Set the selected image URI
    }
  };

  // Handle taking a picture
  const takePicture = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Optional: make image square
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const { uri } = result.assets[0];

      // Optionally, manipulate the image if needed (e.g., resize or crop)
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }], // Resize the image to fit
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImageUri(manipResult.uri); // Set the selected image URI
    }
  };

  // Handle image removal
  const removeImage = () => {
    setImageUri(null);
  };

  // Handle image picking or taking a picture
  const pickOrTakeImage = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Pick from Gallery",
          onPress: pickImage,
        },
        {
          text: "Take a Picture",
          onPress: takePicture,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <TouchableOpacity>
      {imageUri ? (
        <TouchableOpacity onPress={removeImage} style={[styles.imageContainer, { width: size, height: size, borderRadius: shape === 'circle' ? size / 2 : 10 }]}>
          <Image source={{ uri: imageUri }} style={[styles.image, { width: size, height: size, borderRadius: shape === 'circle' ? size / 2 : 10 }]} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={pickOrTakeImage} style={[styles.imageContainer, { width: size, height: size, borderRadius: shape === 'circle' ? size / 2 : 10 }]}>
          <Image source={require('../assets/images/imageAddBill.png')} style={styles.placeholder} resizeMode="cover" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.addImageBtn, { width: iconSize, height: iconSize, borderRadius: iconSize / 2, 
                              }]
        } onPress={pickOrTakeImage}>
        <Image source={require("../assets/images/addImageBtn.png")} style={{ width: iconSize, height: iconSize }} />
      </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  imageContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#7C7C7C',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
  },
  addImageBtn: {
    position: 'absolute',
    right: '-5%',
    bottom: '-7%',
    borderRadius: 15,
  },
});

export default ProfilePictureUploader;