import './cart-component';
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import * as testingLibrary from "@testing-library/dom";
import {CART_SERVICE_EVENTS} from "../models/models";

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

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {id: 2, name: 'Pikachu', total: 1},
                {id: 1, name: 'Bulbasaur', total: 1}
            ],
            total: 2
        });

        expect(testingLibrary.queryByText(document.body, 'PIKACHU')).not.toBeNull();
        expect(testingLibrary.queryByText(document.body, 'BULBASAUR')).not.toBeNull();
    });

    it('renders a field with the total of items', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {id: 2, name: 'Pikachu', total: 97},
            ],
            total: 2
        });

        expect(testingLibrary.queryByDisplayValue(document.body, '97')).not.toBeNull();
    });

    it('updates the total when leave the field', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {id: 2, name: 'Pikachu', total: 9},
            ],
            total: 2
        });

        const inputTotal = testingLibrary.queryByDisplayValue(document.body, '9') as HTMLInputElement;
        const listenerMock = jest.fn();

        subscribeToEvent(CART_SERVICE_EVENTS.UPDATE_ITEM, listenerMock);

        testingLibrary.fireEvent.input(inputTotal, { target: { value: '90' } })

        expect(listenerMock).toBeCalledWith({id: 2, name: 'Pikachu', total: 90})
    });

    it('deletes an item', () => {
        const cartCount = document.createElement('cart-component');
        document.body.appendChild(cartCount);

        publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: [
                {id: 2, name: 'Pikachu', total: 9},
            ],
            total: 2
        });

        const listenerMock = jest.fn();
        subscribeToEvent(CART_SERVICE_EVENTS.DELETE_ITEM, listenerMock);

        testingLibrary.getByText(document.body, 'delete').click();

        expect(listenerMock).toBeCalledWith({id: 2, name: 'Pikachu', total: 9})
    });
});
