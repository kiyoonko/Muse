'use strict'
// chatbutt
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var active = 0
var morning;
var afternoon;
var evening;
var mood;
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
      let sender = event.sender.id.toString()
      console.log(sender)
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Hi MuseBot' && !Boolean(active)) {
            console.log('1')
            active = 1
        }
        if(text === 'Thanks MuseBot'){
            console.log('reset')
        	sendTextMessage(sender, "Enjoy the music!")
        	active = 0
        	timeOfDay = 0
        }
        else if(Boolean(active)){
        	switch(timeOfDay){
        		case 0:
                    console.log('case 0')
        			sendTextMessage(sender, "Hello! How is your morning?")
        			timeOfDay = 1
        			break;
        		case 1:
                    console.log('case 1')
        			
                    var parameters = {
                        text: text
                    };
                    alchemy_language.emotion(parameters, function (err, response) {
                        if (err) {
                            console.log('error:', err);
                        }
                        else {
                            sendAction(sender)
                            mood = JSON.stringify(response['docEmotions'])
                            setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
                        }
                    });
        		setTimeout(()=> { sendTextMessage(sender, "Hey! How is your afternoon?") }, 7000)
        		if(sender != "1806806452938653"){
                    morning = text
                    timeOfDay = 2
                }
        		break;

        		case 2:
                    console.log('case 2')

                    var parameters = {
                        text: text
                    };
                    alchemy_language.emotion(parameters, function (err, response) {
                        if (err) {
                        console.log('error:', err);
                    }
                    else {
                        sendAction(sender)
                        mood = JSON.stringify(response['docEmotions'])
                        setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
                    }
                });

        		setTimeout(()=> { sendTextMessage(sender, "Good evening~ How is your evening?")}, 7000)
                if(sender != "1806806452938653"){
                    afternoon = text
                    timeOfDay = 3
                }
        		break;

        		case 3:
                    console.log('case3')
                    var parameters = {
                        text: text
                    };

                    alchemy_language.emotion(parameters, function (err, response) {
                        if (err) {
                            console.log('error:', err);
                        }
                        else {
                            sendAction(sender)
                            mood = JSON.stringify(response['docEmotions'])
                            setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
                        }
                    });
                    sendAction(sender)
        			setTimeout(()=> { authenticateButton(sender, "Hmm... I see. Okay well here is a playlist created just for you based on your day. Here are your responses - Morning: "+morning+" | Afternoon: "+afternoon+" | Evening "+evening+". Hope you enjoy the music!")}, 7000)
                    if(sender != "1806806452938653"){
                        evening = text
                        timeOfDay = 0
					   active = 0
                    }
        			console.log(timeOfDay, text, morning, afternoon, evening, active)
        			break;
        	    }
            }
            else{
			     sendTextMessage(sender, "Please say 'Hi MuseBot' to get started.")
            }
        }
        if(event.postback){
            authenticateSpotify();
            setTimeout(()=>{sentTextMessage(sender, "Hope you enjoy the music!")}, 3000);
        }
    }
    res.sendStatus(200)
})

const token = "EAAINY3XI1EABAE7zY4GsUayrHSQVb9qD4WctZBYyEPeMHOle4lZAXhUkoIecYKfWqbPnV8PJ69woBpTeZCDhNBqXr46rBNZAar7KhJz0g5o1Yx91nJKpUqwi7rbDjkXj0rVlomdMeIf8XYOIaHGoZCjiUKNAmZCYqw90ah6W0HmwZDZD"

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

function sendAction(sender) {
    let action = 'typing_on'

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            sender_action: action,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function authenticateButton(sender, text){
    let messageData = {
        "attachment": {
            "type": "template",
            "payload":{
                "template_type":"button",
                "text": text,
                "buttons": [{
                    "type": "postback",
                    "title": "Make Playlist",
                    "payload": "run_auth_spotify"
                }]
            }
        }   
    }   
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    },  function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function authenticateSpotify(){
    console.log("Authenticate process");
}

