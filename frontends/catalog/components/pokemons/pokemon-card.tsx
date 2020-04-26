import React from "react";
import {Pokemon} from "../../models/pokemon";
import {EventPublisher} from "../../core/event-bus";

interface Props {
    pokemon: Pokemon;
    eventPublisher: EventPublisher;
    totalIntoCart?: number;
}

export const PokemonCard = ({pokemon, eventPublisher, totalIntoCart}: Props) =>
    <>
        <style jsx>{`
            .cart-count {
              background: #307b22;
              width: 30px;
              height: 30px;
              text-align: center;
              line-height: 30px;
              border-radius: 20px;
              position: absolute;
              display: block;
              color: white;
              right: 20px;
              top: 20px;
            }
            div {
              border: 4px solid #1E3040;
              border-radius: 20px;
              color: #35516c;
              background-color: #060C0D;
              padding: 20px;
              text-align: center;
              font-family: sans-serif;
              position: relative;
              box-shadow: 5px 5px #1E3040;
            }
            img {
              width: 96px;
              height: 96px;
            }
            button {
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
            button:hover {
              background: #35516c;
              border: 1px solid #24384b;
              box-shadow: 3px 3px #24384b;
            }
            .price {
              color: #986A54;
            }
        `}</style>
        <div>
            {
                totalIntoCart > 0 &&

                <span className="cart-count">
                    {totalIntoCart}
                </span>
            }

            <img src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemon.number +  '.png'} alt=""/>

            <h3>{pokemon.name}</h3>

            <p className="price">{
                pokemon.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                })
            }</p>

            <button onClick={() => eventPublisher('CART_SERVICE_ADD_TO_CART', pokemon)}>add to cart</button>
        </div>
    </>
