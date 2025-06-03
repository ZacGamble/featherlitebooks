import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const dynamicBorderColor = error ? colors.error : isFocused ? colors.primary : colors.border;

  const platformSpecificInputStyle: any = Platform.OS === 'web' ? { outlineWidth: 0 } : {};

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        { borderColor: dynamicBorderColor },
      ]}>
        {leftIcon}
        <TextInput
          style={[
            styles.input, 
            inputStyle,
            platformSpecificInputStyle,
            leftIcon ? styles.inputWithLeftIcon : {},
            rightIcon ? styles.inputWithRightIcon : {}
          ]}
          placeholderTextColor={colors.placeholderText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        {rightIcon}
      </View>
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  inputContainerError: {
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeftIcon: {
    marginLeft: 10,
  },
  inputWithRightIcon: {
    marginRight: 10,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});

export default Input; 