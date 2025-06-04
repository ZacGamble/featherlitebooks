import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import Button from './Button';
import { colors } from '@/constants/colors';
import { ActivityIndicator } from 'react-native';

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed and not disabled or loading', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} disabled />
    );
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading prop is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Test Button" onPress={onPressMock} loading />
    );
    const loadingIndicatorContainer = getByTestId('loading-indicator');
    if (loadingIndicatorContainer && loadingIndicatorContainer.parent) {
        fireEvent.press(loadingIndicatorContainer.parent); 
    }
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator and hides title when loading prop is true', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    expect(queryByText('Test Button')).toBeNull();
    const activityIndicator = getByTestId('loading-indicator');
    expect(activityIndicator).toBeTruthy();
  });

  it('applies correct styles for default (primary) variant', () => {
    const { getByTestId } = render(<Button title="Test Primary" onPress={() => {}} />);
    const buttonContainer = getByTestId('button-container');
    const buttonText = getByTestId('button-text');
    
    expect(buttonContainer).toHaveStyle({ backgroundColor: colors.primary });
    expect(buttonText).toHaveStyle({ color: colors.white });
  });

  it('applies correct styles for outline variant', () => {
    const { getByTestId } = render(<Button title="Test Outline" onPress={() => {}} variant="outline" />);
    const buttonContainer = getByTestId('button-container');
    const buttonText = getByTestId('button-text');

    expect(buttonContainer).toHaveStyle({ 
      backgroundColor: colors.transparent, 
      borderColor: colors.primary, 
      borderWidth: 1 
    });
    expect(buttonText).toHaveStyle({ color: colors.primary });
  });

  it('applies correct styles for ghost variant', () => {
    const { getByTestId } = render(<Button title="Test Ghost" onPress={() => {}} variant="ghost" />);
    const buttonContainer = getByTestId('button-container');
    const buttonText = getByTestId('button-text');

    expect(buttonContainer).toHaveStyle({ backgroundColor: colors.transparent, borderColor: colors.transparent });
    expect(buttonText).toHaveStyle({ color: colors.primary });
  });

  it('applies disabled styles when disabled', () => {
    const { getByTestId } = render(<Button title="Test Disabled" onPress={() => {}} disabled />);
    const buttonContainer = getByTestId('button-container');
    expect(buttonContainer).toHaveStyle({ 
        backgroundColor: colors.disabled,
        borderColor: colors.disabled 
    });
  });

  it('should have accessibilityRole as button', () => {
    const { getByTestId } = render(<Button title="Accessible Button" onPress={() => {}} />);
    const buttonContainer = getByTestId('button-container');
    expect(buttonContainer.props.accessibilityRole).toBe('button');
  });

  it('should have accessibilityState disabled when disabled prop is true', () => {
    const { getByTestId } = render(<Button title="Accessible Disabled Button" onPress={() => {}} disabled />);
    const buttonContainer = getByTestId('button-container');
    expect(buttonContainer.props.accessibilityState).toEqual({ disabled: true });
  });

  it('should have accessibilityState disabled when loading prop is true', () => {
    const { getByTestId } = render(<Button title="Accessible Loading Button" onPress={() => {}} loading />);
    const buttonContainer = getByTestId('button-container');
    expect(buttonContainer.props.accessibilityState).toEqual({ disabled: true });
  });

}); 