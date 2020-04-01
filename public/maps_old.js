// console.log((window.location.href).slice(0,18));
if ((window.location.href).slice(0,18) == "https://sanntid.ga") {
  // Skjul 000webhost banner
  $(document).ready(function(){
      $('body').children('div').last().remove();
  });
}

var map, infowindow, markers, marker, markorer, narrowScreen;
var mapSmallOverlay = document.getElementById('mapSmallOverlay');
var mapLargeContainer = document.getElementById('mapLargeContainer');
var closeMapButton = document.getElementById('close-map-button');
mapSmallOverlay.onclick = function () {
  mapLargeContainer.style.display = "block";
  initMap('mapLarge');
}
closeMapButton.onclick = function () {
  mapLargeContainer.style.display = "none";
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  		results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

document.body.onresize = function() {resizeMap();};
function resizeMap() {
  if (narrowScreen == true) {
    if (window.innerWidth >= 900) {initMap();}
  } else if (narrowScreen == false) {
    if (window.innerWidth < 900) {
      initMap();
    }
  }
}

function initMap(container) {
  var latitude = localStorage.getItem("latitude");
  var longitude = localStorage.getItem("longitude");
  if (container) {
    map = new google.maps.Map(document.getElementById(container), {
      zoom: 14,
      center: {lat: 58.145038, lng: 7.994496},
      gestureHandling: 'greedy',
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: true
    });
  } else {
    if (window.innerWidth < 900) {
      narrowScreen = true;
      document.getElementById('mapSmallContainer').style.display = "block";
      if ((window.location.pathname).slice(-15) == "holdeplass.html" || (window.location.pathname).slice(-15) == "iseforslag.html") {
        var mapStorrelse = "map";
      } else {
        var mapStorrelse = "mapSmall";
        document.getElementById('mapSmallOverlay').onmouseover = function(){map.setZoom(14.4)};
        document.getElementById('mapSmallOverlay').onmouseout = function(){map.setZoom(14)};
      }
      map = new google.maps.Map(document.getElementById(mapStorrelse), {
        zoom: 13.5,
        center: {lat: 58.145038, lng: 7.994496},
        gestureHandling: 'none',
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });
      // function mapMouseOver () {map.setZoom(15);}
      // function mapMouseOut () {map.setZoom(14);}
    } else if (window.innerWidth >= 900) {
      narrowScreen = false;
      document.getElementById('mapSmallContainer').style.display = "none";
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 58.145038, lng: 7.994496},
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: true
      });
    }
  }
  if (localStorage.getItem("latitude") && localStorage.getItem("longitude")) {
    var latlng = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
    map.setCenter(latlng);
  }

  google.maps.event.addListener(map, 'idle', function () {
    if (map.getZoom() > 13) {
      addGoogleMarkersToMap();
      for (var i = 0; i < markorer.length; i++) {
        markorer[i].setMap(null);
      }
    }
  });
  setTimeout(function(){ addGoogleMarkersToMap(); removeMarkers(); }, 1000);
  setTimeout(function(){
    var stopId = markorer.findIndex( s => s.hnr == 'NSR:StopPlace:' + getParameterByName('h') );
    google.maps.event.trigger(markorer[stopId], 'click');
  }, 2000);

  function removeMarkers() {
    for (var i = 0; i < markorer.length; i++) {
      markorer[i].setMap(null);
    }
  }

  // Add a style-selector control to the map.
  // var styleControl = document.getElementById('style-selector-control');
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

  // Set the map's style to the initial value of the selector.
  // var styleSelector = document.getElementById('style-selector');
  map.setOptions({styles: styles['brown']});

  // Apply new JSON when the user selects a different style.
  // styleSelector.addEventListener('change', function() {
    // map.setOptions({styles: styles[styleSelector.value]});
  // });
}

function addGoogleMarkersToMap(position) {
    apiUrl = 'https://api.entur.org/journeyplanner/2.0/index/graphql';
    markers = [];
    markorer = [];


    infowindow = new google.maps.InfoWindow({
      maxWidth: 300,
      infoBoxClearance: new google.maps.Size(1, 1),
      disableAutoPan: false
    });

    var i;
    var bounds = map.getBounds();
    var center = bounds.getCenter();
    var deltaLng = Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
    var deltaLat = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
    var lat = center.lat();
    var lon = center.lng();
    var url = apiUrl + 'stopsNearby/' + lon + '/' + lat + '/' + deltaLng + '/' + deltaLat;

    // Set visibility for markers inside/outside visible area
    for (var hnr in markorer) {
      console.log(hnr);
      let marker = markorer[hnr];
      if (!bounds.contains(markorer.getPosition())) {
        markorer[hnr].setMap(null);
        delete markorer[hnr];
      }
    }

    // graphQL request for next departures
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ET-Client-Name': 'https://sanntid.ga'
        },
        body: JSON.stringify({ query: `
          {
            quaysByRadius(latitude: ` + lat + `, longitude: ` + lon + `, radius: 5000, first: 40) {
              edges {
                node {
                  quay {
                    id
                    name
                    latitude
                    longitude
                    stopPlace {
                      id
                      name
                      transportMode
                    }
                  }
                }
              }
            }
          }
        `}),
    })
    .then(res => res.json())
    .then(res => fetchSuccess(res.data))
}

function fetchSuccess(data) {
  for (var i = 0; i < markorer.length; i++) {
    markorer[i].setMap(null);
  }
    if (data.quaysByRadius.edges && data.quaysByRadius.edges.length) {
      for (var i = 0; i < data.quaysByRadius.edges.length; i++) {
        let stop = data.quaysByRadius.edges[i].node.quay;
        var indexStopPlace = markorer.findIndex( s => s.hnr == stop.stopPlace.id );
        if (indexStopPlace < 0) {
          var marker = getMarker(stop, map);
          marker.setMap(map);
          markorer.push(marker);
        } else {
          // console.log(stop);
        }
      }
      console.log(markorer);

    }
}

function getMarker(s, map) {
  var marker = new google.maps.Marker({
    map: null,
    position: new google.maps.LatLng(s.latitude, s.longitude),
    flat: true,
    optimized: false,
    title: s.name,
    hnr: s.stopPlace.id,
    icon: {
      labelOrigin: new google.maps.Point(11, 50),
      url: 'bilder/trip/' + getCapsMode(s.stopPlace.transportMode) + '.svg',
      size: new google.maps.Size(50, 50),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(11, 40),
      scaledSize: new google.maps.Size(38,38)
    },
  });
  var url = "holdeplass.html?h=" + (s.stopPlace.id).slice(14);

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent('<div><a href="' + url + '">' + s.name + '</a></div>');
    infowindow.open(map, marker);
  });
  return marker;
}

function getCapsMode(mode) {
  mode += "";

  switch (mode) {
    case "bus":
      return "buss";
    case "tram":
      return "trikk";
    case "metro":
      return "t-bane";
    case "air":
      return "fly";
    case "rail":
      return "tog";
    case "water":
      return "bat";
    default:
      return mode;
  }
}

var styles = {
      default: [
        {
          "featureType": "transit",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
      ],
      brown: [
        {
            "elementType": "geometry",
            "stylers": [
                {"hue": "#ff4400"},
                {"saturation": -68},
                {"lightness": -4},
                {"gamma": 0.72}
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon"
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [
                {"hue": "#0077ff"},
                {"gamma": 3.1}
            ]
        },
        {
            "featureType": "water",
            "stylers": [
                {"hue": "#00ccff"},
                {"gamma": 0.44},
                {"saturation": -33}
            ]
        },
        {
            "featureType": "poi.park",
            "stylers": [
                {"hue": "#44ff00"},
                {"saturation": -23}
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {"hue": "#007fff"},
                {"gamma": 0.77},
                {"saturation": 65},
                {"lightness": 99}
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [
                {"gamma": 0.11},
                {"weight": 5.6},
                {"saturation": 99},
                {"hue": "#0091ff"},
                {"lightness": -86}
            ]
        },
        {
          "featureType": "transit",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
    ],

      retro: [
        {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{color: '#c9b2a6'}]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'geometry.stroke',
          stylers: [{color: '#dcd2be'}]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [{color: '#ae9e90'}]
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#93817c'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry.fill',
          stylers: [{color: '#a5b076'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#447530'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#f5f1e6'}]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{color: '#fdfcf8'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#f8c967'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#e9bc62'}]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [{color: '#e98d58'}]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry.stroke',
          stylers: [{color: '#db8555'}]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{color: '#806b63'}]
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [{color: '#b9d3c2'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#92998d'}]
        },
        {
          featureType: "transit",
          stylers: [{visibility: "off"}]
        }
      ]
    };
