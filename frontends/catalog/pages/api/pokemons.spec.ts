import http from "http"
import fetch from "isomorphic-fetch"
import listen from "test-listen"
import {apiResolver} from "next/dist/next-server/server/api-utils";
import pokemons from "./pokemons.bff";


describe("pokemons handler", () => {
    let server;
    let url;

    beforeEach(async () => {
        const requestHandler = (req, res) => {
            return apiResolver(req, res, undefined, pokemons, undefined);
        }

        server = http.createServer(requestHandler);
        url = await listen(server);
    })

    afterEach(() => {
        server.close();
    })

    it("responds with the first 20 items", async () => {
        const response = await fetch(url);

        expect(response.status).toBe(200);
        const responseBody = await response.json();

        expect(responseBody.pokemons[0]).toEqual({
            "number": 1,
            "name": "Bulbasaur",
            "primaryType": "Grass",
            "secondaryType": "Poison",
            "totalPower": 318,
            "hp": 45,
            "attack": 49,
            "defense": 49,
            "spAtk": 65,
            "spDef": 65,
            "speed": 45,
            "generation": 1,
            "legendary": false
        })

        expect(responseBody.pokemons).toHaveLength(20);
    });

    it("paginates the result", async () => {
        const response = await fetch(url + "/?page=37");

        expect(response.status).toBe(200);
        const responseBody = await response.json();

        expect(responseBody.pokemons[0].number).toEqual(721);
        expect(responseBody.pokemons).toHaveLength(1);
    });

    it("returns 404 if the page is less then 1", async () => {
        const response = await fetch(url + "/?page=0");

        expect(response.status).toBe(404);
    });

    it("returns 404 if the page is bigger then 37", async () => {
        const response = await fetch(url + "/?page=38");

        expect(response.status).toBe(404);
    });

    it("returns page information", async () => {
        const response = await fetch(url + "/?page=27");

        const responseBody = await response.json();

        expect(responseBody.currentPage).toBe(27);
        expect(responseBody.totalPages).toBe(37);
    });
});
