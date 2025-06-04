import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LoadingIndicator from '../LoadingIndicator';
import { colors } from '@/constants/colors';

describe('LoadingIndicator', () => {
  it('should render the ActivityIndicator by default when visible', () => {
    render(<LoadingIndicator visible={true} />);
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  it('should not render when visible is false and not fullscreen', () => {
    const renderOutput = render(<LoadingIndicator visible={false} fullScreen={false} />);
    expect(renderOutput.toJSON()).toBeNull();
  });

  it('should render text when provided', () => {
    const testText = 'Loading data...';
    render(<LoadingIndicator visible={true} text={testText} />);
    expect(screen.getByText(testText)).toBeTruthy();
  });

  it('renders with specific size and color (verified by snapshot)', () => {
    const { toJSON } = render(<LoadingIndicator visible={true} size="small" color={colors.secondary} text="Customized"/>);
    expect(toJSON()).toMatchSnapshot();
  });

  describe('FullScreen Mode', () => {
    it('should render within a Modal when fullScreen is true and visible is true', () => {
      render(<LoadingIndicator fullScreen={true} visible={true} text="Loading full screen" />);
      expect(screen.getByText('Loading full screen')).toBeTruthy();
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('should not have visible content when fullScreen is true but visible is false', () => {
      render(<LoadingIndicator fullScreen={true} visible={false} text="Not visible"/>);
      expect(screen.queryByText('Not visible')).toBeNull();
      expect(screen.queryByTestId('activity-indicator')).toBeNull();
    });
  });

  it('matches snapshot for basic rendering with text', () => {
    const tree = render(<LoadingIndicator visible={true} text="Snapshotting basic" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

   it('matches snapshot for fullScreen rendering with text', () => {
    const tree = render(<LoadingIndicator fullScreen visible={true} text="Snapshotting fullscreen" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when not visible and not fullscreen (renders null)', () => {
    const tree = render(<LoadingIndicator visible={false} fullScreen={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for fullScreen but not visible (Modal with visible=false)', () => {
    const tree = render(<LoadingIndicator fullScreen visible={false} text="Invisible fullscreen" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
}); 