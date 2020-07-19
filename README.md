<p align="center" style="color: #343a40">
  <img src="jig/ghassets/logo.svg" alt="jigjs" align="center">
  <h1 align="center">a front-end framework</h1>
</p>

 ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![Jig](https://github.com/carlosmaniero/jigjs/workflows/Jig/badge.svg) [![npm version](https://badge.fury.io/js/jigjs.svg)](https://badge.fury.io/js/jigjs) [![Coverage Status](https://coveralls.io/repos/github/carlosmaniero/jigjs/badge.svg?branch=main)](https://coveralls.io/github/carlosmaniero/jigjs?branch=main) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

jigjs is a web library that combines reactiveness with OOP. Making it easy to react to
object side-effects.


```typescript
import {observable, observing, observe} from "jigjs/reactive";

@observable()
class Greater {
    @observing()
    private name;

    constructor(name: string) {
        this.name = name;
    }

    say() {
        return `Hello, ${this.name}!`
    }
    
    updateName(name: string) {
        this.name = name;
    }
}

const greater = new Greater("World!");

const subscription = observe(greater, () => {
    console.log(greater.say());   
});

greater.updateName('Universe'); // calls the observer and prints "Hello, Universe"
greater.updateName('Mars'); // calls the observer and prints "Hello, Mars"

subscription.unsubscribe();

greater.updateName('Earth'); // does not prints anything
``` 

## Installation

```bash
npm install -g jigjs 
```

## Components

A component is a small UI peace that manages its own state. Whenever the class fields
decorated with `@observing` changes the component is re-rendered.

```typescript
import {component, html} from "jigjs/components";
import {observing} from "jigjs/reactive";

@component()
export class CounterComponent {
    @observing()
    private number: number;

    constructor(initialCount = 0) {
        this.number = initialCount;
    }

    reset() {
       this.number = 0;
    }

    render() {
        return html`
            <button onclick="${() => { this.number++ }}">+</button>
            ${this.number}
            <button onclick="${() => { this.number-- }}">-</button>
        `;
    }
}
```
 
Using the component: 

```typescript
import {component, html, renderComponent} from "jigjs/components";

@component()
export class CounterPage {
    private readonly counter: CounterComponent;

    constructor() {
        this.counter = new CounterComponent();
    }

    render() {
        return html`
            <h1>Counter</h1>
        
            ${this.counter}

            <hr>
    
            <button onclick=${this.counter.reset()}>Reset counter</button>
        `;
    }
}

renderComponent(document.querySelector('#root'), new CounterPage());
```

In jigjs you control the component instance. There isn't a magic way to update a component props. The component props
is its state, and you update it by using class methods.

## Styling the component

There is a css-in-js module for jigjs.

Read more about Jig.css [here](/jigcss).

## Creating an APP

As showed in the previous example, you can use jigjs as a simple library by using the `renderComponent` function.
However, it is also possible to use jigjs as a framework.

To start a jigjs project you can use the cli:

```bash
npm install -g jigjs
npx jigjs-new-project
``` 

![Installation demo](jig/ghassets/gif-fast.gif)

It comes with a `Router` system that enables `Single Page Applications`, Native `Server Side Rendering` and built-in 
`build system`.

### Routing

A router is composed by a `path`, a `name` and `handler`. 

- `path` is used to match the user request.
- `name` is used to reverse a route.
- `handler` is called when the path matches the user request.

```typescript
new Routes([
    {
        path: '/',
        name: 'index',
        handler(params, render) {
            render(new IndexPage());
        }
    },
    {
        path: '/hello/:name',
        name: 'hello',
        handler(params, render) {
            render(new HelloPage(params.name));
        }
    },
    {
        path: '/hello/?name=:name',
        name: 'hello:with-query',
        handler(params, render) {
            render(new HelloPage(params.name));
        }
    },
    {
        path: '/hello/#:name',
        name: 'hello:with-hash',
        handler(params, render) {
            render(new HelloPage(params.name));
        }
    }
]);
```

For more examples of router matchers: https://github.com/rcs/route-parser

### Navigation

To redirect users to a specific URL you can use the `Navigation` object.

```typescript
 const routerModule = new RouterModule(window, platform, new Routes([
    {
        path: '/',
        name: 'index',
        handler() {
            // ...
        }
    },
    {
        path: '/hello/:name',
        name: 'hello',
        handler() {
            // ...
        }
    }
]));

routerModule.navigation.navigateTo('hello', {name: 'world'});
routerModule.navigation.navigateTo('index');
```

### Async Handlers

When you need to process async functions in your components you can make your handler to return a promise.

```typescript
const routerModule = new RouterModule(window, platform, new Routes([
    {
        path: '/user/:id',
        name: 'show-user',
        async handler(params, render) {
            render(new PageLoadingComponent());
            const user = await fetchUser(params.id);
            render(new UserPage(user));
        }
    }
]));
```

The server will only release the request when the promise is resolved. You can call the `render` function as much as
you want, this is useful to render loading components that will be visible when the code is executed from the 
client-side.

### Custom Response

The handler receives the response object that can be used to add custom headers and status code.

There is no need to specify the response body since it will be always the render result.

```typescript
const routerModule = new RouterModule(window, platform, new Routes([
    {
        path: '/user/:id',
        name: 'show-user',
        async handler(params, render, transferState, response) {
            try {
                const user = await fetchUser(params.id);
                render(new UserPage(user));
            } catch(e) {
                response.statusCode = 404;
                response.headers['custom-error'] = 'User not found';

                render(new UserNotFoundPage());
            }
        }
    }
]));
```

### Transfer State

When you make a request to the jigjs server, it will pre-render the entire page and return it as raw HTML. Coming to 
browser, jigjs will execute the same code that had executed on server. It means that, any request you performed at the
server-side will be performed again.

To prevent this kind of behaviour you must use `TransferState`. The`TransferState` is a key-value object that can 
be shared from server to browser. Once the server stores a value using `TransferState.setState` it will be available 
to browser thought the `TransferState.getState`.

```typescript
const routerModule = new RouterModule(window, platform, new Routes([
    {
        path: '/my-transfer-state-page',
        name: 'my-transfer-state-page',
        async handler(params, render, transferState) {
            if (transferState.hasState('page-title')) {
                render(new MyPage(transferState.getState('page-title')));
                return;
            }

            render(new PageLoadingComponent());
            const pageTitle = await asyncMethodThatReturnsANicePageTitle();
            transferState.setState('page-title', pageTitle);
            render(new MyPage(pageTitle));
        }
    }
]));
```

### SSR limitations

There is no global variable like `window` or `document` because global variables into a back-end application leads to concurrency
issues. If you want to access the `window` or `document` you can use the window injected into the `AppFactory`.

For third-party libraries you can use the `Platform` object to verify if the code is being executed from browser.
