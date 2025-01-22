import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

interface Task {
  title: string;
  dueTime: string;
}

interface SpecificTaskProps {
  task: Task;
}

const SpecificTask: React.FC<SpecificTaskProps> = ({ task }) => {
  const { title, dueTime } = task;

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/taskDisplayIcon.png")} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dueTime}>{dueTime}</Text>
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
    width: 40,
    height: 40,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
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
