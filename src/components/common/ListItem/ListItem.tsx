import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightIconColor?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  children?: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  onPress,
  leftIconName,
  rightIconName,
  leftIconColor = colors.textSecondary,
  rightIconColor = colors.textSecondary,
  containerStyle,
  titleStyle,
  subtitleStyle,
  children,
}) => {
  const content = (
    <View style={[styles.container, containerStyle]}>
      {leftIconName && (
        <Ionicons name={leftIconName} size={24} color={leftIconColor} style={styles.icon} />
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
      </View>
      {children}
      {rightIconName && !children && (
        <Ionicons name={rightIconName} size={24} color={rightIconColor} style={styles.icon} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default ListItem; 