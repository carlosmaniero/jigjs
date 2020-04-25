export const CART_SERVICE_EVENTS = {
    CART_ITEMS: "CART_SERVICE_ITEMS",
    ADD_TO_CART: "CART_SERVICE_ADD_TO_CART",
    ASK_FOR_ITEMS: "CART_SERVICE_ASK_FOR_ITEMS",
    UPDATE_ITEM: "CART_SERVICE_UPDATE_ITEM",
    DELETE_ITEM: "CART_SERVICE_DELETE_ITEM"
}

export interface Pokemon {
    id: string,
    name: string
}

export type PokemonItem = Pokemon & {
    total: number
}

export interface Cart {
    items: PokemonItem[],
    total: number
}
