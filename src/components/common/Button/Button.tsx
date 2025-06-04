import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform, StyleProp } from 'react-native';
import { colors } from '@/constants/colors';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
  testID: customTestID
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyles = (): ViewStyle[] => {
    const baseStyle = styles.button;
    const variantStyle = styles[variant] || styles.primary;
    const sizeStyle = styles[size] || styles.medium;
    const disabledStyle = isDisabled ? styles.disabled : {};
    return [baseStyle, variantStyle, sizeStyle, disabledStyle];
  };

  const getTextStyles = (): TextStyle[] => {
    const baseTextStyle = styles.text;
    const variantTextStyle = styles[`${variant}Text`] || styles.primaryText;
    const sizeTextStyle = styles[`${size}Text`] || styles.mediumText;
    const disabledTextStyle = isDisabled ? styles.disabledText : {};
    return [baseTextStyle, variantTextStyle, sizeTextStyle, disabledTextStyle];
  };

  return (
    <TouchableOpacity
      testID={customTestID || 'button-container'}
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator testID="loading-indicator" color={variant === 'primary' ? colors.white : colors.primary} size={size === 'small' ? 'small' : 'large'} />
      ) : (
        <>
          {iconLeft && <Text style={styles.iconStyle}>{iconLeft}</Text>}
          <Text testID="button-text" style={[getTextStyles(), textStyle]}>{title}</Text>
          {iconRight && <Text style={styles.iconStyle}>{iconRight}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  secondaryText: {
    color: colors.white,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
  },
  ghostText: {
    color: colors.primary,
  },
  link: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  smallText: {
    fontSize: 14,
  },
  medium: {
    // Default padding is medium
  },
  mediumText: {
    // Default font size is medium
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  largeText: {
    fontSize: 18,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.textTertiary,
  },
  iconStyle: {
    marginHorizontal: 8,
  },
});

export default Button; 