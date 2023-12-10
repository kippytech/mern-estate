const mongoose = require('mongoose')
const User = require('../models/userModel')

const getUsers = (req, res) => {
    res.json({mssg: 'maskani here'})
}

module.exports = {
    getUsers
}