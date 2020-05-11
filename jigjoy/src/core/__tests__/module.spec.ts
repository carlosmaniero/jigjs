import {JigJoyModule} from "../module";
import {DIContainer} from "../di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {ComponentAnnotation, html, RehydrateService, RenderResult} from "../../components/component";
import {Platform} from "../platform";

describe('Module', () => {
    beforeEach(() => {
        DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
        DIContainer.register(Platform, {useValue: new Platform(false)});
    })

    it('registers providers', function () {
        const container = DIContainer.createChildContainer();

        new JigJoyModule({
            providers: [
                {provide: "abc", useValue: "cba"},
                {provide: "def", useValue: "fed"}
            ]
        }).register(window, container);

        expect(container.resolve("abc")).toBe("cba");
        expect(container.resolve("def")).toBe("fed");
    });

    it('registers modules', function () {
        const container = DIContainer.createChildContainer();

        new JigJoyModule({
            modules: [
                new JigJoyModule({
                    providers: [
                        {provide: "abc", useValue: "cba"},
                        {provide: "def", useValue: "fed"}
                    ]
                })
            ]
        }).register(window, container);

        expect(container.resolve("abc")).toBe("cba");
        expect(container.resolve("def")).toBe("fed");
    });

    it('registers components', function () {
        const container = DIContainer.createChildContainer();

        @ComponentAnnotation('my-component')
        class MyComponent {
            render(): RenderResult {
                return html`Hello, World!`;
            }

        }

        new JigJoyModule({
            components: [
                MyComponent
            ]
        }).register(window, container);

        document.body.appendChild(document.createElement('my-component'));

        expect(document.body.innerHTML).toContain('Hello, World!');
    });

    it('registers sub modules', function () {
        const container = DIContainer.createChildContainer();

        new JigJoyModule({
            providers: [
                {provide: "abc", useValue: "cba"},
            ]
        }).andThen((container) => {
            const value = container.resolve("abc");

            return new JigJoyModule({
                providers: [{
                    provide: "def",
                    useValue: value + "!"
                }]
            });
        }).register(window, container);

        expect(container.resolve("def")).toBe("cba!");
    });
});
