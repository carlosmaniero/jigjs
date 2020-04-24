import React from "react";
import {Pokemon} from "../../models/pokemon";
import {EventPublisher} from "../../core/event-bus";

interface Props {
    pokemon: Pokemon;
    eventPublisher: EventPublisher;
    total?: number;
}

export const PokemonCard = ({pokemon, eventPublisher, total}: Props) =>
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
        `}</style>
        <div>
            <span className="cart-count">
                {total}
            </span>

            <img src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemon.id +  '.png'} alt=""/>

            <h3>{pokemon.name.toUpperCase()}</h3>

            <button onClick={() => eventPublisher('CART_SERVICE_ADD_TO_CART', pokemon)}>add to cart</button>
        </div>
    </>
