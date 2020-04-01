const now = new Date();

const resultText = document.getElementById("resultText");
const resultSok = document.getElementById("resultSok");
var inpSok = document.getElementById('inpSok');
// Arrays should be converted to plain objects
// Array containing closest public transport stations
let closestStops = [];
let closestSearchStops = [];
// Array containing closest Trondheim City Bike racks
let cityBikeRacksTrondheim = [];
// Array containing status of Trondheim City Bike racks
let cityBikeRackStatusTrondheim = [];
// Array to be presented
let closest = [];
// Defines how many nearby stops to locate: (Must be 1!)
const numberOfStops = 25;
const maxDistanceinMeters = 5000;
const entur_graphql_endpoint = "https://api.entur.org/journeyplanner/2.0/index/graphql";

// When page is loaded
window.addEventListener('load', function() {
    console.log("Document loaded, starting...");
    getPosition();
});

// Getting position HTML5 way
function getPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(savePosition, failedPosition);
    } else {
        setTimeout(function(){
            console.log("Geolocation failed, redirecting!");
            resultText.innerHTML = "Vi klarer ikkje hente posisjonen din, sender deg til sanntid.ga";
        }, 4000);
        window.location.replace("https://sanntid.ga");
    }
}

function failedPosition() {
  let lat = "58.1462";
  let lon = "7.9972";
  localStorage.setItem("latitude", lat);
  localStorage.setItem("longitude", lon);
  resultText.innerHTML = "Vi klarer ikke å hente posisjonen din, avstander vises fra Kristiansand";
}

// Storing position, HTML5 way
function savePosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    localStorage.setItem("latitude", lat);
    localStorage.setItem("longitude", lon);
    getNearestStops();
}

// if (inpSok.value) {
  inpSok.oninput = searchStations;
// }
function searchStations() {
  closestSearchStops = [];
  // var latitude = 58.159;
  // var longitude = 8.069;
  if (navigator.geolocation) {
    var latitude = localStorage.getItem("latitude");
    var longitude = localStorage.getItem("longitude");
  } else {
    var latitude = "58.159";
    var longitude = "8.069";
  }
  let xhr2 = new XMLHttpRequest();
  xhr2.open("GET", "https://api.entur.org/api/geocoder/1.1/autocomplete?text=" +
      inpSok.value + "&categories=NO_FILTER&focus.point.lat=" + latitude +
      "&focus.point.lon=" + longitude + "10.76&lang=en");
  xhr2.setRequestHeader("ET-Client-Name", "https://sanntid.ga");
  xhr2.send();
  xhr2.onreadystatechange = function () {
      if (xhr2.readyState === 4 && xhr2.status === 200) {
          parseSearchData(xhr2.response);
      }
  }
}

// Parses JSON station data received from Entur into Javascript objects
function parseSearchData(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    for (let i = 0; i < parsedJSON["features"].length; i++) {

        let category = parsedJSON["features"][i]["properties"]["category"];
        // Multimodal stops
        if (parsedJSON["features"][i]["properties"]["category"].length > 1) {
            category = "multimodal";
        }
        if (category == "onstreetBus" || category == "railStation" || category == "metroStation" || category == "busStation" || category == "coachStation" || category == "onstreetTram" || category == "tramStation" || category == "harbourPort" || category == "ferryPort" || category == "ferryStop" || category == "airport" || category == "multimodal") {
          let stopName = parsedJSON["features"][i]["properties"]["name"];
          let stopID = getStopID(parsedJSON["features"][i]["properties"]["id"]);
          let distance = (parsedJSON["features"][i]["properties"]["distance"])*1000;
          let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
          let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
          let county = parsedJSON["features"][i]["properties"]["county"];
          let locality = parsedJSON["features"][i]["properties"]["locality"];
          closestSearchStops.push([category, stopName, stopID, distance, latitude, longitude, county, locality]);
          // console.log(closestSearchStops);
        }
    }
    // console.log("Public transport stations:");
    // console.log(closestStops);
    changeSearchHTML(closestSearchStops);
}

function changeSearchHTML() {
    // console.log(closestStops[0][6]);
    let stopsSearchTable = "<div><h2 id='holdeplass'>Holdeplasser:</h2>" +
    "<table id='sokHoldeplasser'><tr><th>Navn</th> <th>Sted</th> <th>Fylke</th> <th>Avstand</th> <th>Type</th><tr>";
    for (let i = 0; i < closestSearchStops.length; i++) {
        stopsSearchTable += "<tr onclick='redirect(" + closestSearchStops[i][2] + ")'><td>" + getStationName(closestSearchStops[i][1]) + "</td><td>" + closestSearchStops[i][7] + "</td><td>" + closestSearchStops[i][6] + "</td><td>" + getDistance(closestSearchStops[i][3]) + "</td><td>" + getMode(closestSearchStops[i][0]) + "</tr>";

    }
    stopsSearchTable += "</table></div>";
    resultSok.innerHTML = stopsSearchTable;

    // console.log("Displaying finished!");
}

// Connects to Entur API to find nearby stations based on coordinates
function getNearestStops() {
    const latitude = localStorage.getItem("latitude");
    const longitude = localStorage.getItem("longitude");
    console.log("Position: " + latitude + ", " + longitude);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
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

        let category = parsedJSON["features"][i]["properties"]["category"];
        // Multimodal stops
        if (parsedJSON["features"][i]["properties"]["category"].length > 1) {
            category = "multimodal";
        }
        let stopName = parsedJSON["features"][i]["properties"]["name"];
        let stopID = getStopID(parsedJSON["features"][i]["properties"]["id"]);
        // let stopID = "23708";
        let distance = (parsedJSON["features"][i]["properties"]["distance"])*1000;
        let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        let nextDepartures = -1;
        closestStops.push([category, stopName, stopID, distance, latitude, longitude, nextDepartures]);
    }
    // console.log("Public transport stations:");
    // console.log(closestStops);
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
    // console.log(closestStops[0][6]);

    // console.log("Final closest:");
    // console.log(closest);
    let stopsTable = "<div><h2 id='holdeplass'>Nærmeste holdeplasser</h2>" +
    "<table id='avganger'><tr><th>Navn</th> <th>Avstand</th><tr>";
    for (let i = 0; i < closest.length; i++) {
        stopsTable += "<tr onclick='redirect(" + closest[i][2] + ")'><td>" + getStationName(closest[i][1]) + "</td><td>" + getDistance(closest[i][3]) + "</td></tr>";

    }
    stopsTable += "</table></div>";
    resultText.innerHTML = stopsTable;

    console.log("Displaying finished!");
}


// Translates keyword into form of transportation
function getMode(mode) {
    // City bike racks are recognized by ID
    if (Number.isInteger(parseInt(mode))) {
        return "Bysykkel";
    }

    // Convert to string
    mode += "";

    switch (mode) {
        case "onstreetBus":
            return "Buss";
        case "railStation":
            return "Tog";
        case "metroStation":
            return "T-bane";
        case "busStation":
            return "Bussterminal";
        case "coachStation":
            return "Bussterminal";
        case "onstreetTram":
            return "Trikk";
        case "tramStation":
            return "Trikk";
        case "harbourPort":
            return "Båt";
        case "ferryPort":
            return "Ferje";
        case "ferryStop":
            return "Ferje";
        case "lift":
            return "Heis";
        case "airport":
            return "Flyplass";
        case "multimodal":
            return "Knutepunkt";
        default:
            return "Anna";
    }
}


function getStationName(station) {
    return station;
}


// Removes NSR:StopID:
function getStopID(IdString) {
    return (IdString.slice(14));
}


function getDistance(distance) {
    if (distance < 1000) {
      return distance + " meter";
    } else if (distance > 100000) {
      return (distance / 1000).toFixed(0) + " km";
    } else {
      return (distance / 1000).toFixed(2) + " km";
    }
}


// Used to calculate distance to nearest city bikes
function getDistanceBetweenCoords(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    let dLat = degreesToRadians(lat2 - lat1);
    let dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return ((earthRadiusKm * c) * 1000).toFixed(0);
}

function redirect(id) {
  document.location = "avganger.html?h=" + id;
}
