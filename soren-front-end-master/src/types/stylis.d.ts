declare module 'stylis' {
  export type StylisPlugin = (
    element: unknown,
    index: number,
    children: unknown[],
    callback: (...args: unknown[]) => string | void,
  ) => string | void;

  export const prefixer: StylisPlugin;
}
