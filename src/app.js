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

module.exports = app