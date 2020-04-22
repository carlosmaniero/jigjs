import * as express from 'express';
import {CART_SERVICE_EVENTS} from "./services/CartService";

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
    res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

    next();
});

app.use(express.static('dist'));

app.get('/metadata', (req, res) => {
    res.send({
        eventsProvider: [{
            events: Object.values(CART_SERVICE_EVENTS),
            serviceFile: '/services/service.js'
        }]
    })
})

app.get('/', function (req, res) {
    res.header("X-Event-Dependency", [CART_SERVICE_EVENTS.ASK_FOR_ITEMS, CART_SERVICE_EVENTS.ADD_TO_CART]);
    res.send('Cart 0');
});

app.listen(3001, function () {
    console.log('Example app listening on port http://localhost:3001!');
});
