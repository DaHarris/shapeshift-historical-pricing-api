const mongoose = require('mongoose')
const db = mongoose.connection

const dbSetup = (connection) => {
  db.once('open', (callback) => { console.log('MongoDB connected ' + connection) })

  let dbConnection = mongoose.connect(connection)

  return dbConnection
}

module.exports = dbSetup
