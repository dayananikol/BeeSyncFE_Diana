//disclaimer: this have its own font, header, and set background image. when merging, just extract 
// the main parts (components) of the page 

import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font'; 
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import ProfilePictureUploader from '../components/ProfilePictureUploader';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { parse, format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';


interface AddBillProps {}

const AddBill_Screen: React.FC<AddBillProps> = () => {
  const [billName, setBillName] = useState<string>(''); 
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [billAmount, setBillAmount] = useState<string>('');

  // const [rewardSelected, setRewardSelected] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [recurrenceSelected, setRecurrenceSelected] = useState<string | null>(null);
  const [isRecurrenceNeverEnds, setIsRecurrenceNeverEnds] = useState<boolean>(false);

  const [description, setDescription] = useState<string>('');

  const [bill_status, setBillStatus] = useState<string>('Ongoing');

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const navigation = useNavigation();

  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false); 
  const [loaded] = useFonts({'myCustomFont': require('../assets/fonts/WorkSans-Regular.ttf'),});

  // JWT token for testing
  // const jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkYW5nc3lhbmEiLCJpYXQiOjE3MzcyODYyNjAsImV4cCI6MTczNzI4OTg2MH0.--YWYmAZSwv06xvyhuRIBkTHXXILVkFcchTv2-Vj56k';

  useEffect(() => {
    if (loaded) {
      setFontsLoaded(true); 
    }
  }, [loaded]);

  const resetForm = () => {
    setProfileImage(null);
    setBillName('');
    setBillAmount('');
    setDescription('');
    // setRewardSelected(null);
    setRecurrenceSelected(null);
    setIsRecurrenceNeverEnds(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setTime(new Date());
  };

  const handleClosePress = () => {
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
            router.push('/ViewTask_Screen'); // Navigate to the desired page
          },
        },
      ],
      { cancelable: true }
    );
  };

  // const handleRewardPress = (buttonId: string) => {
  //   setRewardSelected(prev => (prev === buttonId ? null : buttonId)); 
  // };

  const handleRecurrencePress = (buttonId: string) => {
    setRecurrenceSelected(prev => (prev === buttonId ? null : buttonId)); 
  };

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
      name: `${billName}.${fileType}`,
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

  const handleCreateBillPress = async () => {
    let imagePath = null;
    if(profileImage){
      imagePath = await uploadImage(profileImage);
    }
    
    if (!billName) {
      Alert.alert("Bill Name Required", "Please enter a bill name.");
      return;
    } else if (!billAmount) {
      Alert.alert("Bill Amount Required", "Please enter a bill amount.");
      return;
    } 
  
    const jwtToken = await AsyncStorage.getItem('jwtToken');

    if (!jwtToken) {
      Alert.alert('Error', 'No JWT token found. Please log in again.');
      return;
    }

    const billData = {
      hive_id:1,
      bill_name: billName,
      img_path: imagePath,
      amount: billAmount,
      bill_status: bill_status,
      description: description,
      schedules: [{ 
        start_date: startDate.toISOString().split('T')[0],
        end_date: isRecurrenceNeverEnds ? null : endDate.toISOString().split('T')[0].split('.')[0],
        recurrence: recurrenceSelected,
        due_time: time.toISOString().split('T')[1].split('.')[0],
      },
      ], 
    };
  
    console.log('Sending bill data:', billData);
  
    setIsLoading(true);
  
    try {
      const response = await fetch('http://192.168.1.33:8080/bills/createFullBill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}` // Send the JWT token in the header
        },
        body: JSON.stringify(billData),
      });
  
      if (response.ok) {
        Alert.alert("Success", "Bill created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                router.push('/CalendarView'); // Navigate to the desired page
              }
            }
          ]
        );
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        Alert.alert('Error', `Failed to create bill: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Network error occurred:', error);
      Alert.alert('Error', `An error occurred: ${(error as any).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#FFefa4' },
      headerTitleStyle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#61646b',
        paddingTop: 20,
      },
      headerTitleAlign: 'center',
      headerTitle: 'Add Bill',
      headerLeft: () => (
        <TouchableOpacity onPress={handleClosePress} style={{ paddingLeft: 20 }}>
          <Image
            source={require('../assets/images/closeBtn.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { flex: 1 }]} edges={['top']}>
        
      <Image source={require('../assets/images/bee-pattern-bg.png')} style={styles.bgImage}/>
        <ScrollView style={styles.scrollView}>

          <View style={styles.billNameAmountContainer}>
            <Text style={styles.billNameText}>Set your Bill Name</Text>
            <View style={styles.imageAddBillContainer}>
              <ProfilePictureUploader imageUri={profileImage} setImageUri={setProfileImage} size={70} iconSize={25}/>
              <TextInput
                style={styles.input}
                onChangeText={setBillName}
                value={billName}
                placeholder="Enter your bill name"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.billAmount}>
              <Text style={styles.billAmountText}>Amount of Bill to Pay</Text>
              <TextInput 
                style={styles.billAmountInput}
                onChangeText={setBillAmount}
                value={billAmount}
                placeholder="Enter your bill amount"
                placeholderTextColor="#888"
                keyboardType="numeric"></TextInput>
            </View>
          </View>

          <View style={styles.billScheduleContainer}>
            <Text style={styles.billScheduleText}>Schedule</Text>
            <View style={styles.recurrenceContainer}>
              <TouchableOpacity activeOpacity={0.6}onPress={() => handleRecurrencePress("Once")} style={[styles.eachRecurrence, recurrenceSelected === "Once" && styles.recurrenceHighlight]}>
                <Text onPress={() => handleRecurrencePress("Once")} style={[styles.recurrenceText, recurrenceSelected === "Once" && styles.recurrenceTextHighlight]}>Once</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.6}onPress={() => handleRecurrencePress("Daily")} style={[styles.eachRecurrence, recurrenceSelected === "Daily" && styles.recurrenceHighlight]}>
                <Text onPress={() => handleRecurrencePress("Daily")} style={[styles.recurrenceText, recurrenceSelected === "Daily" && styles.recurrenceTextHighlight]}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.6}onPress={() => handleRecurrencePress("Weekly")} style={[styles.eachRecurrence, recurrenceSelected === "Weekly" && styles.recurrenceHighlight]}>
                <Text onPress={() => handleRecurrencePress("Weekly")} style={[styles.recurrenceText, recurrenceSelected === "Weekly" && styles.recurrenceTextHighlight]}>Weekly</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.startDateContainer}>
              <Text style={styles.startDateText}>Start Date</Text>
              <View style={styles.datePickerWrapper} >
                <DatePicker selectedDate={startDate} setSelectedDate={setStartDate}/>
              </View>
            </View>
            <View style={styles.endDateContainer}>
              <Text style={styles.endDateText}>End Date</Text>
              <View style={styles.neverEndsContainer}>
                <Checkbox 
                  style={styles.checkbox} 
                  value={isRecurrenceNeverEnds} 
                  onValueChange={setIsRecurrenceNeverEnds} 
                  color={isRecurrenceNeverEnds ? '#61646b' : undefined}/>
                <Text style={styles.neverEndsText}>Never Ends</Text>
              </View>
              <View style={styles.datePickerWrapper}>
                {!isRecurrenceNeverEnds && (<DatePicker selectedDate={endDate} setSelectedDate={setEndDate}/>)}
              </View>
            </View>
            <View style={styles.dueTimeContainer}>
            <Text style={styles.endDateText}>Due by Time</Text>
              <View style={styles.timePickerWrapper}>
                <TimePicker selectedTime={time} setSelectedTime={setTime}/>
              </View>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>Description</Text>
            <TextInput
              editable={true}
              multiline={true}
              numberOfLines={10}
              maxLength={140}
              onChangeText={text => setDescription(text)}
              placeholder='Describe your task'
              value={description}
              style={styles.descriptionInput}>
            </TextInput>
          </View>

          <TouchableOpacity style={styles.createBillBtn} activeOpacity={0.6} onPress={handleCreateBillPress}>
            <Text style={styles.createBillText}>Create Bill</Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor:'#fffcf0'
  },
  scrollView: {
    flexGrow: 1,
  },
  bgImage:{
    position:"absolute",
    width: '100%',   // Make the image width 100% of the container
    height: '100%',  // Make the image height 100% of the container
    resizeMode: 'cover',
    opacity:0.5,
    zIndex:-1,
    backgroundColor: '#fffcf0',
  },
  billNameAmountContainer:{
    backgroundColor:'white',
    paddingBottom:15,
    borderBottomWidth:1,
    borderColor:'gray'
  },
  billNameText: {
    paddingLeft: 113,
    paddingTop: 20,
    color: '#61646b',
    fontWeight: '500',
    fontSize: 15,
    fontFamily: 'myCustomFont'
  },
  imageAddBillContainer: {
    flexDirection: 'row',  // Aligns the image and text box side by side
    alignItems: 'center',  // Vertically aligns image and text box
    paddingLeft: 15,
    paddingBottom: 0,
    width: '100%',  // Ensures the container takes up the full width of the screen
    // height:100,
    gap:10
  },

  input: {
    height: 50,
    flex: 1,  // This allows the input box to take the remaining width of the container
    borderColor: '#61646b',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
    marginRight:20,
  },
  billAmount:{
    marginTop:10,
  },
  billAmountText:{
    color: '#61646b',
    fontWeight: '500',
    fontSize: 15,
    paddingLeft:25,
    fontFamily: 'myCustomFont'
  },
  billAmountInput:{
    height: 50,
    flex: 1,  // This allows the input box to take the remaining width of the container
    borderColor: '#61646b',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
    margin:20,
    marginTop:10,
    marginBottom:0,
  },
  rewardsContainer:{
    backgroundColor:'#fff8da',
    marginTop:7,
    borderBottomWidth:1,
    borderColor:'gray',
    paddingLeft:5,
    paddingBottom:20,
    shadowColor:'black',
    flexDirection:'row'
  },
  rewardsText:{
    fontFamily: 'myCustomFont',
    color: '#61646b',
    fontWeight:'bold',
    paddingLeft:20,
    paddingTop:10,
  },
  customContainer:{
    paddingLeft:8,
    paddingTop:8,
    paddingRight:10,
    marginTop:5,
    alignItems:'center',
  },
  customText:{
    paddingLeft:16,
    paddingTop:3,
    color: '#61646b',
    fontWeight: '400',
    fontSize: 12,
    fontFamily: 'myCustomFont'
  },
  rewardsPoints:{
    paddingLeft: 10,
    marginRight:7,
    paddingTop:45,
  },
  billScheduleContainer:{
    backgroundColor:'#fff8da',
    marginTop:7,
    borderBottomWidth:1,
    borderColor:'gray',
    paddingLeft:5,
    paddingBottom:30,
  },
  billScheduleText:{
    fontFamily: 'myCustomFont',
    color: '#61646b',
    fontWeight:'bold',
    paddingLeft:20,
    paddingTop:10,
  },
  recurrenceContainer:{
    flex:1,
    flexDirection:'row',
    justifyContent: 'space-between',
    marginHorizontal:20,
    paddingTop:10
  },
  recurrenceText:{
    fontFamily:'customFont',
    color: '#61646b',
    fontWeight:'700',
    fontSize:12
  },
  recurrenceTextHighlight:{
    color: 'white'
  },
  eachRecurrence:{
    borderWidth:1,
    borderColor:'lightgray',
    borderRadius:5,
    backgroundColor:'white',
    paddingVertical:5,
    paddingHorizontal:35
  },
  startDateContainer:{
    flex:1,
    flexDirection:'column',
    justifyContent: 'space-between',
    marginHorizontal:20,
    paddingTop:10
  },
  startDateText:{
    fontFamily: 'myCustomFont',
    color: '#61646b',
  },
  datePickerWrapper:{
    marginTop:-5,
  },
  neverEndsContainer:{
    flexDirection:'row',
    gap:10,
    marginVertical:10
  },
  checkbox:{
    width:20,
    height:20,
    borderWidth:1,
    borderColor:'#61646B',
    borderRadius:5,
  },
  neverEndsText:{
    fontFamily: 'myCustomFont',
    color: '#61646b',
    fontSize:12
  },
  endDateContainer:{
    flex:1,
    flexDirection:'column',
    justifyContent: 'space-between',
    marginHorizontal:20,
    paddingTop:10
  },
  endDateText:{
    fontFamily: 'myCustomFont',
    color: '#61646b',
  },
  dueTimeContainer:{
    flex:1,
    flexDirection:'column',
    justifyContent: 'space-between',
    marginHorizontal:20,
    paddingTop:10
  },
  timePickerModal:{

  },
  timePickerWrapper:{
    marginTop:-5,
  },
  descriptionContainer:{
    backgroundColor:'#fff8da',
    marginTop:7,
    borderBottomWidth:1,
    borderColor:'gray',
    paddingLeft:5,
    paddingBottom:20,
  },
  descriptionText:{
    fontFamily: 'myCustomFont',
    color: '#61646b',
    fontWeight:'bold',
    paddingLeft:20,
    paddingTop:10,
  },
  descriptionInput:{
    backgroundColor:'white',
    borderWidth:1,
    borderColor:'lightgray',
    borderRadius:5,
    color: '#61646b',
    fontWeight: '500',
    fontSize: 15,
    fontFamily: 'myCustomFont',
    marginHorizontal:20,
    marginTop:10,
    height:150,
    textAlignVertical: 'top'
  },
  createBillBtn:{
    borderWidth:1,
    borderRadius:8,
    borderColor:'#ffdb36',
    backgroundColor:'#ffdb36',
    marginHorizontal:'15%',
    marginVertical:20,
    shadowColor: 'black', 
    elevation: 6, // Shadow for Android
  },
  createBillText:{
    paddingVertical:10,
    textAlign:'center',
    fontFamily:'myCustomFont',
    fontWeight:'bold',
    fontSize:20,
    color:'white'
  },
  rewardHighlight:{
    borderColor: '#E7BE00',
    borderWidth: 3,
    borderRadius:8,
  },
  recurrenceHighlight:{
    backgroundColor:"#FFDB36"
  }, 
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: to add a semi-transparent background
  },
});

export default AddBill_Screen;
