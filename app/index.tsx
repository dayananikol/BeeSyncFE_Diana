import React from 'react';
import { Text, Image, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const Hive_Progress = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/images/bee-pattern-bg.png')} style={styles.homescreenImage} />
      <Text>Hi!</Text>
      <StatusBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf0',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  homescreenImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.5,
  },
});

export default Hive_Progress;
