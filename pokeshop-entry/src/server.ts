import express from 'express';
import {FragmentResolver} from "./services/fragment-resolver";
import {renderHome} from "./views/home";
import {FrontEndMetadataRegisterService, FrontEndMetadata} from "./services/front-end.metadata";

const app = express();
const frontEndService = new FrontEndMetadataRegisterService();

app.use(express.static('dist'));

console.log('Registering dependencies');

frontEndService.register('http://localhost:3001/').then((frontEndMetadata) => {
    app.get('/', (req, res) => {
        renderHome(new FragmentResolver(), frontEndMetadata)
            .then((view) => {
                res.send(view);
            });
    });

    console.log('starting server');

    app.listen(4200, function () {
        console.log('Example app listening on port http://localhost:4200!');
    });

})
