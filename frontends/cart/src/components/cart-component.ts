import {EventSubscription, publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {Cart, CART_SERVICE_EVENTS, PokemonItem} from "../models/models";

class CartComponent extends HTMLElement {
    private cartSubscription: EventSubscription;
    private cart: Cart;

    constructor() {
        super();
    }

    connectedCallback() {
        this.cartSubscription = subscribeToEvent(CART_SERVICE_EVENTS.CART_ITEMS, (cart: Cart) => {
            if (this.cart && JSON.stringify(cart.items) === JSON.stringify(this.cart.items)) {
                return;
            }

            this.cart = cart;
            this.render();
        })

        publishEvent(CART_SERVICE_EVENTS.ASK_FOR_ITEMS);
    }

    private render() {
        this.classList.add('cart-component')
        this.innerHTML = this.getStyle();

        const table = document.createElement('div');
        table.classList.add('cart-component__table');

        table.appendChild(this.renderHeader());

        this.cart.items.forEach((cartItem) => {
            table.appendChild(this.renderCartItem(cartItem));
        });

        this.appendChild(table);
    }

    private renderCartItem(cartItem: PokemonItem) {
        const itemRow = document.createElement('div');
        itemRow.classList.add('cart-component__item')
        const pokemonName = cartItem.name.toUpperCase();

        itemRow.innerHTML = `
            <div class="cart-component__item__photo-column">
                <img 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cartItem.number}.png" 
                    alt="${pokemonName}"
                >
            </div>
            <div class="cart-component__item__name-column">${pokemonName}</div>
            <div class="cart-component__item__action-column">
                <input type="number" value="${cartItem.total}">
                <button class="cart-component__item__delete_button">delete</button>
            </div>
            <div class="cart-component__item__price-column"></div>
        `;

        this.registerInputEvents(itemRow, cartItem);
        this.registerDeleteButtonEvents(itemRow, cartItem);
        return itemRow;
    }

    private registerInputEvents(itemRow: HTMLDivElement, cartItem: PokemonItem) {
        itemRow.querySelector('input[type=number]')["cartItem"] = cartItem;

        itemRow.querySelector('input[type=number]').addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const newTotal = parseInt(target.value);

            if (cartItem.total === newTotal) {
                return;
            }
            target['cartItem'].total = newTotal;

            publishEvent<PokemonItem>(CART_SERVICE_EVENTS.UPDATE_ITEM,
                {
                    ...cartItem,
                    total: newTotal
                }
            );
        })
    }

    private getStyle() {
        return `
            <style>
                .cart-component {
                    box-shadow: rgb(30, 48, 64) 5px 5px;
                    border-radius: 20px;
                    overflow: hidden;
                    display: block;
                    border: 4px solid rgb(30, 48, 64);                    
                    border-bottom: 0;         
                    font-family: sans-serif;           
                }
                
                .cart-component__header {
                    display: grid;
                    grid-template-columns: 96px 3fr 1fr 1fr;
                    background: rgb(166, 123, 146);
                    color: #fff;
                }
                
                .cart-component__header > * {
                    padding: 20px;
                    font-size: 14px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                
                .cart-component__header > *:first-child {
                    grid-column-start: 1;
                    grid-column-end: 3;
                }
            
                .cart-component__item {
                    color: rgb(53, 81, 108);
                    background-color: rgb(6, 12, 13);
                    font-family: sans-serif;
                    position: relative;
                    border-bottom: 4px solid rgb(30, 48, 64);
                    align-items: center;
                    display: grid;
                    grid-template-columns: 96px 3fr 1fr 1fr;
                    transition: 0.5s;
                }
                .cart-component__item:hover {
                    background: rgba(255, 255, 255, 0.025);
                }
                .cart-component__item > div {
                    padding: 20px;
                    box-sizing: border-box;
                }
                .cart-component__item__photo-column {
                    width: 96px;
                }
                .cart-component__item__action-column {
                    text-align: center;
                }
                .cart-component__item__action-column input {
                    width: 100%;
                    padding: 10px 5px;
                    box-sizing: border-box;
                    border-radius: 20px;
                    text-align: center;
                    outline: none;
                    background: rgb(30, 48, 64);
                    color: #ffffff;
                    border: 0;
                }
                .cart-component__item__action-column input:focus {
                    background: rgb(44,70,94);
                }
                .cart-component__item__delete_button {
                    color: #792929;
                    border: 0;
                    background: none;
                    cursor: pointer;
                    outline: none;
                    margin-top: 10px;
                }
            </style>
        `;
    }

    private renderHeader() {
        const header = document.createElement('div');
        header.classList.add('cart-component__header');

        header.innerHTML = `
            <div>Pokemon</div>
            <div>Quantity</div>
            <div>Price</div>            
        `;

        return header;
    }

    private registerDeleteButtonEvents(itemRow: HTMLDivElement, cartItem: PokemonItem) {
        itemRow.querySelector('button').addEventListener('click', () => {
            publishEvent(CART_SERVICE_EVENTS.DELETE_ITEM, cartItem);
        });
    }
}

customElements.define('cart-component', CartComponent);