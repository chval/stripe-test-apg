'use strict';

const express = require('express');
const https = require('https');
const axios = require('axios');

const router = express.Router();

router.use(async (req, res, next) => {
    const requestBody = {
        grant_type: 'client_credentials',
        scope: 'paymentgatewayapi.fullaccess',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    };

    try {
        const resp = await axios.post(process.env.TOKEN_ENDPOINT, requestBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        const {access_token, token_type} = resp.data;
        res.locals.access_token = access_token;
        res.locals.token_type = token_type;
        next();
    } catch (error) {
        res.status(401).json({error});
    }
});

module.exports = router;
