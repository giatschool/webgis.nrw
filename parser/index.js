const csvFilePath = '/Users/nico/Desktop/datasets/Wahlergebnisse_CDU_1976_bis_2013.csv'; // Bevölkerungsdaten
const csv = require('csvtojson');

const fs = require('fs');

let row = 0;

let parsedData = [];

csv({
        delimiter: ';',
    })
    .fromFile(csvFilePath, {
        encoding: 'utf8'
    })
    .on('csv', (csvRow) => {

        // Check auf Leerzeile
        if (csvRow[0] && !isNaN(Number(csvRow[0]))) {
            // Create JSON Object for Felix here
            var cityObject = {
                RS: csvRow[0], // == City ID
                AGS: csvRow[0], // == City ID, too
                GEN: csvRow[1],
                data: {}
            }

            // Fill data object from 2010 to 1962
            var endYear = 2010;
            for (let i = 0; i < 49; i++) {
                cityObject.data[`${endYear - i}`] = csvRow[2 + i];
            }
            parsedData.push(cityObject);
        }

        // Command to convert the csv to a useful encoding...
        // iconv -f ISO-8859-1 -t UTF-8//TRANSLIT 0_23211-01iz.csv > out.file
    })
    .on('done', (error) => {
        fs.writeFile('data.json', JSON.stringify(parsedData), 'utf8', () => {
            console.log('File written!');
        })
    })