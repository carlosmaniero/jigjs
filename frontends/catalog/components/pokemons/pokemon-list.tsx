import React from "react";
import {Pokemon} from "../../models/pokemon";
import {EventPublisher} from "../../core/event-bus";
import {PokemonCard} from "./pokemon-card";

interface Props {
    pokemons: Pokemon[];
    eventPublisher: EventPublisher;
}

export const PokemonList = ({pokemons, eventPublisher}: Props) =>
    <section>
        {pokemons.map((pokemon) =>
            <PokemonCard key={pokemon.id} pokemon={pokemon} eventPublisher={eventPublisher} />)}
    </section>
