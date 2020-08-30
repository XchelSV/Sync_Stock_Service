const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
fs.readFile(__dirname + '/xmls/MTSPORTT0140120200802.xml', function(err, data) {
    parser.parseString(data, function (err, json_file) {
        fs.writeFile(__dirname + '/xmls/MTSPORTT0140120200802.json', JSON.stringify(json_file) , function(err, data) {
            return null;
        })
    })
})