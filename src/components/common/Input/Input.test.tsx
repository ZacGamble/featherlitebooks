import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from './Input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Test Placeholder" />);
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('displays the label when provided', () => {
    const { getByText } = render(<Input label="Test Label" />);
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('displays an error message when error prop is provided', () => {
    const { getByText } = render(<Input error="Test Error" />);
    expect(getByText('Test Error')).toBeTruthy();
  });

  it('calls onChangeText when text is changed', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Test Input" onChangeText={onChangeTextMock} />
    );
    fireEvent.changeText(getByPlaceholderText('Test Input'), 'new text');
    expect(onChangeTextMock).toHaveBeenCalledWith('new text');
  });
}); 