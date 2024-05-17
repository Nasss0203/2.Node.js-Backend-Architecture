const express = require('express')
const app = express()
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')

//init middleware
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

//init db

//init route
app.get('', (req, res, next) => {

})

//handling error

module.exports = app