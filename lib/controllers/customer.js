'use strict';

const https = require('https');
const axios = require('axios');

module.exports.getCustomers = async function (req, res) {
    const reqOpts = {
        params: {
            pageNumber: 1,
            pageSize: 10
        },
        headers: {
            'Authorization': res.locals.token_type + ' ' + res.locals.access_token,
            'X-StripeKey': process.env.STRIPE_SEC_KEY,
            'X-Version': '2.0'
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    };

    try {
        const resp = await axios.get(process.env.APG_ENDPOINT + '/customer', reqOpts);
        res.json(resp.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
}
