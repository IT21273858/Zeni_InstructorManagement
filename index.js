var express = require('express');
var app = express();
require('dotenv').config();
var routes = require('./routes//routes');
const cors = require('cors');

const PORT = process.env.Port || 8000;


app.use(cors());
app.use(express.json());

app.use(routes);

app.listen(PORT, () => {
    console.log("App is Running on Port", PORT);
})