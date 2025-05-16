declare module 'chalk' {
  interface ChalkInstance {
    (text: string): string;
    bold: ChalkInstance;
    dim: ChalkInstance;
    italic: ChalkInstance;
    underline: ChalkInstance;
    inverse: ChalkInstance;
    hidden: ChalkInstance;
    strikethrough: ChalkInstance;
    visible: ChalkInstance;
    black: ChalkInstance;
    red: ChalkInstance;
    green: ChalkInstance;
    yellow: ChalkInstance;
    blue: ChalkInstance;
    magenta: ChalkInstance;
    cyan: ChalkInstance;
    white: ChalkInstance;
    gray: ChalkInstance;
    grey: ChalkInstance;
    blackBright: ChalkInstance;
    redBright: ChalkInstance;
    greenBright: ChalkInstance;
    yellowBright: ChalkInstance;
    blueBright: ChalkInstance;
    magentaBright: ChalkInstance;
    cyanBright: ChalkInstance;
    whiteBright: ChalkInstance;
    bgBlack: ChalkInstance;
    bgRed: ChalkInstance;
    bgGreen: ChalkInstance;
    bgYellow: ChalkInstance;
    bgBlue: ChalkInstance;
    bgMagenta: ChalkInstance;
    bgCyan: ChalkInstance;
    bgWhite: ChalkInstance;
    bgBlackBright: ChalkInstance;
    bgRedBright: ChalkInstance;
    bgGreenBright: ChalkInstance;
    bgYellowBright: ChalkInstance;
    bgBlueBright: ChalkInstance;
    bgMagentaBright: ChalkInstance;
    bgCyanBright: ChalkInstance;
    bgWhiteBright: ChalkInstance;
    rgb: (r: number, g: number, b: number) => ChalkInstance;
    hex: (color: string) => ChalkInstance;
    bgRgb: (r: number, g: number, b: number) => ChalkInstance;
    bgHex: (color: string) => ChalkInstance;
    stripColor: (text: string) => string;
  }

  const chalk: ChalkInstance;
  export = chalk;
  export default chalk;
}
