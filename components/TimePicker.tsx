import React, { Dispatch, SetStateAction, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface TimePickerProps{
  selectedTime: Date;
  setSelectedTime: Dispatch<SetStateAction<Date>>;

}
const TimePicker:React.FC<TimePickerProps> = ({ selectedTime, setSelectedTime }) => {
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false); // State for showing the modal

  const handleConfirm = (date: Date) => {
    setIsTimePickerVisible(false); // Hide the picker after selection

    // Set the selected time but keep today's date (or whatever date you're working with).
    const updatedTime = new Date(selectedTime);
    updatedTime.setHours(date.getHours());
    updatedTime.setMinutes(date.getMinutes());

    // setSelectedTime(updatedTime); // Update only the time part

    const utcTime = new Date(updatedTime.getUTCFullYear(), updatedTime.getUTCMonth(), updatedTime.getUTCDate(), updatedTime.getUTCHours(), updatedTime.getUTCMinutes());

    setSelectedTime(utcTime); // Update the state with the UTC time
  };

  const handleCancel = () => {
    setIsTimePickerVisible(false); // Hide the picker on cancel
  };
  

  // Format the time as HH:MM AM/PM
  const formatTime = (time: Date) => {
    // Convert from UTC to local time (PH Time Zone)
    const localTime = new Date(time);
    localTime.setHours(localTime.getHours() + 8);  // Adjust for UTC+8
  
    let hours = localTime.getHours();
    const minutes = localTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
  
    hours = hours % 12;
    hours = hours || 12; // Convert '0' hours to '12'
  
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.timeButton} onPress={() => setIsTimePickerVisible(true)} activeOpacity={0.8}>
        <Image source={require('../assets/images/time.png')} style={{width:35, height:35}} />
        <Text style={styles.timeText}>{formatTime(selectedTime)}</Text>
        <Image source={isTimePickerVisible ? require('../assets/images/arrowDown.png') : require('../assets/images/arrowUP.png')} style={{marginLeft:205}} />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isTimePickerVisible} // Whether the modal is visible or not
        mode="time" // Set to 'time' to show the time picker
        date={selectedTime} // Set the currently selected time as the initial value
        onConfirm={handleConfirm} // Callback when time is selected
        onCancel={handleCancel} // Callback when the modal is canceled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginTop: 10,
    width: '100%',
    borderWidth:1,
    borderRadius: 5,
    borderColor: 'lightgray',
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'space-between'
  },
  timeButton: {
    borderRadius: 10,
    flexDirection:'row',
    alignItems:'center',
    padding:10
  },
  timeText: {
    color: '#61646b',
    fontSize: 16,
    marginLeft:10,
  },
});

export default TimePicker;
