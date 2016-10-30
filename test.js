$(document).ready(function() {

    $('#spotifyForm').on('submit', function(event) {
        event.preventDefault();
        $('#main *').remove();
        
        //test createPlaylist()
        //RESULT: it is returning a string, but shows as undefined in console
        //var playlistId = createPlaylist();
        //console.log(playlistId);
        
        //test generateSeed()
        //album_id hard-coded
        //album_id = '6PtkrZCJOePUoLS8SWrvMa';
        //var trackId = generateSeed(album_id);
        //console.log(trackId);
        
        //test threeSeeds
        //var seed = threeSeeds();
        //console.log(seed);
        
        
    })

});