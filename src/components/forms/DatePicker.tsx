import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (newDate: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  error?: string;
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
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={handlePress} style={[styles.pickerButton, error ? styles.errorBorder : {}]}>
        <Text style={[styles.pickerText, !date && styles.placeholderText]}>
          {date ? date.toLocaleDateString() : placeholder}
        </Text>
      </TouchableOpacity>
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