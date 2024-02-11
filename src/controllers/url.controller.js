const helper = require("../helpers/index");
const jwtConfig = require("config").get("jwtConfig");
const con = require("../constants/index");
const bcrypt = require("bcryptjs");
const commonServices = require("../services/Common");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const shortid = require("shortid")

const url = {
    generateShortUrl: async (req, res) => {
        try {
            let { longUrl, title } = req.body;

            let shortId = shortid.generate()
            const shortUrl = await commonServices.dynamicInsert(req, con.TN.URL, {
                long_url: longUrl,
                short_id: shortId,
                created_by: req.token.user_id,
                title: title
            })

            if (!shortUrl) {
                return helper.RH.cResponse(req, res, con.SC.BAD_REQUEST, con.RM.SOMETHING_WENT_WRONG);
            }

            return helper.RH.cResponse(req, res, con.SC.CREATED, con.RM.RECORD_ADDED_SUCCESSFULLY)
        } catch (error) {
            return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
        }
    },
    inactiveUrl: async (req, res) => {
        try {
            let { urlId } = req.body;

            const urls = urlId.forEach(async (id) => {
                await commonServices.dynamicUpdate(req, con.TN.URL, { status: 'inactive' }, { id: id })
            })

            return helper.RH.cResponse(req, res, con.SC.CREATED, con.RM.RECORD_UPDATED_SUCCESSFULLY)
        } catch (error) {
            return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
        }
    },
    getAllUrl: async (req, res) => {
        try {

            const shortUrls = await commonServices.readAllData(req, con.TN.URL, "id,title,short_id,long_url,status,DATE_FORMAT(created_at, '%M %d, %Y %H:%i') AS createdAt,DATE_FORMAT(updated_at, '%M %d, %Y %H:%i') AS updatedAt", { created_by: req.token.user_id })

            if (shortUrls.length == 0) {
                return helper.RH.cResponse(req, res, con.SC.NOT_FOUND, con.RM.RECORD_NOT_FOUND)
            }

            return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.RECORD_FOUND_SUCCESSFULLY, { data: shortUrls })
        } catch (error) {
            return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
        }
    },
}

module.exports = url