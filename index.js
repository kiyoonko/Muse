//HackNC 2016
//Author: Kiyoon Ko, Geng Sng, Gina Lee, Kaijie Chen
//10/29/16
//MuseBot
//new comment

'use strict'
// chatbot
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var active = 0
var morning;
var afternoon;
var evening;
var mood;
var playlist;
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
      //if this message is valid
      if (event.message && event.message.text) {
        let text = event.message.text
        //You have to say 'Hi MuseBot' to get started and the app must not be already collecting data for generating a playlist.
        if (text === 'Hi MuseBot' && !Boolean(active)) {
            //start replying back!
            console.log('1')
            active = 1
        }
        //End session.
        if(text === 'Thanks MuseBot'){
            console.log('reset')
        	sendTextMessage(sender, "Enjoy the music!")
        	active = 0
        	timeOfDay = 0
        }
        //when app is actively collecting data.
        //it seems that this method is accessed whenever a dialogue pops up, regardless of user or bot. To prevent that, the case state, user_response, and active state
        //should only be modified if the dialogue is solely from the user.
        else if(Boolean(active)){
        	switch(timeOfDay){
        		//collect data about morning
                case 0:
                    console.log('case 0')
        			sendTextMessage(sender, "Hello! How is your morning?")
        			timeOfDay = 1
        			break;
                //collect data about afternoon
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
                            //returns mood.
                            mood = JSON.stringify(response['docEmotions'])
                            //setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
                        }
                    });
        		setTimeout(()=> { sendTextMessage(sender, "Hey! How is your afternoon?") }, 7000)
        		if(sender != "1806806452938653"){
                    morning = text
                    timeOfDay = 2
                }
                else {
                  sendAction(sender)
                  mood = JSON.stringify(response['docEmotions'])
                  setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
                  }
              break;


                //collect data about evening
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
                        //returns mood
                        mood = JSON.stringify(response['docEmotions'])
                        //setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
                    }
                });

        		setTimeout(()=> { sendTextMessage(sender, "Good evening~ How is your evening?")}, 7000)
                if(sender != "1806806452938653"){
                    afternoon = text
                    timeOfDay = 3
                }
        		break;

                //All data is collected and we're now generating a playlist.
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
                            //returns mood
                            mood = JSON.stringify(response['docEmotions'])
                            //setTimeout(()=> { sendTextMessage(sender, "Your mood is:" + mood)}, 2000)
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
            //Again... you need to say Hi MuseBot before anything can be started.
            else{
			     sendTextMessage(sender, "Please say 'Hi MuseBot' to get started.")
            }
        }
        //Postback methods also apparently come through this. Only instance this would happen is when user clicks on the generate playlist button.
        if(event.postback){
            //commented out in case you're testing the bot out.
            //generatePlaylist();
            setTimeout(()=>{sendTextMessage(sender, "Hope you enjoy the music!")}, 3000);
        }
    }
    res.sendStatus(200)
})

//TOKEN FOR FACEBOOK CHATBOT
const token = "EAAINY3XI1EABAE7zY4GsUayrHSQVb9qD4WctZBYyEPeMHOle4lZAXhUkoIecYKfWqbPnV8PJ69woBpTeZCDhNBqXr46rBNZAar7KhJz0g5o1Yx91nJKpUqwi7rbDjkXj0rVlomdMeIf8XYOIaHGoZCjiUKNAmZCYqw90ah6W0HmwZDZD"

//Method: sendTextMessage
//Parameters: sender - facebook id of the sender, text - what you will display in the dialogue
//Returns: void method
//It basically displays the message that is supposed to be sent by the bot.
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
        }
        else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

//Method: sendAction
//Parameters: sender - facebook id of the sender
//Returns: void method
//Geng, please fill this out
//As of now, it seems liket his will be used to perform the sentiment analysis...?
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

//Method: authenticateButton
//Parameters: sender - facebook id of the sender, text - what you will display in the dialogue
//Returns: void method
//This method will create a dialogue with a text and a button. Once the button is clicked, we'll start the Spotify section of our app.
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

//Method: generatePlaylist
//Parameters: void
//Returns: void
//This is the class where it calls all the helper methods!
//So I don't know if this is correct or not so we'll have to test it too... someone do that pls.
function generatePlaylist(){
    // authenticateSpotify(); //this is supposed to be the value of a variable credential.
    //first, make the playlist.
    var playlistId = createPlaylist();
    //Then, Geng's sentiment analysis result here: average? or something idk tbh. we'll talk about it when we're all awake. Hardcoded until we meet again.
    //We should get the seeds too!
    var seed = threeSeed();
    //Now, we can get the recommendations
    giveRecommendation(seed[0], seed[1], seed[2], 0.7, 0.3, 0.5); //the numbers are the sentiment analysis stuff.
    for (item in playlist) {
        addToPlaylist(item.id);
    }

}

//Method: authenticateSpotify
//Parameters: void
//Returns: credentials (tbd)
//This is supposed to log you in, then give you all the credentials you'll ever need. I guess we can generate using cookie? For MVP, let's just
//make them authenticate each time.
function authenticateSpotify(){
    //yay get authentication and shit. Token, userid, all that good shit.
    console.log("Authenticate process");
    //return the result in an array and know which position is what so we can parse it in the generatePlaylist method. Until this is finalized, we'll
    //hardcode the values.
}

//spotifyToken! Something that should be retrieved from authenticate Spotify.
var spotifyToken = 'BQAANk50lG7FwySvPh4Uwa9yPidEFeAGm8xvp60nbVTbPGyBLCHwKw148njETAVjjWLeKLA3VPxeG3zuLUXmlu-qesD-YhUbULclnkutKoNJveOkM9RMSe7K27bSQOVMevlnOH2EnnYajmeK7aAgkfZ7NUIy9ZMj'

//Method: giveRecommendation
//Parameters: seed1, seed2, seed3, danceability, energy, loudness.
//Returns: list of recommended tracks.
//This method returns a list of recommended tracks. ARRAY
function giveRecommendation(seed1, seed2, seed3, danceability, energy, loudness) {
    $('#main *').remove();
    var query = $('#spotify').val();
    // console.log(query);
    var xhr = new XMLHttpRequest();
    $.ajax({
        beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer '+spotifyToken);
        },
        type: "GET",
        url: 'https://api.spotify.com/v1/recommendations',
        data:{
            seed_tracks: seed1,
            seed_tracks: seed2,
            seed_tracks: seed3,
            //hardcoded until database and algorithm determining this is figured out.
            target_danceability: danceability,
            target_energy: energy,
            target_loudness: loudness,
        },
        success: function(result) {
            $.each(result.tracks, function(index, item) {
                console.log(result.tracks[index].name);
                playlist.push()
            });
            console.log(result);
            console.log("yay");
        },

        error: function(result){
            console.log('failed');
        }
    });
    return playlist;
};

//Method: createPlaylist
//Parameters: userId - we need to know who's account we're making the playlist in! For now, hardcoded.
//Returns: playlistId
//Makes a new Playlist in the user's spotify database.
function createPlaylist() {
    $('#main *').remove();
    var query = $('#spotify').val();
    // console.log(query);
    var xhr = new XMLHttpRequest();
    $.ajax({
        beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer '+ spotifyToken, 'Content-Type', 'application/json');
        },

        type: "POST",
        url: 'https://api.spotify.com/v1/users/kc267/playlists', //make this user's id when authentication is complete
        // username to be fetched
        data: JSON.stringify({
            name: 'Your Daily Playlist',
        }),

        success: function(result) {
            var splitedString = result.external_urls.spotify.split('/');
            return splitedString[6]; //return the id of the playlist
            console.log(result.external_urls.spotify);
            console.log("yay");
        },

        error: function(result){
            console.log('failed');
        }
    });
};

//Method: addToPlaylist
//Parameters: track - the track we're trying to add to the playlist, playlistId - for knowing which playlist to put it into.
//Returns: void method
//Let's just add one track each time because generating an array is going to take longer.
function addToPlaylist(track) {
    $('#main *').remove();
    var query = $('#spotify').val();
    // console.log(query);
    var xhr = new XMLHttpRequest();
    $.ajax({
        beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer '+spotifyToken, 'Content-Type', 'application/json');
        },

        type: "POST",
        //playlist_id to be fetched from playlist method
        url: 'https://api.spotify.com/v1/users/kc267/playlists/5igxW9Kxdie8mhblY6CPQD/tracks',

        //this should be the tracks we get from recommendation.
        data: JSON.stringify({
            "uris": [track]
        }),


        success: function(result) {

            console.log(result);

            console.log("yay");
        },

        error: function(result){
            console.log('failed');
        }
    });
};

//Method: threeSeeds
//Parameters: none
//Returns: array of three tracks!
//Let's just add one track each time because generating an array is going to take longer.
//THIS FUNCTION RETURNS THE LIST OF ALBUMS. WE NEED ANOTHER METHOD
function threeSeeds() {
var xhr = new XMLHttpRequest();
    $.ajax({
        beforeSend: function(xhr){
            xhr.setRequestHeader('Accept', 'application/json')
            xhr.setRequestHeader('Authorization', 'Bearer '+spotifyToken);
        },
        headers: {
            'Authorization' : 'Bearer '+spotifyToken
        },
        type: "GET",
        url: 'https://api.spotify.com/v1/browse/new-releases',
        data: {
            limit: 3
        },

        success: function(result) {
            //returnin
            var answer
            console.log(result.albums.items);
            $.each(result.albums, function(index, item) {
                answer[index] = generateSeed(result.albums[index].id)
            });

            return answer;

            console.log('yay');
        },

        error: function(result) {
            console.log('failed');
        }
    });
};

//Method: generateSeed
//Parameters: album_id - the id of an album
//Returns: the id of the first track in the album
//THIS METHOD RETURNS THE FIRST TRACK IN A GIVEN ALBUM
function generateSeed(album_id) {
    $('#main *').remove();
    var query = $('#spotify').val();
    $.ajax({
        type: "GET",
        url: 'https://api.spotify.com/v1/albums/' + album_id + '/tracks',
        data: {limit: 1},

        success: function(result) {
            var splitedString = result.external_urls.spotify.split(':');
            console.log(result.items[0].uri);
            console.log("yay");
            return result.items[0].uri;
        },

        error: function(result){
            console.log('failed');
        }
    });
};
