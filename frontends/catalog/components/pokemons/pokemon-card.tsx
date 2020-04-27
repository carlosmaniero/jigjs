import React from "react";
import {Pokemon} from "../../models/pokemon";
import {EventPublisher} from "../../core/event-bus";
import {AddToCartButton} from "../cart/add-to-cart-button";

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
            a {
              text-decoration: none;
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
            .price {
              color: #986A54;
            }
        `}</style>
        <a href={"/pokemon/" + pokemon.number}>
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

                <AddToCartButton pokemon={pokemon} eventPublisher={eventPublisher} />
            </div>
        </a>
    </>
