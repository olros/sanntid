var app = document.getElementById('app');

function showTravelPage() {
  app.innerHTML = '<div style="padding:5px 20px; background-color: var(--primary-color);margin-top: -10px;">' +
      '<p style="margin: 0px 0px 5px;color: var(--text-primary);">Reiserute</p>' +
      '<div class="searchArea" id="searchFromArea"><div class="input-wrapper" id="searchFromAreaWrapper" style="z-index: 4; margin-bottom:10px;"><label for="inpFromSok">Fra</label><input aria-autocomplete="list" autocomplete="off" id="inpFromSok" placeholder="Hvor vil du reise fra?" type="search" value="" style="z-index: 4;"></div><div class="containerSok" id="containerFromSok" style="width:100%;margin:-5px 20px 20px 0px;"><div id="resultFromSok"></div></div></div>' +
      '<div class="searchArea" id="searchToArea"><div class="input-wrapper" id="searchToAreaWrapper" style="z-index: 4;"><label for="inpToSok">Til</label><input aria-autocomplete="list" autocomplete="off" id="inpToSok" placeholder="Hvor vil du reise til?" type="search" value="" style="z-index: 4;"></div><div class="containerSok" id="containerToSok" style="width:100%;margin:-15px 20px 20px 0px;"><div id="resultToSok"></div></div></div>' +
      '<p style="margin: 0px 0px 5px;color: var(--text-primary);">Når vil du reise?</p>' +
      '<div class="radio-group"><input type="radio" id="option-one" name="selector"><label for="option-one" class="radioLabel" style="width:calc(33.33% - 4px/3);"><h4>Nå</h4></label><input type="radio" id="option-two" name="selector" checked><label for="option-two" class="radioLabel" style="width:calc(33.33% - 4px/3);"><h4>Avreise</h4></label><input type="radio" id="option-three" name="selector"><label for="option-three" class="radioLabel" style="width:calc(33.33% - 4px/3);"><h4>Ankomst</h4></label></div><div class="timeArea" id="timeArea"><div id="timeAreaDate"><select id="timeDateSelect"></select></div><div id="timeAreaHour"><select id="timeHourSelect"></select></div><div id="timeAreaMin"><select id="timeMinSelect"></select></div><div style="clear:both"></div></div>' +
      '<div class="searchTrip"><button type="button" id="btnSearchTrip"><h4 style="font-weight:400;">Søk etter reise</h4></button></div><div class="mapsContainer" id="mapSmallContainer" style="position:relative"><div id="mapSmall"></div><div id="mapSmallOverlay"></div></div>' +
      '</div>' +
      '<div style="height: 34px; background-color: var(--background-content-border); color:var(--text-content); padding: 13px 20px 0px; font-size: 16px; font-weight: bold;">Siste reiser</div><div style="width:100%;"><div id="resultArea"><div id="resultText"><p style="padding:5px 20px">Gjør et reisesøk, så dukker det opp her med en gang</p></div></div></div>';

  setTimeInSelect();
  setLastTravels();
  setUpTravel();
}

function showDeparturePage() {
  app.innerHTML = '<div style="padding:5px 20px; background-color: var(--primary-color);margin-top: -10px;">' +
      '<p style="margin: 0px 0px 5px;color: var(--text-primary);">Avganger</p>' +
      '<div id="searchArea"><div class="input-wrapper " style="z-index: 400;"><label for="inpSok">Fra</label><input aria-autocomplete="list" autocomplete="off" id="inpSok" placeholder="Søk etter stoppested" type="search" value="" style="z-index: 4;"></div><div class="containerSok" id="containerSok"><div id="resultSok"></div></div></div>' +
      '<div class="mapsContainer" id="mapSmallContainer" style="position:relative"><div id="mapSmall"></div><div id="mapSmallOverlay"></div></div>' +
      '</div>' +
      '<div style="height: 34px; background-color: var(--background-content-border); color:var(--text-content); padding: 13px 20px 0px; font-size: 16px; font-weight: bold;">Nærmeste holdeplasser</div>' +
      '<div style="width:100%;"><div id="resultArea"><div id="resultText"><p style="padding:5px 20px">Laster</p></div></div></div>';

  getNearestStops();
  setUpSearch();
}

function showFavouritePage() {
  app.innerHTML = '<div style="padding:5px 20px; background-color: var(--primary-color);margin-top: -10px;">' +
      '<p style="margin: 0px 0px 5px;color: var(--text-primary);">Avganger</p>' +
      '<div id="searchArea"><div class="input-wrapper " style="z-index: 400;"><label for="inpSok">Fra</label><input aria-autocomplete="list" autocomplete="off" id="inpSok" placeholder="Søk etter stoppested" type="search" value="" style="z-index: 4;"></div><div class="containerSok" id="containerSok"><div id="resultSok"></div></div></div>' +
      '<div class="mapsContainer" id="mapSmallContainer" style="position:relative"><div id="mapSmall"></div><div id="mapSmallOverlay"></div></div>' +
      '</div>' +
      '<div style="height: 34px; background-color: var(--background-content-border); color:var(--text-content); padding: 13px 20px 0px; font-size: 16px; font-weight: bold;">Dine favoritter</div>' +
      '<div style="width:100%;"><div id="resultArea"><div id="resultText"><p style="padding:5px 20px"></p></div></div></div>';

  showFavourites();
  setUpSearch();
}

// Sets current time in time selectors
function setTimeInSelect() {
  var timeDateSelect = document.getElementById('timeDateSelect');
  var timeHourSelect = document.getElementById('timeHourSelect');
  var timeMinSelect = document.getElementById('timeMinSelect');
  var timeArea = document.getElementById('timeArea');
  for(var i = 0; i <= 100; i++) {
      var currentDate = new Date();
      var startDate = new Date();
      currentDate.setDate(startDate.getDate() + i);
      timeDateSelect.innerHTML += "<option value='" + currentDate.getFullYear() + "-" + ('0'+(currentDate.getMonth()+1)).slice(-2) + "-" + ('0'+(currentDate.getDate())).slice(-2) + "T" + "'>" + DayAsString(currentDate.getDay()) + " " + currentDate.getDate() + ". " + MonthAsString(currentDate.getMonth()) + "</option>";
  }
  for (var h = 0; h < 24; h++) {
    timeHourSelect.innerHTML += "<option value='" + ('0'+(h)).slice(-2) + "'>" + ('0'+(h)).slice(-2) + "</option>";
  }
  for (var m = 0; m < 60; m++) {
    timeMinSelect.innerHTML += "<option value='" + ('0'+(m)).slice(-2) + "'>" + ('0'+(m)).slice(-2) + "</option>";
  }
  var iDag = new Date();
  timeDateSelect.selectedIndex = 0;
  timeHourSelect.selectedIndex = iDag.getHours();
  timeMinSelect.selectedIndex = iDag.getMinutes();
}

// Returns month number as word based on width of display
function MonthAsString(monthIndex) {
    if (window.innerWidth > 600) {
      var month = ["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"];
    } else {
      var month = ["jan.","feb.","mars","april","mai","juni","juli","aug.","sep.","okt.","nov.","des."];
    }
    return month[monthIndex];
}

// Returns day number as word based on width of display
function DayAsString(dayIndex) {
    if (window.innerWidth > 500) {
      var weekdays = ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
    } else {
      var weekdays = ["Søn.","Man.","Tirs.","Ons.","Tors.","Fre.","Lør."];
    }
    return weekdays[dayIndex];
}

function setLastTravels() {
  var resultText = document.getElementById("resultText");
  if (localStorage.getItem("reiser")) {
    reiser = JSON.parse(localStorage.getItem("reiser"));
    resultText.innerHTML = "";
    for (var i = 0; i < reiser.length; i++) {
      resultText.innerHTML += "<a href='" + reiser[i].url + "' class='rad' onclick='addLastTravel(`" + reiser[i].fra + "`, `" + reiser[i].til + "`, `" + reiser[i].url + "`)'><div class='contain'><div style='text-align: left;'><p class='label'>" + reiser[i].fra + "<span style='background: var(--primary-color-dark);display: inline-block;height: 2px;margin: 0 8px;width: 17px;margin-bottom: 4px;'></span>" + reiser[i].til + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/trip/end.svg' height='32px'></div></div></a>";
    }
  } else {
    var resultText = document.getElementById("resultText");
    resultText.innerHTML = "<p style='padding:5px 20px'>Gjør et reisesøk, så dukker det opp her med en gang</p>";
  }
}

function addLastTravel(reiseFra, reiseTil, reiseUrl) {
  var array = {fra: reiseFra, til: reiseTil, url: reiseUrl};
  reiser.splice(0, 0, array);
  reiser.length = 5;
  localStorage.setItem("reiser", JSON.stringify(reiser));
}

function showFavourites() {
  var resultText = document.getElementById("resultText");
  if ((localStorage.getItem("favoritter"))) {
    favoritter = JSON.parse(localStorage.getItem("favoritter"));
    resultText.innerHTML = "";
    for (var i = 0; i < favoritter.length; i++) {
      resultText.innerHTML += "<a href='holdeplass.html?h=" + favoritter[i].id + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + favoritter[i].navn + "</p></div><div style='display: flex; flex-direction: row;'><img src='bilder/star_gray_filled.svg' height='32px'></div></div></a>";
    }
  } else {
    resultText.innerHTML = "<p style='padding:5px 20px'>Du har ikke lagt til noen favoritter</p>";
  }
}

// Connects to Entur API to find nearby stations based on coordinates
function getNearestStops() {
  var numberOfStops = 25;
  var latitude = localStorage.getItem("latitude");
  var longitude = localStorage.getItem("longitude");
  console.log(latitude, longitude);
  if (latitude != null && longitude != null) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.io/geocoder/v1/reverse?point.lat=" +
        latitude + "&point.lon=" + longitude +
        "&lang=no&size=" + numberOfStops + "&layers=venue");
    xhr.setRequestHeader("ET-Client-Name", "https://sanntid.ga");
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        parseStationData(xhr.response);
      }
    }
  } else {
    var resultText = document.getElementById("resultText");
    resultText.innerHTML = "<p style='padding:5px 20px'>Vi klarte ikke å hente din posisjon. Sjekk at du har gitt oss posisjonstilgang.</p>";
  }
}

// Parses JSON station data received from Entur into Javascript objects
function parseStationData(jsonToParse) {
  let parsedJSON = JSON.parse(jsonToParse);
  closestStops = [];
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
    let stopID = (parsedJSON["features"][i]["properties"]["id"]).slice(14);
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
  closest.sort((a, b) => (a[3] - b[3]));
  changeHTML(closest);
}


// Changes the HTML when all data is ready
function changeHTML() {
  var resultText = document.getElementById("resultText");
  let stopsTable = "";
  for (let i = 0; i < closest.length; i++) {
    stopsTable += "<a href='holdeplass.html?h=" + closest[i][2] + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + closest[i][1] + ", " + closest[i][7] + "<br>" + getDistance(closest[i][3]) + "</p></div><div style='display: flex; flex-direction: row;'>" + getCategoryMode(closest[i][0]) + "</div></div></a>";
  }
  resultText.innerHTML = stopsTable;
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

// Travel code
function setUpTravel() {
  var resultText = document.getElementById("resultText");
  var resultFromSok = document.getElementById("resultFromSok");
  var resultToSok = document.getElementById("resultToSok");
  var inpFromSok = document.getElementById('inpFromSok');
  var inpToSok = document.getElementById('inpToSok');
  var btnSearchTrip = document.getElementById('btnSearchTrip');
  var containerFromSok = document.getElementById('containerFromSok');
  var containerToSok = document.getElementById('containerToSok');
  var searchFromArea = document.getElementById('searchFromArea');
  var searchToArea = document.getElementById('searchToArea');

  var radios = document.getElementsByName("selector");
  for(var i = 0;i < radios.length;i++){
      radios[i].onchange = changeTimeShown;
  }

  inpFromSok.onfocus = inpFromSokFocus;
  inpFromSok.onblur = inpFromSokBlur;
  inpToSok.onfocus = inpToSokFocus;
  inpToSok.onblur = inpToSokBlur;

  inpFromSok.oninput = searchFromStations;
  inpToSok.oninput = searchToStations;
  btnSearchTrip.onclick = searchForTrip;
}

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
    xhr2.open("GET", "https://api.entur.io/geocoder/v1/autocomplete?text=" +
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
    xhr2.open("GET", "https://api.entur.io/geocoder/v1/autocomplete?text=" +
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
function searchForTrip() {
  if ((fromId != "" && toId != "") || (fromLat != "" && fromLon != "") || (toLat != "" && toLon != "")) {
    var opt1 = document.getElementById('option-one');
    var opt2 = document.getElementById('option-two');
    var opt3 = document.getElementById('option-three');
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
function inpFromSokFocus() {
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
function inpFromSokBlur() {
  var element = document.getElementById("backdrop");
  element.classList.remove("backdrop_active");
  setTimeout(function () {
    containerFromSok.style.display = "none";
    searchToArea.style.zIndex = "10";
  }, 300);
}
function inpToSokFocus() {
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
function inpToSokBlur() {
  var element = document.getElementById("backdrop");
  element.classList.remove("backdrop_active");
  setTimeout(function () {
    containerToSok.style.display = "none";
    searchFromArea.style.zIndex = "10";
  }, 300);
}

function changeTimeShown() {
  var opt1 = document.getElementById('option-one');
  var opt2 = document.getElementById('option-two');
  var opt3 = document.getElementById('option-three');
  if (opt1.checked) {
    timeArea.style.display = "none";
  } else if (opt2.checked) {
    timeArea.style.display = "block";
  } else if (opt3.checked) {
    timeArea.style.display = "block";
  }
}

// Searchbox code
function setUpSearch() {
  var resultText = document.getElementById("resultText");
  var resultSok = document.getElementById("resultSok");
  var inpSok = document.getElementById('inpSok');
  var inpSok = document.getElementById('inpSok');
  var containerSok = document.getElementById('containerSok');
  inpSok.oninput = searchStations;
  inpSok.onfocus = inpSokFocus;
  inpSok.onblur = inpSokBlur;
}

// Connects to Entur API to find stations based on input
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
            parseSearchBoxData(xhr2.response);
        }
    }
  }
}

// Parses JSON station data received from Entur into Javascript objects
function parseSearchBoxData(jsonToParse) {
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
    changeSearchBoxHTML(closestSearchStops);
}

function changeSearchBoxHTML() {
    let stopsSearchTable = "<div id='sokHoldeplasser'>";
    for (let i = 0; i < closestSearchStops.length; i++) {
      stopsSearchTable += "<a href='holdeplass.html?h=" + closestSearchStops[i][2] + "' class='rad'><div class='contain'><div style='text-align: left;'><p class='label'>" + getStationName(closestSearchStops[i][1]) + ", " + closestSearchStops[i][7] + "<br>" + getDistance(closestSearchStops[i][3]) + "</p></div><div style='display: flex; flex-direction: row;'>" + getCategoryMode(closestSearchStops[i][0]) + "</div></div></a>";
    }
    stopsSearchTable += "</div>";
    resultSok.innerHTML = stopsSearchTable;
}

// Toggles blurred bac when the search input is in focus
function inpSokFocus() {
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
function inpSokBlur() {
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
    var t = setTimeout(time, 1000);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i}
    return i;
}
time();

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

function updateManifest(type) {
  var navn = type.charAt(0).toUpperCase() + type.slice(1);
  var dynamicManifest = {
    "name": "Sanntid - " + navn,
    "short_name": "Sanntid",
    "start_url": "alle.html?" + type,
    "description": "Sjekk avgangene fra din holdeplass i sanntid og finn reiseforslag for hele Norge",
    "background_color": manifestColor,
    "theme_color": manifestColor,
    "display": "standalone",
    "icons": [{
      "src": "https://sanntid.ga/bilder/logo.png",
      "sizes": "256x256",
      "type": "image/png"
    }]
  }
  const stringManifest = JSON.stringify(dynamicManifest);
  const blob = new Blob([stringManifest], {type: 'application/json'});
  const manifestURL = URL.createObjectURL(blob);
  document.querySelector('#my-manifest-placeholder').setAttribute('href', manifestURL);
}

const now = new Date();

let closestStops = [];
let closestSearchStops = [];
let closest = [];
const numberOfStops = 25;
const maxDistanceinMeters = 5000;
const entur_graphql_endpoint = "https://api.entur.io/journey-planner/v2/graphql";

function getParameterByName(name) {
  var url = (window.location.href).toLowerCase();
  if(url.indexOf('?' + name) != -1)
    return true;
  else if(url.indexOf('&' + name) != -1)
    return true;
  return false;
}
var pageSelect1 = document.getElementById('pageSelect1');
var pageSelect2 = document.getElementById('pageSelect2');
var pageSelect3 = document.getElementById('pageSelect3');
if (getParameterByName("reise")) {
  pageSelect1.checked = true;
  window.history.replaceState(null, "Reise", "?reise");
  showTravelPage();
  updateManifest("reise");
} else if (getParameterByName("avganger")) {
  pageSelect2.checked = true;
  window.history.replaceState(null, "Avganger", "?avganger");
  showDeparturePage();
  updateManifest("avganger");
} else if (getParameterByName("favoritter")) {
  pageSelect3.checked = true;
  window.history.replaceState(null, "Favoritter", "?favoritter");
  showFavouritePage();
  updateManifest("favoritter");
} else {
  pageSelect1.checked = true;
  window.history.replaceState(null, "Reise", "?reise");
  showTravelPage();
  updateManifest("reise");
}

// When page is loaded
window.addEventListener('load', function() {
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
    pageSelect1.checked = true;
    window.history.replaceState(null, "Reise", "?reise");
    showTravelPage();
    updateManifest("reise");
  } else if (pageSelect2.checked) {
    pageSelect2.checked = true;
    window.history.replaceState(null, "Avganger", "?avganger");
    showDeparturePage();
    updateManifest("avganger");
  } else if (pageSelect3.checked) {
    pageSelect3.checked = true;
    window.history.replaceState(null, "Favoritter", "?favoritter");
    showFavouritePage();
    updateManifest("favoritter");
  } else {
    pageSelect1.checked = true;
    window.history.replaceState(null, "Reise", "?reise");
    showTravelPage();
    updateManifest("reise");
  }
}

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
  var latlng = new google.maps.LatLng(parseFloat(lat), parseFloat(lon));
  map.setCenter(latlng);
}
