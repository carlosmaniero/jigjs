import {PokemonDetail} from "./pokemon-detail";
import {render} from "@testing-library/react";
import React from "react";

describe('PokemonDetail', () => {
    it('renders a pokemon', async () => {
        const pokemon = {
            number: 28,
            name: "Sandslash",
            primaryType: "Ground",
            secondaryType: "",
            price: 450,
            hp: 75,
            attack: 100,
            defense: 110,
            spAtk: 45,
            spDef: 55,
            speed: 65,
            generation: 1,
            legendary: false
        }

        const component = await render(<PokemonDetail pokemon={pokemon} />);

        expect(component.getByText('Sandslash')).not.toBeNull();
        expect(component.getByText('Ground')).not.toBeNull();
        expect(component.getByText('$450')).not.toBeNull();
        expect(component.getByText('75')).not.toBeNull();
        expect(component.getByText('100')).not.toBeNull();
        expect(component.getByText('110')).not.toBeNull();
        expect(component.getByText('45')).not.toBeNull();
        expect(component.getByText('55')).not.toBeNull();
        expect(component.getByText('65')).not.toBeNull();
    });
})
