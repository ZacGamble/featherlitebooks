# Images

This directory is for static image assets used in the FeatherLiteBooks application, such as logos, icons (if not using a font icon library), or illustration assets.

## Usage

1.  Add your image files (e.g., `.png`, `.jpg`, `.svg`) to this directory.
2.  Import and use them in your components.

Example:

```javascript
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const MyComponent = () => {
  return (
    <Image
      source={require('../../assets/images/my-logo.png')}
      style={styles.logo}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
});

export default MyComponent;
```

## Considerations

*   Optimize images for mobile to reduce app size and improve loading times.
*   Consider using vector graphics (SVG) for icons where possible for scalability, or use a dedicated icon library like `@expo/vector-icons`.
*   For dynamic images (e.g., user-uploaded content), use a cloud storage solution like Supabase Storage and load them via URL. 