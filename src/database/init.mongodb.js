const mongosee = require('mongoose')
const { db: { host, name, port } } = require('../configs/config.mongodb')

const connectString = `mongodb+srv://${host}@${port}/${name}`
const { countConnect } = require('../helpers/check.connect')


class Database {
    constructor() {
        this.connect()
    }

    connect(type = 'mongodb') {
        if (1 === 1) {
            mongosee.set('debug', true)
            mongosee.set('debug', { color: true })
        }
        mongosee.connect(connectString)
            .then(_ => {
                console.log(`Connected MongoDB Success PRO`, countConnect())
            })
            .catch(err => console.log(`Error Connect`))
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb