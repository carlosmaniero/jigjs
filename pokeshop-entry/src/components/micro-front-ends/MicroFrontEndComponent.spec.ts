import {JSDOM} from "jsdom";
import {registerMicroFrontEndComponent} from "./MicroFrontEndComponent";

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
            expect(resolver).toBeCalledWith("http://localhost:3001/", {key: "value"});
            expect(fragmentElement.textContent).toBe('bla!');
            done();
        }

        registerMicroFrontEndComponent(jsdom.window, {resolve: resolver});
    })
})
