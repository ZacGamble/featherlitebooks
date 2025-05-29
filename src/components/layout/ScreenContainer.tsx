import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, SafeAreaView, Platform } from 'react-native';
import { colors } from '@/constants/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  safeArea?: boolean; // Use SafeAreaView for top/bottom padding on iOS
  // Add other layout-specific props like backgroundColor, padding, etc.
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  scrollable = false,
  safeArea = true, // Default to true for better mobile experience
}) => {
  const ContainerComponent = scrollable ? ScrollView : View;
  const baseStyle = scrollable ? styles.scrollableBase : styles.containerBase;

  const content = (
    <ContainerComponent style={[baseStyle, style]}>
      {children}
    </ContainerComponent>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Apply background to SafeAreaView for consistency
  },
  containerBase: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 15, // Default padding, can be overridden by style prop
    paddingVertical: 10,
  },
  scrollableBase: {
    flexGrow: 1, // Ensures ScrollView content can expand
    backgroundColor: colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

export default ScreenContainer; 