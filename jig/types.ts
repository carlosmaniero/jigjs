export type JigWindow = Window & {
  HTMLElement: typeof HTMLElement;
  MouseEvent: typeof MouseEvent;
};

export type Constructor<T> = {
  new(...args: unknown[]): T;
}
