
/*
 * Function to creating ISS.
 * Args:
 *  coords: Initial coordinates (decimal degree).
 */
function create_ISS(coords){
  data = JSON.parse(coords);
  lat = data[0];
  lon = data[1];

	iss_icon = L.icon({
    iconUrl: 'static/iss.png',
    iconRetinaUrl: 'iss@2x.png',
    iconSize: [128, 128],
	});

	iss = L.marker([lat, lon], {icon: iss_icon})
  iss.addTo(map);
}

/*
 * Function to moving ISS.
 * Args:
 *  coords: coordinates to move (decimal degree).
 */

function move_ISS(coords){
  data = JSON.parse(coords);
  lat = data[0];
  lon = data[1];

	iss.setLatLng([lat, lon])
}

/*
 * Function for sending http request. Used for receiving current ISS position
 * from API.
 * Args:
 *  url: API-request url.
 *  callback: callback function after recieving response.
 */
function httpGet(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
 * Main section.
 */

/*
 * Initialize map.
 */
var map = L.map('mapid').setView([0, 0], 3);

L.tileLayer(
	'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic25hc2hlIiwiYSI6ImRFWFVLLWcifQ.IcYEbFzFZGuPmMDAGfx4ew', 
	{
    maxZoom: 18
  }
).addTo(map);

var iss;

// Create ISS on the map
httpGet(window.location.href + 'api', create_ISS);
// Update ISS position every 3 seconds.
setInterval(
  function(){httpGet(window.location.href + 'api', move_ISS)},
  3000
);
  
