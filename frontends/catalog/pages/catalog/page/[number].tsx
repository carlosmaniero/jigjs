import React from "react";
import {fetchPokemons, FetchPokemonsResponse} from "../../../services/catalog-service";
import {publishEvent, subscribeToEvent} from "../../../core/event-bus";
import {PokemonList} from "../../../components/pokemons/pokemon-list";
import {Pagination} from "../../../components/pagination/pagination";

type Props = FetchPokemonsResponse & {
    paginationUrlTemplate: string
}

export default class Number extends React.Component<Props, FetchPokemonsResponse> {
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
                <h1>Catalog</h1>
                <main>
                    {this.state && this.renderPokemons()}
                </main>
            </section>
        );
    }

    renderPokemons() {
        return <PokemonList
            pokemons={this.state.pokemons}
            eventListener={subscribeToEvent}
            eventPublisher={publishEvent}>

            <Pagination
                currentPage={this.state.currentPage}
                totalPages={this.state.totalPages}
                paginationUrlTemplate={this.props.paginationUrlTemplate}
                onPageChange={(pageNumber) => this.handlePageChange(pageNumber)} />

        </PokemonList>
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
    res.setHeader("X-Event-Dependency", "CART_SERVICE_ADD_TO_CART");

    const pageNumber = parseInt(context.params.number);
    const requestText = await fetchPokemons(pageNumber);
    const paginationUrlTemplate = context.req.headers['x-pagination-url-template'] || '/catalog/page/{number}';

    return {
        props: {
            ...requestText,
            paginationUrlTemplate
        }
    }
}
