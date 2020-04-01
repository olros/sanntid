const now = new Date();

const resultText = document.getElementById("resultText");
const resultFromSok = document.getElementById("resultFromSok");
const resultToSok = document.getElementById("resultToSok");
var inpFromSok = document.getElementById('inpFromSok');
var inpToSok = document.getElementById('inpToSok');
var timeDateSelect = document.getElementById('timeDateSelect');
var timeHourSelect = document.getElementById('timeHourSelect');
var timeMinSelect = document.getElementById('timeMinSelect');
var timeArea = document.getElementById('timeArea');
var pageSelect1 = document.getElementById('pageSelect1');
var pageSelect2 = document.getElementById('pageSelect2');
var pageSelect3 = document.getElementById('pageSelect3');
let closestStops = [];
let closestSearchStops = [];
let closest = [];
const numberOfStops = 25;
const maxDistanceinMeters = 5000;
const entur_graphql_endpoint = "https://api.entur.org/journeyplanner/2.0/index/graphql";

// When page is loaded
window.addEventListener('load', function() {
    if (pageSelect1.checked) {
      console.log("Reise");
      console.log(pageSelect1);
    } else if (pageSelect2.checked) {
      console.log("Avganger");
    } else if (pageSelect3.checked) {
      console.log("Favoritter");
    }
    if(typeof localStorage['authorizedGeoLocation'] == "undefined" ) {
      document.getElementById("sporPosisjon").style.display = "block";
    } else if (localStorage['authorizedGeoLocation'] == 0 ) {
      document.getElementById("geolocation").style.display = "none";
      failedPosition();
    } else {
      navigator.geolocation.getCurrentPosition(savePosition, failedPosition);
      document.getElementById("sporPosisjon").style.display = "none";
    }
});

var pageSelect = document.getElementsByName("pageSelect");
for(var i = 0;i < pageSelect.length;i++){
    pageSelect[i].onchange = changePage;
}

function changePage() {
  if (pageSelect1.checked) {
    console.log("P - reise");
    pageSelect1.checked = true;
    window.history.pushState(null, "Reise", "?reise");
  } else if (pageSelect2.checked) {
    console.log("P - avganger");
    pageSelect2.checked = true;
    window.history.pushState(null, "Avganger", "?avganger");
  } else if (pageSelect3.checked) {
    console.log("P - favoritter");
    pageSelect3.checked = true;
    window.history.pushState(null, "Favoritter", "?favoritter");
  } else {
    console.log("Index");
    pageSelect1.checked = true;
    window.history.pushState(null, "Reise", "?reise");
  }
}

// Run searchStations() when user types in search input
inpFromSok.oninput = searchFromStations;
inpToSok.oninput = searchToStations;

// Connects to Entur API to find stations based on input
function searchFromStations() {
  if (inpFromSok.value == "") {
    if ((localStorage.getItem("favoritter"))) {
      favoritter = JSON.parse(localStorage.getItem("favoritter"));
      resultFromSok.innerHTML = "<div id='sokHoldeplasser'>";
      if (localStorage.getItem("latitude") && (localStorage.getItem("longitude"))) {
        resultFromSok.innerHTML += "<div onclick='updateTripFromPos(" + localStorage.getItem("latitude") + "," + localStorage.getItem("longitude") + ")' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>Din posisjon</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/dot_grey.png' height='32px'></div></div></div>";
      }
      for (var i = 0; i < favoritter.length; i++) {
        resultFromSok.innerHTML += "<div onclick='updateTripFromFav(" + favoritter[i].id + ",`" + favoritter[i].navn + "`)' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></div>";
      }
      resultFromSok.innerHTML += "</div>";
    } else {
      resultFromSok.innerHTML = "<div id='sokHoldeplasser'></div>";
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
    xhr2.open("GET", "https://api.entur.org/api/geocoder/1.1/autocomplete?text=" +
        inpFromSok.value + "&categories=NO_FILTER&focus.point.lat=" + latitude +
        "&focus.point.lon=" + longitude + "&lang=en");
    xhr2.setRequestHeader("ET-Client-Name", "https://sanntid.ga");
    xhr2.send();
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            parseSearchData(xhr2.response, "from");
        }
    }
  }
}
function searchToStations() {
  if (inpToSok.value == "") {
    if ((localStorage.getItem("favoritter"))) {
      favoritter = JSON.parse(localStorage.getItem("favoritter"));
      resultToSok.innerHTML = "<div id='sokHoldeplasser'>";
      if (localStorage.getItem("latitude") && (localStorage.getItem("longitude"))) {
        resultToSok.innerHTML += "<div onclick='updateTripToPos(" + localStorage.getItem("latitude") + "," + localStorage.getItem("longitude") + ")' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>Din posisjon</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/dot_grey.png' height='32px'></div></div></div>";
      }
      for (var i = 0; i < favoritter.length; i++) {
        resultToSok.innerHTML += "<div onclick='updateTripToFav(" + favoritter[i].id + ",`" + favoritter[i].navn + "`)' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></div>";
      }
      resultToSok.innerHTML += "</div>";
    } else {
      resultToSok.innerHTML = "<div id='sokHoldeplasser'></div>";
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
    xhr2.open("GET", "https://api.entur.org/api/geocoder/1.1/autocomplete?text=" +
        inpToSok.value + "&categories=NO_FILTER&focus.point.lat=" + latitude +
        "&focus.point.lon=" + longitude + "&lang=en");
    xhr2.setRequestHeader("ET-Client-Name", "https://sanntid.ga");
    xhr2.send();
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            parseSearchData(xhr2.response, "to");
        }
    }
  }
}

// Parses JSON station data received from Entur into Javascript objects
function parseSearchData(jsonToParse, where) {
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
    if (where == "from") {
      changeFromHTML(closestSearchStops);
    } else if (where == "to") {
      changeToHTML(closestSearchStops)
    }
}

function changeFromHTML() {
    let stopsSearchTable = "<div id='sokHoldeplasser'>";
    for (let i = 0; i < closestSearchStops.length; i++) {
      stopsSearchTable += "<div onclick='updateTripFrom(" + i + ")' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + getStationName(closestSearchStops[i][1]) + ", " + closestSearchStops[i][7] + "<br>" + getDistance(closestSearchStops[i][3]) + "</p></div><div style='display: flex; flex-direction: row;'>" + getCategoryMode(closestSearchStops[i][0]) + "</div></div></div>";
    }
    stopsSearchTable += "</div>";
    resultFromSok.innerHTML = stopsSearchTable;
}
function changeToHTML() {
    let stopsSearchTable = "<div id='sokHoldeplasser'>";
    for (let t = 0; t < closestSearchStops.length; t++) {
      stopsSearchTable += "<div onclick='updateTripTo(" + t + ")' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + getStationName(closestSearchStops[t][1]) + ", " + closestSearchStops[t][7] + "<br>" + getDistance(closestSearchStops[t][3]) + "</p></div><div style='display: flex; flex-direction: row;'>" + getCategoryMode(closestSearchStops[t][0]) + "</div></div></div>";
    }
    stopsSearchTable += "</div>";
    resultToSok.innerHTML = stopsSearchTable;
}

// Sets input value to clicked item's name
var fromId = "", fromName = "", toId = "", toName = "";
function updateTripFrom(i) {
  inpFromSok.value = closestSearchStops[i][1] + ", " + closestSearchStops[i][7];
  fromId = closestSearchStops[i][2];
  fromName = closestSearchStops[i][1];
  fromLocality = closestSearchStops[i][7];
  fromLat = closestSearchStops[i][4];
  fromLon = closestSearchStops[i][5];
}
function updateTripTo(t) {
  inpToSok.value = closestSearchStops[t][1] + ", " + closestSearchStops[t][7];
  toId = closestSearchStops[t][2];
  toName = closestSearchStops[t][1];
  toLocality = closestSearchStops[t][7];
  toLat = closestSearchStops[t][4];
  toLon = closestSearchStops[t][5];
}
function updateTripFromFav(a,b) {
  inpFromSok.value = b;
  fromId = a;
  fromName = b;
  fromLocality = "Ukjent";
  fromLat = 8.0;
  fromLon = 58.0;
}
function updateTripToFav(a,b) {
  inpToSok.value = b;
  toId = a;
  toName = b;
  toLocality = "Ukjent";
  toLat = 8.0;
  toLon = 58.0;
}
function updateTripFromPos(lat,lon) {
  inpFromSok.value = "Din posisjon";
  fromId = "";
  fromName = "Din posisjon";
  fromLocality = "Ukjent";
  fromLat = lat;
  fromLon = lon;
}
function updateTripToPos(lat,lon) {
  inpToSok.value = "Din posisjon";
  toId = "";
  toName = "Din posisjon";
  toLocality = "Ukjent";
  toLat = lat;
  toLon = lon;
}

// Making sure ids, names and time is set and then prepare variables for an url
var btnSearchTrip = document.getElementById('btnSearchTrip');
var opt1 = document.getElementById('option-one');
var opt2 = document.getElementById('option-two');
var opt3 = document.getElementById('option-three');
btnSearchTrip.onclick = function () {
  if ((fromId != "" && toId != "") || (fromLat != "" && fromLon != "") || (toLat != "" && toLon != "")) {
    if (opt1.checked) {
      console.log("Nå");
      var arriveby = 'false';
      var d = new Date();
      var yyyy = d.getFullYear(), mm = ('0'+(d.getMonth()+1)).slice(-2), dd = ('0'+(d.getDate())).slice(-2), hh = String(d.getHours()).padStart(2,0), min = String(d.getMinutes()).padStart(2,0), ss = String(d.getSeconds()).padStart(2,0);
      var time = yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + min + ":" + ss + ".000";
    } else if (opt2.checked) {
      var arriveby = 'false';
      var yymmdd = timeDateSelect.value, hh = timeHourSelect.value, mm = timeMinSelect.value;
      var time = yymmdd + hh + ":" + mm + ":00.000";
    } else if (opt3.checked) {
      var arriveby = 'true';
      var yymmdd = timeDateSelect.value, hh = timeHourSelect.value, mm = timeMinSelect.value;
      var time = yymmdd + hh + ":" + mm + ":00.000";
    }
    var url = "reiseforslag.html?fromId=" + fromId + "&fromName=" + fromName + "&fromLocality=" + fromLocality + "&fromLat=" + fromLat + "&fromLon=" + fromLon + "&toId=" + toId + "&toName=" + toName + "&toLocality=" + toLocality + "&toLat=" + toLat +"&toLon=" + toLon + "&arriveBy=" + arriveby + "&time=" + time;
    var reiseUrl = "reiseforslag.html?fromId=" + fromId + "&fromName=" + fromName + "&fromLocality=" + fromLocality + "&fromLat=" + fromLat + "&fromLon=" + fromLon + "&toId=" + toId + "&toName=" + toName + "&toLocality=" + toLocality + "&toLat=" + toLat +"&toLon=" + toLon;
    var reiseFra = fromName; var reiseTil = toName;
    if (!(localStorage.getItem("reiser"))) {
      reiser = [];
      var array = {fra: reiseFra, til: reiseTil, url: reiseUrl};
      reiser.splice(0, 0, array);
      localStorage.setItem("reiser", JSON.stringify(reiser));
    } else {
      reiser = JSON.parse(localStorage.getItem("reiser"));
      var found = reiser.some(function (el) {
        return el.url === reiseUrl;
      });
      if (!found) {
        if (reiser.length < 5) {
          var array = {fra: reiseFra, til: reiseTil, url: reiseUrl};
          reiser.splice(0, 0, array);
          localStorage.setItem("reiser", JSON.stringify(reiser));
        } else if (reiser.length >= 5) {
          var array = {fra: reiseFra, til: reiseTil, url: reiseUrl};
          reiser.splice(0, 0, array);
          reiser.length = 5;
          localStorage.setItem("reiser", JSON.stringify(reiser));
        }
      }
    }
    window.location.href = url;
  } else if (fromId == "") {
    alert("Du må legge inn avreisested");
  } else if (toId == "") {
    alert("Du må legge inn destinasjon");
  } else {
    alert("Noe gikk galt, prøv å laste inn siden på nytt");
  }
}

// Toggles blurred bac when the search input is in focus
var containerFromSok = document.getElementById('containerFromSok');
var containerToSok = document.getElementById('containerToSok');
var searchFromArea = document.getElementById('searchFromArea');
var searchToArea = document.getElementById('searchToArea');
inpFromSok.onfocus = function () {
  var element = document.getElementById("backdrop");
  element.classList.add("backdrop_active");
  containerFromSok.style.display = "block";
  searchToArea.style.zIndex = "9";
  if (inpFromSok.value == "") {
    if ((localStorage.getItem("favoritter"))) {
      favoritter = JSON.parse(localStorage.getItem("favoritter"));
      resultFromSok.innerHTML = "<div id='sokHoldeplasser'>";
      if (localStorage.getItem("latitude") && (localStorage.getItem("longitude"))) {
        resultFromSok.innerHTML += "<div onclick='updateTripFromPos(" + localStorage.getItem("latitude") + "," + localStorage.getItem("longitude") + ")' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>Din posisjon</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/dot_grey.png' height='32px'></div></div></div>";
      }
      for (var i = 0; i < favoritter.length; i++) {
        resultFromSok.innerHTML += "<div onclick='updateTripFromFav(" + favoritter[i].id + ",`" + favoritter[i].navn + "`)' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></div>";
      }
      resultFromSok.innerHTML += "</div>";
    } else {
      resultFromSok.innerHTML = "<div id='sokHoldeplasser'></div>";
    }
  }
}
inpFromSok.onblur = function () {
  var element = document.getElementById("backdrop");
  element.classList.remove("backdrop_active");
  setTimeout(function () {
    containerFromSok.style.display = "none";
    searchToArea.style.zIndex = "10";
  }, 300);
}
inpToSok.onfocus = function () {
  var element = document.getElementById("backdrop");
  element.classList.add("backdrop_active");
  containerToSok.style.display = "block";
  searchFromArea.style.zIndex = "9";
  if (inpToSok.value == "") {
    if ((localStorage.getItem("favoritter"))) {
      favoritter = JSON.parse(localStorage.getItem("favoritter"));
      resultToSok.innerHTML = "<div id='sokHoldeplasser'>";
      if (localStorage.getItem("latitude") && (localStorage.getItem("longitude"))) {
        resultToSok.innerHTML += "<div onclick='updateTripToPos(" + localStorage.getItem("latitude") + "," + localStorage.getItem("longitude") + ")' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>Din posisjon</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/dot_grey.png' height='32px'></div></div></div>";
      }
      for (var i = 0; i < favoritter.length; i++) {
        resultToSok.innerHTML += "<div onclick='updateTripToFav(" + favoritter[i].id + ",`" + favoritter[i].navn + "`)' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></div>";
      }
      resultToSok.innerHTML += "</div>";
    } else {
      resultToSok.innerHTML = "<div id='sokHoldeplasser'></div>";
    }
  }
}
inpToSok.onblur = function () {
  var element = document.getElementById("backdrop");
  element.classList.remove("backdrop_active");
  setTimeout(function () {
    containerToSok.style.display = "none";
    searchFromArea.style.zIndex = "10";
  }, 300);
}
