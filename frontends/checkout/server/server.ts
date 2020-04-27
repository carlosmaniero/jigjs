import express from 'express';

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
  res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Event-Dependency");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

  next();
});

app.use(express.static('dist'));

app.get('/metadata', (req, res) => {
  res.send({
    eventsProvider: []
  })
})

app.listen(8080, function () {
  console.log('Example app listening on port http://localhost:8080!');
});
