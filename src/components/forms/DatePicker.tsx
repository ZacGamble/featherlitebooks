import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Community picker
import { colors } from '@/constants/colors';

// NOTE: @react-native-community/datetimepicker is the standard, but setup can be tricky for web/cross-platform styling.
// This is a very basic placeholder. For a real app, you'd integrate a robust date picker.
// For Expo Go, you might need a custom solution or a library that works well without native builds if @rnc/dtp is problematic.

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (newDate: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  // mode?: 'date' | 'time' | 'datetime'; // If using @rnc/dtp
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  label,
  placeholder = 'Select date',
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    setShowPicker(true);
    // On Web, you might open a modal or use a native HTML date input.
    // On Mobile, you'd show the DateTimePicker.
    // This placeholder doesn't actually show a picker, just text.
  };

  // const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
  //   setShowPicker(Platform.OS === 'ios'); // Keep open on iOS until done
  //   if (selectedDate) {
  //     onDateChange(selectedDate);
  //   }
  // };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={handlePress} style={[styles.pickerButton, error ? styles.errorBorder : {}]}>
        <Text style={[styles.pickerText, !date && styles.placeholderText]}>
          {date ? date.toLocaleDateString() : placeholder}
        </Text>
      </TouchableOpacity>
      {/* {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date || new Date()} // Ensure a valid date is always passed
          mode={"date"} // default to date
          is24Hour={true}
          display="default" // or "spinner", "calendar", "clock"
          onChange={onChange}
        />
      )} */}
      {/* On Web, you might use an <input type="date"> or a custom modal picker */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  pickerButton: {
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.gray,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});

export default CustomDatePicker; 