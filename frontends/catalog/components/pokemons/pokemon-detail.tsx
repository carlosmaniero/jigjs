import React from "react";
import {Pokemon} from "../../models/pokemon";
import {AddToCartButton} from "../cart/add-to-cart-button";
import {publishEvent} from "../../core/event-bus";

interface Props {
    pokemon: Pokemon
}

export class PokemonDetail extends React.Component<Props, {}>{
    render() {
        const pokemon = this.props.pokemon;
        return <>
            <style jsx>{`
              .pokemon-detail {
                display: flex;
                font-family: sans-serif;
                color: #35516c;
              }
              main {
                flex-grow: 1;
              }
              header {
                display: flex;
                color: #ffffff;
                align-items: center;
                background: #1E3040;
                height: 96px;
                padding: 20px;
                justify-content: space-between;
                box-sizing: border-box;
              }
              header .cover {
                margin-left: -20px;
              }
              header h1 {
                margin: 0
              }
              header .info {
                flex-grow: 1;
              }
              header .price {
                padding-right: 20px;
                color: #C8B594;
                font-size: 20px;
              }
              .details {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
              }
              .details > div {
                border-bottom: 1px dotted rgba(255, 255, 255, 0.25);
                padding: 20px 0;
                line-height: 24px;
              }
              .details > div > span {
                font-weight: bold;
              }
              .details .icon {
                font-size: 24px;
              }
              
              .add-to-cart {
                width: 340px;
                margin-left: 60px;
                background: rgba(255, 255, 255, 0.05);              
              }
              .add-to-cart header {
                background: none;
                border-bottom: 1px dotted rgba(255, 255, 255, 0.25);
              }
              .add-to-cart .content {
                padding: 20px;
              }
              
              @media screen and (max-width: 1200px) {
                  .details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                  }
              }
              
              @media screen and (max-width: 900px) {
                  main {
                    margin-right: 30px;
                  }
                  .details {
                    display: grid;
                    grid-template-columns: 1fr;
                  }
                  .add-to-cart {
                    width: auto;
                    margin-left: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    flex-grow: 1;              
                  }
              }
              
              @media screen and (max-width: 700px) {
                .pokemon-detail {
                  display: block;
                }
                main, .add-to-cart {
                  margin-right: 0;
                  margin-left: 0;
                }
              }
            `}</style>
            <div className="pokemon-detail">
                <main>
                    <header>
                        <div className="cover">
                            <img src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemon.number +  '.png'} />
                        </div>
                        <div className="info">
                            <h1>{pokemon.name}</h1>
                            <div>{pokemon.primaryType}</div>
                        </div>
                    </header>

                    <div className="details">
                        <div><span className="icon">💪</span> HP: <span>{pokemon.hp}</span></div>
                        <div><span className="icon">👊</span> Attack: <span>{pokemon.attack}</span></div>
                        <div><span className="icon">🛡</span> Defense: <span>{pokemon.defense}</span></div>
                        <div><span className="icon">🌪</span> Speed: <span>{pokemon.speed}</span></div>
                        <div><span className="icon">🥊</span> Super Attack: <span>{pokemon.spAtk}</span></div>
                        <div><span className="icon">📛</span> Super Defense: <span>{pokemon.spDef}</span></div>
                    </div>
                </main>

                <section className="add-to-cart">
                    <header>
                        <div className="price-label">
                            Price:
                        </div>
                        <div className="price">
                            ${pokemon.price}
                        </div>
                    </header>

                    <div className="content">
                        <AddToCartButton pokemon={pokemon} eventPublisher={publishEvent} />
                    </div>
                </section>
            </div>
        </>
    }
}
