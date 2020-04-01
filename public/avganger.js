const now = new Date();

const resultText = document.getElementById("resultText");
const resultSok = document.getElementById("resultSok");
var inpSok = document.getElementById('inpSok');
// Arrays should be converted to plain objects
// Array containing closest public transport stations
let closestStops = [];
let closestSearchStops = [];
// Array to be presented
let closest = [];
// Defines how many nearby stops to locate:
const numberOfStops = 25;
const maxDistanceinMeters = 5000;
const entur_graphql_endpoint = "https://api.entur.io/journey-planner/v2/graphql";

// When page is loaded
window.addEventListener('load', function() {
    // console.log("Document loaded, starting...");
    if(typeof localStorage['authorizedGeoLocation'] == "undefined" ) {
      document.getElementById("sporPosisjon").style.display = "block";
    } else if (localStorage['authorizedGeoLocation'] == 0 ) {
      document.getElementById("geolocation").style.display = "none";
      failedPosition();
    } else {
      navigator.geolocation.getCurrentPosition(savePosition, failedPosition);
      document.getElementById("sporPosisjon").style.display = "none";
    }
    // getPosition();
});
var giPosisjon = document.getElementById('giPosisjon');
var senerePosisjon = document.getElementById('senerePosisjon');
giPosisjon.onclick = function () {
  navigator.geolocation.getCurrentPosition(savePosition, failedPosition);
}
senerePosisjon.onclick = function () {
  document.getElementById("sporPosisjon").style.display = "none";
}

// Finding position failed, storing alternative lat, lon values in Kristiansand
// Should be improved with values found from ip-tracing!
function failedPosition() {
  let lat = "58.1462";
  let lon = "7.9972";
  localStorage.setItem("latitude", lat);
  localStorage.setItem("longitude", lon);
  document.getElementById("sporPosisjon").style.display = "none";
  resultText.innerHTML = "<p style='padding:5px 20px'>Vi klarte ikke å hente posisjonen din, avstander vises fra Rådhuset i Kristiansand</p>";
  var latlng = new google.maps.LatLng(parseFloat(lat), parseFloat(lon));
  map.setCenter(latlng);
}

// Storing position, HTML5 way
function savePosition(position) {
    localStorage['authorizedGeoLocation'] = 1;
    document.getElementById("sporPosisjon").style.display = "none";
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    localStorage.setItem("latitude", lat);
    localStorage.setItem("longitude", lon);
    getNearestStops();
    var latlng = new google.maps.LatLng(parseFloat(lat), parseFloat(lon));
    map.setCenter(latlng);
}

// Run searchStations() when user types in search input
inpSok.oninput = searchStations;

// Connects to the Entur API to find stations based on input
function searchStations() {
  if (inpSok.value == "") {
    // resultSok.innerHTML = "<div id='sokHoldeplasser'></div>";
    if ((localStorage.getItem("favoritter"))) {
      favoritter = JSON.parse(localStorage.getItem("favoritter"));
      resultSok.innerHTML = "<div id='sokHoldeplasser'>";
      for (var i = 0; i < favoritter.length; i++) {
        resultSok.innerHTML += "<a href='holdeplass.html?h=" + favoritter[i].id + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></a>";
      }
      resultSok.innerHTML += "</div>";
    } else {
      resultSok.innerHTML = "<div id='sokHoldeplasser'></div>";
    }
  } else {
    closestSearchStops = [];
    if (localStorage.getItem("latitude") && localStorage.getItem("longitude")) {
      var latitude = localStorage.getItem("latitude");
      var longitude = localStorage.getItem("longitude");
    } else {
      var latitude = "58.1462";
      var longitude = "7.9972";
    }
    let xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "https://api.entur.io/geocoder/v1/autocomplete?text=" +
        inpSok.value + "&categories=NO_FILTER&focus.point.lat=" + latitude +
        "&focus.point.lon=" + longitude + "&lang=en");
    xhr2.setRequestHeader("ET-Client-Name", "https://sanntid.ga");
    xhr2.send();
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            parseSearchData(xhr2.response);
        }
    }
  }
}

// Parses JSON station data received from Entur into Javascript objects
function parseSearchData(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    for (let i = 0; i < parsedJSON["features"].length; i++) {

        let category = [];
        let categoryLength = parsedJSON["features"][i]["properties"]["category"].length;

        // Pushing categories to the category array, unless it's a street, GroupOfStopPlaces, poi or the category already exists in the array
        for (c=0; c < categoryLength; c++) {
          if (parsedJSON["features"][i]["properties"]["category"][c] != "street") {
            if (parsedJSON["features"][i]["properties"]["category"][c] != "GroupOfStopPlaces") {
              if (parsedJSON["features"][i]["properties"]["category"][c] != "poi") {
                if (parsedJSON["features"][i]["properties"]["category"][c] != "bydel") {
                  if (category.indexOf(parsedJSON["features"][i]["properties"]["category"][c]) == -1) {
                    if (parsedJSON["features"][i]["properties"]["category"][c] == "busStation" && category.indexOf('onstreetBus') > -1) {
                      // It already exists a bus station
                    } else if (parsedJSON["features"][i]["properties"]["category"][c] == "onstreetBus" && category.indexOf('busStation') > -1) {
                      // It already exists a bus station
                    } else {
                      category.push(parsedJSON["features"][i]["properties"]["category"][c]);
                    }
                  }
                }
              }
            }
          }
        }

        let stopName = parsedJSON["features"][i]["properties"]["name"];
        let stopID = getStopID(parsedJSON["features"][i]["properties"]["id"]);
        let distance = (parsedJSON["features"][i]["properties"]["distance"])*1000;
        let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        let county = parsedJSON["features"][i]["properties"]["county"];
        if (parsedJSON["features"][i]["properties"]["locality"]) {
          var locality = parsedJSON["features"][i]["properties"]["locality"];
        } else {
          var locality = "";
        }
        if (category === undefined || category.length == 0) {
            // Array is empty
        } else {
          closestSearchStops.push([category, stopName, stopID, distance, latitude, longitude, county, locality]);
        }
    }
    // Sort based on distance
    closestSearchStops.sort((a, b) => (a[3] - b[3]));
    changeSearchHTML(closestSearchStops);
}

function changeSearchHTML() {
    let stopsSearchTable = "<div id='sokHoldeplasser'>";
    for (let i = 0; i < closestSearchStops.length; i++) {
      // console.log(closestSearchStops);
      stopsSearchTable += "<a href='holdeplass.html?h=" + closestSearchStops[i][2] + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + getStationName(closestSearchStops[i][1]) + ", " + closestSearchStops[i][7] + "<br>" + getDistance(closestSearchStops[i][3]) + "</p></div><div style='display: flex; flex-direction: row;'>" + getCategoryMode(closestSearchStops[i][0]) + "</div></div></a>";
    }
    stopsSearchTable += "</div>";
    resultSok.innerHTML = stopsSearchTable;
}

// Connects to Entur API to find nearby stations based on coordinates
function getNearestStops() {
    const latitude = localStorage.getItem("latitude");
    const longitude = localStorage.getItem("longitude");
    console.log("Position: " + latitude + ", " + longitude);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.io/geocoder/v1/reverse?point.lat=" +
        latitude + "&point.lon=" + longitude +
        "&lang=en&size=" + numberOfStops + "&layers=venue");
    xhr.setRequestHeader("ET-Client-Name", "https://sanntid.ga");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            parseStationData(xhr.response);
        }
    }
}


// Parses JSON station data received from Entur into Javascript objects
function parseStationData(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    for (let i = 0; i < parsedJSON["features"].length; i++) {

        let category = [];
        let categoryLength = parsedJSON["features"][i]["properties"]["category"].length;

        for (c=0; c < categoryLength; c++) {
          if (parsedJSON["features"][i]["properties"]["category"][c] != "street") {
            if (parsedJSON["features"][i]["properties"]["category"][c] != "GroupOfStopPlaces") {
              if (parsedJSON["features"][i]["properties"]["category"][c] != "poi") {
                if (parsedJSON["features"][i]["properties"]["category"][c] != "bydel") {
                  if (category.indexOf(parsedJSON["features"][i]["properties"]["category"][c]) == -1) {
                    if (parsedJSON["features"][i]["properties"]["category"][c] == "busStation" && category.indexOf('onstreetBus') > -1) {
                      // It already exists a bus station
                    } else if (parsedJSON["features"][i]["properties"]["category"][c] == "onstreetBus" && category.indexOf('busStation') > -1) {
                      // It already exists a bus station
                    } else {
                      category.push(parsedJSON["features"][i]["properties"]["category"][c]);
                    }
                  }
                }
              }
            }
          }
        }

        let stopName = parsedJSON["features"][i]["properties"]["name"];
        let stopID = getStopID(parsedJSON["features"][i]["properties"]["id"]);
        let distance = (parsedJSON["features"][i]["properties"]["distance"])*1000;
        let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        let nextDepartures = -1;
        if (parsedJSON["features"][i]["properties"]["locality"]) {
          var locality = parsedJSON["features"][i]["properties"]["locality"];
        } else {
          var locality = "";
        }
        if (category === undefined || category.length == 0) {
            // Array is empty
        } else {
          closestStops.push([category, stopName, stopID, distance, latitude, longitude, nextDepartures, locality]);
        }
    }
    mergeStopsAndRacks(closestStops);
}


// Preparing display
function mergeStopsAndRacks(closestStops) {
    closest = closestStops;
    // Sorts ascending based on distance from user
    closest.sort((a, b) => (a[3] - b[3]));

    // Removes things further away than const maxDistanceinMeters
    removeFarAway();
    // displays information
    changeHTML(closest);
}


function removeFarAway() {
    for (let i = 0; i < closest.length; i++) {
        if (closest[i][3] > maxDistanceinMeters) {
            closest.splice(i);
            break;
        }
        closest.splice(numberOfStops);
    }
}


// Changes the HTML when all data is ready
function changeHTML() {
    let stopsTable = "";
    for (let i = 0; i < closest.length; i++) {
      // console.log(closest);

      stopsTable += "<a href='holdeplass.html?h=" + closest[i][2] + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + getStationName(closest[i][1]) + ", " + closest[i][7] + "<br>" + getDistance(closest[i][3]) + "</p></div><div style='display: flex; flex-direction: row;'>" + getCategoryMode(closest[i][0]) + "</div></div></a>";

    }
    resultText.innerHTML = stopsTable;

    // console.log("Displaying finished!");
}

function getCategoryMode(mode) {
    var full = "";
    var b;
    // Checks number of categories and creates an img-tag for each
    for (i = 0; i < mode.length; i++) {
      b = "<img src='bilder/";
      var sjekk = mode[i] + "";
      switch (sjekk) {
          case "onstreetBus":
              b += "buss";
              break;
          case "railStation":
              b += "tog";
              break;
          case "metroStation":
              b += "t-bane";
              break;
          case "busStation":
              b += "bussterminal";
              break;
          case "coachStation":
              b += "bussterminal";
              break;
          case "onstreetTram":
              b += "trikk";
              break;
          case "tramStation":
              b += "trikk";
              break;
          case "harbourPort":
              b += "bat";
              break;
          case "ferryPort":
              b += "ferje";
              break;
          case "ferryStop":
              b += "ferje";
              break;
          case "lift":
              b += "heis";
              break;
          case "airport":
              b += "fly";
              break;
          case "multimodal":
              b += "knutepunkt";
              break;
          default:
              b += "annet";
              break;
      }
      b += ".svg' height='32px'>";
      full += b;
    }
    // Returns all the img-tags
    return full;
}


function getStationName(station) {
    return station;
}


// Removes NSR:StopID:
function getStopID(IdString) {
    return (IdString.slice(14));
}

// Returns the most suiting distance, meter/km with decimals/km
function getDistance(distance) {
    if (distance < 1000) {
      return distance + " meter";
    } else if (distance > 100000) {
      return (distance / 1000).toFixed(0) + " km";
    } else {
      return (distance / 1000).toFixed(2) + " km";
    }
}

// Animate the menu button and shows the menu
var backdropMenu = document.getElementById('backdropMenu');
var burgerMenuContainer = document.getElementById('burgerMenuContainer');
var burgerMenuButton = document.getElementById('burgerMenuButton');
function animateMenu(x) {
    x.classList.toggle("change");
    backdropMenu.classList.toggle("backdrop_active");
    if (burgerMenuContainer.style.display == "none") {
      burgerMenuContainer.style.display = "block";
    } else {
      burgerMenuContainer.style.display = "none";
    }
}
backdropMenu.onclick = function () {
  burgerMenuButton.classList.toggle("change");
  backdropMenu.classList.toggle("backdrop_active");
  burgerMenuContainer.style.display = "none";
}

// Toggles blurred bac when the search input is in focus
var inpSok = document.getElementById('inpSok');
var containerSok = document.getElementById('containerSok');
inpSok.onfocus = function () {
  var element = document.getElementById("backdrop");
  element.classList.add("backdrop_active");
  containerSok.style.display = "block";
  if (inpSok.value == "") {
    if ((localStorage.getItem("favoritter"))) {
      favoritter = JSON.parse(localStorage.getItem("favoritter"));
      resultSok.innerHTML = "<div id='sokHoldeplasser'>";
      for (var i = 0; i < favoritter.length; i++) {
        resultSok.innerHTML += "<a href='holdeplass.html?h=" + favoritter[i].id + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></a>";
      }
      resultSok.innerHTML += "</div>";
    } else {
      resultSok.innerHTML = "<div id='sokHoldeplasser'></div>";
    }
  }
}
inpSok.onblur = function () {
  var element = document.getElementById("backdrop");
  element.classList.remove("backdrop_active");
  setTimeout(function () {
    containerSok.style.display = "none";
  }, 300);
}

function time(){
	var today = new Date();
	var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('timeContainer').innerHTML = h + ":" + m + ":" + s;
    var t = setTimeout(time, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i}
    return i;
}
time();
