import React from "react";
import {Pokemon} from "models/pokemon";
import {EventPublisher} from "core/event-bus";

interface Props {
    pokemon: Pokemon,
    eventPublisher: EventPublisher
}

export const AddToCartButton = ({pokemon, eventPublisher}: Props) =>
    <>
        <style jsx>{`
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
        <button onClick={(e) => {
            e.preventDefault();
            eventPublisher('CART_SERVICE_ADD_TO_CART', pokemon)
        }}>add to cart</button>
    </>
