import 'isomorphic-fetch'
import {Pokemon} from "../models/pokemon";

export interface FetchPokemonsResponse {
    currentPage: number,
    pokemons: Pokemon[],
    totalPages: number
}

export const fetchPokemons = async (pageNumber: number, host): Promise<FetchPokemonsResponse> => {
    const response = await fetch(`${host}/api/pokemons?page=${pageNumber}`);
    return await response.json()
}

export const fetchPokemon = async (pokemonNumber: number, host): Promise<FetchPokemonsResponse> => {

    const response = await fetch(`${host}/api/pokemons/${pokemonNumber}`);
    return await response.json()
}
