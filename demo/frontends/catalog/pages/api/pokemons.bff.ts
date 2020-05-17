import * as url from "url";
import pokemons from '../../data/pokemons.json';


function return404(res) {
    res.statusCode = 404;
    res.end(JSON.stringify({'error': 'page not found'}));
    return;
}

function getPokemonInPage(currentPage: number, res) {
    const offset = (currentPage - 1) * 20;

    const page = pokemons.slice(offset, offset + 20)

    if (page.length === 0) {
        return return404(res);
    }

    res.end(JSON.stringify({
        pokemons: page,
        currentPage,
        totalPages: Math.ceil(pokemons.length / 20)
    }));
}

export default (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;

    const query = url.parse(req.url,true).query;
    const queryPage = query.page && parseInt(query.page as string);
    const currentPage = queryPage === undefined ? 1 : queryPage;

    if (currentPage < 1) {
        return return404(res);
    }

    return getPokemonInPage(currentPage, res);
}
