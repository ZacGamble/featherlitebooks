import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Card onPress={onPressMock}>
        <Text>Press Me</Text>
      </Card>
    );
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress if not provided and card is pressed (and is not pressable)', () => {
    const { getByText } = render(
      <Card>
        <Text>Non-Pressable</Text>
      </Card>
    );
    expect(() => fireEvent.press(getByText('Non-Pressable'))).not.toThrow();
  });
}); 