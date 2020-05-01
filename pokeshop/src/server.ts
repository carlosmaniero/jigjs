import express from 'express';


const app = express();

app.use(express.static('dist'));

app.get('/', (req, res) => {
    res.send(`<script src="/components.js"></script><div id="app"></div>`);
});


app.listen(4200, function () {
    console.log('Example app listening on port http://localhost:4200!');
});

