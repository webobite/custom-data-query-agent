declare module 'table' {
  export interface TableUserConfig {
    border: {
      topBody: string;
      topJoin: string;
      topLeft: string;
      topRight: string;
      bottomBody: string;
      bottomJoin: string;
      bottomLeft: string;
      bottomRight: string;
      bodyLeft: string;
      bodyRight: string;
      bodyJoin: string;
      joinBody: string;
      joinLeft: string;
      joinRight: string;
      joinJoin: string;
    };
    columns: Array<{
      alignment?: 'left' | 'center' | 'right';
      width?: number;
      wrapWord?: boolean;
      truncate?: number;
      paddingLeft?: number;
      paddingRight?: number;
    }>;
    columnDefault?: {
      paddingLeft: number;
      paddingRight: number;
    };
    drawHorizontalLine?: (index: number, size: number) => boolean;
  }

  export interface TableConfig extends TableUserConfig {
    columns: Array<{
      width: number;
    }>;
  }

  export function table(
    data: any[][],
    userConfig?: TableUserConfig
  ): string;

  export default table;
}
