import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  // Add other card-specific props like elevation, shadow, etc. if needed
}

const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const cardContent = (
    <View style={[styles.cardBase, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    // Shadow for iOS
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
    marginVertical: 8, // Example margin, adjust as needed
  },
});

export default Card; 