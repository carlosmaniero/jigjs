import express from 'express';
import fs from 'fs';
import {CART_SERVICE_EVENTS} from "./models/models";

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
    res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

    next();
});

app.use(express.static('dist'));

const currentHost = (req) =>
    `${req.protocol}://${req.get('host')}`;

app.get('/metadata', (req, res) => {
    res.send({
        eventsProvider: [{
            events: Object.values(CART_SERVICE_EVENTS),
            serviceFile: `${currentHost(req)}/services/services.js`
        }]
    })
})

app.get('/', function (req, res) {
    res.header("X-Event-Dependency", [CART_SERVICE_EVENTS.CART_ITEMS]);
    fs.readFile('src/template/cart-count.html', "utf8", (err, data) => {
        res.send(data.replace('{componentFile}', `${currentHost(req)}/components/cart-count-component.js`));
    })
});

app.get('/cart', function (req, res) {
    res.header("X-Event-Dependency", [CART_SERVICE_EVENTS.CART_ITEMS]);
    fs.readFile('src/template/cart.html', "utf8", (err, data) => {
        res.send(data.replace('{componentFile}', `${currentHost(req)}/components/cart-component.js`));
    })
});

app.listen(3001, function () {
    console.log('Example app listening on port http://localhost:3001!');
});
