const History = require('../lib/history')
const rabbotWrapper = require('rabbitmq-wrapper')

const update = function (msg) {
  try {
    let exchange = msg.body.exchange
    let tickers = msg.body.tickers
    let timeStamp = msg.body.timeStamp
    History.update(exchange, tickers, timeStamp, function (err, results) {
      if (err) {
        console.log(err)
        rabbotWrapper.disposeMsg(msg, err)
      } else {
        rabbotWrapper.disposeMsg(msg, null)
      }
    })
  } catch (err) {
    console.log(err)
    err.deadLetter = true
    rabbotWrapper.disposeMsg(msg, err)
  }
}

const getByName = function (req, res, next) {
  let exchangeName = req.params.exchangeName
  let pair = req.params.pair
  History.getByName(exchangeName, pair, function (err, results) {
    if (err) {
      res.status(500).json('There was an error retrieving exchange historical pricing data.')
    } else {
      res.status(200).json(results)
    }
  })
}

module.exports = {
  update,
  getByName
}
