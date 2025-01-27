import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface Task {
  title: string;
  img_path: string;
  due_time: string;
}

interface SpecificTaskProps {
  task: Task;
}

const SpecificTask: React.FC<SpecificTaskProps> = ({ task }) => {
  const { title, 
    img_path,
    due_time } = task;

  console.log('Task:', task); // Log the task to debug
  
  const defaultImageUrl = 'http://192.168.1.33/uploads/defaultImg.png';
  const taskImageUrl = task.img_path ? `http://192.168.1.33/uploads/${task.img_path}` : defaultImageUrl;

  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.image} source={{ uri: taskImageUrl }} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dueTime}>{due_time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: '5%',
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#61646b",
  },
  dueTime: {
    fontSize: 14,
    color: "#61646b",
  },
});

export default SpecificTask;
