// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

const COLOR_DEPTHS = [10,30,50,70,90];

function colorScale(depth) {
    if (depth <= COLOR_DEPTHS[0]) {
        return "#b3ffb3";
    } else if (depth <= COLOR_DEPTHS[1]){
        return "#00cc00";
    } else if (depth <= COLOR_DEPTHS[2]){
        return "#ffff00";
    } else if (depth <= COLOR_DEPTHS[3]){
        return "#ffaa00";
    } else if (depth <= COLOR_DEPTHS[4]){
            return "#ff8000";
    } else 
        return "#ff3300";
    }

// Perform a GET request to the query URL/
function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    let popupContent = `
    <h3>${feature.properties.place}</h3>
    <p>Magnitude: ${feature.properties.mag}</p>
    <p>Depth: ${feature.geometry.coordinates[2]}</p>
    `;
    layer.bindPopup(popupContent);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: feature.properties.mag * 5, 
            fillColor: colorScale(feature.geometry.coordinates[2]),
            weight: 1, 
            opacity: 1, 
            fillOpacity: 0.8
        });
    },
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });
 
 
//  Create legend. 
  let legend = createLegend();
  
  function createLegend(){
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function (){
        let div = L.DomUtil.create("div", "legend");
        let html = "<strong>Legend</strong><br>";

        html += `<i style="background-color: ${colorScale(COLOR_DEPTHS[0])}">&emsp;&emsp;</i> - ${COLOR_DEPTHS[0]}&nbsp;km&nbsp - 10&nbspkm <br>`;
        for (let i =0; i < COLOR_DEPTHS.length - 1; i++) {
            html += `<i style="background-color: ${colorScale(COLOR_DEPTHS[i+1])}">&emsp;&emsp;</i> ${COLOR_DEPTHS[i]}&nbsp;km - ${COLOR_DEPTHS[i+1]}&nbsp;km <br>`;
          }
        html += `<i style="background-color: ${colorScale(COLOR_DEPTHS[4]+1)}">&emsp;&emsp;</i> ${COLOR_DEPTHS[4]}&nbsp;km + <br>`;

        div.innerHTML = html;
        return div;
    }
    return legend;
}
  legend.addTo(myMap);
  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}