const now = new Date();

const resultText = document.getElementById("resultText");
// Arrays should be converted to plain objects
// Array containing closest public transport stations
let closestStops = [];
// Array containing closest Trondheim City Bike racks
let cityBikeRacksTrondheim = [];
// Array containing status of Trondheim City Bike racks
let cityBikeRackStatusTrondheim = [];
// Array to be presented
let closest = [];
// Defines how many nearby stops to locate: (Must be 1!)
const numberOfStops = 1;
const maxDistanceinMeters = 10000;
const entur_graphql_endpoint = "https://api.entur.org/journeyplanner/2.0/index/graphql";


// When page is loaded
window.addEventListener('load', function() {
    console.log("Document loaded, starting...");
    getPosition();
});


// Getting position HTML5 way
function getPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(savePosition);
    }
    else {
        setTimeout(function(){
            console.log("Geolocation failed, redirecting!");
            resultText.innerHTML = "Vi klarar ikkje hente posisjonen din, sender deg til sanntid.ga";
        }, 4000);
        window.location.replace("https://sanntid.ga");
    }
}


// Storing position, HTML5 way
function savePosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    localStorage.setItem("latitude", lat);
    localStorage.setItem("longitude", lon);
    getNearestStops();
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
    xhr.setRequestHeader("ET-Client-Name", "https://github.com/toretefre/catchbus");
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
        getNextDepartureForStop(stopID);
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
    console.log(closestStops[0][6]);

    console.log("Final closest:");
    console.log(closest);
    let stopsTable = "<div>";
    for (let i = 0; i < closest.length; i++) {
        stopsTable +=
            "<h2 id='holdeplass'>" + getStationName(closest[i][1]) + "</h2><h5>Neste avganger:</h5>" +
            "<table id='avganger'><tr><th>Linje</th> <th>Destinasjon</th> <th>Avgang</th><tr>" +
            "</table></div>";
    }
    resultText.innerHTML = stopsTable;

    console.log("Displaying finished!");
}
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// 0-11 indexed months
function correctMonth(i) {
    return i+1;
}
const hours = addZero(now.getHours());
const minutes = addZero(now.getMinutes());
const seconds = addZero(now.getSeconds());
const day = addZero(now.getDate());
const month = addZero(correctMonth(now.getMonth()));
const year = now.getFullYear();

const startTime = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "+0200";

// Fetches next departure from GraphQL entur API
function getNextDepartureForStop(stopID) {
    // graphQL request for next departures
    fetch(entur_graphql_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ET-Client-Name': 'https://sanntid.ga'
        },
        body: JSON.stringify({ query: `
        {
            stopPlace(id: "NSR:StopPlace:` + stopID + `") {
                id
                name
                estimatedCalls(timeRange: 86400, numberOfDepartures: 200) {
                    realtime
                    aimedDepartureTime
                    expectedDepartureTime
                    forBoarding
                    destinationDisplay {
                        frontText
                    }
                    serviceJourney {
                        journeyPattern {
                            line {
                                publicCode
                                operator {
                                    id
                                }
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
    .then(res => updateNextDepartures(res.data))
}

var avganger = document.getElementById('avganger');
// Inserts next departures into Stop array
function updateNextDepartures(data) {
    for (let i = 0; i < closestStops.length; i++) {
        const stopIDfromData = getStopID(data["stopPlace"]["id"]);
        const stopIDfromArray = closestStops[i][2];
        // Inserts next departures if stopIDs match
        if (stopIDfromData === stopIDfromArray) {
            closestStops[i][6] = data["stopPlace"]["estimatedCalls"];
            console.log(closestStops[i][6][0].aimedDepartureTime);
            for (let a = 0; a < 20; a++) {
              var avganger = document.getElementById('avganger');
              var holdeplass = document.getElementById('holdeplass');
              holdeplass.innerHTML = data["stopPlace"].name;
              var linje = closestStops[i][6][a].serviceJourney.journeyPattern.line.publicCode;
              var destinasjon = closestStops[i][6][a].destinationDisplay.frontText;
              var tid = (closestStops[i][6][a].expectedDepartureTime).slice(11,19);

              // if (closestStops[i][6][a].expectedDepartureTime > startTime) {
                avganger.innerHTML += "<tr><td>" + linje + "</td><td>" + destinasjon + "</td><td>" + tid + "</td></tr>";
              // }
              console.log(closestStops[i][6][a]);
            }
        }
    }
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


// Translates minutes until departure to readable text
function timeUntilDeparture(departureTime, now) {
    let minutesUntil = (departureTime.getTime() - now.getTime()) / 60000;

    switch (minutesUntil) {
        case 0:
            return "er rett rundt hjørnet!";
        case 1:
            return "kjem om ett minutt.";
        case 2:
            return "kjem om to minutt.";
        case 3:
            return "kjem om tre minutt.";
        case 4:
            return "kjem om fire minutt.";
        case 5:
            return "kjem om fem minutt.";
        default:
            return "kjem " + departureTime;
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
    return distance + " meter";
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
