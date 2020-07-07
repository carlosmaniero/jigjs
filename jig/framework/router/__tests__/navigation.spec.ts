import {configureJSDOM} from "../../../core/dom";
import {Routes} from "../routes";
import {RouterModule} from "../module";
import {Platform} from "../../patform/platform";

describe('navigation', () => {
    it('navigates to the given route', () => {
        const dom = configureJSDOM(undefined, 'http://jigjs.com/');

        const routerModule = new RouterModule(dom.window, Platform.browser(), new Routes([
            {
                path: '/',
                name: 'index',
                handler: jest.fn()
            },
            {
                path: '/hello/:name',
                name: 'hello',
                handler: jest.fn()
            }
        ]));
        const {history, navigation} = routerModule;

        navigation.navigateTo('hello', {name: 'world'});
        expect(history.getCurrentUrl()).toBe('/hello/world');
        navigation.navigateTo('index');
        expect(history.getCurrentUrl()).toBe('/');
    });
});
