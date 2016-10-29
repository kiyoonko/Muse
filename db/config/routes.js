const express = require('express')
const router = express.Router()

const messageController = require('../controllers/messages_controller')

// Allow cross-domain ajax requests
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, User-Email, Auth-Token')
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
  next()
})

router.get('/', function (req, res, next) {
  res.json({message: 'Hello'})
})
// router.route('/messages', messageController.getAll)
router.route('/messages')
  // '/messages' GET
  .get(messageController.getAll)
  .post(messageController.createMessage)

router.route('/messages/:id')
  // 'messages/:id' GET
  .get(messageController.getMessage)
  // '/messages/:id' PUT
  .put(messageController.updateMessage)
  // '/messages/:id' DELETE
  .delete(messageController.destroyMessage)

module.exports = router
