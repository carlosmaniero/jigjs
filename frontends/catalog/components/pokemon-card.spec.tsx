import React from "react";
import {render} from '@testing-library/react'
import {PokemonCard} from "./pokemon-card";

describe('PokemonCard', () => {
    let mockPublisher;

    const pokemon = {
        name: "bulbasaur",
        id: "1"
    }

    beforeEach(() => {
        mockPublisher = jest.fn();
    })

    it('renders the pokemon name', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} eventPublisher={mockPublisher} />);

        expect(component.queryByText('BULBASAUR')).not.toBeNull();
    });

    it('adds a pokemon to cart', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} eventPublisher={mockPublisher} />);

        component.getByText("add to cart").click();

        expect(mockPublisher).toBeCalledWith('CART_SERVICE_ADD_TO_CART', pokemon)
    })
})
