import './cart-component';
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import * as testingLibrary from "@testing-library/dom";
import {Cart, CART_SERVICE_EVENTS, Pokemon} from "../models/models";

describe('Cart Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    })

   it('asks for items when it mounts', () => {
       const listenerMock = jest.fn();
       subscribeToEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS, listenerMock);

       const cartCount = document.createElement('cart-component');
       document.body.appendChild(cartCount);

       expect(listenerMock).toBeCalled();
   });

    it('renders all pokemons', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent<Cart>(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {number: 2, name: 'Pikachu', total: 1, price: 318},
                {number: 1, name: 'Bulbasaur', total: 2, price: 320}
            ],
            total: 2
        });

        expect(testingLibrary.queryByText(document.body, 'Pikachu')).not.toBeNull();
        expect(testingLibrary.queryByText(document.body, '$318')).not.toBeNull();
        expect(testingLibrary.queryByText(document.body, 'Bulbasaur')).not.toBeNull();
        expect(testingLibrary.queryByText(document.body, '$640')).not.toBeNull();
    });

    it('renders a field with the total of items in cart', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent<Cart>(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {number: 2, name: 'Pikachu', total: 97, price: 328},
            ],
            total: 98
        });

        expect(testingLibrary.queryByDisplayValue(document.body, '97')).not.toBeNull();
    });

    it('updates the total when leave the field', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent<Cart>(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {number: 2, name: 'Pikachu', total: 9, price: 328},
            ],
            total: 2
        });

        const inputTotal = testingLibrary.queryByDisplayValue(document.body, '9') as HTMLInputElement;
        const listenerMock = jest.fn();

        subscribeToEvent(CART_SERVICE_EVENTS.UPDATE_ITEM, listenerMock);

        testingLibrary.fireEvent.input(inputTotal, { target: { value: '90' } })

        expect(listenerMock).toBeCalledWith({number: 2, name: 'Pikachu', total: 90, price: 328});
        expect(testingLibrary.queryByText(document.body, '$29,520')).not.toBeNull();
    });

    it('deletes an item', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent<Cart>(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {number: 2, name: 'Pikachu', total: 9, price: 328},
            ],
            total: 2
        });

        const listenerMock = jest.fn();
        subscribeToEvent(CART_SERVICE_EVENTS.DELETE_ITEM, listenerMock);

        testingLibrary.getByText(document.body, 'delete').click();

        expect(listenerMock).toBeCalledWith({number: 2, name: 'Pikachu', total: 9, price: 328})
    });
});
