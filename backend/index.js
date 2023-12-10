require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./routes/userRoutes')
const authRouter = require('./routes/authRoute')

const app = express()

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
        console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message
  })
})