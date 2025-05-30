declare module 'react-native-html-to-pdf' {
  export interface Options {
    html: string;
    fileName?: string;
    directory?: string;
    width?: number;
    height?: number;
    base64?: boolean;
    padding?: number; // iOS only
    // Add other options as needed based on library documentation
  }

  export interface File {
    filePath: string;
    base64?: string;
    // Add other properties as needed
  }

  const RNHTMLtoPDF: {
    convert: (options: Options) => Promise<File>;
  };

  export default RNHTMLtoPDF;
} 