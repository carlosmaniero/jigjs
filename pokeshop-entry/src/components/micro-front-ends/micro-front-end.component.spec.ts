import {JSDOM} from "jsdom";
import * as testingLibrary from "@testing-library/dom";
import {registerMicroFrontEndComponent} from "./micro-front-end.component";

describe('MicroFrontEndComponent', () => {
    it('resolves with headers', (done) => {
        const fragment =
            `<front-end-fragment
                id="cart-fragment"
                url="http://localhost:3001/"
                headers='{"key": "value"}'>
            </front-end-fragment>`;

        const jsdom = new JSDOM(fragment);

        const resolver = jest.fn(() => Promise.resolve({
            html: 'bla!'
        }));

        const fragmentElement = jsdom.window.document.querySelector('front-end-fragment');

        (fragmentElement as any).onFinish = () => {
            expect(resolver).toBeCalledWith({
                url: "http://localhost:3001/",
                headers: {key: "value"}
            });
            expect(fragmentElement.textContent).toBe('bla!');
            done();
        }

        registerMicroFrontEndComponent(jsdom.window, {resolve: resolver});
    });

    it('does not renders the fallback when the request fulfills', (done) => {
        const fragment =
            `<front-end-fragment
                id="cart-fragment"
                url="http://localhost:3001/"
                headers='{"key": "value"}'>
                <div slot="fragment-error">ERROR!</div>
            </front-end-fragment>`;

        const jsdom = new JSDOM(fragment);

        const resolver = jest.fn(() => Promise.resolve({
            html: 'bla!'
        }));

        const fragmentElement = jsdom.window.document.querySelector('front-end-fragment');

        (fragmentElement as any).onFinish = () => {
            expect(fragmentElement.textContent).not.toContain('ERROR!');
            done();
        }

        registerMicroFrontEndComponent(jsdom.window, {resolve: resolver});
    });

    it('renders the fallback when the request fulfills', (done) => {
        const fragment =
            `<front-end-fragment
                id="cart-fragment"
                url="http://localhost:3001/">
                <div slot="fragment-error">ERROR!</div>
            </front-end-fragment>`;

        const jsdom = new JSDOM(fragment);

        const resolver = jest.fn(() => Promise.reject('An issue happens!'));

        const fragmentElement = jsdom.window.document.querySelector('front-end-fragment');

        (fragmentElement as any).onFinish = () => {
            expect(testingLibrary.queryByText(jsdom.window.document as any, 'ERROR!')).not.toBeNull();
            done();
        }

        registerMicroFrontEndComponent(jsdom.window, {resolve: resolver});
    });

    it('sends the required attribute', (done) => {
        const fragment =
            `<front-end-fragment
                id="cart-fragment"
                url="http://localhost:3001/"
                headers='{"key": "value"}'
                required="true">
            </front-end-fragment>`;

        const jsdom = new JSDOM(fragment);

        const resolver = jest.fn(() => Promise.resolve({
            html: 'bla!'
        }));

        const fragmentElement = jsdom.window.document.querySelector('front-end-fragment');

        (fragmentElement as any).onFinish = () => {
            expect(resolver).toBeCalledWith({
                url: "http://localhost:3001/",
                headers: {key: "value"},
                required: true
            });
            expect(fragmentElement.textContent).toBe('bla!');
            done();
        }

        registerMicroFrontEndComponent(jsdom.window, {resolve: resolver});
    });
});
