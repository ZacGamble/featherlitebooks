import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';

interface HeaderProps {
  title: string;
  canGoBack?: boolean;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  canGoBack,
  rightIconName,
  onRightIconPress,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.rightContainer}>
          {rightIconName && onRightIconPress && (
            <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
              <Ionicons name={rightIconName} size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
     borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  iconButton: {
    padding: 8,
  },
});

export default Header; 