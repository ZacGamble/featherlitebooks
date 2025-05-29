import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ListItem from './ListItem';

// Mock Ionicons if it's used for icons and not essential for basic rendering tests
// jest.mock('@expo/vector-icons', () => ({
//   Ionicons: () => <Text>Icon</Text>, // Simple mock
// }));

describe('ListItem', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(
      <ListItem title="Main Title" subtitle="Sub Title" />
    );
    expect(getByText('Main Title')).toBeTruthy();
    expect(getByText('Sub Title')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ListItem title="Pressable Item" onPress={onPressMock} />
    );
    fireEvent.press(getByText('Pressable Item'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  // Add more tests for icons and custom children if needed
}); 