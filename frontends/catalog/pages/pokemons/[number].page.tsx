import React from "react";
import {fetchPokemon} from "../../services/catalog-service";
import {Pokemon} from "../../models/pokemon";
import {PokemonDetail} from "../../components/pokemons/pokemon-detail";

interface Props  {
    pokemon: Pokemon
}

export default class PokemonPage extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
        this.state = {...props};
    }

    render() {
        return (
            <section>
                <style jsx>{`
                  h1 {
                    font-family: sans-serif;
                    padding: 10px 0;
                    color: #A67B92;
                    display: inline-block;
                  }
                `}</style>
                <main>
                    <PokemonDetail pokemon={this.props.pokemon} />
                </main>
            </section>
        );
    }
}

export async function getServerSideProps(context) {
    context.res.setHeader("Access-Control-Allow-Origin", "*");
    context.res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency, x-pagination-url-template");
    context.res.setHeader("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency, x-pagination-url-template");
    context.res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    context.res.setHeader("X-Event-Dependency", "CART_SERVICE_ADD_TO_CART");

    const host = `http://${context.req.headers.host}`;
    const pokemonNumber = parseInt(context.params.number);

    return {
        props: {
            pokemon: await fetchPokemon(pokemonNumber, host)
        }
    }
}
