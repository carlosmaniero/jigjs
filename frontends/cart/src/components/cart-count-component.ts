import {EventSubscription, publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {CART_SERVICE_EVENTS} from "../services/cart-service";


class CartCountComponent extends HTMLElement {
    private count: number;
    private subscription: EventSubscription;
    constructor() {
        super();
        this.count = 0;
    }

    connectedCallback() {
        this.render();

        this.subscription = subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, (items: object[]) => {
            this.count = items?.length || this.count;
            this.render();
        })

        publishEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS);
    }

    disconnectedCallback() {
        this.subscription.unsubscribe();
    }

    render() {
        this.style.background = '#5a6283';
        this.style.color = '#ffffff';
        this.style.padding = '10px';
        this.style.fontFamily = 'sans-serif';
        this.style.borderRadius = '20px';
        this.innerHTML = `Cart: <strong>${this.count}</strong>`
    }
}

customElements.define('cart-count-component', CartCountComponent);
