// load in the environment vars
require('dotenv').config({silent: true})

const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const router = require('./config/routes')
const bodyParser = require('body-parser')
const CoSpace = require('./models/message.js')

// MIDDLEWARE
// plugin morgan for debugging information
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// ROUTES
// keep all api routes in a seperate file - prefix routes with api/ path
app.use('/', router)

// server everything in assets folder as static for images etc
app.use(express.static('public'))

// ERRORS
// catch 404 and pass on to error handlers
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Handle Errors in development
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
      message: err.message,
      error: err
    })
  })
}

// Handle errors in production with less information logged
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: {}
  })
})

// START SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server Listening on port ${process.env.PORT}`)
})

// CONNECT TO DB
mongoose.connect(process.env.MONGODB_URI)
