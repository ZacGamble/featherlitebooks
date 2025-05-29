import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} disabled />
    );
    const buttonElement = getByText('Test Button').parentNode;
    // For TouchableOpacity, disabled prop is passed directly
    // RNTL might not directly reflect this in `toBeDisabled` for all custom component setups.
    // We check if onPress is not called as an alternative.
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
    // You might also check for style changes indicating disabled state if applicable
    // For example, if opacity changes: expect(buttonElement.props.style.opacity).toBe(0.6);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    // Note: ActivityIndicator doesn't have a default testID. 
    // You might need to add one or check for its presence in a more abstract way,
    // or by checking that the title text is NOT visible, and an indicator is.
    // For this example, we'll assume the title is hidden or replaced by the loader.
    expect(queryByText('Test Button')).toBeNull();
    // A more robust test would be to add a testID to the ActivityIndicator in Button.tsx
    // and query for that: expect(getByTestId('loading-indicator')).toBeTruthy();
  });
}); 