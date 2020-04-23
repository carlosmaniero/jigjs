import {JSDOM} from 'jsdom';
import {when} from 'jest-when';
import {FrontEndMetadataService} from "./front-end-metadata.service";
import {templateServiceFactory} from "./template-service";
import path from "path";


describe('TemplateService', () => {
    const testTemplateFile = path.join(__dirname, './__tests_assets__/index.html');

    it('renders the template view template', async () => {
        const microFrontEndResolverMock = jest.fn(() => Promise.resolve({
            html: 'stub',
            eventDependencies: null
        }));

        const templateHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadataService());
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

        const templateHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadataService());
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

        const templateHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadataService());
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
            new FrontEndMetadataService({
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
            testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndMetadataService(eventMap)
        );

        const template = new JSDOM(await templateHtml.render()).window.document.body;

        expect(template.querySelector('script#__micro_front_end_metadata__').textContent)
            .toBe(JSON.stringify(eventMap));
    })
});
