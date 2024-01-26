const userController = require("../src/controllers/user.controller");
const Joi = require("joi");
const validator = require("../src/middleware/joiValidator");
const reqValidator = require("../src/middleware/reqValidator");
const con = require("../src/constants/index");

module.exports = (router) => {
  router.post(
    "/registration",
    validator(Joi, {
      name: Joi.string().required().min(3).max(50).regex(/^[a-zA-Z, ]*$/, con.RM.NAME_CAN_NOT_CONTIAN_SPECIAL_CHARACTER_AND_NUMBERS),
      email: Joi.string().email().required(),
      phone: Joi.number().integer().min(1000000000).max(9999999999).required(),
      password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/, con.RM.PASSWORD_MUST_BE_MINIMUM_).required()
    }),
    reqValidator,
    userController.registration)
    router.post(
      "/login",
      validator(Joi, {
        email: Joi.string().email().required(),
        password: Joi.string().required()
      }),
      reqValidator,
      userController.login);
      router.post(
        "/sendEmailOtp",
        validator(Joi, {
          email: Joi.string().email().required()
        }),
        reqValidator,
        userController.sendEmailOtp);
};
