import React from "react";
import {EventPublisher} from "../../../core/src/event-bus";
import {Pokemon} from "../models/pokemon";

interface Props {
    pokemon: Pokemon;
    eventPublisher: EventPublisher;
}

export const PokemonCard = ({pokemon, eventPublisher}: Props) =>
    <>
        <style jsx>{`
            div {
              border: 4px solid #207395;
              border-radius: 20px;
              color: #207395;
              background-color: #fee68b;
              padding: 20px;
              margin-right: 20px;
              display: inline-block;
              margin-bottom: 20px;
              text-align: center;
              font-family: sans-serif;
              position: relative;
              width: 200px;
            }
            img {
              width: 96px;
              height: 96px;
            }
            button {
              width: 200px;
              border: 0;
              background: #207395;
              padding: 10px;
              color: #ffffff;
            }
        `}</style>
        <div>
            <img src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemon.id +  '.png'} alt=""/>

            <h3>{pokemon.name.toUpperCase()}</h3>

            <button onClick={() => eventPublisher('CART_SERVICE_ADD_TO_CART', pokemon)}>add to cart</button>
        </div>
    </>
