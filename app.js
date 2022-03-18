const path = require('path');
const express = require('express');
const cors = require('cors');

const route = require("./routes");
const db = require('./config/db');


// Connect to DB
db.connect();

const app = express();
app.use(cors());
const port = 7009;
app.use(express.json());

// Routes init
app.get('/', (req, res) => {
    res.send('Hello');
  })
  
//Routes
route(app);

app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`),
);
