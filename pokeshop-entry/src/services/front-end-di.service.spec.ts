import {FrontEndDiService, frontEndDIServiceFromDocument} from "./front-end-di.service";
import {FrontEndMetadata} from "./front-end.metadata";
import {JSDOM} from "jsdom";

describe('FrontEnd Dependency Injection', () => {
    it('injects a script for a given event', () => {
        const jsdom = new JSDOM();

        const di = new FrontEndDiService(
            new FrontEndMetadata({
                'my-event': 'my-script.js',
            }),
            jsdom.window.document
        );

        di.injectDependencyOfEvents(['my-event']);

        expect(jsdom.window.document.querySelector('script').src)
            .toBe('my-script.js');
    });

    it('does not injects script for an unknown event', () => {
        const jsdom = new JSDOM();

        const di = new FrontEndDiService(
            new FrontEndMetadata({}),
            jsdom.window.document
        );

        di.injectDependencyOfEvents(['my-event']);

        expect(jsdom.window.document.querySelectorAll('script').length)
            .toBe(0);
    });

    it('does injects a script for a given event twice', () => {
        const jsdom = new JSDOM();

        const di = new FrontEndDiService(
            new FrontEndMetadata({
                'my-event': 'my-script.js',
            }),
            jsdom.window.document
        );

        di.injectDependencyOfEvents(['my-event']);
        di.injectDependencyOfEvents(['my-event']);

        expect(jsdom.window.document.querySelectorAll('script').length)
            .toBe(1);
    });

    it('does injects a script for a given event twice in same request', () => {
        const jsdom = new JSDOM();

        const di = new FrontEndDiService(
            new FrontEndMetadata({
                'my-event': 'my-script.js',
            }),
            jsdom.window.document
        );

        di.injectDependencyOfEvents(['my-event', 'my-event']);

        expect(jsdom.window.document.querySelectorAll('script').length)
            .toBe(1);
    });

    describe('document factory', () => {
        it('injects a script for a given event', () => {
            const jsdom = new JSDOM();

            jsdom.window.document.body.appendChild(
                new FrontEndMetadata({
                    'my-event': 'my-script.js',
                }).createScript(jsdom.window.document)
            )

            const di = frontEndDIServiceFromDocument(jsdom.window.document);

            di.injectDependencyOfEvents(['my-event']);

            expect((jsdom.window.document.querySelector('script[type="application/javascript"]') as HTMLScriptElement).src)
                .toBe('my-script.js');
        });
    });
});
