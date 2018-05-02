import csv from 'csvtojson';

export default class CSVParser {
  constructor() {}

  // CSV handler functions

  getAsText(fileToRead, callback) {
    const reader = new FileReader();
    // Read file into memory as UTF-8
    reader.readAsText(fileToRead);
    console.log('reading file');
    // Handle errors load
    reader.onload = event => {
      const csvString = event.target.result;
      const title = $('#csv_title').val();
      const unit = $('#csv_unit').val();
      this.processData(csvString, title, unit, dataset => {
        console.log(dataset);
        callback(dataset);
      });
    };
    reader.onerror = this.errorHandler;
  }

  processData(csvString, title, unit, callback) {
    let header;
    const customDataset = {
      title: title,
      unit: unit,
      data: []
    };

    csv({
      delimiter: ';'
    })
      .fromString(csvString, {
        encoding: 'utf8'
      })
      .on('header', parsedHeader => {
        console.log(parsedHeader);
        header = parsedHeader;
      })
      .on('csv', csvRow => {
        // Wenn die Row mit einer Zahl beginnt..
        if (!isNaN(Number(csvRow[0]))) {
          const cityObject = {
            RS: csvRow[0],
            AGS: csvRow[0],
            GEN: csvRow[1],
            data: {}
          };

          header.forEach((element, idx) => {
            if (!isNaN(Number(element)) && element !== '') {
              cityObject.data[`${element}`] = csvRow[idx].replace(',', '.');
            }
          }, this);

          customDataset.data.push(cityObject);
        }
      })
      .on('done', () => {
        callback(customDataset);
      });
  }

  errorHandler(evt) {
    if (evt.target.error.name === 'NotReadableError') {
      alert("Canno't read file !");
    }
  }
}
