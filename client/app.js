angular.module('jamApp', [
  'jamApp.services',
  'ui.router',
  'ngAutocomplete'

  ])

.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/artists');

  $stateProvider
  .state('artists', {
    url: '/artists',
    templateUrl: 'app/artists/artists.html',
    controller: 'JamController'
  })
  .state('artists.artist', {
    url: '/artist',
    templateUrl: 'app/artist/artist.html'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'login.html'
  })
  .state('doBetter', {
    url: '/incompatibleBrowser',
    templateUrl: 'incompatibleBrowser.html'
  })


})
.run(function($state, $http, Authentication, init){
  init.cityEvents();
  if (navigator.geolocation) {
    Authentication.isAuth('artists');
  } else {
    $state.go('doBetter');
  }
})

.controller('JamController', function ($scope, $location, $state, AddToSpotify, ArtistInfo, VenueSearch, Authentication, $timeout, init) {

  $scope.obj = {loading : true};
  $scope.eventsList = [];
  $scope.cityId = {}
  $scope.artistAdded = false

  init.getCity()
  .then(function(events){
    displayEvents(events);
  });

  $scope.getVenue = function(venueName){
    $scope.artistClicked = {};
    $state.go('artists')
    $scope.obj = {loading : true};
    console.log($scope.obj);

    var venueName = $scope.text
    var venueId;
    VenueSearch.venueId(venueName)
    .then(function(res){
      console.log('venue res', res)
      venueId = res.data.resultsPage.results.venue[0].id
      console.log(venueId)
      return VenueSearch.venueEvents(venueId)
    }).then(function(res){
     console.log('venueEvents call returned',res)
     var events = res.data.resultsPage.results.event
     $scope.eventsList = []
     searchEvents(events)
   })
  }

 
  function displayEvents(events){
    $scope.eventsList = [];
    console.log('events ', events);
    for(var i = 0; i < events.length; i++){
      if(events[i].performance.length > 0){
        var artist = events[i].performance[0].artist.displayName;
        $scope.eventsList.push({
          artistName: artist,
          artistId: events[i].performance[0].artist.id,
          eventDateTime: {date: events[i].start.date,
            time: events[i].start.time},
            venue: events[i].venue.displayName,
            venueId: events[i].venue.id
          })

      }
    }
    $scope.obj = {loading : false};
  }

  $scope.artistDeets = function(artistClicked){
    // console.log($events)
    var newId;
    var artistId  = artistClicked.artistId;
    $scope.artistClicked = artistClicked
    console.log('in ArtistDeets', artistClicked)
    $state.go('artists.artist')
  }

  $scope.logout = function(){
    Authentication.logOut()
    .then(function(res){
      console.log('logged out')
    })
  }

  $scope.spotify = function(artist){
    var artistId = artist.artistId;
    ArtistInfo.getSpotifyIds(artistId)
    .then(function(artistForeignId){
      var newId;
      if(artistForeignId === '') throw Error('no foreign Id');
      console.log('foreign id', artistForeignId);
      newId = artistForeignId.slice(15);
      return AddToSpotify.hotTracks(newId);
    })
    .then(function(addToSpotifyJammCityPlaylistStatus){
      if(addToSpotifyJammCityPlaylistStatus === 'tracks added!'){
        Materialize.toast('Popular music from ' + artist.artistName + ' was added to your Jamm-City playlist on Spotify', 5750);
      } else {
        throw Error('did not add to spotify');
      }
    })
    .catch(function(err){
      Materialize.toast('We could not add '+ artist.artistName + ' to your Jamm-City playlist on Spotify :(...', 5750);
      console.log('echonest or spot ', err);
    })
  };


});

