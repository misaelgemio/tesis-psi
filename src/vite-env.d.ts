/// <reference types="vite/client" />

declare module "jstat" {
  const jstat: {
    normal: { cdf: (x: number, mean: number, std: number) => number; inv: (p: number, mean: number, std: number) => number };
    studentt: { cdf: (x: number, df: number) => number };
    [key: string]: unknown;
  };
  export default jstat;
}
