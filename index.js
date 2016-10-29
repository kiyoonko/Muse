'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var active = 0
var morning;
var afternoon;
var evening;
var timeOfDay = 0;

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'hacknc_messenger') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

//send things to hacknc_messenger
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Hi MuseBot' && !Boolean(active)) {
            active = 1
        }
        if(text === 'Thanks MuseBot'){
        	sendTextMessage(sender, "Enjoy the music!")
        	active = 0
        	timeOfDay = 0
        }
        else if(Boolean(active)){
        	switch(timeOfDay){
        		case 0:
        			sendTextMessage(sender, "Hello! How is your morning?")
        			timeOfDay = 1
        			break;
        		case 1:
        			morning = text
        			sendTextMessage(sender, "Hey! How is your afternoon?")
        			timeOfDay = 2
        			break;
        		case 2:
        			afternoon = text
        			sendTextMessage(sender, "Good evening~ How is your evening?")
        			timeOfDay = 3
        			break;
        		case 3:
        			evening = text
        			sendTextMessage(sender, "Hmm... I see. Okay well here is a playlist created just for you based on your day except nah (At least not yet). Here are your responses - Morning: "+morning+" | Afternoon: "+afternoon+" | Evening "+evening+". Hope you enjoy the music!")
        			timeOfDay = 0
					active = 0
        			break;
        	}
        }
        else{
			sendTextMessage(sender, "Please say 'Hi MuseBot' to get started.")
        }
      }
    }
    res.sendStatus(200)
  })

const token = "EAAINY3XI1EABAGqj0Sxg57Sie8sJLSQRKdAhfqMhxPhHB0fkb1gy9pfH7xnmZCmxNYb9Dv69DeY0GijQsEzDZCdgApZBxp0SLqIhtE8m9ZCZCGETFmBQcXiX9cXZBCn7msaxk7h5ty8IYkpg4kaM2b63s0OYQyNtzZCIps38QTZAEgZDZD"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}