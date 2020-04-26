import {JSDOM} from 'jsdom';
import {when} from 'jest-when';
import {FrontEndMetadata} from "./front-end.metadata";
import {templateServiceFactory} from "./template-service";
import {FragmentResult} from "./fragment-resolver";
const path = require('path');


describe('TemplateService', () => {
    const singleFragmentFile = path.join(__dirname, './__tests_assets__/single-fragment.html');
    const customElementsFile = path.join(__dirname, './__tests_assets__/custom-elements.html');
    const testTemplateFile = path.join(__dirname, './__tests_assets__/index.html');

    it('releases the result when the fetch is finished', async () => {
        const microFrontEndResolverMock = jest.fn(() => Promise.resolve({
            html: 'stub',
            eventDependencies: []
        }));

        const templateHtml = await templateServiceFactory(
            singleFragmentFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadata(),
            {name: 'World'}
        );

        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('front-end-fragment').textContent)
            .toContain('stub');
    });

    it('renders with template context', async () => {
        const microFrontEndResolverMock = jest.fn(() => Promise.resolve({
            html: 'stub',
            eventDependencies: []
        }));

        const templateHtml = await templateServiceFactory(
            testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadata(),
            {name: 'World'}
        );

        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('h2').textContent)
            .toContain('Hello, World');
        expect(template.querySelector('h3').textContent)
            .toContain('Hello, World');
    });

    it('renders the template view template', async () => {
        const microFrontEndResolverMock = jest.fn(() => Promise.resolve({
            html: 'stub',
            eventDependencies: []
        }));

        const templateHtml = await templateServiceFactory(
            testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadata());
        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('h1').textContent)
            .toContain('Welcome to Pokémon Shop')
    });

    it('renders catalog fragment', async () => {
        const microFrontEndResolverMock = jest.fn();

        when(microFrontEndResolverMock)
            .mockReturnValue(Promise.resolve({
                html: 'stub',
                eventDependencies: []
            }))
            .calledWith({
                url: 'http://localhost:3000/catalog/page/1',
                headers: {},
                required: false
            })
            .mockReturnValue(Promise.resolve({
                html: 'yay!',
                eventDependencies: []
            }));

        const templateHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadata());
        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('#catalog-fragment').textContent)
            .toContain('yay!')
    });

    it('renders cart fragment', async () => {
        const microFrontEndResolverMock = jest.fn();

        when(microFrontEndResolverMock)
            .mockReturnValue(Promise.resolve({
                html: 'stub',
                eventDependencies: []
            }))
            .calledWith({
                    url: 'http://localhost:3001/',
                    headers: {key: "value"},
                    required: false
                })
            .mockReturnValue(Promise.resolve({
                html: 'yoy!',
                eventDependencies: []
            }));

        const templateHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadata());
        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('#cart-fragment').textContent)
            .toContain('yoy!')
    });

    it('appends the dependency script', async () => {
        const microFrontEndResolverMock = jest.fn();

        when(microFrontEndResolverMock)
            .mockReturnValue(Promise.resolve({
                html: 'stub',
                eventDependencies: []
            }))
            .calledWith({
                url: 'http://localhost:3000/catalog/page/1',
                headers: {},
                required: false
            })
            .mockReturnValue(Promise.resolve({
                html: 'yoy!',
                eventDependencies: ['my-event']
            }));

        const templateHtml = await templateServiceFactory(
            testTemplateFile,
            {resolve: microFrontEndResolverMock},
            new FrontEndMetadata({
                'my-event': 'my-service.js',
            })
        );

        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect((template.querySelector('script:not(#__micro_front_end_metadata__)') as HTMLScriptElement).src)
            .toContain('my-service.js')
    });

    it('adds a script with the the front-end meta data', async () => {
        const microFrontEndResolverMock = jest.fn(() => {
            return Promise.resolve({
                html: 'stub',
                eventDependencies: []
            })
        });

        const eventMap = {
            'EVENT_BLA': '/service.js',
        };

        const templateHtml = await templateServiceFactory(
            testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadata(eventMap)
        );

        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('script#__micro_front_end_metadata__').textContent)
            .toBe(JSON.stringify(eventMap));
    });

    it('renders a custom element', async () => {
        const microFrontEndResolverMock = jest.fn(() => {
            return new Promise<FragmentResult>(() => {});
        });

        const templateHtml = await templateServiceFactory(
            customElementsFile,
            {resolve: microFrontEndResolverMock},
            new FrontEndMetadata({}),
            {},
            [
                (window: any) => {
                    class MyCoolComponent extends window.HTMLElement {
                        constructor() {
                            super();
                        }
                        connectedCallback() {
                            this.innerHTML = 'cool!'
                        }
                    }

                    window.customElements.define('my-cool-component', MyCoolComponent);
                }
            ]
        );

        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('my-cool-component').textContent).toBe('cool!');
    })
});
