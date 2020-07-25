var gMapsUrl = 'http://maps.google.com/maps?z=12&t=m&q=loc:{lat}+{lon}'

var astroLink = `
<div class="item">
	<a target="_blank" rel="noopener noreferrer" 
		href="https://duckduckgo.com/?q={url}&t=ffab&ia=news&iax=about"> 👨‍🚀 {name}
	</a>
</div>`

var mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/
	{z}/{x}/{y}?access_token=pk.eyJ1Ijoic25hc2hlIiwiYSI6ImRFWFVLLWcifQ.IcYEbFzFZGuPmMDAGfx4ew`

var latLonLink = `
<div class="item">
  <a target="_blank" rel="noopener noreferrer" 
    href="http://maps.google.com/maps?z=12&t=m&q=loc:{lat}+{lon}">
    {latText}, {lonText}
  </a>
</div>`

/* string.formatUnicorn({key: value}) */
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

/* Called when click on marker (ISS) */
function onClick(e) {
    window.open(this.options.url);
}

/* Add ISS Marker */
function createISS(newLat, newLon){
	iss_icon = L.icon({
    iconUrl: 'static/iss.png',
    iconRetinaUrl: 'iss@2x.png',
    iconSize: [128, 128],
	});

  newLon = newLon - 360;
  // Add 3 ISS to allow on left and right sides
  // There is LeafLet parameter for copying map but it's quite laggy
  for(var i = 0; i < 3; i++){
    console.log('Add ISS  at [' + newLon + ' ' + newLat + ']');
    var station = new L.Marker([newLat, newLon], {
      icon: new L.DivIcon({
          className: 'iss-icon',
          html: '<span id="iss">🛰️</span>'
      }),
			url: gMapsUrl.formatUnicorn({lat: newLat, lon: newLon})
			//'http://maps.google.com/maps?z=12&t=m&q=loc:' + newLat + '+' + newLon
    });

    mul_iss[i] = station;
    station.addTo(map);
    newLon = newLon + 360;
    mul_iss[i].on('click', onClick);
  }
}

function moveISS(newLat, newLon){
  console.log("Got new coords [" + newLat + ", " + newLon + "]"); 

  if(follow){
    map.flyTo(new L.LatLng(newLat, newLon));
  }

  newLon = newLon - 360;
  for(var i = 0; i < mul_iss.length; i++){
	  mul_iss[i].setLatLng([newLat, newLon])
		mul_iss[i].options.url = gMapsUrl.formatUnicorn({lat: newLat, lon: newLon})
    newLon = newLon + 360;
  }
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

/*==============================================================================
 * Initialize map
 *=============================================================================/

/* Set to 'true' camera will follow ISS */
follow = false
/* Already big */
var bigScreen = false

var root = location.protocol + '//' + location.host + '/';

/*
 * Initialize map.
 */
var map = L.map('mapid',{
  scrollWheelZoom: false, // disable original zoom function
  smoothWheelZoom: true,  // enable smooth zoom 
  smoothSensitivity: 1,   // zoom speed. default is 1
}).setView([0, 0], 3);
map.setMaxBounds( [[-90,-360], [90,360]] )

L.tileLayer(
	mapboxUrl, 
	{
    maxZoom: 18,
    minZoom: 3,
    maxBoundsViscosity: 0.5
    //noWrap: true
  }
).addTo(map);

var mul_iss = [];

//==============================================================================
// Add windows with people in space
//==============================================================================
// Adding info window
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  return this._div;
};
// info.addTo(map);

// method that we will use to update the control based on feature properties passed
info.update = function (data) {
    var str = ''; 
    people_arr = data['people']
    for(i = 0; i < people_arr.length; i++){
      var nameInUrl = people_arr[i]['name'].replace(' ', '+')
      str += astroLink.formatUnicorn({url: nameInUrl, name: people_arr[i]['name']});
    }

    this._div.innerHTML = '<h4>People in space:</h4>' + str
};

//==============================================================================
// Add windows with information about ISS
//==============================================================================
// Adding info window
var infoiss = L.control({ position : 'bottomright' });

infoiss.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'infoiss');
  return this._div;
};
// infoiss.addTo(map);

// method that we will use to update the control based on feature properties passed
infoiss.update = function (data) {
    var str = ''; 
    var array_keys = ['latitude', 'longitude', 'altitude', 'velocity'];
 
    str += latLonLink.formatUnicorn({
      lat: data['latitude'], lon: data['longitude'], 
      latText: Number(data['latitude']).toFixed(4), 
      lonText: Number(data['longitude']).toFixed(4)
    })
    
    str += '<div class="item"> Altitude: ' + Number(data['altitude']).toFixed(2) + ' km</div>'
    str += '<div class="item"> Velocity: ' + Number(data['velocity']).toFixed(2) + ' km/h</div>'

    this._div.innerHTML = '<h4>Information:</h4>' + str
};


//==============================================================================
// Add "Follow" mode button 
//==============================================================================
var followButton = L.easyButton('<img src="static/crosshair.svg" id="follow-mode-icon">', function(btn, map){
    follow = !follow;
    button = document.getElementsByClassName('easy-button-button leaflet-bar-part leaflet-interactive unnamed-state-active')[0];
    if(follow){
      button.setAttribute("style", "background-color: #ffb8b8;");
    } else {
      button.removeAttribute("style");
    }
  }).addTo( map );

//==============================================================================
// Create terminator
//==============================================================================
var terminator = L.terminator()
function updateTerminator(t) {
    var t2 = L.terminator();
    t.setLatLngs(t2.getLatLngs());
    t.redraw();
}
terminator.refreshTimer = setInterval(function(){
  updateTerminator(terminator)}, 1000);

//==============================================================================
// Add info elements if not mobile
//==============================================================================
function adjustForScreensize(){
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  if(width > 480 && !bigScreen) {
    switchToDesktop();
    bigScreen = true;
  } else if(width < 480) {
    switchToMobile();
    bigScreen = false;
  } else {
    console.log('Don\'t switch')
  }
}

function switchToMobile(){
    console.log('Switched to mobile')

    // Remove all elements as they eat screen or laggy (terminator)
    // document.getElementsByClassName('info')[0].setAttribute('display', 'none')
    // document.getElementsByClassName('infoiss')[0].setAttribute('display', 'none')
    terminator.remove()

    info.remove()
    infoiss.remove()
    // Disable updates
    // clearInterval(infoRefreshTimer);
    clearInterval(terminator.refreshTimer);

    // Move control elements to the right side
    map.zoomControl.setPosition('topright');
    followButton.setPosition('topright');

    // Change of position should preceed addition of new classes as
    // setPosition() resets classList
    // Make control element bigger
    document.getElementsByClassName('leaflet-control-zoom-in')[0].classList.add("big-control")
    document.getElementsByClassName('leaflet-control-zoom-out')[0].classList.add("big-control")
    document.querySelector('.easy-button-button').classList.add("big-control")
}

function switchToDesktop(){
    console.log('Switched to desktop')

    // Make element small
    document.getElementsByClassName('leaflet-control-zoom-in')[0].classList.remove("big-control")
    document.getElementsByClassName('leaflet-control-zoom-out')[0].classList.remove("big-control")
    document.querySelector('.easy-button-button').classList.remove("big-control")

    // Set controls elements back to initial position
    map.zoomControl.setPosition('topleft');
    followButton.setPosition('topleft');

    // Add day/night overlay
    // It's too heavy for mobile
    terminator.addTo(map)
    terminator.refreshTimer = setInterval(function(){
      updateTerminator(terminator)}, 1000);

    info.addTo(map)
    infoiss.addTo(map)

    // Update information window about people in space
    httpGet(root + 'people', function(response){
      data = JSON.parse(response);
      info.update(data);  
    });
    
    var infoRefreshTimer = setInterval(
      function(){
        httpGet(root + 'people', function(response){
          data = JSON.parse(response);
          info.update(data);  
        })
      },
      86400000 // Every 24 hour
    );
}

// Create ISS on the map
httpGet(root + 'issfullinfo', function(response){
  data = JSON.parse(response);

  lat = data['latitude'];
  lon = data['longitude'];
  createISS(lat, lon);  
  if(infoiss._div){
    infoiss.update(data);  
  }
});

// Update ISS position every 3 seconds.
setInterval(function(){
  httpGet(root + 'issfullinfo', function(response){
    data = JSON.parse(response);

    lat = data['latitude'];
    lon = data['longitude'];
    moveISS(lat, lon);  
    if(infoiss._div){
      infoiss.update(data);  
    }
  })},
  3100 // [ms]
);

// Call it once to open pop-ups if we are on desktop
adjustForScreensize()
window.addEventListener('resize', adjustForScreensize)
window.addEventListener('load', adjustForScreensize)
