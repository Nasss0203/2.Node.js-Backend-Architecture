
const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const _SECONDS = 5000
//Count Connect
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connections::${numConnection}`)
}

//Check over load
const checkOverLoad = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length;
        const memoryUsega = process.memoryUsage().rss

        console.log(`Active connection::${numCores}`)
        console.log(`Memory useage:: ${memoryUsega / 1024 / 1024} MB`)

        // Example Maxium number of connections based on number of compression
        const maxConnections = numConnection * 5

        if (numConnection > maxConnections) {
            console.log(`Connection overload detected`)
        }
    }, _SECONDS) // Monitor every 5 seconds
}

module.exports = {
    countConnect, checkOverLoad
}