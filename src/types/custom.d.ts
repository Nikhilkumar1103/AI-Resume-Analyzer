declare module 'pdf-parse' {
  export interface TextResult {
    text: string;
    total: number;
    pages: { text: string; num: number }[];
  }
  export class PDFParse {
    constructor(options?: { data: Uint8Array });
    load(): Promise<any>;
    getText(params?: any): Promise<TextResult>;
    static setWorker(workerSrc?: string): string;
  }
}

declare module 'mammoth' {
  export interface ExtractionResult {
    value: string;
    messages: any[];
  }
  export function extractRawText(options: { buffer: Buffer }): Promise<ExtractionResult>;
}
