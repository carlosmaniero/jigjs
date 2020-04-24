import {EventSubscription, publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {Cart, CART_SERVICE_EVENTS, PokemonItem} from "../models/models";

class CartComponent extends HTMLElement {
    private cartSubscription: EventSubscription;
    private cart: Cart;

    constructor() {
        super();
        this.cart = {
            items: [],
            total: 0
        }
    }

    connectedCallback() {
        publishEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS);

        this.cartSubscription = subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, (cart: Cart) => {
            this.cart = cart;
            this.render();
        })
    }

    private render() {
        this.classList.add('cart-component')

        this.innerHTML = `
            <style>
                .cart-component__item {
                    display: grid;
                    grid-template-columns: 96px 5fr 1fr 1fr;
                    color: rgb(53, 81, 108);
                    background-color: rgb(6, 12, 13);
                    font-family: sans-serif;
                    position: relative;
                    box-shadow: rgb(30, 48, 64) 5px 5px;
                    border-width: 4px;
                    border-style: solid;
                    border-color: rgb(30, 48, 64);
                    border-image: initial;
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .component__item__photo-column {
                    width: 96px;
                }
            </style>
        `;
        this.cart.items.forEach((cartItem) => {
            this.renderCartItem(cartItem);
        })
    }

    private renderCartItem(cartItem: PokemonItem) {
        const itemRow = document.createElement('div');
        itemRow.classList.add('cart-component__item')
        const pokemonName = cartItem.name.toUpperCase();

        itemRow.innerHTML = `
            <div class="component__item__photo-column">
                <img 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cartItem.id}.png" 
                    alt="${pokemonName}"
                >
            </div>
            <div class="component__item__name-column">${pokemonName}</div>
            <div class="component__item__update-column"><input type="number" value="${cartItem.total}"></div>
            <div class="component__item__update-column"><button>Delete</button></div>
        `;

        itemRow.querySelector('input[type=number]').addEventListener('blur', (e) => {
            publishEvent<PokemonItem>(CART_SERVICE_EVENTS.UPDATE_ITEM,
                {
                    ...cartItem,
                    total: parseInt((e.target as HTMLInputElement).value)
                }
            );
        })
        this.appendChild(itemRow);
    }
}

customElements.define('cart-component', CartComponent);
