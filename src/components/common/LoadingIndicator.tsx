import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { colors } from '@/constants/colors';

interface Props {
  fullScreen?: boolean;
  text?: string;
  visible?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingIndicator: React.FC<Props> = ({
  fullScreen = false,
  text,
  visible = true,
  size = 'large',
  color = colors.primary,
}) => {
  const content = (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} testID="activity-indicator" />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent={true} animationType="none" visible={visible}>
        <View style={styles.modalBackground}>{content}</View>
      </Modal>
    );
  }

  if (!visible) return null;

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
  text: {
    marginTop: 10,
    color: colors.text,
    fontSize: 16,
  },
});

export default LoadingIndicator; 