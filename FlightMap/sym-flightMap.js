(function(PV) {
    'use strict';

    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis);
    symbolVis.prototype.init = function(scope, element) {

        this.onConfigChange = function() {
            L.tileLayer(scope.config.url).addTo(mymap);
        }

        var markers = new Array();
        // pass an array of markers..
        function removeAllMovingMarkers(markers) {
            if (markers.length > 0) {
                for (var i = 0; i < markers.length; i++) {
                    mymap.removeLayer(markers[i]);
                }
            }
        }

        $.get("https://pisrv01.pischool.int/piwebapi/tables/B0_BJ6yxOWfEu1XN8dxGow1gpu2vXIoR4E2NJL1emU7iBAUElTUlYwMVxIQUNLQVRIT05cVEFCTEVTW01BUExPQ0FUSU9OU10/data", function(data) {
            // console.log(data)

            for (var i = 0; i < data.Rows.length; i++) {
                var dataIcon = L.icon({
                    iconUrl: data.Rows[i].Image,
                    iconSize: [45, 45], // size of the icon
                    iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
                    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
                });
                L.marker([data.Rows[i].Lat, data.Rows[i].Lon], {
                    icon: dataIcon
                }).addTo(mymap).bindPopup(data.Rows[i].DisplayText);
            }
        });

        // NOTE: http://leafletjs.com/examples/custom-icons/ this may be helpful.
        //  Initialise the map
        var mymap = L.map('map').setView([58.1, -0.796], 7);

        function getDictionaryFromEventFrame(url) {
            var dict = {}
            $.get(url, function(data) {
                for (var i = 0; i < data.Items.length; i++) {
                    if (data.Items[i].Value.Value.Value != undefined) {
                        dict[data.Items[i].Name] = data.Items[i].Value.Value.Value;
                    } else {
                        dict[data.Items[i].Name] = data.Items[i].Value.Value;
                    }
                }
                //console.log('object containing the data..');
                //console.log(dict);
                // console.log('added new flight. ' + flightNum);
                var dataIcon = L.icon({
                    iconUrl: dict['category'] + '.png',
                    iconSize: [45, 45], // size of the icon
                    iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
                    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
                });
                var marker = L.marker([dict['currentlat'], dict['currentlon']], {
                    icon: dataIcon,
                    rotationAngle: dict['Heading']
                }).addTo(mymap).bindPopup("<p>Flight number: " + dict['flightnumber'] + "</p><p>Company: " + dict['Company'] + "</p><p>Altitude: " + dict['altitude'] + "</p><p>Category: " + dict['category'] + "</p><p>ETA: " + dict['ETA'] + "</p>");
                markers.push(marker);
            })
        }

        // 'https://api.mapbox.com/styles/v1/james9005/cizjp9yg800692skfuidcqwkf/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXM5MDA1IiwiYSI6ImNpemd6eXVuMjAwM2QzM256OGw5bXNneWoifQ.W5ahILd1Gk2TO3nsj8rUsA'
        L.tileLayer(scope.config.url).addTo(mymap);
        $.get('https://pisrv01.pischool.int/piwebapi/assetdatabases/D0_BJ6yxOWfEu1XN8dxGow1gy3WkCfmin0CFPHi0tWC1ywUElTUlYwMVxIQUNLQVRIT04/eventframes', function(data) {
            for (var i = 0; i < data.Items.length; i++) {
                getDictionaryFromEventFrame('https://pisrv01.pischool.int/piwebapi/streamsets/' + data.Items[i].WebId + '/value');
            }
        })

        setInterval(function() {
            removeAllMovingMarkers(markers);
            $.get('https://pisrv01.pischool.int/piwebapi/assetdatabases/D0_BJ6yxOWfEu1XN8dxGow1gy3WkCfmin0CFPHi0tWC1ywUElTUlYwMVxIQUNLQVRIT04/eventframes', function(data) {
                for (var i = 0; i < data.Items.length; i++) {
                    getDictionaryFromEventFrame('https://pisrv01.pischool.int/piwebapi/streamsets/' + data.Items[i].WebId + '/value');
                }
            })
        }, 30000)
    }

    var def = {
        typeName: 'flightMap',
        displayName: 'FlightMap',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: 'Images/ServelecControlsSmall.png',
        getDefaultConfig: function() {
            var config = PV.SymValueLabelOptions.getDefaultConfig({
                DataShape: 'Value',
                Height: 1000,
                Width: 1000,
                Fill: 'rgba(255,255,255,0)',
                Stroke: 'rgba(119,136,153,1)',
                ValueStroke: 'rgba(255,255,255,1)',
                ShowTime: true,
                IndicatorFillUp: 'white',
                IndicatorFillDown: 'white',
                IndicatorFillNeutral: 'gray',
                ShowDifferential: true,
                DifferentialType: 'percent',
                ShowIndicator: false,
                ShowValue: true,
                ShowTarget: true,
                url: "https://api.mapbox.com/styles/v1/james9005/cizjp9yg800692skfuidcqwkf/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXM5MDA1IiwiYSI6ImNpemd6eXVuMjAwM2QzM256OGw5bXNneWoifQ.W5ahILd1Gk2TO3nsj8rUsA"
            });
            return config;
        },
        templateUrl: 'scripts/app/editor/symbols/ext/sym-flightMap-template.html',
        visObjectType: symbolVis,
        configTemplateUrl: 'scripts/app/editor/symbols/ext/sym-flightMap-config.html',
        configTitle: PV.ResourceStrings.FormatValueOption,
        formatMap: {
            BackgroundColor: 'Fill',
            TextColor: 'Stroke',
            ValueColor: 'ValueStroke'
        },
        fontMetrics: {
            charHeight: 10,
            charMidHeight: 4,
            charWidth: 6.3
        }
    };
    PV.symbolCatalog.register(def);
})(window.PIVisualization);
