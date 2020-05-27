import {EventSubscription, publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {CART_SERVICE_EVENTS} from "../models/models";

class CartCountComponent extends HTMLElement {
    private count: number;
    private subscription: EventSubscription;
    constructor() {
        super();
        this.count = 0;
    }

    connectedCallback() {
        this.render();

        this.subscription = subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, ({total}: {total: number}) => {
            this.count = total;
            this.render();
        })

        publishEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS);
    }

    disconnectedCallback() {
        this.subscription.unsubscribe();
    }

    render() {
        this.innerHTML = '';
        const linkAddress = document.createElement('a');
        linkAddress.href = '/cart';

        linkAddress.style.background = '#5a6283';
        linkAddress.style.color = '#ffffff';
        linkAddress.style.padding = '10px';
        linkAddress.style.fontFamily = 'sans-serif';
        linkAddress.style.borderRadius = '20px';
        linkAddress.style.textDecoration = 'none';
        linkAddress.innerHTML = `Cart: <strong>${this.count}</strong>`

        this.appendChild(linkAddress);
    }
}

if (!customElements.get('cart-count-component')) {
    customElements.define('cart-count-component', CartCountComponent);
}
