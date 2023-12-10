const bcryptjs = require('bcryptjs')
const User = require('../models/userModel')


const signup = async (req, res, next) => {
    const { username, email, password } = req.body

    const hashedPassword = bcryptjs.hashSync(password, 10)
    

    try {
        //const user_id = req.user._id
        //const user = await User.create({username, email, password: hashedPassword})
        const user = await new User({username, email, password: hashedPassword})
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        next (error)
    }
}

module.exports = {
    signup
}