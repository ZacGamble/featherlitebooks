import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListItem from './ListItem';

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
}); 