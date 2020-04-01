// if ((window.location.href).slice(0,18) == "https://sanntid.ga") {
//   // Hide 000webhost banner
//   $(document).ready(function(){
//       $('body').children('div').last().remove();
//   });
// }
if ((window.location.href).slice(0,18) == "https://sanntid.ga") {
  Element.prototype.remove = function() {
      this.parentElement.removeChild(this);
  }
  NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
      for(var i = this.length - 1; i >= 0; i--) {
          if(this[i] && this[i].parentElement) {
              this[i].parentElement.removeChild(this[i]);
          }
      }
  }
  window.addEventListener('load', function() {
    document.getElementsByTagName("BODY")[0].lastElementChild.remove();
    if ((document.getElementsByTagName("BODY")[0].lastElementChild).tagName == "SCRIPT") {
      document.getElementsByTagName("BODY")[0].lastElementChild.previousElementSibling.remove();
    } else {
      document.getElementsByTagName("BODY")[0].lastElementChild.remove();
    }
  });
}

var themeLight = document.getElementById('themeLight');
var themeDark = document.getElementById('themeDark');
var themeNavy = document.getElementById('themeNavy');
var themeGreen = document.getElementById('themeGreen');
var themeBrown = document.getElementById('themeBrown');
var themeRed = document.getElementById('themeRed');
// Set theme color matching the selected theme on load
if (localStorage.getItem("theme")) {
  document.body.className = localStorage.getItem("theme");
  switch (localStorage.getItem("theme")) {
    case 'light': themeLight.checked = true; break;
    case 'dark': themeDark.checked = true; break;
    case 'navy': themeNavy.checked = true; break;
    case 'green': themeGreen.checked = true; break;
    case 'brown': themeBrown.checked = true; break;
    case 'red': themeRed.checked = true; break;
    default: themeGreen.checked = true; break;
  }
} else {
  localStorage.setItem("theme", "green");
  document.getElementById('themeGreen').checked = true;
}

// Change theme radio-button click
var themeRadios = document.getElementsByName("theme");
for(var i = 0;i < themeRadios.length;i++){
    themeRadios[i].onchange = changeTheme;
}
function changeTheme() {
  if (themeLight.checked) {
    document.body.className = 'light';
    localStorage.setItem("theme", "light");
  } else if (themeDark.checked) {
    document.body.className = 'dark';
    localStorage.setItem("theme", "dark");
  } else if (themeNavy.checked) {
    document.body.className = 'navy';
    localStorage.setItem("theme", "navy");
  } else if (themeGreen.checked) {
    document.body.className = 'green';
    localStorage.setItem("theme", "green");
  } else if (themeBrown.checked) {
    document.body.className = 'brown';
    localStorage.setItem("theme", "brown");
  } else if (themeRed.checked) {
    document.body.className = 'red';
    localStorage.setItem("theme", "red");
  }
}

var map, marker, markorer, narrowScreen, allMarkers;
var infowindow = null;
var timeout = null;
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
    if (window.innerWidth < 900) {initMap();}
  }
}

function initMap(container) {
  var latitude = localStorage.getItem("latitude");
  var longitude = localStorage.getItem("longitude");
  markorer = [];
  allMarkers = [];
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
    var myloc = new google.maps.Marker({
      icon: {
        url: 'bilder/dot.png',
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 30),
        scaledSize: new google.maps.Size(32,32)
      },
      shadow: null,
      title: "Din posisjon",
      position: latlng,
      zIndex: 999,
      map: map,
      flat: true,
      optimized: false
    });
    google.maps.event.addListener(myloc, 'click', (function(myloc) {
      return function() {
        if (infowindow) {
          infowindow.close();
        }
        infowindow = new google.maps.InfoWindow({
          maxWidth: 300,
          infoBoxClearance: new google.maps.Size(1, 1),
          disableAutoPan: false
        });
        infowindow.setPosition(latlng);
        infowindow.setContent('<h2>Sanntid tror du er her.</h2><i><b>Er posisjonen feil?</b></i><br>Hvis posisjonsdata ikke er tilgjengelig for øyeblikket vises din forrige kjente posisjon.<br><br>Ikke alle enheter har nøyaktig GPS, eller GPS i det hele tatt. Da brukes det andre mer unøyaktige metoder for å beregne din posisjon.');
        infowindow.open(map, myloc);
      }
    })(myloc));
  }
  if (typeof latlngHoldeplass !== 'undefined') {
    map.setCenter(latlngHoldeplass);
    map.setZoom(16);
    setCenter = true;
  }

  google.maps.event.addListener(map, 'idle', function () {
    if (map.getZoom() > 13) {
      clearTimeout(timeout);

      timeout = setTimeout(function () {
        addGoogleMarkersToMap();
      }, 1500);
      // addGoogleMarkersToMap();
    }
  });
  setTimeout(function(){
    addGoogleMarkersToMap();
  }, 1000);
  setTimeout(function(){
    var stopId = allMarkers.findIndex( s => s.hnr == 'NSR:StopPlace:' + getParameterByName('h') );
    if (stopId > -1) {
      google.maps.event.trigger(allMarkers[stopId], 'click');
    }
  }, 2000);

  // map.setOptions({styles: styles['brown']});
  // map.setOptions({styles: styles['retro']});
  map.setOptions({styles: styles['default']});
}

function addGoogleMarkersToMap(position) {
    apiUrl = 'https://api.entur.io/journey-planner/v2/graphql';

    var i;
    var bounds = map.getBounds();
    var center = bounds.getCenter();
    var deltaLon = Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
    var deltaLat = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
    var lat = center.lat();
    var lon = center.lng();
    var minLat = lat - deltaLat;
    var maxLat = lat + deltaLat;
    var minLon = lon - deltaLon;
    var maxLon = lon + deltaLon;

    // graphQL request for next departures
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ET-Client-Name': 'https://sanntid.ga'
        },
        body: JSON.stringify({ query: `
          {
            stopPlacesByBbox(minimumLatitude: ` + minLat + `, maximumLatitude: ` + maxLat + `, minimumLongitude: ` + minLon + `, maximumLongitude: ` + maxLon + `, multiModalMode: parent) {
              id
              name
              latitude
              longitude
              transportMode
              estimatedCalls(numberOfDepartures: 3, omitNonBoarding:true) {
                realtime
                expectedDepartureTime
                destinationDisplay {
                  frontText
                }
                quay {
                  id
                }
                serviceJourney {
                  id
                  operator {
                    id
                  }
                  journeyPattern {
                    line {
                      id
                      publicCode
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
    if (data.stopPlacesByBbox && data.stopPlacesByBbox.length) {
      if (data.stopPlacesByBbox.length > 50) {var numberOfMapStops = 50;
      } else {var numberOfMapStops = data.stopPlacesByBbox.length;}
      for (var i = 0; i < numberOfMapStops; i++) {
        var stop = data.stopPlacesByBbox[i];
        if (!markorer.includes(stop.id)) {
          markorer.push(stop.id);
          var marker = getMarker(stop, map);
          marker.setMap(map);
          allMarkers.push(marker);
        }
      }
    }
}

function getMarker(s, map) {
  var marker = new google.maps.Marker({
    map: null,
    position: new google.maps.LatLng(s.latitude, s.longitude),
    flat: true,
    optimized: false,
    title: s.name,
    hnr: s.id,
    icon: {
      labelOrigin: new google.maps.Point(11, 50),
      url: 'bilder/trip/' + getCapsMode(s.transportMode) + '.svg',
      size: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(11, 40),
      scaledSize: new google.maps.Size(32,32)
    },
  });
  var url = "holdeplass.html?h=" + (s.id).slice(14) + "&" + s.name;

  google.maps.event.addListener(marker, 'click', function () {
    var avganger = "<table style='margin-top:0;'>";
    for (var i = 0; i < s.estimatedCalls.length; i++) {
      var transportModeAvgang = s.estimatedCalls[i].serviceJourney.journeyPattern.line.transportMode;
      var linje = s.estimatedCalls[i].serviceJourney.journeyPattern.line.publicCode;
      var lineId = s.estimatedCalls[i].serviceJourney.journeyPattern.line.id;
      var serviceJourneyId = s.estimatedCalls[i].serviceJourney.id;
      var stopQuayId = s.estimatedCalls[i].quay.id;
      var operator = s.estimatedCalls[i].serviceJourney.operator.id;
      if (linje == "" && transportModeAvgang == "air") {
        var linje = "Fly";
      }
      if (s.estimatedCalls[i].realtime == true) {
        var color = "green";
        var ca = "";
      } else {
        var color = "black";
        var ca = "ca. ";
      }
      if (lineId == "AKT:Line:395_3003") {
        var destinasjon = getFrontText(stopQuayId);
      } else if (serviceJourneyId.substring(0, 29) == "AKT:ServiceJourney:395_1012_1") {
        var destinasjon = "Justvik - Jærnesheia";
      } else {
        var destinasjon =  s.estimatedCalls[i].destinationDisplay.frontText;
      }
      avganger += "<tr><td style='color:" + color + ";width:1px;white-space:nowrap;'>" + ca + timeUntilMapDeparture(i, s) + "</td><td style='width:1px;white-space:nowrap;'><div style='padding:5.5px;border-radius:7px; " + getMapLineStyle(linje, operator) + "'>" + linje + "</div></td><td>" + destinasjon + "</td></tr>";
    }
    if (s.estimatedCalls.length == 0) {
      avganger += "<tr><td>Fant ingen avganger, finn din avgang i <a style='font-size:13px' href='index.html'>reiseplanleggeren</a></td></tr>";
    }
    avganger += "</table>";
    if (infowindow) {
      infowindow.close();
    }
    infowindow = new google.maps.InfoWindow({
      maxWidth: 300,
      infoBoxClearance: new google.maps.Size(1, 1),
      disableAutoPan: false
    });
    infowindow.setContent('<div style=""><a href="' + url + '">' + s.name + '</a><br>' + avganger+ '</div>');
    infowindow.open(map, marker);
  });
  return marker;
}

function getFrontText(quayId) {
  var quayTab = ["NSR:Quay:38099","NSR:Quay:44625","NSR:Quay:40287","NSR:Quay:44603","NSR:Quay:44608","NSR:Quay:44629","NSR:Quay:44637","NSR:Quay:44623","NSR:Quay:44615","NSR:Quay:44627","NSR:Quay:41440","NSR:Quay:39769","NSR:Quay:43506","NSR:Quay:38000","NSR:Quay:43010","NSR:Quay:42112","NSR:Quay:38798","NSR:Quay:38188","NSR:Quay:42289","NSR:Quay:41293","NSR:Quay:40104","NSR:Quay:41177","NSR:Quay:38111","NSR:Quay:42135","NSR:Quay:43403","NSR:Quay:39370","NSR:Quay:39113","NSR:Quay:38012","NSR:Quay:41171","NSR:Quay:41165","NSR:Quay:40733","NSR:Quay:40739","NSR:Quay:40749","NSR:Quay:44728","NSR:Quay:44611","NSR:Quay:38242","NSR:Quay:40771","NSR:Quay:42274","NSR:Quay:38428","NSR:Quay:38432","NSR:Quay:38472","NSR:Quay:38438","NSR:Quay:41682","NSR:Quay:38417","NSR:Quay:38457","NSR:Quay:42824","NSR:Quay:40751","NSR:Quay:40738","NSR:Quay:40734","NSR:Quay:41164","NSR:Quay:41172","NSR:Quay:39962","NSR:Quay:38014","NSR:Quay:39115","NSR:Quay:39371","NSR:Quay:43404","NSR:Quay:38108","NSR:Quay:41176","NSR:Quay:40103","NSR:Quay:41294","NSR:Quay:42290","NSR:Quay:38186","NSR:Quay:42136","NSR:Quay:39050","NSR:Quay:40118","NSR:Quay:43011","NSR:Quay:101501","NSR:Quay:37999","NSR:Quay:43507","NSR:Quay:39770","NSR:Quay:41438","NSR:Quay:44626","NSR:Quay:44620","NSR:Quay:44636","NSR:Quay:38099","NSR:Quay:44625","NSR:Quay:40287","NSR:Quay:44603","NSR:Quay:44608"];

  var stopId = quayTab.indexOf(quayId);
  if (stopId > 33) {
    return "Slettheia";
  } else {
    return "Søm";
  }
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
    case "unknown":
      return "knutepunkt";
    default:
      return mode;
  }
}

// Translates minutes until departure to readable text
function timeUntilMapDeparture(a, s) {
    var c = s.estimatedCalls[a].expectedDepartureTime;
    var d = new Date(c.slice(0,4), c.slice(5,7)-1, c.slice(8,10), c.slice(11,13), c.slice(14,16), c.slice(17,19));
    var n = new Date();
    let minutesUntil = ((d.getTime() - n.getTime()) / 60000).toFixed(0);

    switch (Number(minutesUntil)) {
        case 0:
            return "Nå";
        case 1:
            return "1 min";
        case 2:
            return "2 min";
        case 3:
            return "3 min";
        case 4:
            return "4 min";
        case 5:
            return "5 min";
        case 6:
            return "6 min";
        case 7:
            return "7 min";
        case 8:
            return "8 min";
        case 9:
            return "9 min";
        default:
            return s.estimatedCalls[a].expectedDepartureTime.slice(11,16);
    }
}
function getMapLineStyle(linje, operator) {
  linje += "";

  var b;
  var c;

  if (linje == "Gå") {
    b = "#ffffff"; c = "#000000; border: 1px solid; padding: 5.5px;";
  } else if (operator == "AVI:Operator:SK") {
    b = "#000066"; c = "#ffffff";
  } else if (operator == "AVI:Operator:WF") {
    b = "#ffffff"; c = "#015e2f; border: 1px solid #015e2f; padding: 5.5px;";
  } else if (operator == "AVI:Operator:DY") {
    b = "#d81939"; c = "#ffffff";
  } else if (operator == "RUT:Operator:210") {
    b = "#ec700c"; c = "#ffffff";
  } else if (operator == "RUT:Operator:220") {
    b = "#0b91ef"; c = "#ffffff";
  } else if (operator == "RUT:Operator:160") {
    b = "#e60000"; c = "#ffffff";
  } else if (operator == "RUT:Operator:120" || operator == "RUT:Operator:130" || operator == "RUT:Operator:130a" || operator == "RUT:Operator:130b" || operator == "RUT:Operator:130c" || operator == "RUT:Operator:140") {
    b = "#76a300"; c = "#ffffff";
  } else {
    switch (linje) {
      // Kristiansand - buss, sjekk første
      case "M1": b = "#61f230"; c = "#000000"; break;
      case "M2": b = "#ff3366"; c = "#000000"; break;
      case "M3": b = "#33ffff"; c = "#000000"; break;
      // Østlandet - tog
      case "F1": b = "#949494"; c = "#ffffff"; break;
      case "F1x": b = "#949494"; c = "#ffffff"; break;
      case "F2": b = "#949494"; c = "#ffffff"; break;
      case "L1": b = "#d72d82"; c = "#ffffff"; break;
      case "L2": b = "#64c8ff"; c = "#000000"; break;
      case "L2x": b = "#ffffff"; c = "#64c8ff; border: 1px solid; padding: 5.5px;"; break;
      case "L3": b = "##8cbe23"; c = "#000000"; break;
      case "L3x": b = "#ffffff"; c = "#8cbe23; border: 1px solid; padding: 5.5px;"; break;
      case "L12": b = "#dc0000"; c = "#ffffff"; break;
      case "L13": b = "#f0871e"; c = "#000000"; break;
      case "L13x": b = "#ffffff"; c = "#f0871e; border: 1px solid; padding: 5.5px;"; break;
      case "L14": b = "#fcc414"; c = "#000000"; break;
      case "L14x": b = "#ffffff"; c = "#fcc414; border: 1px solid; padding: 5.5px;"; break;
      case "L21": b = "#8c69aa"; c = "#ffffff"; break;
      case "L22": b = "#005aaf"; c = "#ffffff"; break;
      case "L22x": b = "#ffffff"; c = "#005aaf; border: 1px solid; padding: 5.5px;"; break;
      case "R10": b = "#a0001e"; c = "#ffffff"; break;
      case "R11": b = "#ee1c25"; c = "#ffffff"; break;
      case "R11E": b = "#ffffff"; c = "#ee1c25; border: 1px solid; padding: 5.5px;"; break;
      case "R11x": b = "#ffffff"; c = "#ee1c25; border: 1px solid; padding: 5.5px;"; break;
      case "R20": b = "#873287"; c = "#ffffff"; break;
      case "R20x": b = "#ffffff"; c = "#873287; border: 1px solid; padding: 5.5px;"; break;
      case "R30": b = "#05782d"; c = "#ffffff"; break;
      case "R30x": b = "#ffffff"; c = "#05782d; border: 1px solid; padding: 5.5px;"; break;
      case "": b = ""; c = ""; break;
      case "Fly": b = "#ffffff"; c = "#000000; border: 1px solid; padding: 5.5px;"; break;
      default: b = "#ffffff"; c = "#000000; border: 1px solid; padding: 5.5px;"; break;
    }
  }
  return "color:" + c + "; background-color:" + b;
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
