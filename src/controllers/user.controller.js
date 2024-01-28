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

      const fetchUserByEmail = await commonServices.readSingleData(req, con.TN.USERS, "*", { email: email })
      if (fetchUserByEmail.length != 0) {
        return helper.RH.cResponse(req, res, con.SC.BAD_REQUEST, con.RM.USER_WITH_EMAIL_ALREADY_EXIST);
      }

      const fetchUserByPhone = await commonServices.readSingleData(req, con.TN.USERS, "*", { phone: phone })
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
        user_id: uuidv4(),
        verification_token: uuidv4()
      }

      //Insertion
      let result = await commonServices.dynamicInsert(req, con.TN.USERS, userInfo);
      if (!result) {
        return helper.RH.cResponse(req, res, con.SC.BAD_REQUEST, con.RM.SOMETHING_WENT_WRONG);
      }

      // Send Registration Email
      await helper.CM.sendEmailJsMail(process.env.VERIFYEMAIL_TEMPLATE_ID,
        {
          name: name,
          email: email,
          link: `${process.env.FRONTEND_URL}/verify/${userInfo.verification_token}`
        })

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

  sendEmailOtp: async (req, res) => {
    try {
      const body = req.body;
      let user = await commonServices.readSingleData(req, con.TN.USERS, '*', {
        "email": body.email,
        "status": "active"
      });
      //If no row found
      if (user.length == 0) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.USER_WITH_EMAIL_DOES_NOT_EXIST);
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      const seconds = String(today.getSeconds()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      const otp = Math.floor(1000 + Math.random() * 9000);
      let updateInfo = {
        'otp': otp,
        'otp_date_time': formattedDate
      };

      await commonServices.dynamicUpdate(req, con.TN.USERS, updateInfo, { email: body.email })
      await helper.CM.sendEmailJsMail(process.env.SENDOTP_TEMPLATE_ID,
        {
          "name": user[0].name,
          "otp": otp,
          "email": body.email
        })

      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.OTP_SENT);
    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },

  forgetPassword: async (req, res) => {
    try {
      const body = req.body;
      let user = await commonServices.readSingleData(req, con.TN.USERS, '*', {
        "email": body.email,
        "status": "active"
      });
      //If no row found
      if (user.length == 0) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.USER_WITH_EMAIL_DOES_NOT_EXIST);
      }

      if (user[0].otp != body.otp) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.INVALID_OTP);
      }

      if ((new Date() - new Date(user[0].otp_date_time)) / 60000 > 5) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.OTP_EXPIRED)
      }
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
      let updateInfo = {
        otp: null,
        otp_date_time: null,
        verification_token: null,
        email_verified: true,
        password: body.password
      }
      await commonServices.dynamicUpdate(req, con.TN.USERS, updateInfo, { email: body.email })

      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.PASSWORD_CHANGED_SUCCESSFULLY)

    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },

  userDetails: async (req, res) => {
    try {
      let user = await commonServices.readSingleData(req, con.TN.USERS, 'id,user_id,name,email,phone,email_verified,profile_picture,status,account_type', {
        user_id: req.token.user_id
      });
      //If no row found
      if (user.length == 0) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.RECORD_NOT_FOUND);
      }

      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.RECORD_FOUND_SUCCESSFULLY, { user: user })

    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },

  verifyEmail: async (req, res) => {
    try {
      let user = await commonServices.readSingleData(req, con.TN.USERS, '*', {
        verification_token: req.params.verificationToken
      });
      //If no row found
      if (user.length == 0) {
        return helper.RH.cResponse(req, res, con.SC.UNAUTHORIZED, con.RM.RECORD_NOT_FOUND);
      }

      await commonServices.dynamicUpdate(req, con.TN.USERS, { email_verified: true, verification_token: null }, { user_id: user[0].user_id })

      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.EMAIL_VERIFIED_SUCCESSFULLY)

    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },

  sendEmailVerificationLink: async (req, res) => {
    try {
      let user = await commonServices.readSingleData(req, con.TN.USERS, '*', {
        user_id: req.token.user_id
      });

      let verificationToken = uuidv4()

      // Send Email VErification Email
      await helper.CM.sendEmailJsMail(process.env.VERIFYEMAIL_TEMPLATE_ID,
        {
          name: user[0].name,
          email: user[0].email,
          link: `${process.env.FRONTEND_URL}/verify/${verificationToken}`
        })

      await commonServices.dynamicUpdate(req, con.TN.USERS, { verification_token: verificationToken }, { user_id: req.token.user_id })

      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.VERIFICATION_EMAIL_SENT_SUCCESSFULLY)

    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  },
}

module.exports = user
