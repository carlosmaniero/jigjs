import {JigJoyModule} from "../module";
import {DIContainer} from "../di";
import {Component, html, RehydrateService, RenderResult} from "../../components/component";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";

describe('Module', () => {
    beforeEach(() => {
        DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
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

        new JigJoyModule({
            components: [
                new class extends Component {
                    readonly selector: string;

                    constructor() {
                        super();
                        this.selector = 'my-component';
                    }

                    render(): RenderResult {
                        return html`Hello, World!`;
                    }

                }
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
