import {render} from "@testing-library/react";
import React from "react";
import {PokemonList} from "./pokemon-list";

describe('PokemonList', () => {
    let mockPublisher;

    const pokemons = [
        {
            name: "bulbasaur",
            id: "1"
        },
        {
            name: "pikachu",
            id: "2"
        },
    ]

    beforeEach(() => {
        mockPublisher = jest.fn();
    })

    it('renders the pokemons name', async () => {
        const component = await render(<PokemonList
            pokemons={pokemons}
            eventPublisher={mockPublisher}
        />);

        expect(component.queryByText('BULBASAUR')).not.toBeNull();
        expect(component.queryByText('PIKACHU')).not.toBeNull();
    });
});
