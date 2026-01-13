declare module 'ansi-to-html' {
  interface Options {
    fg?: string;
    bg?: string;
    newline?: boolean;
    escapeXML?: boolean;
    stream?: boolean;
    colors?: string[] | Record<number, string>;
  }

  export default class AnsiToHtml {
    constructor(options?: Options);
    toHtml(text: string): string;
  }
}
