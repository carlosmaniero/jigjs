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

    flush(): Record<string, unknown> {
        return {...this.state};
    }
}
