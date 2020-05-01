import '../../core/register';
import {render} from "../../testing/utils";
import {FragmentComponent, resolverFragmentFactory} from "../fragment-component";
import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "../fragments";
import {DIContainer} from "../../core/di";
import {html, RenderResult} from "../../components/component";

describe('Fragment Component', () => {
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

            const component = render(new class MyFragment extends FragmentComponent {
                readonly selector: string = 'my-fragment';
                readonly options: FragmentOptions = options;

                protected response: FragmentResponse;

                constructor() {
                    super(fragmentResolverMock, fragmentContentRenderMock);
                }
            });

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(component.getByText('How')).not.toBeNull();
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

            const component = render(new class MyFragment extends FragmentComponent {
                readonly selector: string = 'my-fragment';
                readonly options: FragmentOptions = {url: 'http://localhost:3000/'};

                protected response: FragmentResponse;

                constructor() {
                    super(fragmentResolverMock, fragmentContentRenderMock);
                }

                onErrorRender(error: Error): RenderResult {
                    expect(error).toBe(resolverError);
                    return html`It was not possible to fetch fragment`
                }
            });

            await new Promise(resolve => setImmediate(() => resolve()));

            expect(component.getByText('It was not possible to fetch fragment')).not.toBeNull();
        });
    });

    describe('Factory', () => {
        it('creates a Fragment', async () => {
            const fragmentResolverMock = {resolve: jest.fn()};
            const fragmentContentRenderMock = {render: jest.fn()};
            const options = {url: 'http://localhost:3000/'};


            DIContainer.register(FragmentResolver.InjectionToken, {useValue: fragmentResolverMock});
            DIContainer.register(FragmentContentRender.InjectionToken, {useValue: fragmentContentRenderMock});

            const fragmentComponentFactory = resolverFragmentFactory();

            const fragment: FragmentComponent = fragmentComponentFactory.createFragment({
                selector: "my-fragment",
                options
            });

            expect(fragment.selector).toBe('my-fragment');
            expect(fragment.options).toBe(options);
        });
    })
});
