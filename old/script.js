mapboxgl.accessToken = 'pk.eyJ1IjoiaW5nbXYiLCJhIjoiY2t4MDVzY2RmMGRkMTJycWxyd2ZseHZsdSJ9.pdIDZ3EJ9TsggGyvkL98vg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    //style: 'mapbox://styles/ingmv/cl93viohx005w14l32o0ivlwr', // style URL SATELLITE
    style: 'mapbox://styles/ingmv/clr7zg5g1001k01r50orldets', //style URL OUTDOOR
    center: [11.7, 44], // starting position [lng, lat]
    zoom: 6, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
var geojson = {
    'type': 'FeatureCollection',
    'features': []
}
/*geojson.features.push(turf.point(
    [14, 45],
    {
        name: "testPoint",
        description: "desc.value",
        "fill": "#FF0000"
    }
));*/
/* geojson.features.push(
    turf.sector([14, 45], 50, 0, 360,
        {
            properties: {
                name: "cerchio",
                fill: "#ff0000",
                "fill-opacity": 0.2
            }
        })
); */
map.on('error', (error) => {
    console.log(error);
});

map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style

    map.addSource('settori', {
        type: 'geojson',
        data: geojson
    })

    map.loadImage("./cell-tower.png", (error, image) => {
        if (error) throw error;
        map.addImage('tower', image, { sdf: true });
    });

    map.addLayer({
        id: 'sectors',
        type: 'fill',
        source: 'settori',
        paint: {
            "fill-color": ["get", "fill"],
            "fill-opacity": ["get", "fill-opacity"]
        }
    });

    map.addLayer({
        id: 'markers',
        type: 'symbol',
        source: 'settori',
        layout: {
            "icon-image": 'tower',
            "icon-size": 0.7,
            "text-field": ["get", "name"],
            //"text-offset": [0,1.5],
            "text-variable-anchor": ["bottom", "top", "left", "right"],
            "text-justify": "auto",
            "text-radial-offset": 1.5,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
        },
        paint: {
            "icon-color": ["get", "fill"]
        },
        filter: ["==", ["geometry-type"], "Point"]

    });

    // measurements source
    map.addSource('_measurements', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    // measurements layer
    map.addLayer({
        id: '_measurements',
        source: '_measurements',
        type: 'symbol',
        paint: {
            'text-color': '#000000',
            'text-halo-color': 'hsl(0, 0%, 100%)',
            'text-halo-width': 2
        },
        layout: {
            'text-field': '{label}',
            'text-size': ['get', 'size'],
            "text-variable-anchor": ["bottom", "top", "left", "right"],
            "text-justify": "auto",
            "text-radial-offset": ['get', 'offset'],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            //"text-rotation-alignment": 'map',
            //"symbol-placement": "point",
        }
    });
    
});

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);
map.addControl(new MapboxExportControl({
    PageSize: Size.A4,
    PageOrientation: PageOrientation.Landscape,
    Format: Format.PNG,
    DPI: DPI[200],
    Crosshair: true,
    PrintableArea: true,
}), 'top-right');
var draw = new MapboxDraw({
    styles: [
        // default themes provided by MB Draw
        {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'fill-color': '#3bb2d0',
                'fill-outline-color': '#3bb2d0',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'paint': {
                'fill-color': '#fbb03b',
                'fill-outline-color': '#fbb03b',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-midpoint',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 7,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fbb03b'
            }
        },

        {
            'id': 'gl-draw-polygon-fill-static',
            'type': 'fill',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Polygon']
            ],
            'paint': {
                'fill-color': '#404040',
                'fill-outline-color': '#404040',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-static',
            'type': 'line',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Polygon']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#404040',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-static',
            'type': 'line',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'LineString']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#404040',
                'line-width': 2
            }
        },         // end default themes provided by MB Draw
        {
            'id': 'gl-draw-point-point-stroke-inactive', //INATTIVO
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 10,
                'circle-opacity': 1,
                'circle-color': '#000'
            }
        },
        {
            'id': 'gl-draw-point-inactive', //INATTIVO
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 8,
                'circle-color': '#ffe63b'
            }
        },
        {
            'id': 'gl-draw-point-center-inactive', //Centro Punto INATTIVO
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'false']
            ],
            'paint': {
                'circle-radius': 2,
                'circle-color': '#000000'
            }
        },
        {
            'id': 'gl-draw-point-stroke-active', //bordo punto ATTIVO
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'active', 'true'],
                ['!=', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 12, //default è 7
                'circle-color': '#000000' // Default'#fff'
            }
        },
        {
            'id': 'gl-draw-point-active', //intermedio punto ATTIVO
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true']
            ],
            'paint': {
                'circle-radius': 10, //default è 5
                'circle-color': '#ffe63b' //'#fbb03b'
            }
        },
        {
            'id': 'gl-draw-point-center-active', //Centro Punto ATTIVO
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#000000'
            }
        },
        {
            'id': 'gl-draw-line-inactive', //LINEA INATTIVO
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'LineString'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round',
            },
            'paint': {
                'line-color': '#000000', //'#3bb2d0',
                'line-width': 2,
            }
        },
        {
            'id': 'gl-draw-line-active', //LINEA ATTIVO
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'],
                ['==', 'active', 'true']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#000000', //'#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-point-static',
            'type': 'circle',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Point']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#404040'
            }
        }
    ],
    userProperties: true
});

map.addControl(draw, 'top-left');

map.addControl(
    new mapboxgl.NavigationControl({ position: 'top-left' })
);
// Control implemented as ES6 class
class IControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';
        this._container.textContent = 'Icontrol';
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

//On right click, update Latitude and Longitude in the form
map.on('contextmenu', (e) => {
    var lat = document.getElementById('inp_lat');
    var lon = document.getElementById('inp_lon');
    lat.value = e.lngLat.lat;
    lon.value = e.lngLat.lng;

});


map.on('draw.create', (e) => {
    map.moveLayer("_measurements"); //move layer to stay on top in z-index
})


//Function to add a celltower using the values in the form
function aggiungiCella() { 
    var lat = document.getElementById('inp_lat');
    var lon = document.getElementById('inp_lon');
    var angolo1 = document.getElementById('angle1');
    var angolo2 = document.getElementById('angle2');
    var name = document.getElementById('inp_name');
    var desc = document.getElementById('inp_desc');
    var radius = document.getElementById('inp_radius');
    var fillcolor = document.getElementById('inp_fill');
    var alpha = document.getElementById('inp_alpha');
    geojson.features.push(turf.point(
        [lon.value, lat.value],
        {
            name: name.value,
            description: desc.value,
            "fill": fillcolor.value
        }
    ));
    geojson.features.push(turf.sector(
        [lon.value, lat.value],
        radius.value, //radius
        angolo1.value,
        angolo2.value,
        {
            properties: {
                name: name.value,
                description: desc.value,
                "fill": fillcolor.value,
                "fill-opacity": parseFloat(alpha.value)
            }
        })
    );

    map.getSource('settori').setData(geojson);
    createTable(geojson.features);

}
//Erase every cell tower drawn
function cancella() {
    geojson.features = [];
    map.getSource('settori').setData(geojson);
    var elem = document.getElementById('elementi');
    elem.innerHTML = "";
    var geotxt = document.getElementById('geotxt');
    geotxt.value = JSON.stringify(geojson.features);
}

//download to KML
function scaricaKML() {
    var kml_string = tokml(geojson, { name: 'name', description: 'description', simplestyle: true });
    save("map.kml", kml_string);
}

//create blob and link to it for download
function save(filename, data) {
    const blob = new Blob([data], { type: 'text/kml' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

function createTable(tableData) {
    var elem = document.getElementById('elementi');
    elem.innerHTML = "";
    var table = document.createElement('table');

    for (const marker of tableData) {
        const row = document.createElement('tr');
        for (const val of Object.values(marker.properties)) {
            const col = document.createElement('td');
            col.textContent = val;
            row.appendChild(col);
        }
        const btn = document.createElement('button');
        btn.innerText = "X";
        btn.addEventListener('click', function () {
            geojson.features = geojson.features.filter(function (e) { return e !== marker });
            map.getSource('settori').setData(geojson);
            createTable(geojson.features);
        });
        row.appendChild(btn);
        table.appendChild(row);
    }
    elem.appendChild(table);
    var geotxt = document.getElementById('geotxt');
    geotxt.value = JSON.stringify(geojson.features);
}

function importfeatures() {
    var geotxt = document.getElementById('geotxt');
    geojson.features = JSON.parse(geotxt.value);
    map.getSource('settori').setData(geojson);
    createTable(geojson.features);
}

//RIGHELLO
// use https://github.com/mapbox/cheap-ruler for fast measurements
// depends on http://numeraljs.com/ and http://turfjs.org/getting-started
//var ruler = CheapRuler(map.getCenter().lat, 'meters');



// on draw.render update the measurments
map.on('draw.render', function (e) {
    var labelFeatures = [];
    var all = draw.getAll();
    if (all && all.features) {
        all.features.forEach(function (feature) {
            switch (turf.getType(feature)) {
                case 'Point':
                    // label Points
                    if (feature.geometry.coordinates.length > 1) {
                        labelFeatures.push(turf.point(feature.geometry.coordinates, {
                            type: 'point',
                            label: feature.geometry.coordinates[1].toFixed(6) + ',\n ' + feature.geometry.coordinates[0].toFixed(6),
                            size: 12,
                            offset: 1.3,
                        }));
                    }
                    break;
                case 'LineString':
                    // label Lines
                    if (feature.geometry.coordinates.length > 1) {
                        var length = turf.length(feature); //ruler.lineDistance(feature.geometry.coordinates);
                        var label = numeral(length*1000).format('0,0.0a') + 'm';
                        var midpoint = turf.along(feature, length / 2);
                        midpoint.properties = {
                            type: 'line',
                            label: label,
                            size: 16,
                            offset: 0.5,
                        };
                        labelFeatures.push(midpoint);
                    }
                    break;
                case 'Polygon':
                    // label Polygons
                    if (feature.geometry.coordinates.length > 0 && feature.geometry.coordinates[0].length > 3) {
                        var area = turf.area(feature);
                        var label = numeral(area).format('0,0.0a') + 'm²';
                        labelFeatures.push(turf.centroid(feature, {
                            type: 'area',
                            label: label
                        }));
                    }
                    break;
            }
        });
    }
    map.getSource('_measurements').setData({
        type: 'FeatureCollection',
        features: labelFeatures
    });
});