import React from "react";
import {render} from '@testing-library/react'
import {PokemonCard} from "./pokemon-card";
import {Pokemon} from "../../models/pokemon";

describe('PokemonCard', () => {
    let mockPublisher;

    const pokemon: Pokemon = {
        number: 1,
        name: "Bulbasaur",
        primaryType: "Grass",
        secondaryType: "Poison",
        price: 3180,
        hp: 45,
        attack: 49,
        defense: 49,
        spAtk: 65,
        spDef: 65,
        speed: 45,
        generation: 1,
        legendary: false
    }

    beforeEach(() => {
        mockPublisher = jest.fn();
    })

    it('renders the pokemon name', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} eventPublisher={mockPublisher} />);

        expect(component.queryByText('Bulbasaur')).not.toBeNull();
    });

    it('renders the total at cart', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} totalIntoCart={1} eventPublisher={mockPublisher} />);

        expect(component.queryByText('1')).not.toBeNull();
    });

    it('does not renders the total when it is zero', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} totalIntoCart={0} eventPublisher={mockPublisher} />);

        expect(component.queryByText('0')).toBeNull();
    });

    it('renders the pokemon price', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} eventPublisher={mockPublisher} />);

        expect(component.queryByText('$3,180')).not.toBeNull();
    });

    it('adds a pokemon to cart', async () => {
        const component = await render(<PokemonCard pokemon={pokemon} eventPublisher={mockPublisher} />);

        component.getByText("add to cart").click();

        expect(mockPublisher).toBeCalledWith('CART_SERVICE_ADD_TO_CART', pokemon)
    })
})
