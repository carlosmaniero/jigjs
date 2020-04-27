import express from 'express';
import {FragmentResolverImpl} from "./services/fragment-resolver";
import {renderCatalog} from "./views/catalog-view";
import {FrontEndMetadataRegisterService} from "./services/front-end.metadata";
import {renderCart} from "./views/cart-view";
import {registerHeaderComponent} from "./components/layout/header.component";
import {registerTitle} from "./components/layout/title.component";

const app = express();
const frontEndService = new FrontEndMetadataRegisterService();

app.use(express.static('dist'));

console.log('Registering dependencies');

function createFragmentResolver(res) {
    return new FragmentResolverImpl({
        onError: (url, error) => console.error(`it was not possible to fetch ${url}`, error),
        onFatal: (url, error) => {
            console.error(`Error: it was not possible to fetch ${url}`, error)
            res.statusCode = 500;
        }
    });
}

let frontEndMetadata;

setInterval(async () => {
    frontEndMetadata = await frontEndService.register('http://localhost:3001/');
}, 2000);

frontEndService.register('http://localhost:3001/').then((initialMetadata) => {
    frontEndMetadata = initialMetadata;

    const customElementRegistrations = [registerHeaderComponent, registerTitle];

    app.get('/', (req, res) => {
        renderCatalog(createFragmentResolver(res), frontEndMetadata, '1', customElementRegistrations)
            .then((view) => {
                res.send(view);
            });
    });

    app.get('/catalog/:number', (req, res) => {
        renderCatalog(createFragmentResolver(res), frontEndMetadata, req.params.number, customElementRegistrations)
            .then((view) => {
                res.send(view);
            });
    });

    app.get('/cart', (req, res) => {
        renderCart(createFragmentResolver(res), frontEndMetadata, customElementRegistrations)
            .then((view) => {
                res.send(view);
            });
    });

    console.log('starting server');

    app.listen(4200, function () {
        console.log('Example app listening on port http://localhost:4200!');
    });

})
