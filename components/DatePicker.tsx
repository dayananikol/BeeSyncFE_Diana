// src/components/DatePicker.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Image, View, Text } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DatePickerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, setSelectedDate }) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const dateStr = selectedDate.toLocaleDateString();
    setFormattedDate(dateStr);
  }, [selectedDate]);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  return (
    <>
      <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton} activeOpacity={0.8}>
        <Image source={require('../assets/images/calendar_month.png')} />
        <Text style={styles.dateButtonText}>{formattedDate || 'Select a date'}</Text>
        <Image source={isDatePickerVisible ? require('../assets/images/arrowDown.png') : require('../assets/images/arrowUP.png')} style={{ marginLeft: 200 }} />
      </TouchableOpacity>
 
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

const styles = StyleSheet.create({
  datePickerButton: {
    backgroundColor: 'white',
    padding: 10,
    marginTop: 10,
    width: '100%',
    borderWidth:1,
    borderRadius: 5,
    borderColor: 'lightgray',
    flexDirection:'row',
    alignItems:'center',
  },
  dateButtonText: {
    color: '#61646b',
    fontSize: 16,
    marginLeft:10,
  },
  startDateIcons:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-between',
  },
});

export default DatePicker;
