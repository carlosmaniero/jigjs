import {RouterModule} from 'jigjs/framework/router/module';
import {App, AppFactory} from 'jigjs/framework/app/app';
import {Home} from './pages/home';
import {MyPage} from './pages/my-page';
import {NotFound} from './pages/not-found';


export const appFactory: AppFactory = (window, platform) => {
  const routerModule = new RouterModule(window, platform);

  routerModule.routes
      .handle({
        path: '/',
        name: 'home',
        handler(params, render) {
          render(new Home(routerModule.linkFactory));
        },
      })
      .handle({
        path: '/another/page',
        name: 'my-page',
        async handler(params, render, transferState) {
          // You can call the render function as much as you want.
          // It means that you could render a loading component before a async function.

          // transfer state can be used to transfer information between server and browser.
          // In this example, the server had stores the 'page-title' state, and the browser just use it.
          // just open http://localhost:3333/another/page and look at the browser console:
          // You will see the log bellow.
          // In case you came to this handler using the link of the home page, you won't see the log below because
          // there won't a state set from server.
          if (transferState.hasState('page-title')) {
            console.log('cool! we have a page title from server!');
            render(new MyPage(transferState.getState('page-title')));

            return;
          }

          // a fake async function that takes two seconds to return a page title (it is mocking a request)
          const asyncMethodThatReturnsANicePageTitle = () => new Promise<string>((resolve) => {
            setTimeout(() => {
              resolve('Just another example!');
            }, 2000);
          });

          console.log('There is no page title information. fetching it...');
          const pageTitle = await asyncMethodThatReturnsANicePageTitle();

          // set the state to prevent browser to fetch it again.
          transferState.setState('page-title', pageTitle);

          // render the component
          render(new MyPage(pageTitle));
        },
      })
      .handle404((route: string, render) => {
        render(new NotFound(routerModule.linkFactory, route));
      });

  return new App(routerModule);
};
