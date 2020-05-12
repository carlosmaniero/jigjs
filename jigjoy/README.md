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

export const app = new JigJoyApp({bootstrap: Index})
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
```
