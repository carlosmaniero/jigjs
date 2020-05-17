import {apiResolver} from "next/dist/next-server/server/api-utils";
import fetch from "isomorphic-fetch"
import pokemon from "./[number].bff";
import http from "http";
import listen from "test-listen";

describe('Pokemon Detail BFF', () => {
    let server;
    let url;

    async function configureTest(query = {}) {
        const requestHandler = (req, res) => {
            return apiResolver(req, res, query, pokemon, undefined);
        }

        server = http.createServer(requestHandler);
        url = await listen(server);
    }

    afterEach(() => {
        server.close();
    })

    it('returns a pokemon by number', async () => {
        await configureTest({number: 1});
        const response = await fetch(url);

        expect(response.status).toBe(200);
        const responseBody = await response.json();

        expect(responseBody).toEqual({
            "number": 1,
            "name": "Bulbasaur",
            "primaryType": "Grass",
            "secondaryType": "Poison",
            "price": 318,
            "hp": 45,
            "attack": 49,
            "defense": 49,
            "spAtk": 65,
            "spDef": 65,
            "speed": 45,
            "generation": 1,
            "legendary": false
        })
    });

    it('returns 404 when there is no pokemon with a number', async () => {
        await configureTest({number: 1000});
        const response = await fetch(url);

        expect(response.status).toBe(404);
    });
})
