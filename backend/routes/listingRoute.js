const express = require('express')
const { createListing } = require('../controllers/listingController')

const router = express.Router()

router.post('/create', createListing)

module.exports = router