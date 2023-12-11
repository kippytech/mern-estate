const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const errorHandler = require('../utils/error')


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

const login = async (req, res, next) => {
    const { email, password } = req.body
    
    try {
        const validUser = await User.findOne({email})
        if (!validUser) {
            return next(errorHandler(404, 'User not found!'))
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password)
        if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'))
        const token = jwt.sign({ id: validUser._user}, process.env.SECRET)
        const { password: pass, ...rest } = validUser._doc
        res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest) // http then ,expires: new Date(Date.now() + 24*60*60*days)
    } catch (error) {
        next (error)
    }
}

const google = async (req, res, next) => {
    //const { email } = req.body
    
    try {
        const user = await User.findOne({email})
        if (!user) {
            const token = jwt.sign({ id: user._id}, process.env.SECRET)
            const { password: pass, ...rest } = user._doc
            res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest)
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo })
            await newUser.save()
            const token = jwt.sign({ id: newUser._id}, process.env.SECRET)
            const { password: pass, ...rest } = newUser._doc
            res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest)
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signup,
    login,
    google
}