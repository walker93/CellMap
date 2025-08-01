mapboxgl.accessToken = API_KEY;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ingmv/clr7zg5g1001k01r50orldets',
    center: [11.7, 44],
    zoom: 6,
    projection: 'globe'
});
var geojson = {
    'type': 'FeatureCollection',
    'features': []
}
var hiddenPois = [];

map.on('load', setupMapLayers);
map.on('error', (error) => console.error('Mapbox error:', error));

function setupMapLayers() {
    const geojson = {
        'type': 'FeatureCollection',
        'features': []
    };
    addGeoJsonSource('settori', geojson);
    addGeoJsonSource('aree', geojson);
    addCellLayer();
    addOtherTools();
    addMeasurementTools();
    loadicons();
}
var draw;
var overlays = [];

function addCellLayer() {
    map.loadImage("cell-tower.png", (error, image) => {
        if (error) throw error;
        map.addImage('tower', image, { sdf: true });
    });
    map.addLayer({
        id: 'sectors',
        type: 'fill',
        source: 'aree',
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
            "text-variable-anchor": ["bottom", "top", "left", "right"],
            "text-justify": "auto",
            "text-radial-offset": 1.5,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
        },
        paint: {
            "icon-color": ["get", "fill"],
        },
        filter: ['all', ["==", ["geometry-type"], "Point"],
            ['==', ['get', "marker"], 'cell'],
        ]

    });
}

function addOtherTools() {
    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
    );
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

    map.addControl(new MapboxExportControl({
        PageSize: Size.A4,
        PageOrientation: PageOrientation.Landscape,
        Format: Format.PNG,
        DPI: DPI[200],
        Crosshair: true,
        PrintableArea: true,
    }), 'top-right');


}

function addMeasurementTools() {
    draw = new MapboxDraw({
        styles: [
            // default themes provided by MB Draw
            {
                'id': 'gl-draw-polygon-fill-inactive',
                'type': 'fill',
                'filter': ['all', ['==', 'active', 'false'],
                    ['==', '$type', 'Polygon'],
                    ['!=', 'mode', 'static'],
                    ['!=', "user_marker", 'cell']
                ],
                'paint': {
                    'fill-color': ['get', 'user_fill'],//'#3bb2d0',
                    'fill-outline-color': ['get', 'user_fill'], //'#3bb2d0',
                    'fill-opacity': ['get', 'user_opacity'] //0.1
                }
            },
            {
                'id': 'gl-draw-polygon-fill-active',
                'type': 'fill',
                'filter': ['all', ['==', 'active', 'true'],
                    ['==', '$type', 'Polygon'],
                    ['!=', "user_marker", 'cell']
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
                    ['==', 'meta', 'midpoint'],
                    ['!=', "user_marker", 'cell']
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
                    ['!=', 'mode', 'static'],
                    ['!=', "user_marker", 'cell']
                ],
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': ['get', 'user_fill'], //'#3bb2d0',
                    'line-width': 2
                }
            },
            {
                'id': 'gl-draw-polygon-stroke-active',
                'type': 'line',
                'filter': ['all', ['==', 'active', 'true'],
                    ['==', '$type', 'Polygon'],
                    ['!=', "user_marker", 'cell']
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
                    ['!=', 'mode', 'static'],
                    ['!=', "user_marker", 'cell']
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
                    ['!=', 'mode', 'static'],
                    ['!=', "user_marker", 'cell']
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
                    ['==', '$type', 'Polygon'],
                    ['!=', "user_marker", 'cell']
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
                    ['==', '$type', 'Polygon'],
                    ['!=', "user_marker", 'cell']
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
                    ['==', '$type', 'LineString'],
                    ['!=', "user_marker", 'cell']
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
                    ['!=', 'mode', 'static'],
                    ['!=', "user_marker", 'cell'],
                    ['!has', 'user_icon']
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
                    ['!=', 'mode', 'static'],
                    ['!=', "user_marker", 'cell'],
                    ['!has', 'user_icon']
                ],
                'paint': {
                    'circle-radius': 8,
                    'circle-color': ['get', 'user_fill'] //'#ffe63b'
                }
            },
            {
                'id': 'gl-draw-point-center-inactive', //Centro Punto INATTIVO
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'],
                    ['!=', 'meta', 'midpoint'],
                    ['==', 'active', 'false'],
                    ['!=', "user_marker", 'cell'],
                    ['!has', 'user_icon']
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
                    ['!=', 'meta', 'midpoint'],
                    ['!=', "user_marker", 'cell'],
                    ['!has', 'user_icon']
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
                    ['==', 'active', 'true'],
                    ['!=', "user_marker", 'cell'],
                    ['!has', 'user_icon']
                ],
                'paint': {
                    'circle-radius': 10, //default è 5
                    'circle-color': ['get', 'user_fill']//'#ffe63b' //'#fbb03b'
                }
            },
            {
                'id': 'gl-draw-point-center-active', //Centro Punto ATTIVO
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'],
                    ['!=', 'meta', 'midpoint'],
                    ['==', 'active', 'true'],
                    ['!=', "user_marker", 'cell'],
                    ['!has', 'user_icon']
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
                    'line-color': ['get', 'user_fill'], //'#000000', //'#3bb2d0',
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
                    'line-color': '#fbb03b',
                    'line-dasharray': [0.2, 2],
                    'line-width': 2
                }
            },
            {
                'id': 'gl-draw-point-static',
                'type': 'circle',
                'filter': ['all', ['==', 'mode', 'static'],
                    ['==', '$type', 'Point'],
                    ['!=', "user_marker", 'cell']
                ],
                'paint': {
                    'circle-radius': 5,
                    'circle-color': '#404040'
                }
            },
            {
                'id': 'gl-draw-point-icon',
                'type': 'symbol',
                'filter': ['all', ['==', '$type', 'Point'],
                    ['==', 'meta', 'feature'],
                    ['has', 'user_icon']
                ],
                'layout': {
                    'icon-image': ['get', 'user_icon'],
                    'icon-allow-overlap': true,
                    'icon-size': 0.9,
                    "text-allow-overlap": false,
                    "text-ignore-placement": true,
                    "icon-ignore-placement": true,
                    "icon-anchor": 'bottom'
                }
            },
            {
                'id': 'gl-draw-point-icon-active',
                'type': 'symbol',
                'filter': ['all', ['==', '$type', 'Point'],
                    ['==', 'meta', 'feature'],
                    ['has', 'user_icon'],
                    ['==', 'active', 'true']
                ],
                'layout': {
                    'icon-image': ['get', 'user_icon'],
                    'icon-allow-overlap': true,
                    'icon-size': 1.1,
                    "text-allow-overlap": false,
                    "icon-ignore-placement": true,
                    "icon-anchor": 'bottom'
                }
            }
        ],
        userProperties: true
    });

    map.addControl(draw, 'top-left');

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
}

function addGeoJsonSource(sourceId, geojsonData) {
    if (!map.getSource(sourceId)) {
        // Only add the source if it doesn't already exist
        map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData
        });
    } else {
        // If the source already exists, update its data
        map.getSource(sourceId).setData(geojsonData);
    }
}

// funzione che aggiunge una cella e il settore alla mappa
// se viene passata una cella esistente viene aggiornata
function aggiungiCella(existingCell) {

    if (!validateCellInput()) {
        alert('Please correct the inputs.');
        return;
    }
    var cella_feat = createFeatureFromInput();
    var tower = cella_feat[0];
    // Se esiste una cella, aggiorno le proprietà
    if (existingCell) tower.id = existingCell.id; // Mantengo l'id della cella esistente


    var tower_id = draw.add(tower);
    // Aggiungi l'id del marker nelle proprietà (così ["id"] funzionerà correttamente)
    {
        let t = draw.get(tower_id[0]);
        t.properties.id = tower_id[0];
        draw.add(t);
    }

    // Creare area torre
    var area_polygon = cella_feat[1];
    area_polygon.properties.towerid = tower_id[0];
    geojson.features.push(area_polygon);

    //Aggiorno mappa
    addGeoJsonSource('aree', geojson);
    addGeoJsonSource('settori', draw.getAll());

    createTable(draw.getAll());
    closeForm();
}

function validateCellInput() {
    const lat = document.getElementById('inp_lat').value;
    const lon = document.getElementById('inp_lon').value;

    // TODO: check other fields for valid not empty data
    return isFinite(lat) && isFinite(lon);
}

function createFeatureFromInput() {
    const lat = parseFloat(document.getElementById('inp_lat').value);
    const lon = parseFloat(document.getElementById('inp_lon').value);
    var angolo1 = document.getElementById('angle1');
    var angolo2 = document.getElementById('angle2');
    var name = document.getElementById('inp_name');
    var desc = document.getElementById('inp_desc');
    var radius = document.getElementById('inp_radius');
    var fillcolor = document.getElementById('inp_fill');
    var alpha = document.getElementById('inp_alpha');

    const features = [
        turf.point([lon, lat], {
            name: name.value,
            description: desc.value,
            "fill": fillcolor.value,
            "marker": "cell",
            'meta': 'feature',
            'Angle1': angolo1.value,
            'Angle2': angolo2.value,
            'Radius': radius.value,
            'opacity': parseFloat(alpha.value)
        }),
        turf.sector(
            [lon, lat],
            radius.value, //radius
            angolo1.value,
            angolo2.value,
            {
                properties: {
                    name: name.value,
                    description: desc.value,
                    "fill": fillcolor.value,
                    "fill-opacity": parseFloat(alpha.value),
                    "marker": "cell"
                }
            })
    ]
    resetForm();

    return features;
}

function resetForm() {
    document.getElementById('inp_lat').value = "";
    document.getElementById('inp_lon').value = "";
    document.getElementById('angle1').value = "0";
    document.getElementById('angle2').value = "360";
    document.getElementById('inp_name').value = "";
    document.getElementById('inp_desc').value = "";
    document.getElementById('inp_radius').value = "3";
    document.getElementById('inp_fill').value = "#FF0000";
    document.getElementById('inp_alpha').value = "0.2";
    document.getElementById('feature-id').value = "";
    document.getElementById('inp_icon').tomselect.clear();
}

function loadForm(feature) {
    var lat = document.getElementById('inp_lat');
    var lon = document.getElementById('inp_lon');
    var angolo1 = document.getElementById('angle1');
    var angolo2 = document.getElementById('angle2');
    var name = document.getElementById('inp_name');
    var desc = document.getElementById('inp_desc');
    var radius = document.getElementById('inp_radius');
    var fillcolor = document.getElementById('inp_fill');
    var alpha = document.getElementById('inp_alpha');
    var feat_id = document.getElementById('feature-id');
    var savebtn = document.getElementById("savebtn");
    var icn = document.getElementById('inp_icon');

    if (feature.properties.marker && feature.properties.marker == "cell") {
        //if cell feature load all previus fields
        angolo1.value = feature.properties.Angle1;
        angolo2.value = feature.properties.Angle2;
        radius.value = feature.properties.Radius;
        radius.disabled = false;
        angolo1.disabled = false;
        angolo2.disabled = false;
        icn.tomselect.disable(); // disable icon input for cell features
        savebtn.setAttribute('onclick', 'modificaCella()');
    } else {
        //if marker is a PoI feature disable sector related fields
        radius.disabled = true;
        angolo1.disabled = true;
        angolo2.disabled = true;
        icn.tomselect.enable();
        savebtn.setAttribute('onclick', 'modificaPoi()');
    }
    //enable or disable coords field according to geometry type
    if (feature.geometry.type === "Point") {
        lon.value = feature.geometry.coordinates[0];
        lat.value = feature.geometry.coordinates[1];
        lon.disabled = false
        lat.disabled = false
    } else {
        lon.disabled = true
        lat.disabled = true
    }
    //load all the other features
    name.value = feature.properties.name || "";
    desc.value = feature.properties.description || "";
    fillcolor.value = feature.properties.fill || "";
    alpha.value = feature.properties.opacity || "0.2";
    icn.tomselect.setValue(feature.properties.icon || "");
    feat_id.value = feature.id;
}

function modificaPoi() {
    var feature_id = document.getElementById('feature-id').value;
    var feature = draw.get(feature_id);
    var lat = document.getElementById('inp_lat');
    var lon = document.getElementById('inp_lon');
    var name = document.getElementById('inp_name');
    var desc = document.getElementById('inp_desc');
    var fillcolor = document.getElementById('inp_fill');
    var alpha = document.getElementById('inp_alpha');
    feature.properties.name = name.value;
    feature.properties.description = desc.value;
    feature.properties.fill = fillcolor.value;
    feature.properties.opacity = parseFloat(alpha.value);
    if (feature.geometry.type === "Point") {
        feature.geometry.coordinates[0] = parseFloat(lon.value);
        feature.geometry.coordinates[1] = parseFloat(lat.value);
    }
    if (!(feature.properties.marker && feature.properties.marker == "cell")) {
        var icon_select = document.getElementById('inp_icon');
        var category = icon_select.options[icon_select.selectedIndex].parentNode;
        feature.properties.icon = icon_select.value || undefined; // Set icon or remove if empty
        feature.properties.icon_category = category.label || undefined; // Set icon category or remove if empty
    }
    draw.add(feature);
    //reset and close form
    closeForm();
    resetForm();
    createTable(draw.getAll());
    addGeoJsonSource('settori', draw.getAll());
}

function modificaCella() {
    var feature_id = document.getElementById('feature-id').value;

    //Delete old tower and sector
    //draw.delete(feature_id);
    geojson.features = geojson.features.filter(function (e) { return e.properties.towerid !== feature_id });

    //invoke aggiungicella() for creation of new tower and sector with updated values
    aggiungiCella(draw.get(feature_id));
    createTable(draw.getAll());
    addGeoJsonSource('settori', draw.getAll());
    addGeoJsonSource('aree', geojson);

    //reset and close form
    closeForm();
    resetForm();
}

function createTable(tableData) {
    //update tower table
    var tower_table = document.getElementById('features');
    var poi_table = document.getElementById('poi');
    var overlay_table = document.getElementById('overlays');
    tower_table.innerHTML = "";
    poi_table.innerHTML = "";
    overlay_table.innerHTML = "";
    tableData.features = tableData.features.concat(hiddenPois).sort((a, b) => {
        //sort by id
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
    });
    if (tableData) {
        for (const marker of tableData.features) {
            if (marker.properties.marker && marker.properties.marker == "cell") {
                const tower_row = createTowerRow(marker);
                tower_table.appendChild(tower_row);
            } else {
                const poi_row = createPOIRow(marker);
                poi_table.appendChild(poi_row);
            }
        }
    }
    // add hiddenpois to the table
    /*for (const hiddenpoi of hiddenPois) {
        const poi_row = createPOIRow(hiddenpoi);
        poi_table.appendChild(poi_row);
    }*/
    // add overlays to the table
    for (const overlay of overlays) {
        const overlay_row = createOverlayRow(overlay);
        overlay_table.appendChild(overlay_row);
    }
}

function createOverlayRow(overlay) {
    const row = document.createElement('div');
    row.className = "table-element";
    var span_name = document.createElement('span');
    span_name.innerText = overlay.file;
    row.appendChild(span_name);

    //button column
    col = document.createElement('span');
    col.className = "btn-col";
    //locate column
    var icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-location-dot";
    icon.addEventListener("click", function () {
        //center on map feature
        var bounds = [overlay.west, overlay.south, overlay.east, overlay.north];
        map.fitBounds(bounds, { padding: 100, maxZoom: 13 });
    });
    col.appendChild(icon);

    // New hide/show icon for overlay
    icon = document.createElement('i');
    // If overlay.hidden is truthy, show eye-slash, otherwise eye
    icon.className = overlay.hidden ?
        "fa-sharp fa-solid fa-eye-slash" :
        "fa-sharp fa-solid fa-eye";
    icon.addEventListener("click", function () {
        var layerId = "overlay-layer-" + overlay.ID;
        if (overlay.hidden) {
            // Show overlay: set visibility to visible
            overlay.hidden = false;
            map.setLayoutProperty(layerId, 'visibility', 'visible');
            this.className = "fa-sharp fa-solid fa-eye";
        } else {
            // Hide overlay: set visibility to none
            overlay.hidden = true;
            map.setLayoutProperty(layerId, 'visibility', 'none');
            this.className = "fa-sharp fa-solid fa-eye-slash";
        }
    });
    col.appendChild(icon);

    //delete icon
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-xmark";
    icon.addEventListener("click", function () {
        //delete overlay
        var index = overlays.indexOf(overlay);
        if (index > -1) {
            overlays.splice(index, 1);
            createTable(draw.getAll());
            map.removeLayer("overlay-layer-" + overlay.ID);
            map.removeSource("overlay-source-" + overlay.ID);
        }
    });
    col.appendChild(icon);
    row.appendChild(col);

    return row;
}

/*overlays.push({
    'file': file.name,
    'ID': overlayID,
    'imageURL': imageUrl,
    'imageBlob': imageBlob,
    'north': north,
    'east': east,
    'west': west,
    'south': south
});*/

function createPOIRow(marker) {
    const row = document.createElement('div');
    //type Column
    //var col = document.createElement('td');
    row.className = "table-element";
    var span_name = document.createElement('span');
    span_name.setAttribute("data-id", marker.id);
    var testo = "";
    switch (marker.geometry.type) {
        case "Point":
            testo = "PoI"
            break;
        case "LineString":
            testo = "Measure"
            break;
        case "Polygon":

            testo = "Area";
            break;
        default:
            break;
    }
    span_name.innerText = testo;

    //col.appendChild(span_name);
    row.appendChild(span_name);


    //name Column
    //col = document.createElement('td');
    span_name = document.createElement('span');
    span_name.innerText = marker.properties.name;
    if (marker.properties.name === undefined || marker.properties.name == "") {
        var testo = "";
        switch (marker.geometry.type) {
            case "Point":
                testo = marker.geometry.coordinates[1].toFixed(6) + ';' + marker.geometry.coordinates[0].toFixed(6);
                break;
            case "LineString":
                var length = turf.length(marker);
                testo = numeral(length * 1000).format('0,0.0a') + 'm';
                break;
            case "Polygon":
                var area = math.unit(turf.area(marker), "m^2");
                testo = area.format({ notation: 'fixed', precision: 2 });
                break;
            default:
                break;
        }
        span_name.innerText = testo;
    }
    //col.appendChild(span_name);
    row.appendChild(span_name);

    //color column
    //col = document.createElement('td');
    var square = document.createElement('div');
    square.className = "square-color"
    square.style.backgroundColor = marker.properties.fill;
    //col.appendChild(square);
    row.appendChild(square);

    //button column
    col = document.createElement('span');
    col.className = "btn-col";
    //locate column
    var icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-location-dot";
    icon.addEventListener("click", function () {
        var bounds = new mapboxgl.LngLatBounds(turf.bbox(marker));
        map.fitBounds(bounds, { padding: 100, maxZoom: 13 });
    });
    col.appendChild(icon);

    // Hide/Show icon for POI
    icon = document.createElement('i');
    // default visible icon
    if (!marker.properties.hidden) icon.className = "fa-sharp fa-solid fa-eye";
    else icon.className = "fa-sharp fa-solid fa-eye-slash";

    icon.addEventListener("click", function () {
        if (marker.properties.hidden) {
            // Show the feature
            marker.properties.hidden = false;
            this.className = "fa-sharp fa-solid fa-eye";
            // retrive the feature from the hidden array and add to draw
            var index = hiddenPois.findIndex(f => f.id === marker.id);
            if (index > -1) {
                draw.add(hiddenPois[index]);
                hiddenPois.splice(index, 1);
            }
        } else {
            // Hide the feature
            marker.properties.hidden = true;
            this.className = "fa-sharp fa-solid fa-eye-slash";
            // add the feature to the hidden array
            hiddenPois.push(marker);
            draw.delete(marker.id);
        }
        createTable(draw.getAll());
    });
    col.appendChild(icon);


    //duplicate
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-copy"
    icon.addEventListener("click", function () {
        //duplicate cell
        var copy_poi = draw.get(marker.id);
        copy_poi.id = "";
        var new_id = draw.add(copy_poi);

        createTable(draw.getAll());
        addGeoJsonSource('settori', draw.getAll());

    });
    col.appendChild(icon);

    //edit
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-pen"
    icon.addEventListener("click", function () {
        //EDIT AND UPDATE FEATURE
        loadForm(marker);
        openForm(marker);
    });
    col.appendChild(icon);

    //delete icon
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-xmark"
    icon.addEventListener("click", function () {
        draw.delete(marker.id);
        createTable(draw.getAll());
        addGeoJsonSource('settori', draw.getAll());
        geojson.features = geojson.features.filter(function (e) { return e.properties.towerid !== marker.id });
        addGeoJsonSource('aree', geojson);
    });
    col.appendChild(icon);
    row.appendChild(col);

    return row;
}

function createTowerRow(marker) {
    const row = document.createElement('div');
    row.className = "table-element";
    //Name Column
    //var col = document.createElement('td');
    var span_name = document.createElement('span');
    span_name.setAttribute("data-id", marker.id);
    span_name.innerText = marker.properties.name;
    if (marker.properties.name == "") {
        span_name.innerText = "Unnamed";
    }

    row.appendChild(span_name);
    //row.appendChild(col);

    //Angle Column
    //col = document.createElement('td');
    span_name = document.createElement('span');
    var testo = marker.properties.Angle1.toString() + " - " + marker.properties.Angle2.toString() + "°";
    span_name.innerText = testo;
    row.appendChild(span_name);
    //row.appendChild(col);

    //Radius Column
    //col = document.createElement('td');
    span_name = document.createElement('span');
    span_name.innerText = marker.properties.Radius.toString() + "km";
    row.appendChild(span_name);
    //row.appendChild(col);

    //color column
    //col = document.createElement('td');
    var square = document.createElement('div');
    square.className = "square-color"
    square.style.backgroundColor = marker.properties.fill;
    row.appendChild(square);
    //row.appendChild(col);

    //button column
    col = document.createElement('span');
    col.className = "btn-col";
    //locate column
    var icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-location-dot"
    icon.addEventListener("click", function () {
        //center on map feature
        map.flyTo({
            center: marker.geometry.coordinates,
            zoom: 11
        });
    });
    col.appendChild(icon);

    //hide/show column
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-eye";
    if (marker.properties.hidden) {
        icon.className = "fa-sharp fa-solid fa-eye-slash";
    }
    icon.addEventListener("click", function () {
        //hide/show feature
        var hiddenFilterMarkers = map.getFilter('markers') || ['all'];
        var hiddenFilterSectors = map.getFilter('sectors') || ['all'];
        if (!Array.isArray(hiddenFilterMarkers)) { hiddenFilterMarkers = ['all']; }
        if (!Array.isArray(hiddenFilterSectors)) { hiddenFilterSectors = ['all']; }

        var feat = draw.get(marker.id);
        if (feat.properties.hidden) {
            // Show the feature
            feat.properties.hidden = false;
            // Remove the marker hide filter that was added (using ["id"])
            hiddenFilterMarkers = hiddenFilterMarkers.filter(f =>
                !(Array.isArray(f) && f[0] === "!=" && JSON.stringify(f[1]) === JSON.stringify(["get", "id"]) && f[2] === marker.id)
            );
            // Remove the sector hide filter (using ["get", "towerid"])
            hiddenFilterSectors = hiddenFilterSectors.filter(f =>
                !(Array.isArray(f) && f[0] === "!=" && JSON.stringify(f[1]) === JSON.stringify(["get", "towerid"]) && f[2] === marker.id)
            );
            this.className = "fa-sharp fa-solid fa-eye";
        } else {
            // Hide the feature
            feat.properties.hidden = true;

            // Aggiungi il filtro per nascondere questa feature
            if (hiddenFilterMarkers.length === 1 && hiddenFilterMarkers[0] === 'all') {
                hiddenFilterMarkers = ['all', ["!=", ["get", "id"], marker.id]];
            } else {
                hiddenFilterMarkers.push(["!=", ["get", "id"], marker.id]);
            }

            if (hiddenFilterSectors.length === 1 && hiddenFilterSectors[0] === 'all') {
                hiddenFilterSectors = ['all', ["!=", ["get", "towerid"], marker.id]];
            } else {
                hiddenFilterSectors.push(["!=", ["get", "towerid"], marker.id]);
            }
            this.className = "fa-sharp fa-solid fa-eye-slash";
        }

        map.setFilter('markers', hiddenFilterMarkers);
        map.setFilter('sectors', hiddenFilterSectors);
        draw.add(feat);
        createTable(draw.getAll());
    });
    col.appendChild(icon);

    //duplicate
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-copy"
    icon.addEventListener("click", function () {
        //duplicate cell
        var copy_cell = draw.get(marker.id);
        copy_cell.id = "";
        var new_id = draw.add(copy_cell);

        createTable(draw.getAll());
        addGeoJsonSource('settori', draw.getAll());
        var copy_sector = geojson.features.filter(function (e) { return e.properties.towerid === feature_id });
        copy_sector.properties.towerid = new_id[0];
        geojson.features.push(copy_sector);
        addGeoJsonSource('aree', geojson);

    });
    col.appendChild(icon);

    //edit
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-pen"
    icon.addEventListener("click", function () {
        //EDIT AND UPDATE FEATURE
        loadForm(marker);
        openForm(marker);
    });
    col.appendChild(icon);

    //delete icon
    icon = document.createElement('i');
    icon.className = "fa-sharp fa-solid fa-xmark"
    icon.addEventListener("click", function () {
        draw.delete(marker.id);
        createTable(draw.getAll());
        addGeoJsonSource('settori', draw.getAll());
        geojson.features = geojson.features.filter(function (e) { return e.properties.towerid !== marker.id });
        addGeoJsonSource('aree', geojson);
    });
    col.appendChild(icon);
    row.appendChild(col);

    return row;
}

function deleteAll() {
    draw.deleteAll();
    geojson.features = [];

    overlays.forEach(function (overlay) {
        map.removeLayer("overlay-layer-" + overlay.ID);
        map.removeSource("overlay-source-" + overlay.ID);
    });


    overlays = [];
    addGeoJsonSource('aree', geojson);
    addGeoJsonSource('settori', draw.getAll());
    createTable(draw.getAll());
}

function scaricageojson() {
    var data = JSON.stringify(draw.getAll());
    downloadFile("map.geojson", data, 'application/geo+json');
}

function importjson() {
    var inp_file = document.createElement("input");
    inp_file.setAttribute("type", "file");
    inp_file.setAttribute("accept", ".geojson");
    inp_file.click();
    inp_file.addEventListener('change', function filechange() {
        if (this.files.length === 0) {
            console.log('No file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function fileReadCompleted() {
            // when the reader is done, the content is in reader.result.
            deleteAll();
            //Parsing Geojson
            var read_json = JSON.parse(reader.result);
            draw.add(read_json);
            for (const feat of read_json.features) {
                if (feat.properties.marker == "cell") { //se di tipo cella, aggiungo il relativo settore
                    var area_polygon = turf.sector(
                        feat.geometry.coordinates,
                        feat.properties.Radius, //radius
                        feat.properties.Angle1,
                        feat.properties.Angle2,
                        {
                            properties: {
                                name: feat.properties.name,
                                description: feat.properties.description,
                                "fill": feat.properties.fill,
                                "fill-opacity": parseFloat(feat.properties.opacity),
                                "marker": feat.properties.marker,
                                towerid: feat.id
                            }
                        });
                    geojson.features.push(area_polygon);
                }
            }

            addGeoJsonSource('aree', geojson);
            addGeoJsonSource('settori', draw.getAll());
            createTable(draw.getAll());
        };
        reader.readAsText(this.files[0]);
    });
}

function scaricaKML() {
    var merged = {
        'type': 'FeatureCollection',
        'features': draw.getAll().features.concat(geojson.features)
    };

    const kmlData = generateKML(merged);
    downloadFile('map.kml', kmlData, 'text/kml');
}

function generateKML(geojsonData) {
    return tokml(geojsonData, { name: 'name', description: 'description', simplestyle: true });
}

function downloadFile(filename, data, mimeType) {
    const blob = new Blob([data], { type: mimeType });
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

function showError(message) {
    const errorContainer = document.getElementById('error-display');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}

function hideError() {
    const errorContainer = document.getElementById('error-display');
    errorContainer.style.display = 'none';
}

function setupClustering(map) {
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'settori',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': {
                property: 'point_count',
                type: 'interval',
                stops: [[0, '#51bbd6'], [100, '#f1f075'], [750, '#f28cb1']]
            },
            'circle-radius': {
                property: 'point_count',
                type: 'interval',
                stops: [[0, 20], [100, 30], [750, 40]]
            }
        }
    });
}

function openForm(marker) {
    if (marker != null) {
        //change button to save instead of add
        document.getElementById("savebtn").style.display = "inline-block";
        document.getElementById("addbtn").style.display = "none";
    } else {
        //change button to add instead of save
        document.getElementById("savebtn").style.display = "none";
        document.getElementById("addbtn").style.display = "inline-block";
        document.getElementById('inp_icon').tomselect.disable();
    }
    document.getElementById("inputs").style.display = "block";

}

function closeForm() {
    document.getElementById("inputs").style.display = "none";
    document.getElementById("savebtn").style.display = "none";
    document.getElementById("addbtn").style.display = "inline-block";
}


function processKMZ() {

    var inp_file = document.createElement("input");
    inp_file.setAttribute("type", "file");
    inp_file.setAttribute("accept", ".kmz");
    inp_file.click();
    inp_file.addEventListener('change', async function filechange() {
        if (this.files.length === 0) {
            console.log('No file selected.');
            return;
        }
        const file = inp_file.files[0];
        JSZip.loadAsync(file)
            .then(zip => {
                let kmlContentPromise, imageBlobPromise;

                // Cerca il file KML e l'immagine nel KMZ
                zip.forEach((relativePath, zipEntry) => {
                    if (relativePath.endsWith(".kml")) {
                        kmlContentPromise = zipEntry.async("string");
                    } else if (relativePath.endsWith(".png")) {
                        imageBlobPromise = zipEntry.async("blob");
                    }
                });

                // Verifica che esistano sia il file KML sia l'immagine
                if (!kmlContentPromise || !imageBlobPromise) {
                    alert("Invalid KMZ file: inner KML or image missing.");
                    return Promise.reject("KML o immagine mancante");
                }

                // Risolvi le promesse per ottenere i contenuti del KML e l'immagine
                return Promise.all([kmlContentPromise, imageBlobPromise]);
            })
            .then(([kmlContent, imageBlob]) => {
                // Parsing del contenuto KML usando DOMParser
                const parser = new DOMParser();
                const kmlDoc = parser.parseFromString(kmlContent, "application/xml");

                // Estrai le coordinate dal KML
                const latLonBox = kmlDoc.querySelector("LatLonBox");
                const north = parseFloat(latLonBox.querySelector("north").textContent);
                const south = parseFloat(latLonBox.querySelector("south").textContent);
                const east = parseFloat(latLonBox.querySelector("east").textContent);
                const west = parseFloat(latLonBox.querySelector("west").textContent);

                // Crea un URL temporaneo per l'immagine
                const imageUrl = URL.createObjectURL(imageBlob);
                const overlayID = Date.now();

                // Aggiungi l'immagine come sorgente e sovrapponila alla mappa
                map.addSource('overlay-source-' + overlayID, {
                    'type': 'image',
                    'url': imageUrl,
                    'coordinates': [
                        [west, north], // NO
                        [east, north], // NE
                        [east, south], // SE
                        [west, south]  // SO
                    ]
                });

                map.addLayer({
                    id: 'overlay-layer-' + overlayID,
                    'type': 'raster',
                    'source': 'overlay-source-' + overlayID,
                    'paint': {
                        'raster-fade-duration': 0,
                        'raster-opacity': 0.3
                    }
                });
                overlays.push({
                    'file': file.name,
                    'ID': overlayID,
                    'imageURL': imageUrl,
                    'imageBlob': imageBlob,
                    'north': north,
                    'east': east,
                    'west': west,
                    'south': south
                });
                createTable(draw.getAll());
            })
            .catch(error => {
                console.error("Errore nell'elaborazione del file KMZ:", error);
                alert("Si è verificato un errore durante l'elaborazione del file KMZ.");
            });

    });
}


function openfile() {
    /* csv example 
    lat,lon,name,desc,fill,marker,angle1,angle2,radius,opacity
    45.1256,9.2365,"torre","descrizione","#ff0000","cell",0,360,3,0.2
    
    */

    var inp_file = document.createElement("input");
    inp_file.setAttribute("type", "file");
    inp_file.setAttribute("accept", ".csv");
    inp_file.click();
    inp_file.addEventListener('change', function filechange() {
        if (this.files.length === 0) {
            console.log('No file selected.');
            return;
        }
        Papa.parse(inp_file.files[0], {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                deleteAll();
                var data = results.data;
                for (const cell of data) {
                    const cella_feat = [
                        turf.point([cell.lon, cell.lat], {
                            name: cell.name,
                            description: cell.desc,
                            "fill": cell.fill,
                            "marker": "cell",
                            'meta': 'feature',
                            'Angle1': cell.angle1,
                            'Angle2': cell.angle2,
                            'Radius': cell.radius,
                            'opacity': parseFloat(cell.opacity)
                        }),
                        turf.sector(
                            [cell.lon, cell.lat],
                            cell.radius, //radius
                            cell.angle1,
                            cell.angle2,
                            {
                                properties: {
                                    name: cell.name,
                                    description: cell.desc,
                                    "fill": cell.fill,
                                    "fill-opacity": parseFloat(cell.opacity),
                                    "marker": "cell"
                                }
                            })
                    ]
                    const tower = cella_feat[0];
                    var tower_id = draw.add(tower);

                    //Creare area torre
                    var area_polygon = cella_feat[1];
                    area_polygon.properties.towerid = tower_id[0];
                    geojson.features.push(area_polygon);

                    //Aggiorno mappa
                    addGeoJsonSource('aree', geojson);
                    addGeoJsonSource('settori', draw.getAll());

                    createTable(draw.getAll());
                }
            }
        });
    });

}

//fecth icon folder and add each image as a mapbox image - add option to select icon for PoI
function loadicons() {
    var iconInput = document.getElementById('inp_icon');
    iconInput.innerHTML = '<option value="" selected>Choose an icon</option>';
    iconInput.disabled = true;
    fetch('images/icons/icons.json')
        .then(response => response.json())
        .then(data => {
            // data: { "usr_xxx": { value, text, category, url }, ... }
            var options = Object.values(data);
            // Carica tutte le icone in mapbox e raggruppa per categoria in un solo ciclo
            var optgroups = {};
            options.forEach(opt => {
                if (opt.url && opt.value) {
                    map.loadImage(opt.url, function (error, image) {
                        if (!error && !map.hasImage(opt.value)) {
                            map.addImage(opt.value, image);
                        }
                    });
                }
                if (!optgroups[opt.category]) optgroups[opt.category] = [];
                optgroups[opt.category].push(opt);
            });
            // Ricostruisci la select (per fallback)
            iconInput.innerHTML = '<option value="" selected>Choose an icon</option>';
            Object.keys(optgroups).forEach(cat => {
                var optgroup = document.createElement('optgroup');
                optgroup.label = cat;
                optgroups[cat].forEach(opt => {
                    var option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    optgroup.appendChild(option);
                });
                iconInput.appendChild(optgroup);
            });
            iconInput.disabled = false;
            // Inizializza TomSelect
            if (iconInput.tomselect) {
                iconInput.tomselect.destroy();
            }
            new TomSelect(iconInput, {
                maxItems: 1,
                maxOptions: null,
                valueField: 'value',
                labelField: 'text',
                searchField: ['text'],
                options: options,
                optgroups: Object.keys(optgroups).map(cat => ({ value: cat, label: cat })),
                optgroupField: 'category',
                optgroupLabelField: 'label',
                optgroupValueField: 'value',
                render: {
                    option: function(data, escape) {
                        return `<div style="display:flex;align-items:center;gap:8px;">
                            <img src='${escape(data.url)}' style='width:24px;height:24px;object-fit:contain;margin-right:6px;'>
                            <span>${escape(data.text)}</span>
                        </div>`;
                    },
                    item: function(data, escape) {
                        return `<div style="display:flex;align-items:center;gap:8px;">
                            <img src='${escape(data.url)}' style='width:20px;height:20px;object-fit:contain;margin-right:4px;'>
                            <span>${escape(data.text)}</span>
                        </div>`;
                    },
                    optgroup_header: function(data, escape) {
                        return `<div style="font-weight:bold;padding:4px 0;text-align:center;background: var(--background-color);">${escape(data.label)}</div>`;
                    }
                },
                placeholder: 'Choose an icon',
                allowEmptyOption: true
            });
        });
}
/* MAP EVENTS */

// on draw.render update the measurments
map.on('draw.render', function (e) {
    var labelFeatures = [];

    var all = draw.getAll();
    if (all && all.features) {
        all.features.forEach(function (feature) {
            switch (turf.getType(feature)) {
                case 'Point':
                    // label Points

                    //Remove this check if you want cells to show coordinates
                    if (feature.properties.marker != 'cell') {
                        if (feature.geometry.coordinates.length > 1) {
                            var label = feature.properties.name || feature.geometry.coordinates[1].toFixed(6) + ',\n ' + feature.geometry.coordinates[0].toFixed(6);
                            var offset = feature.properties.icon ? 3 : 1.3;
                            labelFeatures.push(turf.point(feature.geometry.coordinates, {
                                type: 'point',
                                label: label,
                                size: feature.properties.name ? 16 : 12,
                                offset: offset,
                            }));
                        }
                    }
                    break;
                case 'LineString':
                    // label Lines
                    if (feature.geometry.coordinates.length > 1) {
                        var length = turf.length(feature);
                        var label = feature.properties.name || numeral(length * 1000).format('0,0.0a') + 'm';
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
                        var area = math.unit(turf.area(feature), "m^2");
                        var label = feature.properties.name || area.format({ notation: 'fixed', precision: 2 });  //numeral(area).format('0,0.0a') + 'm²';
                        var centroid = turf.centroid(feature);
                        centroid.properties = {
                            type: 'fill',
                            label: label,
                            size: 16
                        };
                        labelFeatures.push(centroid);
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

map.on('draw.create', function (e) {
    var feature = draw.get(e.features[0].id);
    feature.properties.fill = "#ff0000";
    feature.properties.opacity = 0.2;
    draw.add(feature);
    createTable(draw.getAll());
});

map.on('draw.delete', function (e) {
    createTable(draw.getAll());
});

map.on('draw.update', function (e) {
    createTable(draw.getAll());
});

map.on('contextmenu', (e) => {
    if (document.getElementById("inputs").style.display == "block") {
        var lat = document.getElementById('inp_lat');
        var lon = document.getElementById('inp_lon');
        lat.value = e.lngLat.lat;
        lon.value = e.lngLat.lng;
    }
});

map.on('click', ['markers'], function (e) {
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const name = feature.properties.name || 'PoI';
    const description = feature.properties.description || 'Nessuna descrizione';

    new mapboxgl.Popup({offset: [0, -25] })
        .setLngLat(coordinates)
        .setHTML(`<strong>${name}</strong><br>${description}`)
        .addTo(map);
});

// Cambia il cursore quando passi sopra un marker
map.on('mouseenter', 'markers', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'markers', function () {
    map.getCanvas().style.cursor = '';
});