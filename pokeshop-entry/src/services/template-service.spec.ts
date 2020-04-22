import {JSDOM} from 'jsdom';
import {when} from 'jest-when';
import {FrontEndService} from "./front-end.service";
import {templateServiceFactory} from "./template-service";
import path from "path";


describe('TemplateService', () => {
    const testTemplateFile = path.join(__dirname, './__tests_assets__/index.html');

    it('renders the home view template', async () => {
        const microFrontEndResolverMock = jest.fn(() => Promise.resolve({
            html: 'stub',
            eventDependencies: null
        }));

        const homeHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndService());
        const home = new JSDOM(await homeHtml.render()).window.document.body;

        expect(home.querySelector('h1').textContent)
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

        const homeHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndService());
        const home = new JSDOM(await homeHtml.render()).window.document.body;

        expect(home.querySelector('#catalog-fragment').textContent)
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

        const homeHtml = await templateServiceFactory(testTemplateFile, {resolve: microFrontEndResolverMock}, new FrontEndService());
        const home = new JSDOM(await homeHtml.render()).window.document.body;

        expect(home.querySelector('#cart-fragment').textContent)
            .toContain('yoy!')
    });

    it('appends the dependency script', async () => {
        const microFrontEndResolverMock = jest.fn();
        const getServiceForEventMock = jest.fn();

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

        when(getServiceForEventMock)
            .calledWith('my-event')
            .mockReturnValue('my-service.js');

        const homeHtml = await templateServiceFactory(
            testTemplateFile,
            {resolve: microFrontEndResolverMock},
            {getServiceForEvent: getServiceForEventMock} as any
        );

        const home = new JSDOM(await homeHtml.render()).window.document.body;

        expect(home.querySelector('script').src)
            .toContain('my-service.js')
    });
});
