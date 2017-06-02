const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const app = express()

// Configuration Setup
const config = require('shapeshift-common-library')('shapeshift-historical-pricing-api')
const port = config.get('port')
const mongoConfig = config.get('mongoDBConnection')

// MongoDB connection setup
require('./database/mongoSetup')(mongoConfig)

// RabbitMQ connection setup
const rabbotWrapper = require('rabbitmq-wrapper')
const rabbotConfig = config.get('rabbitMQ')
rabbotWrapper.setQ_Subscription('queue.historicalExchangeHandler')

// Rabbot Handlers
const history = require('./middleware/history')
rabbotWrapper.setHandler('event.externalAPI.exchangeUpdated', history.update)

// Routes
router.route('/exchange/:exchangeName/pair/:pair').get(history.getByName)

// Final Express setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})
app.use(bodyParser.json())
app.use('/history', router)
app.listen(port, () => { console.log('Listening on port: ' + port) })

// Final RabbitMQ setup
rabbotWrapper.setupClient('historicalPricingAPI', rabbotConfig)
