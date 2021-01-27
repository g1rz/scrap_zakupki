const osmosis = require('osmosis');

let inn = 3808229774;
let inn2 = 1435193127;
const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn}&morphology=on&recordsPerPage=50`;

const fs = require('fs');

let getFirstPageData = function(path) {
    return  new Promise((resolve) => {
        let savedData = [];
        let countPages = 0;
        let i = 1;
        osmosis
            .get(path)
            .delay(10000)
            .find('.pages')
            .set({
                countPages: 'li:last-of-type',
            })
            .find('.search-registry-entry-block')
            .set({
                orderID: '.registry-entry__header-mid__number a',
                link: '.registry-entry__header-mid__number a @href',
                status: '.registry-entry__header-mid__title',
                object: '.registry-entry__body-value',
                owner: '.registry-entry__body-href a',
                price: '.price-block__value',
                dateStart: '.data-block > .row .col-6:first-child .data-block__value',
                dateUpdate: '.data-block > .row .col-6:last-child .data-block__value',
                dateEnd: '.data-block > .data-block__value',
            })
            .data(function (data) {
                data.id = i++;
                savedData.push(data);
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
        let i = (page - 1) * 50 + 1;
        let link = path + '&pageNumber=' + page;
        osmosis
            .get(link)
            .delay(5000)
            .find('.search-registry-entry-block')
            .set({
                orderID: '.registry-entry__header-mid__number a',
                link: '.registry-entry__header-mid__number a @href',
                status: '.registry-entry__header-mid__title',
                object: '.registry-entry__body-value',
                owner: '.registry-entry__body-href a',
                price: '.price-block__value',
                dateStart: '.data-block > .row .col-6:first-child .data-block__value',
                dateUpdate: '.data-block > .row .col-6:last-child .data-block__value',
                dateEnd: '.data-block > .data-block__value',
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

getFirstPageData(link)
    .then((data) => {

        return new Promise(resolve => {
            let orders = [...data.data];

            if (data.countPages > 1) {
                let requests = [];
            
                for (let i = 2; i <= data.countPages; i++) {
                    requests.push(getDataFromPage(link, i));
                }
            
                Promise.all(requests).then(responses => {
            
                    responses.map(response => {
                        orders = [...orders, ...response]
                    })
                    resolve(orders);
                    // fs.writeFile('data.json', JSON.stringify(orders, null, 4), function (err) {
                    //     if (err) console.error(err);
                    //     else console.log('Data Saved to data.json file');
                    // });
                    // console.log('Количество записей: ' + orders.length);
                })
            } else {
                resolve(orders);
            }
            
        });

    })
    .then(data => {
        console.log('Количество записей: ' + data.length);
    })
