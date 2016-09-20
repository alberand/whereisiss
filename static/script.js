
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
httpGet(window.location.href + 'coords', create_ISS);
// Update ISS position every 3 seconds.
setInterval(
  function(){httpGet(window.location.href + 'coords', move_ISS)},
  3000
);
  
// Adding info window
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  console.log(props);
  if(typeof props !== "undefined"){
    data = JSON.parse(props);
  
    var str = ''; 
    for(i = 0; i < data.length; i++){
      str = str + '<div class="astr">' + data[i]['name'] + '</div>'
    }

    this._div.innerHTML = '<h4>People in space:</h4>' + str
  }
};

info.addTo(map);

// Update information window about people in space
httpGet(window.location.href + 'people', function(response){
  info.update(response);  
});
setInterval(
  function(){
    httpGet(window.location.href + 'people', function(response){
      info.update(response);  
    })
  },
  86400000 // Every 24 hour
);
