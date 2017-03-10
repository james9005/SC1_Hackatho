/*
Author      - Alexander Dixon
Symbol      - scEFTable
Revision    - R0.1

*/
// TODO: (JT) load each event frame into the table. (Between a certain time?).
(function (CS) {
    function symbolVis() { }
    var tabledata = [];
    CS.deriveVisualizationFromBase(symbolVis);

	symbolVis.prototype.init = function (scope) {
        this.onDataUpdate = dataUpdate;
        //this will be updated everytime 'data' is updated? Could limit the time by using a setInterval from the init() (like in flightMap)

        // Make Get Request FOR ALL EVENT frames
        $.get('https://pisrv01.pischool.int/piwebapi/assetdatabases/D0_BJ6yxOWfEu1XN8dxGow1gy3WkCfmin0CFPHi0tWC1ywUElTUlYwMVxIQUNLQVRIT04/eventframes', function (data) {
            for (var i = 0; i < data.Items.length; i++) {
                getDictionaryFromEventFrame('https://pisrv01.pischool.int/piwebapi/streamsets/' + data.Items[i].WebId + '/value');
            }
        })

        setInterval(function () {

            tabledata = [];
            $.get('https://pisrv01.pischool.int/piwebapi/assetdatabases/D0_BJ6yxOWfEu1XN8dxGow1gy3WkCfmin0CFPHi0tWC1ywUElTUlYwMVxIQUNLQVRIT04/eventframes', function (data) {
                for (var i = 0; i < data.Items.length; i++) {
                    getDictionaryFromEventFrame('https://pisrv01.pischool.int/piwebapi/streamsets/' + data.Items[i].WebId + '/value');
                }
            })
        }, 30000);

        function dataUpdate(data) {
            if(data) {

                if(tabledata.length > 0){
                    scope.drawdata = tabledata;

                }

            }
        }
        // console.log('hello');

        function getDictionaryFromEventFrame(url) {
            var dict = {}
            $.get(url, function (data) {
                for (var i = 0; i < data.Items.length; i++) {
                    dict[data.Items[i].Name] = data.Items[i].Value.Value;
                }
                console.log('object containing the data..');
                console.log(dict);

                tabledata.push([dict['flightnumber'], dict['STD'], dict['ETA'], dict['Routing'],Math.round(dict['currentlat']*100)/100 + "," + Math.round(dict['currentlon']*100)/100,dict['altitude'], dict['Heading'], dict['speed'], dict['squawk'] ]);

            })

        }


    };

    var definition = {
        typeName: 'scEFTable',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
	iconUrl: 'Images/ServelecControlsSmall.png',
        visObjectType: symbolVis,
        getDefaultConfig: function() {
    	    return {
    	        DataShape: 'Value',
    	        Height: 150,
                Width: 1500,
                BackgroundColor: 'rgb(255,0,0)',
                TextColor: 'rgb(0,255,0)'
            };
        },
        configTitle: 'Format Symbol',
        StateVariables: [ 'MultistateColor' ]
    };

    CS.symbolCatalog.register(definition);
})(window.PIVisualization);
