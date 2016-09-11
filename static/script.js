var zoom = 2;
var center = [0, 0];
// Create map
var map = new ol.Map({
  target: 'map',
  view: new ol.View({
    // center: ol.proj.fromLonLat(center),
    center: ol.proj.fromLonLat([0, 0]),
    zoom: zoom,
    minZoom: 1,
    maxZoom: 19
  }),

  // Add layers
  layers: [
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic25hc2hlIiwiYSI6ImRFWFVLLWcifQ.IcYEbFzFZGuPmMDAGfx4ew'
      })
    })
  ],
});

var iss = new ol.Feature(new ol.geom.Point([0, 0]));

iss.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.95,
        src: 'static/iss.png'
      }))
    })
)

var vec_layer = new ol.layer.Vector({
    source: new ol.source.Vector({
       features: [iss]
    })
})

map.addLayer(vec_layer);

function moveIss(coords){
  data = JSON.parse(coords);
  lat = data[0];
  lon = data[1];
  console.log('Moving ISS to ' + lat + ', ' + lon);
  iss.set('geometry', new ol.geom.Point(getPointFromLongLat(lon, lat)));
}

function getPointFromLongLat (long, lat) {
      return ol.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857')
}

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


// httpGet(
  // window.location.href + 'api',
  // function(args){console.log(args);}
// );

setInterval(
  //function(){console.log('Hello')},
  function(){httpGet(window.location.href + 'api', moveIss)},
  3000
);
  
