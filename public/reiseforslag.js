const now = new Date();

const resultText = document.getElementById("resultText");
const btnBack = document.getElementById('back-button');
const btnClose = document.getElementById('close-button');
var merInfo = document.getElementById('merInfo');
// Arrays should be converted to plain objects
// Array containing closest public transport stations
let reiseArray = [];
// Array to be presented
let closest = [];
// Defines how many nearby stops to locate: (Must be 1!)
const numberOfStops = 1;
const maxDistanceinMeters = 10000;
const entur_graphql_endpoint = "https://api.entur.io/journey-planner/v2/graphql";

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    		results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// When page is loaded
window.addEventListener('load', function() {
    changeHTML();
    var h = getParameterByName('h');
    // setInterval(function(){ console.log("Refresh"); getNextDepartureForStop(h); }, 5000);
});

// Changes the HTML when all data is ready
function changeHTML() {
    let stopsTable = "<div id='forslag'><p style='padding:20px; font-size: 18px;'>Laster forslag...</p></div>";
    resultText.innerHTML = stopsTable;
    var fromId = getParameterByName('fromId');
    var fromName = getParameterByName('fromName');
    if (!fromName) {fromName = "";}
    var fromLocality = getParameterByName('fromLocality');
    var fromLat = getParameterByName('fromLat');
    var fromLon = getParameterByName('fromLon');
    var toId = getParameterByName('toId');
    var toName = getParameterByName('toName');
    if (!toName) {toName = "";}
    var toLocality = getParameterByName('toLocality');
    var toLat = getParameterByName('toLat');
    var toLon = getParameterByName('toLon');
    var arriveBy = getParameterByName('arriveBy');
    if (!arriveBy) {
      arriveBy = false;
    }
    var time = getParameterByName('time');
    if (!time) {
      var d = new Date();
      var yyyy = d.getFullYear(), mm = ('0'+(d.getMonth()+1)).slice(-2), dd = ('0'+(d.getDate())).slice(-2), hh = String(d.getHours()).padStart(2,0), min = String(d.getMinutes()).padStart(2,0), ss = String(d.getSeconds()).padStart(2,0);
      time = yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + min + ":" + ss + ".000";
    }
    var tripInfo = document.getElementById('tripInfo');
    var tripDetailsInfo = document.getElementById('tripDetailsInfo');
    var forslag = document.getElementById('forslag');
    // if (fromId && fromLat && fromLon && toId && toLat && toLon) {
    if (fromLat) {
      getNextDepartureForStop(fromId, fromName, fromLocality, fromLat, fromLon, toId, toName, toLocality, toLat, toLon, arriveBy, time);
      tripInfo.innerHTML = "<p>" + fromName + " - " + toName + "</p>";
      tripDetailsInfo.innerHTML = "<p>" + fromName + " - " + toName + "</p>";
      setManifest(fromName, toName);
    } else {
      tripInfo.innerHTML = "<div style='background-color: var(--secondary-color); width:100%;height:35px;'></div>";
      forslag.innerHTML = "<p style='padding:20px; font-size:18px'>Noe gikk galt, prøv å søke etter reise på nytt <a href='index.html' style='color:var(--text-content);font-weight:bold'>her</a></p>";
    }
}

// Fetches next departure from GraphQL entur API
function getNextDepartureForStop(fromId, fromName, fromLocality, fromLat, fromLon, toId, toName, toLocality, toLat, toLon, arriveBy, time) {
    // graphQL request for next departures
    console.log(fromId, fromName, fromLocality, fromLat, fromLon, toId, toName, toLocality, toLat, toLon, arriveBy, time);
    fetch(entur_graphql_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ET-Client-Name': 'https://sanntid.ga'
        },
        body: JSON.stringify({ query: `
          {
            trip(
              from: {
                place: "NSR:StopPlace:` + fromId + `",
                name: "` + fromName + `, ` + fromLocality + `",
                coordinates: {
                  latitude: ` + fromLat + `,
                  longitude: ` + fromLon + `
                }
              }

              to: {
                place:"NSR:StopPlace:` + toId + `",
                name: "` + toName + `, ` + toLocality + `",
                coordinates: {
                  latitude: ` + toLat + `,
                  longitude: ` + toLon + `
                }
              }
              numTripPatterns: 10
              maximumTransfers: 5
              dateTime: "` + time + `"
              minimumTransferTime: 180
              walkSpeed: 1.3
              wheelchair: false
              arriveBy: ` + arriveBy + `
            ) {
              tripPatterns {
                startTime
                duration
                walkDistance
                legs {
                  mode
                  distance
                  duration
                  startTime
                  expectedEndTime
                  steps {
                    latitude
                    longitude
                  }
                  line {
                    id
                    name
                    publicCode
                    authority {
                      name
                    }
                  }
                  fromEstimatedCall {
                    quay {
                      id
                      latitude
                      longitude
                      stopPlace {
                        name
                        id
                      }
                    }
                    destinationDisplay {frontText}
                    serviceJourney {
                      publicCode
                      operator {
                        name
                        id
                      }
                    }
                    realtime
                    aimedDepartureTime
                    expectedDepartureTime
                  }
                  toEstimatedCall {
                    quay {
                      latitude
                      longitude
                      stopPlace {
                        name
                        id
                      }
                    }
                    expectedArrivalTime
                    aimedDepartureTime
                    expectedDepartureTime
                  }
                  intermediateEstimatedCalls {
                    expectedArrivalTime
                    expectedDepartureTime
                    quay {
                      latitude
                      longitude
                      stopPlace {
                        name
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `}),
    })
    .then(res => res.json())
    .then(res => updateTravelOptions(res.data))
}

// Inserts next departures into Stop array
function updateTravelOptions(data) {
    // console.log(data);
    reiseArray[0] = data["trip"]["tripPatterns"];
    var antallForslag = reiseArray[0].length;
    var forslag = document.getElementById('forslag');
    var update = "";

    if (antallForslag == 0) {
      forslag.innerHTML = "<p style='padding:20px;font-size:18px'>Fant ingen reiseforslag</p>";
      return;
    }

    //Write all next departures to innerHTML
    for (let a = 0; a < antallForslag; a++) {
      var antallEtapper = reiseArray[0][a].legs.length;
      if (reiseArray[0][a].legs[0].mode != "foot") {
        var from = reiseArray[0][a].legs[0].fromEstimatedCall.quay.stopPlace.name;
      } else if (antallEtapper > 1)  {
        if (reiseArray[0][a].legs[1].mode != "foot") {
          var from = reiseArray[0][a].legs[1].fromEstimatedCall.quay.stopPlace.name;
        } else {
          var from = getParameterByName('fromName');
        }
      } else {
        var from = getParameterByName('fromName');
      }
      var duration = (Number(reiseArray[0][a].duration) / 60).toFixed(0);
      if (duration > 60) {
        duration = Math.floor(duration / 60) + ' t ' + duration % 60;
      }
      if (reiseArray[0][a].legs[0].fromEstimatedCall === null) {
        var startTime = (reiseArray[0][a].legs[0].startTime).slice(11,16);
      } else {
        var startTime = (reiseArray[0][a].legs[0].fromEstimatedCall.expectedDepartureTime).slice(11,16);
      }
      var endTime = (reiseArray[0][a].legs[antallEtapper - 1].expectedEndTime).slice(11,16);

      var etapper = "";
      for (let e = 0; e < antallEtapper; e++) {
        if (reiseArray[0][a].legs[e].fromEstimatedCall === null) {
          var startTime1 = (reiseArray[0][a].legs[e].startTime).slice(11,16);
          var frontText = "Gå";
          var color = "var(--normal-color)";
        } else {
          var startTime1 = (reiseArray[0][a].legs[e].fromEstimatedCall.expectedDepartureTime).slice(11,16);
          if (reiseArray[0][a].legs[e].line.publicCode) {
            var frontText = reiseArray[0][a].legs[e].line.publicCode;
          } else {
            var frontText = reiseArray[0][a].legs[e].fromEstimatedCall.serviceJourney.publicCode;
          }
          var operator = reiseArray[0][a].legs[e].fromEstimatedCall.serviceJourney.operator.id;
          if (reiseArray[0][a].legs[e].fromEstimatedCall.realtime == true) {
            var color = "var(--realtime-color)";
          } else {
            var color = "var(--normal-color)";
          }
        }

        etapper += "<div class='reiseEtappe'><div class='reiseMode'><img class='reiseImg' src='bilder/trip/" + getTransportMode(reiseArray[0][a].legs[e].mode) + ".svg'><p class='reiseModeLine' style='" + getLineStyle(frontText, operator) + "'>" + frontText + "</p></div><div class='reiseAvgang' style='color:" + color + "'>" + startTime1 + "</div></div>";
      }

      update += "<div class='forslagContainer'><div class='forslagBoks' onclick='moreDetails(" + a + ")'><div class='forslagHeader'>Fra " + from + "<span class='durationSpan'>" + duration + " min</span></div><div class='forslagMain'>" + etapper + "</div><div class='forslagSecond'><div class='reiseEtappe'><div class='reiseMode'><img src='bilder/trip/end.svg' style='width:40px;padding:5px;'><p style='text-align: center;margin: 0;'>Mål</p></div><div class='reiseAvgang'>" + endTime +
      "</div></div></div><div class='forslagHeader forslagDetaljer'><span class='durationSpan' style='text-decoration: underline;'>Se detaljer</span></div></div></div>";
    }

    forslag.innerHTML = update;
}

function moreDetails(a) {
  reiseArray[1] = reiseArray[0][a];
  if (window.innerWidth < 900) {
    document.getElementById('open-map-on-small-button').style.display = "block";
  }
  var tripDetails = document.getElementById('tripDetails');
  merInfo.style.display = "block";
  if (a == undefined) {
    tripDetails.innerHTML = "<p style='padding:15px; font-size:18px;'>Noe fikk galt, prøv å søke etter reise på nytt</p>";
  } else {
    var antallEtapper = reiseArray[0][a].legs.length;
    var totalDuration = (Number(reiseArray[0][a].duration) / 60).toFixed(0);
    if (totalDuration > 60) {
      totalDuration = Math.floor(totalDuration / 60) + ' t ' + totalDuration % 60;
    }
    tripDetails.innerHTML = "";
    for (i = 0; i < antallEtapper; i++) {
      if (reiseArray[0][a].legs[i].mode == "foot") {
        var avstand = getDistance(reiseArray[0][a].legs[i].distance);
        var varighet = (Number(reiseArray[0][a].legs[i].duration) / 60).toFixed(0);
        if (varighet == 0) {
          varighet = "mindre enn 1";
        }
        var avgang = (reiseArray[0][a].legs[i].startTime).slice(11,16);
        if (i > 0) {
          var fra = reiseArray[0][a].legs[i - 1].toEstimatedCall.quay.stopPlace.name;
        } else {
          var fra = getParameterByName('fromName');
        }
        if (i + 1 < antallEtapper) {
          var til = reiseArray[0][a].legs[i + 1].fromEstimatedCall.quay.stopPlace.name;
        } else {
          var til = getParameterByName('toName');
        }
        tripDetails.innerHTML += "<div class='detaljerEtappe'><div class='detaljerFra'><div class='detaljerTid'>" + avgang +
        "</div><div class='detaljerMer'><h3 style='margin: 10px 0px;'>" + fra + "</h3></div><div style='clear:both'></div></div>" +
        "<div class='detaljerTil'><div class='detaljerMer' style='background-color:var(--background-content)'><div style='display: flex;flex-flow: row nowrap; align-items: center;'><img src='bilder/trip/fot.svg' style='width: 43px;vertical-align: middle;'><p>Gå i " + varighet + " min (" + avstand + ") til " + til + "." +
        "</div></div><div style='clear:both'></div></div></div>";
      } else {
        var avgang = (reiseArray[0][a].legs[i].fromEstimatedCall.expectedDepartureTime).slice(11,16);
        var fra = reiseArray[0][a].legs[i].fromEstimatedCall.quay.stopPlace.name;
        var realtime = reiseArray[0][a].legs[i].fromEstimatedCall.realtime;
        if (realtime == true) {var inRealtime = "<div class='RealtimeIconAnimation' style='margin:10px 15px'></div>";} else {var inRealtime = ""}
        var fraId = getStopID(reiseArray[0][a].legs[i].fromEstimatedCall.quay.stopPlace.id);
        var operator = reiseArray[0][a].legs[i].fromEstimatedCall.serviceJourney.operator.id;
        var modeType = getModeAndDestination(a, i, operator);
        if (reiseArray[0][a].legs[i].mode == "air") {
          var operatør = reiseArray[0][a].legs[i].fromEstimatedCall.serviceJourney.operator.name;
        } else {
          var operatør = reiseArray[0][a].legs[i].line.authority.name;
        }
        var varighet = (Number(reiseArray[0][a].legs[i].duration) / 60).toFixed(0);
        var ankomst = (reiseArray[0][a].legs[i].toEstimatedCall.expectedArrivalTime).slice(11,16);
        var til = reiseArray[0][a].legs[i].toEstimatedCall.quay.stopPlace.name;
        var antallStopp = reiseArray[0][a].legs[i].intermediateEstimatedCalls.length;

        var mellomStopp = "";
        for (var m = 0; m < antallStopp; m++) {
          mellomStopp += (reiseArray[0][a].legs[i].intermediateEstimatedCalls[m].expectedDepartureTime).slice(11,16) + " - " + reiseArray[0][a].legs[i].intermediateEstimatedCalls[m].quay.stopPlace.name + "<br>";
        }
        if (antallStopp > 0) {
          var mellom = "<div><div class='detaljerTid'></div><div class='detaljerMer' style='background-color:var(--background-content);padding: 15px 15px 0px 15px;'>" +
          "<div style='display:flex; cursor:pointer; width:fit-content' onclick='toggleMellomStopp(this)'><div style='user-select: none;'>" + antallStopp + " stopp </div><div style='margin-left:5px'><img id='downSvgImg' style='width:20px;transition:0.5s' src='bilder/down.svg'></div></div><p style='display:none; margin:5px 0px'>" + mellomStopp + "</p></div>" +
          "<div style='clear:both'></div>";
        } else {
          var mellom = "";
        }

        tripDetails.innerHTML += "<div class='detaljerEtappe'><div class='detaljerFra'><div class='detaljerTid'>" + avgang +
        inRealtime + "</div><div class='detaljerMer'><div style='display: flex;flex-flow: row nowrap; align-items: center;'><img src='bilder/trip/" + getTransportMode(reiseArray[0][a].legs[i].mode) + ".svg' style='width: 43px;vertical-align: middle;'><h3 style='margin: 10px 0px; width:calc(100% - 88px); overflow:hidden; text-overflow:ellipsis;'>" + fra + "</h3>" +
        "<a class='detaljerLink' href='holdeplass.html?h=" + fraId + "'><img src='bilder/tilbake.svg' style='width: 23px;transform: rotate(180deg);right: 0px;'></a></div><p>Ta " + modeType + " med " + operatør + "</p>" +
        "<p>Reisen tar " + varighet + " min</p></div><div style='clear:both'></div></div>" +
        mellom +
        "<div class='detaljerTil'>" +
        "<div class='detaljerTid'>" + ankomst + "</div><div class='detaljerMer'><h3 style='margin: 10px 0px;'>" + til + "</h3>" +
        "</div><div style='clear:both'></div></div></div>";
      }
    }
    tripDetails.innerHTML += "<div class='detaljerEtappe' style='padding: 0px 20px;'>" +
    "<div class='detaljerTil'><div class='detaljerMer' style='background-color:var(--background-content)'><div style='display: flex;flex-flow: row nowrap; align-items: center;'><img src='bilder/klokke.svg' style='width: 19px;vertical-align: middle; margin-right: 14px;'><p>Total reisetid er " + totalDuration + " min." +
    "</div></div><div style='clear:both'></div></div></div>";
  }
  showStopsOnMap();
}

function openMapOnSmall() {
  mapLargeContainer.style.display = "block";
  initMap('mapLarge');
  showStopsOnMap();
}

function showStopsOnMap() {
  var legs = reiseArray[1].legs;
  var lineCoords = [];
  for (var i = 0; i < legs.length; i++) {
    if (legs[i].mode == "foot") {
      for (var j = 0; j < legs[i].steps.length; j++) {
        lineCoords.push({lat: legs[i].steps[j].latitude, lng: legs[i].steps[j].longitude});
      }
    } else {
      lineCoords.push({lat: legs[i].fromEstimatedCall.quay.latitude, lng: legs[i].fromEstimatedCall.quay.longitude});
      for (var j = 0; j < legs[i].intermediateEstimatedCalls.length; j++) {
        lineCoords.push({lat: legs[i].intermediateEstimatedCalls[j].quay.latitude, lng: legs[i].intermediateEstimatedCalls[j].quay.longitude});
      }
      lineCoords.push({lat: legs[i].toEstimatedCall.quay.latitude, lng: legs[i].toEstimatedCall.quay.longitude});
    }
  }

  window.linePath = new google.maps.Polyline({
    path: lineCoords,
    geodesic: true,
    strokeColor: '#007849',
    strokeOpacity: 1.0,
    strokeWeight: 4
  });

  linePath.setMap(map);
}

function toggleMellomStopp(elem) {
  var x = elem.nextSibling;
  var img = elem.lastChild.lastChild;
  if (x.style.display == "none") {
    x.style.display = "block";
    img.style.transform = "rotate(180deg)";
  } else {
    x.style.display = "none";
    img.style.transform = "rotate(0deg)";
  }
}

function getModeAndDestination(a, i, o) {
  if (reiseArray[0][a].legs[i].line.publicCode) {
    var frontText = reiseArray[0][a].legs[i].line.publicCode;
  } else {
    var frontText = reiseArray[0][a].legs[i].fromEstimatedCall.serviceJourney.publicCode;
  }
  var mode = getTransportMode(reiseArray[0][a].legs[i].mode);
  var destinationDisplay = reiseArray[0][a].legs[i].fromEstimatedCall.destinationDisplay.frontText;
  var lineId = reiseArray[0][a].legs[i].line.id;
  var stopQuayId = reiseArray[0][a].legs[i].fromEstimatedCall.quay.id;
  if (lineId == "AKT:Line:395_3003") {
    var destinationDisplay = getFrontText(stopQuayId);
  } else {
    var destinationDisplay = reiseArray[0][a].legs[i].fromEstimatedCall.destinationDisplay.frontText;
  }
  return mode + " <span class='tripDetailLineStyle' style='" + getLineStyle(frontText, o) + "'>" + frontText + "</span> mot " + destinationDisplay;
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

function getLineStyle(linje, operator) {
  linje += "";

  var b;
  var c;
  if (operator == "AVI:Operator:SK") {
    b = "#000066"; c = "#ffffff";
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
      // default: b = "#000000"; c = "#ffff00"; break;
      default: b = "#ffffff"; c = "#000000; border: 1px solid; padding: 5.5px;"; break;
    }
  }
  return "color:" + c + "; background-color:" + b;
}

function getTransportMode(mode) {
  mode += "";
  switch (mode) {
    case "bus":
      return "buss";
    case "coach":
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
    case "foot":
      return "fot";
    default:
      return mode;
  }
}

// Translates minutes until departure to readable text
function timeUntilDeparture(a, b) {
    if (reiseArray[0][a].legs[b].fromEstimatedCall === null) {
      var c = reiseArray[0][a].legs[b].startTime;
    } else {
      var c = reiseArray[0][a].legs[b].fromEstimatedCall.expectedDepartureTime;
    }
    // var c = reiseArray[0][a].legs[b].fromEstimatedCall.expectedDepartureTime;
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
            if (reiseArray[0][a].legs[b].fromEstimatedCall === null) {
              return reiseArray[0][a].legs[b].startTime.slice(11,16);
            } else {
              return reiseArray[0][a].legs[b].fromEstimatedCall.expectedDepartureTime.slice(11,16);
            }
            // return reiseArray[0][a].legs[0].fromEstimatedCall.expectedDepartureTime.slice(11,16);
    }
}

function getDistance(distance) {
    if (distance < 1000) {
      return distance.toFixed(0) + " meter";
    } else if (distance > 100000) {
      return (distance / 1000).toFixed(0) + " km";
    } else {
      return (distance / 1000).toFixed(2) + " km";
    }
}


function getStationName(station) {
    return station;
}


// Removes NSR:StopID:
function getStopID(IdString) {
    return (IdString.slice(14));
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

btnBack.onclick = function () {
  window.history.back();
}
btnClose.onclick = function () {
  merInfo.style.display = "none";
  linePath.setMap(null);
}

function setManifest(fromName, toName) {
  var url = window.location.href;
  if (!(getParameterByName('time'))) {} else {url = url.slice(0, -29);}
  if (!(getParameterByName('arriveBy'))) {} else {url = url.slice(0, -14);}
  var dynamicManifest = {
    "name": "Reise fra " + fromName + ", til " + toName,
    "short_name": fromName + " - " + toName,
    "description": "Sjekk når bussen kommer i sanntid og finn reiseforslag for hele Norge",
    "start_url": url,
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
