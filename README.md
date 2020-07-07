 ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![Jig](https://github.com/carlosmaniero/jigjs/workflows/Jig/badge.svg) [![npm version](https://badge.fury.io/js/jigjs.svg)](https://badge.fury.io/js/jigjs)

# ![Jig Logo](jig/ghassets/logo.svg) a front-end library.

Jig.js is a web library that combines reactiveness with OOP. Making it easy to react to
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

A component is a small UI peace that manage its own state. Whenever the class fields
decorated with `@overserving` changes the component is re-rendered.

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

In jisjs you control the component instance. There aren't a magic way to update a component props. The component props
is its state you update it by using class methods.

## Creating an APP

As showed in the previous example, you can use jigjs as a simple library by using the `renderComponent` function.
However, it is possible to use jigjs as a framework. 

To start a jigjs project you can use the cli:

```bash
npm install -g jigjs
npx jigjs-new-project
``` 

It comes with a `Router` system that enables `Single Page Applications`, Native `Server Side Rendering` and built-in 
`build system`.

### Routing

With the native router you can have custom routes and easily extracts router parameters.

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

### Transfer State

When you make a request to the jigjs server, it will pre-render the entire page and return it as raw HTML. Coming to 
browser, jigjs will execute the same code that had executed on server. It means that, any request you made at the 
server-side will be made again.

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

There are no global `window` and `document` because global variables into a back-end application leads to concurrency 
issues. If you want to access the `window` or `document` you will need to use the window injected into the `AppFactory`.

For third-party libraries you can use the `Platform` object to verify if the code is being executed from browser.
