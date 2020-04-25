import 'isomorphic-fetch'
import {Pokemon} from "../models/pokemon";

export interface FetchPokemonsResponse {
    currentPage: number,
    pokemons: Pokemon[],
    totalPages: number
}

export const fetchPokemons = async (pageNumber: number, host): Promise<FetchPokemonsResponse> => {

    const response = await fetch(`${host}/api/pokemons?page=${pageNumber}`);
    const body = await response.json();

    return body
}
