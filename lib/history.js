const History = require('shapeshift-common-library/models/History').model
const util = require('util')

const update = function (exchangeName, tickers, timeStamp, callback) {
  History.findOne({exchangeName: exchangeName}, function (err, results) {
    if (err) {
      callback(err, null)
    } else if (!results) {
      // The exchange history does not exist yet, create it from scratch
      let formattedTickers = tickers.map(function (ticker) {
        ticker.timeStamp = timeStamp
        ticker.history = [{
          high: ticker.high,
          low: ticker.low,
          last: ticker.last,
          bid: ticker.bid,
          ask: ticker.ask,
          timeStamp: timeStamp
        }]
        return ticker
      })
      let newHistory = new History({
        exchangeName: exchangeName,
        tickers: formattedTickers
      })
      newHistory.save(function (err, results) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, results)
        }
      })
    } else {
      let formattedTickers = {}
      tickers.map(function (ticker) {
        ticker.timeStamp = timeStamp
        formattedTickers[ticker.symbol] = Object.assign(ticker, {})
      })
      let newTickerHistory = results.tickers.map(function (ticker) {
        ticker.timeStamp = timeStamp
        ticker.history.push(formattedTickers[ticker.symbol])
        return ticker
      })
      History.findOneAndUpdate({exchangeName: exchangeName}, {tickers: newTickerHistory}, {new: true}, function (err, history) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, true)
        }
      })
    }
  })
}

const getByName = function (exchangeName, pair, callback) {
  History.aggregate(
    {'$match': {'exchangeName': exchangeName}},
    {'$unwind': '$tickers'},
    {'$match': {'tickers.symbol': pair}},
    {'$group': {_id: '$_id', data: {'$push': '$tickers'}}},
    function (err, results) {
      if (err) {
        callback(err, null)
      } else if (!results || !results.length) {
        let newError = new Error('Did not find historical pricing data for exchange: ' + exchangeName)
        callback(newError, null)
      } else {
        let formatted = results[0].data[0]
        formatted.exchangeName = exchangeName
        callback(null, formatted)
      }
    })
}

module.exports = {
  update,
  getByName
}
