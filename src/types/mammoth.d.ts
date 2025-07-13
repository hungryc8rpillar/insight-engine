declare module 'mammoth' {
  interface ExtractRawTextOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: ArrayBuffer;
  }

  interface ExtractRawTextResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  function extractRawText(arrayBuffer: ArrayBuffer): Promise<ExtractRawTextResult>;
  function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
  
  export = {
    extractRawText
  };
} 