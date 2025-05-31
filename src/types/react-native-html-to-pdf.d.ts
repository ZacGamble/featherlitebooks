declare module 'react-native-html-to-pdf' {
  export interface Options {
    html: string;
    fileName?: string;
    directory?: string;
    width?: number;
    height?: number;
    base64?: boolean;
    padding?: number;
  }

  export interface File {
    filePath: string;
    base64?: string;
  }

  const RNHTMLtoPDF: {
    convert: (options: Options) => Promise<File>;
  };

  export default RNHTMLtoPDF;
} 