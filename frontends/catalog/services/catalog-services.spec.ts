import fetchMock from "jest-fetch-mock";
import {fetchPokemons} from "./catalog-service";

describe('catalog-service', () => {
    beforeAll(() => {
        fetchMock.enableMocks()
    });

    beforeEach(() => {
        fetchMock.resetMocks()
    })

    afterAll(() => {
        fetchMock.disableMocks();
    })

    it('fetches pokemons', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                count: 964,
                results: [
                    {
                        name: "bulbasaur",
                        url: "https://pokeapi.co/api/v2/pokemon/1/"
                    },
                    {
                        name: "ivysaur",
                        url: "https://pokeapi.co/api/v2/pokemon/2/"
                    }
                ]
            })
        )

        const result = await fetchPokemons(1);

        expect(result).toEqual({
            currentPage: 1,
            totalPages: 49,
            pokemons: [
                {
                    name: "bulbasaur",
                    id: "1"
                },
                {
                    name: "ivysaur",
                    id: "2"
                }
            ]
        });
    });

    it('configures request', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                count: 964,
                results: []
            })
        )

        await fetchPokemons(3);

        expect(fetchMock.mock.calls[0][0]).toContain('limit=20');
        expect(fetchMock.mock.calls[0][0]).toContain('offset=40');
    });
});
