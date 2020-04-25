import * as testingLibrary from '@testing-library/dom';

import './cart-count-component';
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {CART_SERVICE_EVENTS} from "../models/models";

describe('CartCountComponent', () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    afterEach(() => {
        document.body.innerHTML = "";
    })

    it("renders the cart count with zero as default value", () => {
        const cartCount = document.createElement('cart-count-component');
        document.body.appendChild(cartCount);

        expect(testingLibrary.queryByText(document.body, "0")).not.toBeNull();
    });

    it("asks for the total when mount", () => {
        const listenerMock = jest.fn();
        subscribeToEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS, listenerMock)

        const cartCount = document.createElement('cart-count-component');
        document.body.appendChild(cartCount);

        expect(listenerMock).toBeCalled();
    });

    it("renders the cart items count", () => {
        const cartCount = document.createElement('cart-count-component');
        document.body.appendChild(cartCount);

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [{
                id: 1,
                name: 'hi'
            }],
            total: 1
        });

        expect(testingLibrary.queryByText(document.body, "1")).not.toBeNull();
    });

    it("updates cart to zero when all items are removed", () => {
        const cartCount = document.createElement('cart-count-component');
        document.body.appendChild(cartCount);

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [{
                id: 1,
                name: 'hi'
            }],
            total: 1
        });

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [],
            total: 0
        });

        expect(testingLibrary.queryByText(document.body, "0")).not.toBeNull();
    });
})
