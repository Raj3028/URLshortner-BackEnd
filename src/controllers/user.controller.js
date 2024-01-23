const helper = require('../helpers/index');
const con = require("../constants/index");


const user = {
  getUsers: async (req, res) => {
    try {
      return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.SUCCESSFULLY,{
        payload:[]
      })
    } catch (error) {
      return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
    }
  }
}
module.exports = user;