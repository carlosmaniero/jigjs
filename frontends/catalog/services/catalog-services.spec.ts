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
            })
        )

        const result = await fetchPokemons(1, 'http://localhost:3000');

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
            JSON.stringify({})
        )

        await fetchPokemons(3, 'http://localhost:3000');

        expect(fetchMock.mock.calls[0][0]).toContain('page=3');
    });
});
