const helper = require("../helpers/index");
const jwtConfig = require("config").get("jwtConfig");
const con = require("../constants/index");
const bcrypt = require("bcryptjs");
const commonServices = require("../services/Common");
const { v4: uuidv4 } = require('uuid');

const user = {
  registration: async (req, res) => {
    try {
      let { name, email, phone, password } = req.body;

      const fetchUserByEmail = await commonServices.readSingleData(req, con.TN.USERS,"*", { email: email })
      if (fetchUserByEmail.length != 0) {
        return helper.RH.cResponse(req, res, con.SC.BAD_REQUEST, con.RM.USER_WITH_EMAIL_ALREADY_EXIST);
      }

      const fetchUserByPhone = await commonServices.readSingleData(req, con.TN.USERS,"*", { phone: phone })
      if (fetchUserByPhone.length != 0) {
        return helper.RH.cResponse(req, res, con.SC.BAD_REQUEST, con.RM.USER_WITH_PHONE_ALREADY_EXIST);
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let userInfo = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        user_id:uuidv4()
      }
      
      //Insertion
      let result = await commonServices.dynamicInsert(req, con.TN.USERS, userInfo);
      if (!result) {
        return helper.RH.cResponse(req, res, con.SC.BAD_REQUEST, con.RM.SOMETHING_WENT_WRONG);
      }

      return helper.RH.cResponse(req, res, con.SC.CREATED, con.RM.REGISTRATION_SUCCESSFULL)
    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },

  login: async (req, res) => {
    try {
      const body = req.body;
      let loginResults = await commonServices.readSingleData(req, con.TN.USERS, '*', {
        "email": body.email
      });
      //If no row found
      if (loginResults.length == 0) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.USER_WITH_EMAIL_DOES_NOT_EXIST);
      }
      const match = await bcrypt.compare(body.password, loginResults[0].password);
      if (match == false) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.INVALID_CREDENTIALS);
      }
      const tempData = {
        user_id: loginResults[0].user_id,
        name: loginResults[0].name,
        email: loginResults[0].email,
        phone: loginResults[0].phone
      }
      let regularToken = await helper.CM.createToken(tempData, jwtConfig.jwtExpirySeconds, "login");
      let refreshToken = await helper.CM.createToken(tempData, jwtConfig.refreshTokenExpiry, "login");

      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.LOGIN_SUCCESSFULL, {
        token: regularToken,
        refreshToken: refreshToken
      })
    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },
}

module.exports = user
