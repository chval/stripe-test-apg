'use strict';

const express = require('express');
const https = require('https');
const axios = require('axios');

const TokenCache = require('../TokenCache');

const router = express.Router();

router.use(async (req, res, next) => {
    const cache = TokenCache.instance;

    if ( !cache.hasValidData() ) {
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

            cache.setData(resp.data);
        } catch (error) {
            res.status(401).json({error});
        }
    }

    const {access_token, token_type} = cache.getData();
    res.locals.access_token = access_token;
    res.locals.token_type = token_type;
    next();
});

module.exports = router;
