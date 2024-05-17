const mongosee = require('mongoose')

const connectString = `mongodb+srv://anhnamnguyen0203:1234567890@cluster0.oupiinn.mongodb.net/shopDev`

mongosee.connect(connectString)
    .then(_ => console.log(`Connected MongoDb Level:0 Success`))
    .catch(err => console.log(`Error Connect`))

//dev 
if (1 === 1) {
    mongosee.set('debug', true)
    mongosee.set('debug', { color: true })
}

module.exports = mongosee