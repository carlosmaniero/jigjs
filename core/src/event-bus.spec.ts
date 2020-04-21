import {subscribeToEvent, publishEvent} from "./event-bus";

describe('event-bus', () => {
    const payload = {hello: 'world'};

    it('sends an event using dispatchEvent', (done) => {
        const listenerMock = jest.fn();

        document.addEventListener('my-event', (event: CustomEvent) => {
            expect(event.detail).toBe(payload);
            done();
        });

        publishEvent('my-event', payload);
    });

    it('listen to an event', () => {
        const listenerMock = jest.fn();

        subscribeToEvent('my-event', listenerMock);
        publishEvent('my-event', payload);

        expect(listenerMock).toBeCalledWith(payload)
    });

    it('unsubscribe to an event', () => {
        const listenerMock = jest.fn();

        subscribeToEvent('my-event', listenerMock)
            .unsubscribe();

        publishEvent('my-event', payload);

        expect(listenerMock).not.toBeCalled();
    });
})
