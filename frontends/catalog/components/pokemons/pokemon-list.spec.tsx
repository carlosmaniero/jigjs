import {render} from "@testing-library/react";
import React from "react";
import {PokemonList} from "./pokemon-list";
import {publishEvent, subscribeToEvent} from "../../core/event-bus";

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
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        expect(component.queryByText('BULBASAUR')).not.toBeNull();
        expect(component.queryByText('PIKACHU')).not.toBeNull();
    });

    it('updates state when props changes', async () => {
        const component = await render(<PokemonList
            pokemons={[{
                name: "bulbasaur",
                id: "1"
            }]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        component.rerender(<PokemonList
            pokemons={[{
                name: "Pikachu",
                id: "2"
            }]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);


        expect(component.queryByText('PIKACHU')).not.toBeNull();
    });

    it('renders the total of items on cart', async () => {
        const component = await render(<PokemonList
            pokemons={[{
                name: "bulbasaur",
                id: "1"
            }]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        publishEvent('CART_SERVICE_ITEMS', {
            items: [{
                items: [{
                    name: "bulbasaur",
                    id: "1",
                    total: 67
                }]
            }],
            total: 10
        })

        expect(component.findByText('67')).not.toBeNull();
    });

    it('renders the total of items on cart', async () => {
        const component = await render(<PokemonList
            pokemons={[{
                name: "bulbasaur",
                id: "1"
            }]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        component.rerender(<PokemonList
            pokemons={[{
                name: "Pikachu",
                id: "2"
            }]}
            eventListener={subscribeToEvent}
            eventPublisher={mockPublisher}
        />);

        expect(mockPublisher).toBeCalledTimes(2);
        expect(mockPublisher).toHaveBeenNthCalledWith(1, "CART_SERVICE_ASK_FOR_ITEMS")
        expect(mockPublisher).toHaveBeenNthCalledWith(2, "CART_SERVICE_ASK_FOR_ITEMS")
    });
});
