![Jig Logo](./ghassets/logo.png)

# Jig.js - A Micro-frontend framework
![Jig Build Status](https://github.com/carlosmaniero/micro-pokeshop/workflows/JigJoy/badge.svg)

## Basic Example

```typescript
@Component('index-component')
export class Index implements OnRehydrate {
    @State()
    private clicks = {
        number: 0
    };

    render(): RenderResult {
        return html`
            <cart-count-fragment></cart-count-fragment>
            
            <button onclick="${() => { this.clicks.number++ }}">+</button>
            ${this.clicks.number}
            <button onclick="${() => { this.clicks.number-- }}">-</button>
        `;
    }

    rehydrate(): void {
        this.clicks.number = 0;
    }
}

export const app = new JigApp({bootstrap: Index})
    .registerModuleUsingContainer((container) => {
        const fragmentFactory: FragmentComponentFactory = container.resolve(FragmentComponentFactory);

        return new JigModule({
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
```

## Communication between micro front-ends
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
