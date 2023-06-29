'use strict';

const https = require('https');
const axios = require('axios');

module.exports.createPayment = async function (req, res) {
    const requestBody = {
        currency: 'USD',
        amount: req.body.amount,
        clientCustomerId: req.body.customer_id,
        paymentMethod: req.body.payment_method,
        hold: false
    };

    try {
        const resp = await axios.post(process.env.APG_ENDPOINT + '/payment', JSON.stringify(requestBody), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': res.locals.token_type + ' ' + res.locals.access_token,
                'X-StripeKey': process.env.STRIPE_SEC_KEY,
                'X-Version': '2.0'
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });

        res.json(resp.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
}
