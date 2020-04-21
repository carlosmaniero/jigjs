import {CART_SERVICE_EVENTS, CartService, registerCartService} from "./CartService";
import randomstring from 'randomstring';
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";

describe('CartService', () => {
    beforeEach(() => {
        // There is no easy way to clean event service events
        CART_SERVICE_EVENTS.ADD_TO_CART = randomstring.generate();

        (global as any).document = document.cloneNode(true);
        localStorage.clear();
    });

    afterAll(() => {
        localStorage.clear();
        (global as any).document = document.cloneNode(true);
    })

    it('adds a new pokemon to cart', () => {
        const listener = jest.fn();

        registerCartService(publishEvent, subscribeToEvent)
        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);

        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});

        expect(listener).toBeCalledWith([{id: 1, pokemonName: 'Bulbasaur'}]);
    });

    it('appends the pokemon cart list when adding', () => {
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([
            {id: 2, pokemonName: 'Pikachu'}
        ]));

        registerCartService(publishEvent, subscribeToEvent)
        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);

        publishEvent(
            CART_SERVICE_EVENTS.ADD_TO_CART,
            {id: 1, pokemonName: 'Bulbasaur'}
        );

        expect(listener).toBeCalledWith([
            {id: 2, pokemonName: 'Pikachu'},
            {id: 1, pokemonName: 'Bulbasaur'}
        ]);
    });

    it('stores pokemon into localstorage', () => {
        registerCartService(publishEvent, subscribeToEvent)

        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});

        expect(localStorage.getItem('cart-service-items'))
            .toBe(JSON.stringify([{id: 1, pokemonName: 'Bulbasaur'}]));
    });

    it('responds a message asking for the card items', () => {
        const pokemon = {id: 2, pokemonName: 'Pikachu'};
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([pokemon]));

        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);
        publishEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS);

        expect(listener).toBeCalledWith([
            pokemon
        ])
    });
});
