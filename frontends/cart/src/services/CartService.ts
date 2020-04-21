import {EventPublisher, EventSubscriber} from "../../../../core/src/event-bus";

export const CART_SERVICE_EVENTS = {
    ADD_TO_CART: "CART_SERVICE_ADD_TO_CART",
    ITEMS_UPDATED: "CART_SERVICE_ITEMS_UPDATED"
}

interface Pokemon {
    id: number,
    name: string
}

export class CartService {
    constructor(private readonly publishEvent: EventPublisher) {
    }

    addToCart(payload: Pokemon) {
        const newPokemonList = [...this.getPokemons(), payload];
        this.savePokemonList(newPokemonList);
        this.publishEvent(CART_SERVICE_EVENTS.ITEMS_UPDATED, newPokemonList);
    }

    private getPokemons(): Pokemon[] {
        return JSON.parse(localStorage.getItem('cart-service-items') || '[]');
    }

    private savePokemonList(newPokemonList: Pokemon[]) {
        localStorage.setItem('cart-service-items', JSON.stringify(newPokemonList));
    }
}

export const registerCartService = (publishEvent: EventPublisher, subscribeToEvent: EventSubscriber) => {
    const cartService = new CartService(publishEvent);

    subscribeToEvent(CART_SERVICE_EVENTS.ADD_TO_CART, (payload: Pokemon) => {
        cartService.addToCart(payload);
    });
}
