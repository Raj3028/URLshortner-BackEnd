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
    updateStatus: async (req, res) => {
        try {
            let { urlId,urlStatus } = req.body;

            urlId.forEach(async (id) => {
                await commonServices.dynamicUpdate(req, con.TN.URL, { status: urlStatus }, { id: id })
            })

            return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.RECORD_UPDATED_SUCCESSFULLY)
        } catch (error) {
            return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
        }
    },
    getAllUrl: async (req, res) => {
        try {

            const shortUrls = await commonServices.readAllData(req, con.TN.URL, "id,title,short_id,long_url,status,DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS createdAt,DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') AS updatedAt", { created_by: req.token.user_id})

            // if (shortUrls.length == 0) {
            //     return helper.RH.cResponse(req, res, con.SC.NOT_FOUND, con.RM.RECORD_NOT_FOUND)
            // }

            return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.RECORD_FOUND_SUCCESSFULLY, { data: shortUrls })
        } catch (error) {
            return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
        }
    },
    redirectUrl: async (req, res) => {
        try {
            let {shortId} = req.body

            const shortUrl = await commonServices.readSingleData(req, con.TN.URL, "*",{short_id:shortId,status:'active'})

            if (shortUrl.length == 0) {
                return helper.RH.cResponse(req, res, con.SC.NOT_FOUND, con.RM.RECORD_NOT_FOUND)
            }
            return helper.RH.cResponse(req, res, con.SC.SUCCESS, con.RM.RECORD_FOUND_SUCCESSFULLY, { url: shortUrl[0].long_url });
        } catch (error) {
            return helper.RH.cResponse(req, res, con.SC.EXPECTATION_FAILED, error);
        }
    },
}

module.exports = url
