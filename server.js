'use strict';

const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '/.env') });

// express app init
const app = express();
app.use(express.static('public'));
app.use(express.json());

const authRouter = require('./lib/routes/auth');
const customerRouter = require('./lib/routes/customer');
const paymentRouter = require('./lib/routes/payment');

app.use('/', express.static('app', {
    index: 'index.html'
}));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/api', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/payment', paymentRouter);

app.get('/conf/stripe_pk', (req, res) => {
    res.status(200).send(process.env.STRIPE_PUB_KEY);
});

const port = process.env.SERVER_PORT || 443;
const host = '0.0.0.0';

https
    .createServer({
        key: fs.readFileSync("tls/key.pem"),
        cert: fs.readFileSync("tls/cert.pem"),
    }, app)
    .listen(port, host, () => {
        console.log(`Running on ${host}:${port}`)
    });
