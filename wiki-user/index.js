// ./app.js
const express = require('express');
const bodyParser = require('body-parser');
const mountRoutes = require('./routes');
const http = require('http');

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
mountRoutes(app); // Calls the index.js route file to mount all routes in route folder.

const httpServer = http.createServer(app);

httpServer.listen(4000);
