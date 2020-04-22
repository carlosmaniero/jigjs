import 'isomorphic-fetch'
import {Pokemon} from "../models/pokemon";

export interface FetchPokemonsResponse {
    currentPage: number,
    pokemons: Pokemon[],
    totalPages: number
}

function mapResultToPokemons(body) {
    return body.results.map((result) => ({
        name: result.name,
        id: result.url.split('/v2/pokemon/')[1].replace('/', '')
    }));
}

export const fetchPokemons = async (pageNumber: number): Promise<FetchPokemonsResponse> => {
    const itemsPerPage = 20;
    const offset = (pageNumber - 1) * itemsPerPage;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`);
    const body = await response.json();

    return {
        currentPage: pageNumber,
        pokemons: mapResultToPokemons(body),
        totalPages: Math.ceil(body.count / itemsPerPage)
    }
}
