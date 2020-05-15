import '../register';
import {JigApp} from "../app";
import {globalContainer} from "../di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, RehydrateService, RenderResult} from "../../components/component";
import {html} from "../../template/render";
import {Platform} from "../platform";
import {configureJSDOM} from "../dom";
import {waitForPromises} from "../../testing/wait-for-promises";


describe('JigEntryPoint', () => {

    it('renders the given EntryPoint', async () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigApp({
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        await entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-app></jig-app>`

        expect(jsdom.serialize()).toContain('hell yeah!');
    });
});
