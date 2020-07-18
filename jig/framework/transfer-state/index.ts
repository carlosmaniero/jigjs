export class TransferState {
  constructor(private state: Record<string, unknown> = {}) {
  }

  setState<V>(key: string, value: V): void {
    this.state[key] = value;
  }

  getState<T>(key: string): T {
    return this.state[key] as T;
  }

  hasState(key: string): boolean {
    return this.state.hasOwnProperty(key);
  }

  fetch<T>(key: string, fetcher: () => Promise<T>, callback: (err: unknown, value: T) => void): void {
    const executeCallback = (err: unknown, value: T) => {
      try {
        callback(err, value);
      } catch (e) {
        console.error(e);
      }
    };

    if (this.hasState(key)) {
      executeCallback(undefined, this.getState<T>(key));
      return;
    }

    fetcher().then((result) => {
      this.setState(key, result);
      executeCallback(undefined, result);
    }).catch((err) => {
      executeCallback(err, undefined);
      return undefined;
    });
  }

  flush(): Record<string, unknown> {
    return {...this.state};
  }
}
