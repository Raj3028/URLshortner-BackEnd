const urlController = require("../src/controllers/url.controller");
const Joi = require("joi");
const validator = require("../src/middleware/joiValidator");
const reqValidator = require("../src/middleware/reqValidator");
const con = require("../src/constants/index");
const auth = require("../src/middleware/jwtAuthValidation");

module.exports = (router) => {
    router.post(
        "/generateShortUrl",
        auth,
        validator(Joi, {
            longUrl: Joi.string().uri().required(),
            title: Joi.string().required()
        }),
        reqValidator,
        urlController.generateShortUrl)

    router.get(
        "/getAllUrl",
        auth,
        reqValidator,
        urlController.getAllUrl)

    router.post(
        "/inactiveUrl",
        validator(Joi, {
            urlId: Joi.array().items().min(1)
        }),
        auth,
        reqValidator,
        urlController.inactiveUrl)
};
