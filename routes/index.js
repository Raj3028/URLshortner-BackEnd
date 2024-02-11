const express = require('express');
const router = express.Router();

//import routes
const userApi = require('./user');
const urlApi = require('./url');

//We made groupping of routes 
userApi(router);
urlApi(router);

module.exports = router;