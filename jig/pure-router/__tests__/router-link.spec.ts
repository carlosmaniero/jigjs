import {RouterModule} from "../module";
import {configureJSDOM} from "../../core/dom";
import {Routes} from "../routes";
import {Route, RouteLinkElement} from "../router-link";
import {html, renderComponent} from "../../pure-components/pure-component";
import {waitForPromises} from "../../testing/wait-for-promises";

describe('router link', () => {
    describe('rendering the content', () => {
        it('renders the given content', () => {
            const dom = configureJSDOM(undefined, 'http://jigjs.com/');

            const module = new RouterModule(dom.window, new Routes([
                {
                    path: '/',
                    name: 'index',
                    handler: jest.fn()
                }
            ]));

            const routerLink = module.linkFactory.createLink(
                new Route('index'),
                new RouteLinkElement(html`<span>Hello!</span>`, {class: 'link-address'})
            );

            renderComponent(dom.body, routerLink);

            expect(dom.body.querySelector('a').textContent).toBe('Hello!');
            expect(dom.body.querySelector('a').className).toBe('link-address');
        });

        it('updates the content', async () => {
            const dom = configureJSDOM(undefined, 'http://jigjs.com/');

            const module = new RouterModule(dom.window, new Routes([
                {
                    path: '/',
                    name: 'index',
                    handler: jest.fn()
                }
            ]));

            const routerLink = module.linkFactory.createLink(
                new Route('index'),
                new RouteLinkElement(html`<span>Hello!</span>`, {class: 'link-address'})
            );

            renderComponent(dom.body, routerLink);

            routerLink.updateElement(new RouteLinkElement('Hi!'));

            await waitForPromises();

            expect(dom.body.querySelector('a').innerHTML).toBe('Hi!');
            expect(dom.body.querySelector('a').className).toBe('');
        });
    });

    describe('handling link', () => {
        let dom;
        beforeEach(() => {
            dom = configureJSDOM(undefined, 'http://jigjs.com/');
        });

        it('renders the link', () => {
            const module = new RouterModule(dom.window, new Routes([
                {
                    path: '/home',
                    name: 'index',
                    handler: jest.fn()
                }
            ]));

            const routerLink = module.linkFactory.createLink(
                new Route('index'),
                new RouteLinkElement(html`<span>Hello!</span>`, {class: 'link-address'})
            );

            renderComponent(dom.body, routerLink);

            expect(dom.body.querySelector('a').getAttribute('href')).toBe('/home');
        });

        it('updates the link', async () => {
            const module = new RouterModule(dom.window, new Routes([
                {
                    path: '/home',
                    name: 'index',
                    handler: jest.fn()
                },
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler: jest.fn()
                }
            ]));

            const routerLink = module.linkFactory.createLink(
                new Route('index'),
                new RouteLinkElement(html`<span>Hello!</span>`, {class: 'link-address'})
            );

            renderComponent(dom.body, routerLink);

            routerLink.updateRoute(new Route('hello', {name: 'world'}));

            await waitForPromises();

            expect(dom.body.querySelector('a').getAttribute('href')).toBe('/hello/world');
        });

        it('changes route when click', async () => {
            const module = new RouterModule(dom.window, new Routes([
                {
                    path: '/home',
                    name: 'index',
                    handler: jest.fn()
                },
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler: jest.fn()
                }
            ]));

            const routerLink = module.linkFactory.createLink(
                new Route('hello', {name: 'world'}),
                new RouteLinkElement(html`<span>Hello!</span>`, {class: 'link-address'})
            );

            renderComponent(dom.body, routerLink);
            dom.body.querySelector('a').click();

            expect(module.history.getCurrentUrl()).toBe('/hello/world');
        });

        describe('special clicking', () => {
            let dom;
            let module;
            let routerLink;

            beforeEach(() => {
                dom = configureJSDOM(undefined, 'http://jigjs.com/');

                module = new RouterModule(dom.window, new Routes([
                    {
                        path: '/home',
                        name: 'index',
                        handler: jest.fn()
                    },
                    {
                        path: '/#:name',
                        name: 'hello',
                        handler: jest.fn()
                    }
                ]));

                routerLink = module.linkFactory.createLink(
                    new Route('hello', {name: 'world'}),
                    new RouteLinkElement(html`<span>Hello!</span>`, {class: 'link-address'})
                );

                renderComponent(dom.body, routerLink);
            });

            it('does nothing when use meta button', () => {
                dom.body.querySelector('a').dispatchEvent(new dom.window.MouseEvent('click', {
                    metaKey: true
                }));

                expect(module.history.getCurrentUrl()).toBe('/');
            });

            it('does nothing when use shif button', () => {
                dom.body.querySelector('a').dispatchEvent(new dom.window.MouseEvent('click', {
                    shiftKey: true
                }));

                expect(module.history.getCurrentUrl()).toBe('/');
            });

            it('does nothing when use alt button', () => {
                dom.body.querySelector('a').dispatchEvent(new dom.window.MouseEvent('click', {
                    altKey: true
                }));

                expect(module.history.getCurrentUrl()).toBe('/');
            });

            it('does nothing when use control button', () => {
                dom.body.querySelector('a').dispatchEvent(new dom.window.MouseEvent('click', {
                    ctrlKey: true
                }));

                expect(module.history.getCurrentUrl()).toBe('/');
            });
        });
    });
});
