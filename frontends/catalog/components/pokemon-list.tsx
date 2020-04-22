import React from "react";
import {EventPublisher} from "../../../core/src/event-bus";
import {PokemonCard} from "./pokemon-card";
import {Pokemon} from "../models/pokemon";

interface Props {
    pokemons: Pokemon[];
    eventPublisher: EventPublisher;
}

export const PokemonList = ({pokemons, eventPublisher}: Props) =>
    <section>
        {pokemons.map((pokemon) =>
            <PokemonCard key={pokemon.id} pokemon={pokemon} eventPublisher={eventPublisher} />)}
    </section>
