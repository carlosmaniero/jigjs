import React from "react";
import {Pokemon} from "../../models/pokemon";
import {EventPublisher, EventSubscriber, EventSubscription} from "../../core/event-bus";
import {PokemonCard} from "./pokemon-card";

type CartEventItemContract = Pokemon & {total: number}

interface CartEventContract {
    items: CartEventItemContract[]
}

interface Props {
    pokemons: Pokemon[];
    eventPublisher: EventPublisher;
    eventListener: EventSubscriber;
}

interface State {
    pokemons: CartEventItemContract[],
    items: CartEventItemContract[]
}

export class PokemonList extends React.Component<Props, State> {
    state = {
        pokemons: [],
        items: []
    }
    private subscription: EventSubscription;

    render(): React.ReactNode {
        return <>
            <style jsx>{`
              section {
                display: grid;
                grid-gap: 20px;
                grid-auto-rows: 1fr;
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
              }
              @media only screen and (max-width: 1400px) {
                section {
                  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                }
              }
              @media only screen and (max-width: 1280px) {
                section {
                  grid-template-columns: 1fr 1fr 1fr 1fr;
                }
              }
              @media only screen and (max-width: 980px) {
                section {
                  grid-template-columns: 1fr 1fr 1fr;
                }
              }
              @media only screen and (max-width: 720px) {
                section {
                  grid-template-columns: 1fr 1fr;
                }
              }
              @media only screen and (max-width: 600px) {
                section {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
            <section>
                {this.props.pokemons.map((pokemon) =>
                    <PokemonCard
                        key={pokemon.number}
                        pokemon={pokemon}
                        totalIntoCart={this.getTotalForPokemon(pokemon)}
                        eventPublisher={this.props.eventPublisher} />)}

                    {this.props.children}
            </section>
        </>
    }

    componentDidMount(): void {
        this.setState({
            items: [],
        });

        this.subscription = this.props.eventListener('CART_SERVICE_ITEMS', (cart: CartEventContract) => {
            this.setState({
                items: cart.items,
            });
        });

        this.addPokemonsToState();
    }

    componentDidUpdate(prevProps): void {
        if (prevProps === this.props) {
            return;
        }
        this.addPokemonsToState();
    }

    private addPokemonsToState() {
        this.props.eventPublisher('CART_SERVICE_ASK_FOR_ITEMS');
    }

    componentWillUnmount(): void {
        this.subscription.unsubscribe();
    }

    private getTotalForPokemon(pokemon: Pokemon) {
        const item = this.state.items.find((item) => item.number === pokemon.number);

        if (item) {
            return item.total;
        }

        return 0;
    }
}
