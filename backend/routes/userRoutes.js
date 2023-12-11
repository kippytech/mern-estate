const express = require('express')
const { getUsers, updateUser } = require('../controllers/userController')
const verifyToken = require('../utils/verifyUser')

const router = express.Router()

router.get('/users', getUsers)
router.post('/update/:id', verifyToken, updateUser)

module.exports = router