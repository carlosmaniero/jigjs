import {EventPublisher, EventSubscriber} from "../../../../core/src/event-bus";

export const CART_SERVICE_EVENTS = {
    CART_ITEMS: "CART_SERVICE_ITEMS",
    ADD_TO_CART: "CART_SERVICE_ADD_TO_CART",
    ASK_FOR_ITEMS: "CART_SERVICE_ASK_FOR_ITEMS"
}

interface Pokemon {
    id: number,
    name: string
}

type PokemonItem = Pokemon & {
    total: number
}

export class CartService {
    constructor(private readonly publishEvent: EventPublisher) {
        this.publishCart();
    }

    addToCart(payload: Pokemon) {
        const newPokemonList = [...this.getPokemons(), payload];
        this.savePokemonList(newPokemonList);
        this.publishCart();
    }

    publishCart() {
        this.publishEvent(CART_SERVICE_EVENTS.CART_ITEMS, {
            items: this.getItemsWithTotal(),
            total: this.getPokemons().length
        })
    }

    private getItemsWithTotal() {
        return this.getPokemons().reduce((acc, pokemon) => {
            const pokemonItem: PokemonItem = acc
                .find((item) => item.id === pokemon.id);

            if (pokemonItem) {
                return [
                    ...acc.filter((item) => pokemonItem !== item),
                    {...pokemonItem, total: pokemonItem.total + 1}
                ]
            }

            return [...acc, {...pokemon, total: 1}]
        }, [] as PokemonItem[])
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

    subscribeToEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS, () => {
        cartService.publishCart();
    });
}
