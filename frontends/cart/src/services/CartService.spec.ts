import {CART_SERVICE_EVENTS, CartService, registerCartService} from "./CartService";
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";

describe('CartService', () => {
    beforeEach(() => {
        (global as any).document = document.cloneNode(true);
        localStorage.clear();
    });

    afterAll(() => {
        localStorage.clear();
        (global as any).document = document.cloneNode(true);
    })

    it('stores pokemon into localstorage', () => {
        registerCartService(publishEvent, subscribeToEvent)

        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});

        expect(localStorage.getItem('cart-service-items'))
            .toBe(JSON.stringify([{id: 1, pokemonName: 'Bulbasaur'}]));
    });

    it('adds a new pokemon to cart', () => {
        const listener = jest.fn();

        registerCartService(publishEvent, subscribeToEvent)
        subscribeToEvent(CART_SERVICE_EVENTS.ITEMS_UPDATED, listener);

        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});

        expect(listener).toBeCalledWith([{id: 1, pokemonName: 'Bulbasaur'}]);
    });

    it('appends the pokemon cart list when adding', () => {
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([
            {id: 2, pokemonName: 'Pikachu'}
        ]));

        registerCartService(publishEvent, subscribeToEvent)
        subscribeToEvent(CART_SERVICE_EVENTS.ITEMS_UPDATED, listener);

        publishEvent(
            CART_SERVICE_EVENTS.ADD_TO_CART,
            {id: 1, pokemonName: 'Bulbasaur'}
        );

        expect(listener).toBeCalledWith([
            {id: 2, pokemonName: 'Pikachu'},
            {id: 1, pokemonName: 'Bulbasaur'}
        ]);
    });
});
