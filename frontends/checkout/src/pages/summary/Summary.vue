<template>
  <div class="checkout-summary">
    <div class="total-price-info">
      <h3>Quantity</h3>
      <div class="value">{{cart.total}} {{cart.total === 1 ? 'product': 'products'}}</div>

      <h3>Total Price</h3>
      <div class="value">{{totalPrice}}</div>
    </div>
    <div class="checkout-actions">
      <button>Checkout!</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { subscribeToEvent } from '../../../../../core/src/event-bus';


export interface PokemonItem {
    number: number;
    name: string;
    price: number;
    total: number;
  }

export interface Cart {
    items: PokemonItem[];
    total: number;
  }

  @Component
export default class Summary extends Vue {
    private cart: Cart | {} = {};

    created() {
      subscribeToEvent<Cart>('CART_SERVICE_ITEMS', (cart) => {
        this.setCart(cart);
        this.$forceUpdate();
      });
    }

    get totalPrice() {
      if (!Summary.isCart(this.cart)) {
        return '';
      }
      return this.cart.items
        .map((item) => item.price * item.total)
        .reduce((price, acc) => price + acc, 0)
        .toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        });
    }

    private setCart(cart: Cart) {
      this.$nextTick().then(() => {
        this.$data.cart = cart;
      });
    }

    private static isCart(cart: Cart | {}): cart is Cart {
      return !!(cart as Cart).items;
    }
}
</script>

<style>
  .checkout-summary {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.03);
    padding: 20px;
  }
  .total-price-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: sans-serif;
  }
  .total-price-info > * {
    padding: 20px 0;
    border-bottom: 1px dotted rgba(255, 255, 255, 0.25);
  }
  .total-price-info h3 {
    margin: 0;
    font-size: 14px;
  }
  .checkout-summary button {
    width: 100%;
    background: #1E3040;
    padding: 15px;
    color: #ffffff;
    border-radius: 10px;
    border: 1px solid #24384b;
    box-shadow: 3px 3px #24384b;
    cursor: pointer;
    transition-duration: 0.25s;
  }
  .checkout-actions {
    margin-top: 20px;
  }
</style>
