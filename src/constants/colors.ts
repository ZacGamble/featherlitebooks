// FeatherLiteBooks Color Scheme
// Based on palette:
//   Dark Red: #830808
//   Dark Gray/Brown: #453a3c
//   Blue: #39648d
//   Light Gray: #b6b6b6
//   Off-White: #fbf9f9

export const colors = {
  // Core Semantic Colors from Palette
  primary: '#39648d',        // Blue: For primary actions, buttons, active states
  secondary: '#453a3c',      // Dark Gray/Brown: For secondary actions, alternative buttons
  accent: '#830808',         // Dark Red: For highlights, special callouts, or important secondary actions

  // Text Colors
  text: '#453a3c',            // Dark Gray/Brown: Main text color for readability
  textSecondary: '#5A5A5A',   // Mid-Gray: For subtitles, less important information (WCAG AA on #fbf9f9)
  textTertiary: '#b6b6b6',    // Light Gray: For placeholder text, hints, disabled text elements

  // Backgrounds
  background: '#fbf9f9',      // Off-White: Main application background
  surface: '#ffffff',         // Pure White: For cards, modals, input backgrounds to stand out

  // Borders
  border: '#b6b6b6',          // Light Gray: Default border color for inputs, cards
  borderLight: '#dcdcdc',     // Lighter Gray: For subtle dividers or less prominent borders

  // Status Indicators
  error: '#830808',           // Dark Red: For error messages, icons, and states
  success: '#198754',         // Standard Green: For success messages and states
  warning: '#ffc107',         // Standard Yellow/Orange: For warnings

  // UI States & Components
  primaryMuted: '#7c9cbf',    // Lighter Blue: A muted version of primary for less emphasis or disabled primary states
  disabled: '#b6b6b6',        // Light Gray: Color for text/icons on disabled components
  disabledBackground: '#e9ecef', // Very Light Gray: Background for disabled buttons/inputs
  
  inputBackground: '#ffffff',   // Matches surface for consistency
  placeholderText: '#b6b6b6',   // Light Gray: For input placeholders (matches textTertiary)

  // Base Colors
  white: '#ffffff',
  black: '#000000',           // Pure black, use sparingly
  transparent: 'transparent',

  // Direct Palette Access (optional, but useful for reference or specific overrides)
  palette: {
    darkRed: '#830808',
    darkGrayBrown: '#453a3c',
    blue: '#39648d',
    lightGray: '#b6b6b6',
    offWhite: '#fbf9f9',
  },

  // Navigation & Tabs
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#007AFF',
  headerBackground: '#FFFFFF',
  headerTintColor: '#007AFF',

  // Add more specific colors based on FeatherLiteBooks branding
  // e.g. featherLiteBlue, featherLiteGreen

  TEXT: '#1F2937',       // Dark Gray - For primary text
  TEXT_SECONDARY: '#6B7280', // Medium Gray - For secondary text, placeholders
  TEXT_TERTIARY: '#9CA3AF', // Light Gray - For less important text, hints (NEW)
  PLACEHOLDER_TEXT: '#A0AEC0', // Gray - For input placeholders
  BORDER: '#D1D5DB',      // Light Gray - For borders
}; 