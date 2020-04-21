import * as express from 'express';
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.send('Cart 0');
});

app.listen(3001, function () {
    console.log('Example app listening on port http://localhost:3001!');
});
