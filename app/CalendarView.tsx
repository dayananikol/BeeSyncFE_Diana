// CalendarView is actually just a component, since we already have a bottom navigation made by Jassy, the code 
// here for calendar view/view2 and other functions should be extracted and pasted on the ready-made Calendar page

// make sure to remove the background image set to bee patterns in the code

import React, { useState, useEffect } from 'react';
import { Modal, View, Button, StyleSheet, Text, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Dimensions } from 'react-native';
import SpecificTask from '@/components/SpecificTask';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
// import { isLoading } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<{ [key: string]: { title: string; dueTime: string }[] }>({});
  const [bills, setBills] = useState<{ [key: string]: { title: string; dueTime: string }[] }>({});

  // const jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkYW5nc3lhbmEiLCJpYXQiOjE3MzcyODYyNjAsImV4cCI6MTczNzI4OTg2MH0.--YWYmAZSwv06xvyhuRIBkTHXXILVkFcchTv2-Vj56k';

  useFocusEffect(
    React.useCallback(() => {
    const fetchTasksAndBills = async () => {
      try {

        const jwtToken = await AsyncStorage.getItem('jwtToken'); // Retrieve the JWT token

        if (!jwtToken) {
          Alert.alert('Error', 'No JWT token found. Please log in again.');
          return;
        }

        const [tasksResponse, billsResponse] = await Promise.all([
          fetch('http://192.168.1.33:8080/tasks/tasks-by-end-date', {
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
            },
          }),
          fetch('http://192.168.1.33:8080/bills/bills-by-end-date', {
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
            },
          }),
        ]);

        if (!tasksResponse.ok || !billsResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const [tasksData, billsData] = await Promise.all([
          tasksResponse.json(),
          billsResponse.json(),
        ]);

        console.log('Tasks Data:', tasksData);
        console.log('Bills Data:', billsData);

        // Group tasks by date
        const tasksByDate: { [key: string]: { title: string; dueTime: string }[] } = Object.keys(tasksData).reduce((acc: { [key: string]: { title: string; dueTime: string }[] }, date: string) => {
          const localDate = new Date(date).toISOString().split('T')[0]; // Convert to local date
          acc[localDate] = tasksData[date].map((detail: string) => {
            const [title, dueTime] = detail.split(' : ');
            return { title, dueTime };
          });
          return acc;
        }, {});

        // Group bills by date
        const billsByDate = Object.keys(billsData).reduce((acc: { [key: string]: { title: string; dueTime: string }[] }, date: string) => {
          acc[date] = billsData[date].map((detail: string) => {
            const [title, dueTime] = detail.split(' : ');
            return { title, dueTime };
          });
          return acc;
        }, {});

        setTasks(tasksByDate);
        setBills(billsByDate);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksAndBills();
  }, [])

  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setIsModalVisible(true);
  };

  const getTaskInfo = () => {
    if (!selectedDate) {
      return <Image source={require('../assets/images/Happy Bee Instax.png')} style={{ alignSelf: 'center' }} />;
    }

    const tasksForDate = tasks[selectedDate] || [];
    const billsForDate = bills[selectedDate] || [];

    if (tasksForDate.length === 0 && billsForDate.length === 0) {
      return <Image source={require('../assets/images/Happy Bee Instax.png')} style={{ alignSelf: 'center' }} />;
    }

    return (
      <>
        {tasksForDate.map((task, index) => (
          <SpecificTask key={index} task={task} />
        ))}
        {billsForDate.map((bill, index) => (
          <SpecificTask key={index} task={bill} />
        ))}
      </>
    );
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>

      <Image source={require('../assets/images/bee-pattern-bg.png')} style={styles.bgImage} /> {/*should be removed*/}

      <Calendar
        style={{
          width: width * 0.9, 
          height: height * 0.45, 
          marginTop: 30, 
          borderRadius: 10, 
          elevation: 5, 
          backgroundColor: '#ffffff', 
        }}
        current={new Date().toISOString().split('T')[0]}
        minDate={new Date().toISOString().split('T')[0]}
        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        markedDates={Object.keys(tasks).reduce((acc, date) => {
          acc[date] = { marked: true };
          return acc;
        }, {} as { [key: string]: { marked: boolean } })}
      />

        <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView>
                {getTaskInfo()}
              </ScrollView>
              <View style={styles.buttonContainer}>
                  <View style={styles.buttonWrapper}>
                    <Button title="Back" onPress={() => setIsModalVisible(false)} color="#FFD100" />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <Button title="Add" onPress={() => console.log('Add Task button pressed')} color="#FFD100" />
                  </View>
                </View>
            </View>
          </SafeAreaView>
        </Modal>
    </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf0',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#ffefa4',
    borderRadius: 10,
    padding: 20,
    maxHeight: '60%',
  },
  taskItem: {
    marginBottom: 10,
  },
  taskTitle: {
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#61646b',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 15,
  },
  buttonWrapper: {
    width: '45%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    position: 'absolute',
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.5,
  },
});

export default CalendarView;