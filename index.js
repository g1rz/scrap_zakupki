const osmosis = require('osmosis');

let inn = 3808229774;
const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn}&morphology=on`;

const fs = require('fs');

let i = 1;

let promise = new Promise((resolve) => {
    let savedData = [];
    osmosis
        .get(link)
        // .paginate('.paginator .pages > a[href]', 5)
        .find('.search-registry-entry-block')
        .set({
            orderID: '.registry-entry__header-mid__number a',
            link: '.registry-entry__header-mid__number a @href',
        })
        .data(function (data) {
            data.id = i++;
            console.log(data);
            savedData.push(data);
        })
        .log(console.log) // включить логи
        .error(console.error) // на случай нахождения ошибки
        .done(function () {
            resolve(savedData);
            // fs.writeFile('data.json', JSON.stringify(savedData, null, 4), function (err) {
            //     if (err) console.error(err);
            //     else console.log('Data Saved to data.json file');
            // });
        });
});

promise.then((data) => {
    fs.writeFile('data.json', JSON.stringify(data, null, 4), function (err) {
        if (err) console.error(err);
        else console.log('Data Saved to data.json file');
    });
});
