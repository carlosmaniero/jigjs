const startApp = (browser) => {
    import(/* webpackChunkName: "home.ts" */ '../src/apps/home.ts').then(({default: app}) => {
        browser.init(app);
    })
}

import(/* webpackChunkName: "browser" */ '../src/browser').then(({default: browser}) => {
    startApp(browser);
}).catch(error => 'An error occurred while loading the component');
