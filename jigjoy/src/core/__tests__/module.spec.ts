import '../register';
import {JigJoyModule} from "../module";
import {DIContainer} from "../di";
import {container} from "tsyringe";
import {Component, html, RenderResult} from "../../components/component";

describe('Module', () => {
    beforeEach(() => {
        container.reset();
    })

    it('registers providers', function () {
        new JigJoyModule({
            providers: [
                {provide: "abc", useValue: "cba"},
                {provide: "def", useValue: "fed"}
            ]
        }).register(window);

        expect(DIContainer.resolve("abc")).toBe("cba");
        expect(DIContainer.resolve("def")).toBe("fed");
    });

    it('registers modules', function () {
        new JigJoyModule({
            modules: [new JigJoyModule({
                providers: [
                    {provide: "abc", useValue: "cba"},
                    {provide: "def", useValue: "fed"}
                ]
            })]
        }).register(window);

        expect(DIContainer.resolve("abc")).toBe("cba");
        expect(DIContainer.resolve("def")).toBe("fed");
    });

    it('registers components', function () {
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
        }).register(window);

        document.body.appendChild(document.createElement('my-component'));

        expect(document.body.innerHTML).toContain('Hello, World!');
    });

    it('registers providers', function () {
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
        }).register(window);

        expect(DIContainer.resolve("def")).toBe("cba!");
    });
});
