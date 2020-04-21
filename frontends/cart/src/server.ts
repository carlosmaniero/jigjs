import * as express from 'express';
const app = express();

app.get('/', function (req, res) {
    res.send('Cart 0');
});

app.listen(3001, function () {
    console.log('Example app listening on port http://localhost:3001!');
});
