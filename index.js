const osmosis = require('osmosis');

let inn = 3808229774;
const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn}&morphology=on`;

const fs = require('fs');
let savedData = [];

osmosis
    .get(link)
    .find('.search-registry-entrys-block')
    .set({ related: ['.registry-entry__form'] })
    .data(function (data) {
        console.log(data);
        savedData.push(data);
    })
    .done(function () {
        fs.writeFile('data.json', JSON.stringify(savedData, null, 4), function (err) {
            if (err) console.error(err);
            else console.log('Data Saved to data.json file');
        });
    });

// osmosis
//     .get('https://www.google.co.in/search?q=analytics')
//     .find('#botstuff')
//     .set({ related: ['.card-section .brs_col p a'] })
//     .data(function (data) {
//         console.log(data);
//     });
