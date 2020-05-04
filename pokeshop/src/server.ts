import '../../jigjoy/src/core/register';
import {JigJoyServer} from "../../jigjoy/src/server/server";
import path from "path";
import {Component, html, RenderResult} from "../../jigjoy/src/components/component";
import {JigJoyApp} from "../../jigjoy/src/core/app";
import {JigJoyModule} from "../../jigjoy/src/core/module";
import {FragmentComponentFactory} from "../../jigjoy/src/fragments/fragment-component";
import "../../jigjoy/src/fragments/server/server-fragment-module";

class Bla extends Component {
    selector: string = "bla-component";
    number = 0;

    render(): RenderResult {
        return html`<cart-count-fragment></cart-count-fragment>`;
    }

    mount() {
        this.number++;
        this.updateRender();
    }
}

const app = new JigJoyApp({bootstrap: Bla})
    .registerModuleUsingContainer((container) => {
        const fragmentFactory: FragmentComponentFactory = container.resolve(FragmentComponentFactory);

        return new JigJoyModule({
            components: [
                fragmentFactory.createFragment({
                    selector: 'cart-count-fragment',
                    options: {
                        url: 'http://127.0.0.1:3001'
                    },
                    onErrorRender: () => html`Error :(`
                })
            ]
        })
    });

new JigJoyServer({
    routes: [{
        route: '/',
        templatePath: path.join(__dirname, 'templates', 'index.html'),
        app
    }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
}).start()
