import {configureJSDOM} from "../../core/dom";
import {History} from "../history";
import {Routes} from "../routes";
import {Navigation} from "../navigation";

describe('navigation', () => {
    it('navigates to the given route', () => {
        const dom = configureJSDOM(undefined, 'http://jigjs.com/');
        const history = new History(dom.window);

        const routes = new Routes([
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
        ]);

        new Navigation(routes, history).navigateTo('hello', {name: 'world'});
        expect(history.getCurrentUrl()).toBe('/hello/world');
        new Navigation(routes, history).navigateTo('index');
        expect(history.getCurrentUrl()).toBe('/');
    });
});
