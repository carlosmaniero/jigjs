import '../../core/register';
import {FragmentComponent, FragmentComponentFactory} from "../fragment-component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "../fragments";
import {globalContainer} from "../../core/di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, componentFactoryFor, html, RehydrateService, RenderResult} from "../../components/component";
import * as testingLibrary from '@testing-library/dom';
import {Platform} from "../../core/platform";
import {configureJSDOM} from "../../core/dom";

describe('Fragment Component', () => {
    beforeEach(() => {
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
        globalContainer.register(Platform, {useValue: new Platform(false)});
    });
    describe('component', () => {
        it('resolves using the given options', async () => {
            const responseHtml = '<b>Hey</b>';

            const fragmentResolverMock = {
                resolve: jest.fn(() => Promise.resolve({
                    html: responseHtml,
                    dependencies: []
                }))
            };

            const fragmentContentRenderMock = {
                render: jest.fn(() => {
                    const div = document.createElement('div');
                    div.innerHTML = '<i>How</i>';
                    return div;
                })
            };

            const options = {url: 'http://localhost:3000/'};

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                protected response: FragmentResponse;

                constructor() {
                    super(fragmentResolverMock, fragmentContentRenderMock);
                }
            }

            globalContainer.register(MyFragment, MyFragment);

            const dom = configureJSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(testingLibrary.getByText(dom.window.document.body, 'How')).not.toBeNull();
            expect(fragmentResolverMock.resolve).toBeCalledWith(options);
            expect(fragmentContentRenderMock.render).toBeCalledWith(responseHtml);
        });

        it('renders the on error view given a resolver error', async () => {
            const resolverError = new Error('my error');

            const fragmentResolverMock = {
                resolve: jest.fn(() => Promise.reject(resolverError))
            };

            const fragmentContentRenderMock = {
                render: jest.fn()
            };

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = {url: 'http://localhost:3000/'};

                protected response: FragmentResponse;

                constructor() {
                    super(fragmentResolverMock, fragmentContentRenderMock);
                }

                onErrorRender(error: Error): RenderResult {
                    expect(error).toEqual(resolverError);
                    return html`It was not possible to fetch fragment`
                }
            }

            globalContainer.register(MyFragment, MyFragment);

            const dom = configureJSDOM()

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(testingLibrary
                .getByText(dom.window.document.body, 'It was not possible to fetch fragment')).not.toBeNull();
        });
    });

    describe('Factory', () => {
        it('creates a Fragment', async () => {
            const responseHtml = '<b>Hey</b>';

            const fragmentResolverMock = {
                resolve: jest.fn(() => Promise.resolve({
                    html: responseHtml,
                    dependencies: []
                }))
            };

            const fragmentContentRenderMock = {
                render: jest.fn(() => {
                    const div = document.createElement('div');
                    div.innerHTML = '<i>How</i>';
                    return div;
                })
            };

            const options = {url: 'http://localhost:3000/'};


            globalContainer.register(RehydrateService.InjectionToken, {useClass: ServerRehydrateService})
            globalContainer.register(FragmentResolver.InjectionToken, {useValue: fragmentResolverMock});
            globalContainer.register(FragmentContentRender.InjectionToken, {useValue: fragmentContentRenderMock});
            globalContainer.register(FragmentComponentFactory, FragmentComponentFactory);
            const fragmentComponentFactory = globalContainer.resolve(FragmentComponentFactory);

            const fragment = fragmentComponentFactory.createFragment({
                selector: "my-fragment",
                options
            });

            globalContainer.register(fragment, fragment);

            const dom = configureJSDOM()

            const factory = componentFactoryFor(fragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(testingLibrary.getByText(dom.window.document.body, 'How')).not.toBeNull();
        });
    });

    describe('controlling the render', () => {
        it('returns a placeholder until the render is not completed', async () => {
            const responseHtml = '<b>Hey</b>';

            const fragmentResolverMock = {
                resolve: () => new Promise(() => {})
            };

            const fragmentContentRenderMock = {
                render:  () => new Promise(() => {})
            };

            const options = {url: 'http://localhost:3000/'};

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                constructor() {
                    super(fragmentResolverMock as any, fragmentContentRenderMock as any);
                }
            }

            globalContainer.register(MyFragment, MyFragment);

            const dom = configureJSDOM()

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            const fragmentComponent: HTMLElement = dom.window.document.querySelector('my-fragment');

            expect((fragmentComponent.childNodes[0] as any).className)
                .toBe(FragmentComponent.FragmentPlaceholderClass);
        });

        it('resolves using the given options', async () => {
            const responseHtml = '<b>Hey</b>';

            const fragmentResolverMock = {
                resolve: jest.fn(() => Promise.resolve({
                    html: responseHtml,
                    dependencies: []
                }))
            };

            const fragmentContentRenderMock = {
                render: jest.fn(() => {
                    const div = document.createElement('div');
                    div.innerHTML = '<i>How</i>';
                    return div;
                })
            };

            const options = {url: 'http://localhost:3000/'};

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                protected response: FragmentResponse;

                constructor() {
                    super(fragmentResolverMock, fragmentContentRenderMock);
                }
            }

            const dom = configureJSDOM()

            globalContainer.register(MyFragment, MyFragment);
            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment>Already Fetched!</my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(dom.window.document.querySelector('my-fragment').textContent).toBe('Already Fetched!');
        });
    });
});
