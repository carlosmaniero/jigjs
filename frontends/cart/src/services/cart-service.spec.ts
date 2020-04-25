import {registerCartService} from "./cart-service";
import randomstring from 'randomstring';
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {CART_SERVICE_EVENTS} from "../models/models";

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

        expect(listener).toBeCalledWith({
            items: [
                {id: 1, pokemonName: "Bulbasaur", total: 1}
            ],
            total: 1
        });
    });

    it('computate the total of pokemons added', () => {
        const listener = jest.fn();

        registerCartService(publishEvent, subscribeToEvent)
        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);

        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});
        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});

        expect(listener).toBeCalledWith({
            items: [
                {id: 1, pokemonName: "Bulbasaur", total: 2}
            ],
            total: 2
        });
    });

    it('appends the pokemon cart list when adding', () => {
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([
            {id: 2, pokemonName: 'Pikachu', total: 1}
        ]));

        registerCartService(publishEvent, subscribeToEvent)
        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);

        publishEvent(
            CART_SERVICE_EVENTS.ADD_TO_CART,
            {id: 1, pokemonName: 'Bulbasaur'}
        );

        expect(listener).toBeCalledWith({
            items: [
                {id: 2, pokemonName: 'Pikachu', total: 1},
                {id: 1, pokemonName: 'Bulbasaur', total: 1}
            ],
            total: 2
        });
    });

    it('stores pokemon into localstorage', () => {
        registerCartService(publishEvent, subscribeToEvent)

        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});
        publishEvent(CART_SERVICE_EVENTS.ADD_TO_CART, {id: 1, pokemonName: 'Bulbasaur'});

        expect(localStorage.getItem('cart-service-items'))
            .toBe(JSON.stringify([{id: 1, pokemonName: 'Bulbasaur', total: 2}]));
    });

    it('responds a message asking for the card items', () => {
        registerCartService(publishEvent, subscribeToEvent);

        const pokemon = {id: 2, pokemonName: 'Pikachu', total: 1};
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([pokemon]));

        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);
        publishEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS);

        expect(listener).toBeCalledWith({
            items: [
                {...pokemon, total: 1}
            ],
            total: 1
        })
    });

    it('publishes a message with the cart as soon as it is registered', () => {
        const pokemon = {id: 2, pokemonName: 'Pikachu', total: 1};
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([pokemon]));

        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);

        registerCartService(publishEvent, subscribeToEvent);

        expect(listener).toBeCalledWith({
            items: [
                {...pokemon, total: 1}
            ],
            total: 1
        })
    });

    it('updates the value', () => {
        const pokemon = {id: 2, pokemonName: 'Pikachu', total: 10};
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([pokemon]));

        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);
        registerCartService(publishEvent, subscribeToEvent);

        publishEvent(CART_SERVICE_EVENTS.UPDATE_ITEM, {...pokemon, total: 90})

        expect(listener).toBeCalledWith({
            items: [
                {...pokemon, total: 90}
            ],
            total: 90
        })
    });

    it('deletes an item', () => {
        const pokemon = {id: 2, pokemonName: 'Pikachu', total: 10};
        const listener = jest.fn();

        localStorage.setItem('cart-service-items', JSON.stringify([pokemon]));

        subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, listener);
        registerCartService(publishEvent, subscribeToEvent);

        publishEvent(CART_SERVICE_EVENTS.DELETE_ITEM, {...pokemon})

        expect(listener).toBeCalledWith({
            items: [],
            total: 0
        })
    });
});
