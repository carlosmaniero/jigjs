import {FragmentComponent, FragmentComponentFactory} from "../fragment-component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "../fragments";
import {globalContainer} from "../../../core/di";
import {ServerRehydrateService} from "../../../components/server/server-rehydrate-service";
import {
    Component,
    componentFactoryFor,
    html,
    Prop,
    RehydrateService,
    RenderResult
} from "../../../components/component";
import * as testingLibrary from '@testing-library/dom';
import {Platform} from "../../../core/platform";
import {configureJSDOM} from "../../../core/dom";
import {render, Renderable} from "../../../template/render";
import waitForExpect from "wait-for-expect";

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
            }

            globalContainer.register(MyFragment, MyFragment);
            globalContainer.registerInstance(FragmentResolver.InjectionToken, fragmentResolverMock);
            globalContainer.registerInstance(FragmentContentRender.InjectionToken, fragmentContentRenderMock);

            const dom = configureJSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(testingLibrary.getByText(dom.window.document.body, 'How')).not.toBeNull();
            expect(fragmentResolverMock.resolve).toBeCalledWith(options);
            expect(fragmentContentRenderMock.render).toBeCalledWith(responseHtml);
        });

        it('update fragment when props changes', async () => {
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


            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                @Prop()
                private readonly id;

                @Prop()
                private readonly anyOther;

                get options(): FragmentOptions {
                    return {
                        url: `http://localhost:3000/${this.id}`
                    };
                }
            }

            globalContainer.register(MyFragment, MyFragment);
            globalContainer.registerInstance(FragmentResolver.InjectionToken, fragmentResolverMock);
            globalContainer.registerInstance(FragmentContentRender.InjectionToken, fragmentContentRenderMock);

            const dom = configureJSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            render(html`<my-fragment @id="1"></my-fragment>`)(dom.body);
            render(html`<my-fragment @id="2"></my-fragment>`)(dom.body);
            render(html`<my-fragment @id="2" anyOther="1"></my-fragment>`)(dom.body);

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(testingLibrary.getByText(dom.window.document.body, 'How')).not.toBeNull();
            expect(fragmentResolverMock.resolve).toBeCalledWith({url: 'http://localhost:3000/1'});
            expect(fragmentContentRenderMock.render).toBeCalledWith(responseHtml);
            expect(fragmentResolverMock.resolve).toBeCalledWith({url: 'http://localhost:3000/2'});
            expect(fragmentResolverMock.resolve).toBeCalledTimes(2);
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
                    super(fragmentResolverMock, fragmentContentRenderMock, new Platform(false));
                }

                onErrorRender(error: Error): RenderResult {
                    expect(error).toEqual(resolverError);
                    return html`It was not possible to fetch fragment`
                }
            }

            globalContainer.registerInstance(FragmentResolver.InjectionToken, fragmentResolverMock);
            globalContainer.registerInstance(FragmentContentRender.InjectionToken, fragmentContentRenderMock);
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
            const fragmentResolverMock = {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                resolve: <T>(): Promise<T> => new Promise(() => {})
            };

            const fragmentContentRenderMock = {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                render:  <T>(): Promise<T> => new Promise(() => {
                    return;
                })
            };

            const options = {url: 'http://localhost:3000/'};

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                protected placeholder(): RenderResult {
                    return html`Waiting`;
                }
            }

            globalContainer.registerInstance(FragmentResolver.InjectionToken, fragmentResolverMock);
            globalContainer.registerInstance(FragmentContentRender.InjectionToken, fragmentContentRenderMock);
            globalContainer.register(MyFragment, MyFragment);

            const dom = configureJSDOM()

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            const fragmentComponent: HTMLElement = dom.window.document.querySelector('my-fragment');

            expect(testingLibrary.getByText(fragmentComponent, 'Waiting')).not.toBeNull();
        });
    });

    describe('async fragments', () => {
        it('renders the placeholder at the server', async () => {
            const fragmentResolverMock = {resolve: jest.fn(() => Promise.resolve())};
            const fragmentContentRenderMock = {render: jest.fn()};

            globalContainer.registerInstance(FragmentResolver.InjectionToken, fragmentResolverMock);
            globalContainer.registerInstance(FragmentContentRender.InjectionToken, fragmentContentRenderMock);

            const options = {url: 'http://localhost:3000/', async: true};

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                placeholder(): Renderable {
                    return html`fragment placeholder`
                }
            }

            globalContainer.register(MyFragment, MyFragment);

            const dom = configureJSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(fragmentResolverMock.resolve).not.toBeCalled();
            expect(fragmentContentRenderMock.render).not.toBeCalled();
            expect(testingLibrary.getByText(dom.body, 'fragment placeholder')).not.toBeNull();
        });

        it('resolves the async fragment at the browser', async () => {
            const fragmentResolverMock = {resolve: jest.fn(() => Promise.resolve())};
            const fragmentContentRenderMock = {render: jest.fn()};
            globalContainer.unregister(Platform);
            globalContainer.registerInstance(Platform, Platform.browser());
            globalContainer.registerInstance(FragmentResolver.InjectionToken, fragmentResolverMock);
            globalContainer.registerInstance(FragmentContentRender.InjectionToken, fragmentContentRenderMock);

            const options = {url: 'http://localhost:3000/', async: true};

            @Component('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                placeholder(): Renderable {
                    return html`fragment placeholder`
                }
            }

            globalContainer.register(MyFragment, MyFragment);

            const dom = configureJSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-fragment rehydrate-context-name="0"></my-fragment>';

            await waitForExpect(() => {
                expect(fragmentResolverMock.resolve).toBeCalled();
            });
        });
    });
});
