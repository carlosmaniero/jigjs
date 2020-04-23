import React from "react";
import {fetchPokemons, FetchPokemonsResponse} from "../../../services/catalog-service";
import {publishEvent} from "../../../core/event-bus";
import {PokemonList} from "../../../components/pokemons/pokemon-list";
import {Pagination} from "../../../components/pagination/pagination";

export default class Number extends React.Component<FetchPokemonsResponse, FetchPokemonsResponse> {
    constructor(props) {
        super(props);
        this.state = {...props};
    }

    render() {
        return (
            <section>
                <style jsx>{`
                  h1 {
                    border-bottom: 5px solid #cc5242;
                    font-family: sans-serif;
                    padding: 10px 0;
                    color: #cc5242;
                    display: inline-block;
                  }
                `}</style>
                <h1>Pokemon List</h1>
                <main>
                    {this.state && this.renderPokemons()}
                </main>
                <Pagination
                    currentPage={this.state.currentPage}
                    totalPages={this.state.totalPages}
                    onPageChange={(pageNumber) => this.handlePageChange(pageNumber)} />
            </section>
        );
    }

    renderPokemons() {
        return <PokemonList
            pokemons={this.state.pokemons}
            eventPublisher={publishEvent} />
    }

    private async handlePageChange(pageNumber: number) {
        this.setState({
            ...await fetchPokemons(pageNumber)
        })
    }
}

export async function getServerSideProps(context) {
    const res = context.res;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
    res.setHeader("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

    const pageNumber = parseInt(context.params.number);
    const requestText = await fetchPokemons(pageNumber);

    return {
        props: {
            ...requestText,
        }
    }
}
