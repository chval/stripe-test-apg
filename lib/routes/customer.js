'use strict';

const express = require('express');

const customerController = require('../controllers/customer');

const router = express.Router();

router.get('/', customerController.getCustomers);

module.exports = router;
