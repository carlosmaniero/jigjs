![Jig Logo](jig/ghassets/logo.png)

# Jig.js - A Micro-frontend framework
![Jig](https://github.com/carlosmaniero/jigjs/workflows/Jig/badge.svg)

Jig.js is a web framework focused on micro front-ends with native server-side rendering support!
# Installation

```bash
npm install -g jigjs 
```

Install the npm package and then run the `jigjs-new-project` to create a new Jig.js project.

```bash
npx jigjs-new-project
``` 

# First component

It's pretty simple to create a JigJs component. 
Let's create a counter component.

```typescript
@Component('counter-component')
export class CounterComponent implements OnMount {
    @State()
    private clicks = {
        number: 0
    };

    @Prop()
    private initialCounter: number;

    mount() {
       this.clicks.number = this.initialCounter; 
    }

    render(): RenderResult {
        return html`
            <button onclick="${() => { this.clicks.number++ }}">+</button>
            ${this.clicks.number}
            <button onclick="${() => { this.clicks.number-- }}">-</button>
        `;
    }
}
```

It will create a component using the
 [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) API.
 
Using the component: 

```typescript
@Component('counter-page')
export class CounterPage {
    // ...

    render(): RenderResult {
        return html`
            <counter-component @initialCounter=${this.initialCounter}></counter-component>
        `;
    }
}
```

**@Component:** creates a custom element component with the given tag name.

**@State:** the component state. Every change at the state performs a render.

**@Prop:** is a decorator that binds the element attributes to the class instance. The `@` at the beginning of an `attribute` indicates that this
value should be passed as a Javascript Object. By default, every property is passed as a string following the 
[Element.setAttribute()](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute) API. 

# Creating an APP

Every app should live into an `apps/` directory, and the `export default` should be the app itself.

```typescript
export default new JigApp({
    bootstrap: CounterPage,
    components: [CounterComponent],
    bundleName: 'my-app'
});
```

# Creating you very first fragment

The concept of a fragment is pretty similar to an iframe. It renders another website content inside your page. So then you could have independent deploys of your micro front-ends. The fragment can be 
resolved at the server-side which brings less glitch to the application.


```typescript
@Component('catalog-fragment')
class CatalogFragment extends FragmentComponent {
    @Prop()
    private readonly pageNumber: string;

    get options() {
        return {
            url: `http://localhost:3000/catalog/page/${this.pageNumber}`
        }
    }
}

@Component('cart-counter-fragment')
class CartCounte extends FragmentComponent {
    private readonly options = {
        url: `http://localhost:4000/counter`
    }
}

@Component('catalog-page')
export class CatalogPage {
    // ...

    render(): RenderResult {
        return html`
            <head>
              ...
              <cart-counter-fragment></cart-counter-fragment>
              ...
            </head>
  
            <main>
               <catalog-fragment pageNumber="1"></catalog-fragment>
            </main>
        `;
    }
}
``` 

# Explore

- Pokemon e-commerce [demo](./demo/pokeshop) - WIP
- Dependency injection concept - WIP

## Core Concepts - WIP
### Communication between micro front-ends
In an e-commerce system, either the **cart** and the **product catalog** can be expressed as a micro front-end. It is commonly **cart's** responsibility to manage the list of products, however, it is **product catalog** responsibility to actually add a product to the **cart**.

Keeping this in mind, we could expose a service into the **cart** context who can be accessed by any micro front-end on demand. And then make it possible to **product catalog** to add a product to cart.

![cart-service](https://user-images.githubusercontent.com/2002011/82006024-3edc0700-963d-11ea-998f-5c4458ec6412.png)

The communication between micro front-ends can be performed by events. Let's see an example:

**Product Catalog Micro Front-end**
```js
// product-catalog.component.js

const onAddButtonClick = (product) => {
  const addToCartEvent = new CustomEvent("add-to-cart", {
    detail: {
      product: product
    }
  });
  window.dispatchEvent(addToCartEvent);
}
```
**Cart Micro Front-end**
```js
// cart-service.js
window.addEventListener('add-to-cart', (event) => {
    addToCart(event.detail.product);
});
```
