import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFefa4' },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: 'bold',
          color: '#61646b',
          paddingTop: 20,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="CalendarView"
        options={{
          tabBarLabel: '',
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/calendar_month.png')}
              style={{
                width: 29,
                height: 32,
                marginTop: 5,
                tintColor: focused ? '#fed000' : '#61646b', // Change icon color when selected
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: '',
          title: 'Hive Progress',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/Hive.png')}
              style={{
                width: 30,
                height: 30,
                marginTop: 5,
                tintColor: focused ? '#fed000' : '#61646b', // Change icon color when selected
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
