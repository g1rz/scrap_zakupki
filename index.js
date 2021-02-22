const osmosis = require('osmosis');

let inn = 3808229774;
let inn2 = 1435193127;

const fs = require('fs');

const getFirstPageData = async (path, inn) => {
    return new Promise((resolve) => {
        let savedData = {
            orders: [],
        };
        let countPages = 0;
        let totalCount = '';
        let i = 1;
        osmosis
            .get(path)
            .delay(5000)
            .find('.search-registry-entry-block')
            .set({
                orderID: '.registry-entry__header-mid__number a',
                link: '.registry-entry__header-mid__number a @href',
                status: '.registry-entry__header-mid__title',
                object: '.registry-entry__body-value',

                price: '.price-block__value',
                dateStart: '.data-block > .row .col-6:first-child .data-block__value',
                dateUpdate: '.data-block > .row .col-6:last-child .data-block__value',
                dateEnd: '.data-block > .data-block__value',
            })
            .data(function (data) {
                data.id = i++;
                savedData.orders.push(data);
            })
            .find('.search-registry-entry-block:first-child')
            .set({
                owner: '.registry-entry__body-href a',
                ownerLink: '.registry-entry__body-href a @href',
            })
            .data(function (data) {
                savedData.inn = inn;
                savedData.owner = data.owner;
                savedData.ownerLink = data.ownerLink;
            })
            .find('.content-search-registry-block')
            .set({
                countPages: '.pages li:last-of-type',
                totalCount: '.search-results__total',
            })
            .data(function (data) {
                countPages = data.countPages;
                totalCount = data.totalCount;
            })
            .log(console.log) // включить логи
            .error(console.error) // на случай нахождения ошибки
            .done(function () {
                resolve({ data: savedData, countPages: countPages, totalCount: totalCount });
            });
    });
};

const getDataFromPage = async (path, page, inn) => {
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
                // owner: '.registry-entry__body-href a',
                // ownerLink: '.registry-entry__body-href a @href',
                price: '.price-block__value',
                dateStart: '.data-block > .row .col-6:first-child .data-block__value',
                dateUpdate: '.data-block > .row .col-6:last-child .data-block__value',
                dateEnd: '.data-block > .data-block__value',
            })
            .data(function (data) {
                data.id = i++;
                // data.inn = inn;
                savedData.push(data);
            })
            .log(console.log) // включить логи
            .error(console.error) // на случай нахождения ошибки
            .done(function () {
                resolve(savedData);
            });
    });
};

const getData = async (inn) => {
    const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn}&morphology=on&recordsPerPage=50&af=on`;

    return getFirstPageData(link, inn)
        .then((data) => {
            console.log(data.totalCount);
            return new Promise((resolve) => {
                let savedData = data.data; //[...data.data];

                if (data.countPages > 1) {
                    let requests = [];
                    for (let i = 2; i <= savedData.countPages; i++) {
                        requests.push(getDataFromPage(link, i, inn));
                    }
                    Promise.all(requests).then((responses) => {
                        responses.map((response) => {
                            savedData.orders = [...savedData.orders, ...response];
                        });
                        resolve(savedData);
                    });
                } else {
                    resolve(savedData);
                }
            });
        })
        .then((data) => {
            console.log('Количество записей: ' + data.length);
            return data;
        });
};

const getAll = async (arrInn) => {
    let dataInn = [];

    let requests = arrInn.map((inn) => {
        return getData(inn);
    });

    Promise.all(requests).then((responses) => {
        // responses.map(response => {
        //     dataInn = [...dataInn, ...response]
        // })
        fs.writeFile('data.json', JSON.stringify(responses, null, 4), function (err) {
            if (err) console.error(err);
            else console.log('Data Saved to data.json file');
        });
        return responses;
    });
};

getAll([inn]);
