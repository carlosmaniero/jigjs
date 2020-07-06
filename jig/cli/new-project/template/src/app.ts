import '@abraham/reflection';
import {AppFactory} from "jigjs/framework/server/ssr";
import {RouterModule} from "jigjs/framework/router/module";
import {Routes} from "jigjs/framework/router/routes";
import {App} from "jigjs/framework/app/app";
import {Home} from "./pages/home";
import {MyPage} from "./pages/my-page";


export const appFactory: AppFactory = (window) => {
    const routerModule = new RouterModule(window, new Routes([
        {
            path: '/',
            name: 'home',
            handler(params, render) {
                render(new Home(routerModule.linkFactory))
            }
        },
        {
            path: '/another/page',
            name: 'my-page',
            handler(params, render) {
                // You can call the render as much as you want.
                // It means that you could render a loading component before the async function.

                return new Promise((resolve) => {
                    setTimeout(() => {
                        render(new MyPage());
                        resolve();
                    }, 2000);
                });
            }
        }
    ]));

    return new App(routerModule)
}
