export interface Subscription {
    unsubscribe: () => void;
}

export type Callback<T> = (value: T) => void;

export interface Subscriber<T> {
    subscribe: (callback: Callback<T>) => Subscription;
}

export interface Publisher<T> {
    publish: (value: T) => void;
}

export class Subject<T> implements Subscriber<T>, Publisher<T> {
    private callbacks: Callback<T>[] = []

    publish(value: T): void {
        this.callbacks.forEach((callback) => {
            callback(value);
        });
    }

    subscribe(callback: (value: T) => void): Subscription {
        this.callbacks.push(callback);
        return {
            unsubscribe: (): void => {
                this.callbacks = this.callbacks.filter((otherCallback) => {
                    return otherCallback !== callback
                });
            }
        }
    }
}
