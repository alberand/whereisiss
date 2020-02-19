/* Called when click on marker (ISS) */
function onClick(e) {
    window.open(this.options.url);
}

/*
 * Function to creating ISS.
 * Args:
 *  coords: Initial coordinates (decimal degree).
 */
function createISS(coords){
  data = JSON.parse(coords);
  lat = data[0];
  lon = data[1];

	iss_icon = L.icon({
    iconUrl: 'static/iss.png',
    iconRetinaUrl: 'iss@2x.png',
    iconSize: [128, 128],
	});

  lon = lon - 360;
  // Add 3 ISS to allow on left and right sides
  for(var i = 0; i < 3; i++){
    console.log(lon + ' ' + lat);
    var station = new L.Marker([lat, lon], {
      icon: new L.DivIcon({
          className: 'iss-icon',
          html: '<span id="iss">🛰️</span>'
      }),
			url: 'http://maps.google.com/maps?z=12&t=m&q=loc:' + lat + '+' + lon
    // str += '<div class="item"> Latitude: ' + data['latitude'] + '</div>'
    });

    // var tooltip = station.bindTooltip("my tooltip text", {
      // permanent: true,
      // direction: "bottom"
    // }).openTooltip();


    mul_iss[i] = station;
    station.addTo(map);
    lon = lon + 360;
    mul_iss[i].on('click', onClick);
  }
}

/*
 * Function to moving ISS.
 * Args:
 *  coords: coordinates to move (decimal degree).
 */

function moveISS(coords){
  data = JSON.parse(coords);
  lat = data[0];
  lon = data[1];

  console.log("Got new coords [" + lat + ", " + lon + "]"); 

  if(follow){
    map.panTo(new L.LatLng(lat, lon));
  }

  lon = lon - 360;
  for(var i = 0; i < mul_iss.length; i++){
	  mul_iss[i].setLatLng([lat, lon])
		mul_iss[i].options.url = 'http://maps.google.com/maps?z=12&t=m&q=loc:' + lat + '+' + lon
    lon = lon + 360;
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
 * Main section.
 *=============================================================================/

/* Set to 'true' camera will follow ISS */
follow = false
/* Information elements exists */
infoExist = false

/*
 * Initialize map.
 */
var map = L.map('mapid').setView([0, 0], 3);
map.setMaxBounds( [[-90,-360], [90,360]] )

L.tileLayer(
	'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic25hc2hlIiwiYSI6ImRFWFVLLWcifQ.IcYEbFzFZGuPmMDAGfx4ew', 
	{
    maxZoom: 18,
    minZoom: 3,
    maxBoundsViscosity: 0.5
    //noWrap: true
  }
).addTo(map);

var mul_iss = [];

// Create ISS on the map
httpGet(window.location.href + 'coords', createISS);

// Update ISS position every 3 seconds.
setInterval(
  function(){
    httpGet(window.location.href + 'coords', moveISS)},
  3000
);

// Add day/night overlay
var t = L.terminator()
t.addTo(map)
setInterval(function(){updateTerminator(t)}, 500);
function updateTerminator(t) {
    var t2 = L.terminator();
    t.setLatLngs(t2.getLatLngs());
    t.redraw();
}

//==============================================================================
// Add windows with people in space
//==============================================================================
// Adding info window
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  if(typeof props !== "undefined"){
    data = JSON.parse(props)['people'];

    var str = ''; 
    for(i = 0; i < data.length; i++){
      var url = data[i]['name'].replace(' ', '+')
      str += '<div class="item"><a target="_blank" rel="noopener noreferrer" href="https://duckduckgo.com/?q=' + url + '&t=ffab&ia=news&iax=about"> 👨‍🚀 ' + data[i]['name'] + '</a></div>'
    }

    this._div.innerHTML = '<h4>People in space:</h4>' + str
  }
};

//==============================================================================
// Add windows with information about ISS
//==============================================================================
// Adding info window
var infoiss = L.control({ position : 'bottomright' });

infoiss.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "infoiss"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
infoiss.update = function (issfullinfo) {
  if(typeof issfullinfo !== "undefined"){
    data = JSON.parse(issfullinfo);

    var str = ''; 
    var array_keys = ['latitude', 'longitude', 'altitude', 'velocity'];
 
    str += '<div class="item"><a target="_blank" rel="noopener noreferrer" href="http://maps.google.com/maps?z=12&t=m&q=loc:' + data['latitude'] + '+' + data['longitude'] + '">' + Number(data['latitude']).toFixed(4) + ', ' + Number(data['longitude']).toFixed(4) + '</a></div>'
    // str += '<div class="item"> Latitude: ' + data['latitude'] + '</div>'
    // str += '<div class="item"> Longitude: ' + data['longitude'] + '</div>'
    str += '<div class="item"> Altitude: ' + Number(data['altitude']).toFixed(2) + ' km</div>'
    str += '<div class="item"> Velocity: ' + Number(data['velocity']).toFixed(2) + ' km/h</div>'

    this._div.innerHTML = '<h4>Information:</h4>' + str
  }
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
// Add info elements if not mobile
//==============================================================================
function addNonMobileElements(){
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  if( width > 480 && !infoExist) { // is desktop
    console.log('Switched to desktop')
    infoExist = true

    // Make element small
    document.getElementsByClassName('leaflet-control-zoom-in')[0].classList.remove("big-control")
    document.getElementsByClassName('leaflet-control-zoom-out')[0].classList.remove("big-control")
    document.querySelector('.easy-button-button').classList.remove("big-control")

    // Set controls elements back to initial position
    map.zoomControl.setPosition('topleft');
    followButton.setPosition('topright');

    info.addTo(map);
    infoiss.addTo(map);

    // Update information window about people in space
    httpGet(window.location.href + 'people', function(response){
      info.update(response);  
    });
    
    var infoRefreshTimer = setInterval(
      function(){
        httpGet(window.location.href + 'people', function(response){
          info.update(response);  
        })
      },
      86400000 // Every 24 hour
    );

    // Update information window about people in space
    httpGet(window.location.href + 'issfullinfo', function(response){
      infoiss.update(response);  
    });
    
    var infoissRefreshTimer = setInterval(
      function(){
        httpGet(window.location.href + 'issfullinfo', function(response){
          infoiss.update(response);  
        })
      },
      3000 // Every 24 hour
    );

  } else if( width < 480) { // is mobile 
    console.log('Switched to mobile')
    infoExist = false
    info.remove();
    infoiss.remove();
    clearInterval(infoRefreshTimer);
    clearInterval(infoissRefreshTimer);
    // Move control elements to the right side
    map.zoomControl.setPosition('topright');
    followButton.setPosition('topright');
    // Change of position should preceed addition of new classes as
    // setPosition() resets classList
    // Make control element bigger
    document.getElementsByClassName('leaflet-control-zoom-in')[0].classList.add("big-control")
    document.getElementsByClassName('leaflet-control-zoom-out')[0].classList.add("big-control")
    document.querySelector('.easy-button-button').classList.add("big-control")
  } else {
    console.log('Don\'t switch')
  }
}

// Call it once to open pop-ups if we are on desktop
addNonMobileElements()
window.addEventListener('resize', addNonMobileElements)
window.addEventListener('load', addNonMobileElements)
