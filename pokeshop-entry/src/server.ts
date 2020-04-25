import express from 'express';
import {FragmentResolver} from "./services/fragment-resolver";
import {renderCatalog} from "./views/catalog-view";
import {FrontEndMetadataRegisterService} from "./services/front-end.metadata";
import {renderCart} from "./views/cart-view";

const app = express();
const frontEndService = new FrontEndMetadataRegisterService();

app.use(express.static('dist'));

console.log('Registering dependencies');

frontEndService.register('http://localhost:3001/').then((frontEndMetadata) => {
    app.get('/', (req, res) => {
        renderCatalog(new FragmentResolver(), frontEndMetadata)
            .then((view) => {
                res.send(view);
            });
    });

    app.get('/catalog/:number', (req, res) => {
        renderCatalog(new FragmentResolver(), frontEndMetadata, req.params.number)
            .then((view) => {
                res.send(view);
            });
    });

    app.get('/cart', (req, res) => {
        renderCart(new FragmentResolver(), frontEndMetadata)
            .then((view) => {
                res.send(view);
            });
    });

    console.log('starting server');

    app.listen(4200, function () {
        console.log('Example app listening on port http://localhost:4200!');
    });

})
