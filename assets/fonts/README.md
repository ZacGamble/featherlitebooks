# Fonts

This directory should contain any custom font files (e.g., `.ttf`, `.otf`) used in the FeatherLiteBooks application.

## Usage

1.  Add your font files to this directory.
2.  Update `expo-font` configuration in `app.config.ts` or load them using `useFonts` hook in `App.tsx`.
3.  Reference the font family name in your StyleSheet definitions.

Example:

```javascript
// In your component or App.tsx
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'YourFont-Regular': require('../../assets/fonts/YourFont-Regular.ttf'),
  'YourFont-Bold': require('../../assets/fonts/YourFont-Bold.ttf'),
});

if (!fontsLoaded) {
  return null; // or a loading indicator
}

// In your styles
const styles = StyleSheet.create({
  text: {
    fontFamily: 'YourFont-Regular',
  },
  boldText: {
    fontFamily: 'YourFont-Bold',
  },
});
``` 