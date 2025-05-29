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
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading prop is true', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    expect(queryByText('Test Button')).toBeNull();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
}); 