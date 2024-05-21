require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')

//init middleware
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

//init db
require('./database/init.mongodb')

//init route
app.use('/', require('./routes/index'))

//handling error
app.use((res, req, next) => {
    const error = new Error("Not Found")
    error.status = 404
    next(error)
})

app.use((error, res, req, next) => {
    const statusCode = error.status || 500
    return req.status(statusCode).json({
        status: 'error',
        code: statusCode,
        // stack: error.stack, //debug
        message: error.message || "Internal Server Error"
    })
})

module.exports = app