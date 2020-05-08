import '../../core/register';
import {FragmentComponent, FragmentComponentFactory} from "../fragment-component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "../fragments";
import {DIContainer} from "../../core/di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {
    ComponentAnnotation,
    componentFactoryFor,
    html,
    RehydrateService,
    RenderResult
} from "../../components/component";
import {JSDOM} from 'jsdom';
import * as testingLibrary from '@testing-library/dom';

describe('Fragment Component', () => {
    beforeEach(() => {
        DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
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

            @ComponentAnnotation('my-fragment')
            class MyFragment extends FragmentComponent {
                readonly options: FragmentOptions = options;

                protected response: FragmentResponse;

                constructor() {
                    super(fragmentResolverMock, fragmentContentRenderMock);
                }
            }

            const dom = new JSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, DIContainer);

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

            @ComponentAnnotation('my-fragment')
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

            const dom = new JSDOM();

            const factory = componentFactoryFor(MyFragment);
            factory.registerComponent(dom.window as any, DIContainer);

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


            DIContainer.register(RehydrateService.InjectionToken, {useClass: ServerRehydrateService})
            DIContainer.register(FragmentResolver.InjectionToken, {useValue: fragmentResolverMock});
            DIContainer.register(FragmentContentRender.InjectionToken, {useValue: fragmentContentRenderMock});

            const fragmentComponentFactory = DIContainer.resolve(FragmentComponentFactory);

            const fragment = fragmentComponentFactory.createFragment({
                selector: "my-fragment",
                options
            });

            const dom = new JSDOM();

            const factory = componentFactoryFor(fragment);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-fragment></my-fragment>';

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(testingLibrary.getByText(dom.window.document.body, 'How')).not.toBeNull();
        });
    })
});
