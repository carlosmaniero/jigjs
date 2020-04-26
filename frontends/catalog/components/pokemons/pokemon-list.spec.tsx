import {render} from "@testing-library/react";
import React from "react";
import {PokemonList} from "./pokemon-list";
import {publishEvent, subscribeToEvent} from "../../core/event-bus";
import {Pokemon} from "../../models/pokemon";

describe('PokemonList', () => {
    let mockPublisher;

    const bulbasaur: Pokemon = {
        number: 1,
        name: "Bulbasaur",
        primaryType: "Grass",
        secondaryType: "Poison",
        price: 318,
        hp: 45,
        attack: 49,
        defense: 49,
        spAtk: 65,
        spDef: 65,
        speed: 45,
        generation: 1,
        legendary: false
    };
    const pikachu: Pokemon = {
        number: 2,
        name: "Pikachu",
        primaryType: "Electric",
        secondaryType: "",
        price: 320,
        hp: 35,
        attack: 55,
        defense: 40,
        spAtk: 50,
        spDef: 50,
        speed: 90,
        generation: 1,
        legendary: false
    };
    const pokemons = [
        bulbasaur,
        pikachu,
    ]

    beforeEach(() => {
        mockPublisher = jest.fn();
    })

    it('renders the pokemons name', async () => {
        const component = await render(<PokemonList
            pokemons={pokemons}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        expect(component.queryByText('Bulbasaur')).not.toBeNull();
        expect(component.queryByText('Pikachu')).not.toBeNull();
    });

    it('updates state when props changes', async () => {
        const component = await render(<PokemonList
            pokemons={[bulbasaur]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        component.rerender(<PokemonList
            pokemons={[pikachu]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);


        expect(component.queryByText('Pikachu')).not.toBeNull();
    });

    it('renders the total of items on cart', async () => {
        const component = await render(<PokemonList
            pokemons={[bulbasaur]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        publishEvent('CART_SERVICE_ITEMS', {
            items: [{
                items: [{
                    ...bulbasaur,
                    total: 67
                }]
            }],
            total: 10
        })

        expect(component.findByText('67')).not.toBeNull();
    });

    it('renders the total of items on cart', async () => {
        const component = await render(<PokemonList
            pokemons={[bulbasaur]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        component.rerender(<PokemonList
            pokemons={[pikachu]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        expect(mockPublisher).toBeCalledTimes(2);
        expect(mockPublisher).toHaveBeenNthCalledWith(1, "CART_SERVICE_ASK_FOR_ITEMS")
        expect(mockPublisher).toHaveBeenNthCalledWith(2, "CART_SERVICE_ASK_FOR_ITEMS")
    });
});
