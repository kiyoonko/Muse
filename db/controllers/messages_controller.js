const Message = require('../models/message')
// GET
function getAll (req, res) {
  Message.find(function (err, messages) {
    if (err) res.json({message: 'could not find message'})
    res.status(200).json(messages)
  })
}

function getMessage (req, res) {
  let id = req.params.id

  Message.findById({_id: id}, function (err, message) {
    if (err) res.json({message: 'could not find message b/c: ' + err})
    let newObj = message
    newObj.model = 'messages'
    res.json({message: newObj})
  })
}
// POST
function createMessage (req, res) {
  let message = new Message()

  message.id_fb = req.body.id_fb
  message.id_spotify = req.body.id_spotify
  message.sentiment = req.body.sentiment
  message.timestamp = req.body.timestamp

  message.save((err, message) => {
    if (err) res.json({message: 'could not create message b/c: ' + err})
    res.send(message)
  })
}

// PUT
function updateMessage (req, res) {
  let id = req.params.id

  Message.findById({_id: id}, (err, message) => {
    if (err) res.json({message: 'could not find post b/c: ' + err})
    if (req.body.id_fb) message.id_fb = req.body.id_fb
    if (req.body.id_spotify) message.id_spotify = req.body.id_spotify
    if (req.body.sentiment) message.sentiment = req.body.sentiment
    if (req.body.timestamp) message.timestamp = req.body.website

    message.save((err) => {
      if (err) res.json({message: 'could not update post b/c: ' + err})
      res.json({message: 'message successfully updated'})
    })
  })
}

// DELETE
function destroyMessage (req, res) {
  let id = req.params.id
  Message.findById({_id: id}, (err, message) => {
    if (err) return res.json({message: 'could not find post b/c: ' + err})
    message.remove((err) => {
      if (err) return res.json({message: 'could not delete post b/c: ' + err})
      res.json({message: 'message successfully deleted'})
    })
  })
}

module.exports = {
  getAll: getAll,
  getMessage: getMessage,
  createMessage: createMessage,
  updateMessage: updateMessage,
  destroyMessage: destroyMessage
}
