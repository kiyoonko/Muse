const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema({
  id_fb: String,
  id_spotify: String,
  sentiment: String,
  timestamp: String
})

let Message = mongoose.model('Message', MessageSchema)

module.exports = Message
