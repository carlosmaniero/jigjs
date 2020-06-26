import {History} from '../history'
import {configureJSDOM} from "../../core/dom";
import {subscribeToSideEffects} from "../../side-effect/observable";
import waitForExpect from "wait-for-expect";

describe('history', () => {
    it('defines the current url as window url', () => {
        const dom = configureJSDOM(undefined, 'http://jigjs.com/path?query=1#hash');
        const history = new History(dom.window);
        expect(history.getCurrentUrl()).toBe('/path?query=1#hash')
    });

    it('publishes side effects when url changes', () => {
        const dom = configureJSDOM(undefined, 'http://jigjs.com/alalal');
        const history = new History(dom.window);
        const stub = jest.fn();

        subscribeToSideEffects(history, stub);

        history.push('/hello/world');

        expect(stub).toBeCalled();
    });

    describe('pushing', () => {
        it('updates url given the url changes', () => {
            const dom = configureJSDOM(undefined, 'http://jigjs.com/alalal');
            const history = new History(dom.window);

            history.push('/hello/world');

            expect(history.getCurrentUrl()).toBe('/hello/world')
        });

        it('history.back updates the url', async () => {
            const dom = configureJSDOM(undefined, 'http://jigjs.com/home');
            const history = new History(dom.window);

            history.push('/hello/world');

            dom.window.history.back();

            await waitForExpect(() => {
                expect(history.getCurrentUrl()).toBe('/home')
            });
        });
    });
});
