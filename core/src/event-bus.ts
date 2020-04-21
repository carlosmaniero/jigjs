export type EventBusListener<T> = (detail: T) => void;

export interface EventSubscription {
    unsubscribe: () => void;
}

export type EventPublisher = <T>(eventName: string, detail?: T) => void;

export type EventSubscriber = <T>(eventName: string, listener: EventBusListener<T>) => EventSubscription;

export const publishEvent: EventPublisher = <T>(eventName: string, detail?: T) => {
    const event = new CustomEvent(eventName, {
        bubbles: true,
        detail: detail
    });

    document.dispatchEvent(event);
}

export const subscribeToEvent = <T>(eventName: string, listener: EventBusListener<T>): EventSubscription => {
    const listenerWrapped = (event: CustomEvent) => {
        listener(event.detail);
    };

    document.addEventListener(eventName, listenerWrapped);

    return createSubscription(eventName, listenerWrapped);
}

const createSubscription = <T>(eventName: string, listener: EventListener): EventSubscription => ({
    unsubscribe: () => {
        document.removeEventListener(eventName, listener);
    },
})
