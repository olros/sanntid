const now = new Date();

let closestStops = [];
let closestSearchStops = [];
let closest = [];
const numberOfStops = 25;
const maxDistanceinMeters = 5000;
const entur_graphql_endpoint = "https://api.entur.org/journeyplanner/2.0/index/graphql";

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
