const osmosis = require('osmosis');

let inn = 3808229774;
const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn}&morphology=on`;

const fs = require('fs');

let getFirstPageData = function(path) {
    return  new Promise((resolve) => {
        let savedData = [];
        let countPages = 0;
        let i = 1;
        osmosis
            .get(path)
            .find('.search-registry-entry-block')
            .set({
                orderID: '.registry-entry__header-mid__number a',
                link: '.registry-entry__header-mid__number a @href',
            })
            .data(function (data) {
                data.id = i++;
                savedData.push(data);
            })
            .find('.pages')
            .set({
                countPages: 'li:last-of-type',
            })
            .data(function (data) {
                countPages = data.countPages;
            })
            .log(console.log) // включить логи
            .error(console.error) // на случай нахождения ошибки
            .done(function () {
                resolve({data: savedData, countPages: countPages});
    
            });
    });
}

let getDataFromPage = function(path, page) {
    return new Promise((resolve) => {
        let savedData = [];
        let i = (page - 1) * 10 + 1;
        let link = path + '&pageNumber=' + page;
        osmosis
            .get(link)
            .delay(2000)
            .find('.search-registry-entry-block')
            .set({
                orderID: '.registry-entry__header-mid__number a',
                link: '.registry-entry__header-mid__number a @href',
            })
            .data(function (data) {
                data.id = i++;
                savedData.push(data);
            })
            .log(console.log) // включить логи
            .error(console.error) // на случай нахождения ошибки
            .done(function () {
                resolve(savedData);
            });
    });
}

getFirstPageData(link).then((data) => {

    let orders = [...data.data];
    let requests = [];

    for (let i = 2; i <= data.countPages; i++) {
        requests.push(getDataFromPage(link, i));
    }

    Promise.all(requests).then(responses => {

        responses.map(response => {
            orders = [...orders, ...response]
            // orders.push(response)
        })
        // console.log(orders);
        fs.writeFile('data.json', JSON.stringify(orders, null, 4), function (err) {
            if (err) console.error(err);
            else console.log('Data Saved to data.json file');
        });
        console.log('Количество записей: ' + orders.length);
    })

    
});

// getDataFromPage(link, 3).then((data) => {
//     fs.writeFile('data.json', JSON.stringify(data, null, 4), function (err) {
//         if (err) console.error(err);
//         else console.log('Data Saved to data.json file');
//     });
//     console.log(data);
// });





