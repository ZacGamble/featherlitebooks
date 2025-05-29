import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
}) => {
  const getButtonStyles = () => {
    const buttonStyles: ViewStyle[] = [styles.buttonBase as ViewStyle];
    const textStyles: TextStyle[] = [styles.textBase as TextStyle];

    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyles.push(styles.primaryButton as ViewStyle);
        textStyles.push(styles.primaryText as TextStyle);
        break;
      case 'secondary':
        buttonStyles.push(styles.secondaryButton as ViewStyle);
        textStyles.push(styles.secondaryText as TextStyle);
        break;
      case 'outline':
        buttonStyles.push(styles.outlineButton as ViewStyle);
        textStyles.push(styles.outlineText as TextStyle);
        break;
      case 'ghost':
        buttonStyles.push(styles.ghostButton as ViewStyle);
        textStyles.push(styles.ghostText as TextStyle);
        break;
      case 'danger':
        buttonStyles.push(styles.dangerButton as ViewStyle);
        textStyles.push(styles.dangerText as TextStyle);
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        buttonStyles.push(styles.smallButton as ViewStyle);
        textStyles.push(styles.smallText as TextStyle);
        break;
      case 'large':
        buttonStyles.push(styles.largeButton as ViewStyle);
        textStyles.push(styles.largeText as TextStyle);
        break;
      case 'medium': // Default, already covered by base
      default:
        break;
    }

    if (disabled || loading) {
      buttonStyles.push(styles.disabledButton as ViewStyle);
    }

    if (style) buttonStyles.push(style);
    if (textStyle) textStyles.push(textStyle);

    return { buttonStyles, textStyles };
  };

  const { buttonStyles, textStyles } = getButtonStyles();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={buttonStyles}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary} />
      ) : (
        <>
          {iconLeft}
          <Text style={textStyles}>{title}</Text>
          {iconRight}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  smallText: {
    fontSize: 14,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button; 