import {JSDOM} from 'jsdom';
import {when} from 'jest-when';
import {FrontEndMetadata} from "./front-end.metadata";
import {templateServiceFactory} from "./template-service";
const path = require('path');


describe('TemplateService', () => {
    const testTemplateFile = path.join(__dirname, './__tests_assets__/index.html');

    it('renders with template context', async () => {
        const microFrontEndResolverMock = jest.fn(() => Promise.resolve({
            html: 'stub',
            eventDependencies: null
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
            eventDependencies: null
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
                eventDependencies: null
            }))
            .calledWith('http://localhost:3000/catalog/page/1')
            .mockReturnValue(Promise.resolve({
                html: 'yay!',
                eventDependencies: null
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
                eventDependencies: null
            }))
            .calledWith('http://localhost:3001/')
            .mockReturnValue(Promise.resolve({
                html: 'yoy!',
                eventDependencies: null
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
                eventDependencies: null
            }))
            .calledWith('http://localhost:3001/')
            .mockReturnValue(Promise.resolve({
                html: 'yoy!',
                eventDependencies: 'my-event'
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
                eventDependencies: null
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
    })
});
