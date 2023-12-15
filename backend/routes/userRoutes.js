const express = require('express')
const { getUsers, updateUser, deleteUser, getUserListings, getUser } = require('../controllers/userController')
const verifyToken = require('../utils/verifyUser')

const router = express.Router()

router.get('/users', getUsers)
router.post('/update/:id', verifyToken, updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken, getUserListings)
router.get('/:id', verifyToken, getUser)

module.exports = router