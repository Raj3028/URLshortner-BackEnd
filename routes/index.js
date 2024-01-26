const express = require('express');
const router = express.Router();

//import routes
const userApi = require('./user');

//We made groupping of routes 
userApi(router);

module.exports = router;