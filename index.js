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
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
  api_key: 'eb0ddf47c65932a16f7e44101448025abee42655'
});
var sentiment = ''

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
        	console.log(timeOfDay, text, morning, afternoon, evening, active)
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
        			console.log(timeOfDay, text, morning, afternoon, evening, active)
        			break;
        		case 1:
        			morning = text
              var mood = ''
              var parameters = {
                text: text
              };

              alchemy_language.keywords(parameters, function (err, response) {
                if (err) {
                  console.log('error:', err);
                }
                else {
                  sendTextMessage(sender, "Your key words are: " + JSON.stringify(response, null, 2))
                  console.log(JSON.stringify(response, null, 2));
                  }
              });

        			sendTextMessage(sender, "Hey! How is your afternoon?")
        			timeOfDay = 2
        			console.log(timeOfDay, text, morning, afternoon, evening, active)
        			break;
        		case 2:
        			afternoon = text
              var parameters = {
                text: text
              };
              alchemy_language.keywords(parameters, function (err, response) {
                if (err) {
                  console.log('error:', err);
                }
                else {
                  sendTextMessage(sender, "Your key words are: " + JSON.stringify(response, null, 2))
                  console.log(JSON.stringify(response, null, 2));
                  }
              });

        			sendTextMessage(sender, "Good evening~ How is your evening?")
        			timeOfDay = 3
        			console.log(timeOfDay, text, morning, afternoon, evening, active)
        			break;
        		case 3:
        			evening = text
              var parameters = {
                text: text
              };

              alchemy_language.keywords(parameters, function (err, response) {
                if (err) {
                  console.log('error:', err);
                }
                else {
                  sendTextMessage(sender, "Your key words are: " + Object.Keys(JSON.stringify(response, null, 2)))
                  sendTextMessage(sender, "Your key words are: " + Object.Values(JSON.stringify(response, null, 2)))
                  console.log(JSON.stringify(response, null, 2));
                  }
              });

        			sendTextMessage(sender, "Hmm... I see. Okay well here is a playlist created just for you based on your day except nah (At least not yet). Here are your responses - Morning: "+morning+" | Afternoon: "+afternoon+" | Evening "+evening+". Hope you enjoy the music!")
        			timeOfDay = 0
					    active = 0
        			console.log(timeOfDay, text, morning, afternoon, evening, active)
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

const token = "EAAINY3XI1EABAA82aksmY4P7HYrns3SqZArQqcpv06ghQNeQ8hsnkU0sXVGrzPaOrmh6juZCqrZCoSZCHn3zV0otvKmPcaG8mI1ZCXrImDa9NeljbfNPZCJ7xf5EZBXC0LFrNJvyRbe09hT7P2RGLZCHtDtrKAyT0xi0dPxUntANIAZDZD"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    sentiment = messageData
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
