import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

export const commonStyles = StyleSheet.create({
  // Flexbox
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  alignItemsStart: {
    alignItems: 'flex-start',
  },
  alignItemsEnd: {
    alignItems: 'flex-end',
  },
  alignSelfCenter: {
    alignSelf: 'center',
  },

  // Spacing (use sparingly, prefer component-specific styles or layout components)
  paddingSm: {
    padding: 8,
  },
  paddingMd: {
    padding: 16,
  },
  paddingLg: {
    padding: 24,
  },
  marginSm: {
    margin: 8,
  },
  marginMd: {
    margin: 16,
  },
  marginLg: {
    margin: 24,
  },
  marginBottomSm: {
    marginBottom: 8,
  },
  marginBottomMd: {
    marginBottom: 16,
  },
  marginBottomLg: {
    marginBottom: 24,
  },
  marginTopSm: {
    marginTop: 8,
  },
  marginTopMd: {
    marginTop: 16,
  },
  marginTopLg: {
    marginTop: 24,
  },

  // Text
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  textPrimary: {
    color: colors.primary,
  },
  textSecondary: {
    color: colors.secondary,
  },
  textAccent: {
    color: colors.accent,
  },
  textLight: {
    color: colors.white,
  },
  textDark: {
    color: colors.text,
  },
  textError: {
    color: colors.error,
  },
  textSuccess: {
    color: colors.success,
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  } as TextStyle,
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  } as TextStyle,
  body1: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  } as TextStyle,
  body2: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
  } as TextStyle,

  // Containers & Cards
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  } as ViewStyle,
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  } as ViewStyle,

  // Forms
  inputContainer: {
    marginBottom: 16,
  } as ViewStyle,
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.white,
  } as ViewStyle,
  inputError: {
    borderColor: colors.error,
  } as ViewStyle,
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  } as TextStyle,

  // Buttons (Basic button styles, often overridden by Button component)
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  // Utilities
  hidden: {
    display: 'none',
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 16,
  } as ViewStyle,
  fullWidth: {
    width: '100%',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
}); 