import pokemons from '../../../data/pokemons.json';


function respondWith(res, pokemon) {
    if (!pokemon) {
        res.statusCode = 404;
        res.end(JSON.stringify({error: 'not found!'}))
        return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify(pokemon))
}

export default (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader('Content-Type', 'application/json');
    const number = parseInt(req.query.number) - 1;

    const pokemon = pokemons[number];

    respondWith(res, pokemon);
}
