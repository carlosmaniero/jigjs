import * as testingLibrary from '@testing-library/dom';

import './cart-count-component';
import {publishEvent} from "../../../../core/src/event-bus";
import {CART_SERVICE_EVENTS} from "../services/cart-service";

describe('CartCountComponent', () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    })

    it("renders the cart count with zero as default value", () => {
        const cartCount = document.createElement('cart-count-component');
        document.body.appendChild(cartCount);

        expect(testingLibrary.queryByText(document.body, "0")).not.toBeNull();
    });

    it("renders the cart items count", () => {
        const cartCount = document.createElement('cart-count-component');
        document.body.appendChild(cartCount);

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, [{
            id: 1,
            name: 'hi'
        }]);

        expect(testingLibrary.queryByText(document.body, "1")).not.toBeNull();
    });
})
