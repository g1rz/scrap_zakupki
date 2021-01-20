let request = require("request"),
    cheerio = require("cheerio");

const fs = require('fs');
    
let inn = 3808229774;


getDataPromPage(inn);


function getDataPromPage(inn, page = 1) {
    return new Promise((resolve) => {
        let savedData = [];
        let countPages = 0;
        let i = 1;

        const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn}&morphology=on&pageNumber=${page}`;

        request(link, function (error, response, body) {
            if (error) {
                console.log(error);
                return error;
            }
                

            let $ = cheerio.load(body);
            let countPages = $(".pages li:last-of-type span").text();

            let activePage = Number($('.page__link_active span').text());
            
            $('.search-registry-entry-block').each(function (i, item) {
                order = {
                    id: (i + 1) * activePage,
                    orderID: $(item).find('.registry-entry__header-mid__number a').text().replace('\n', '').trim(),
                    link: $(item).find('.registry-entry__header-mid__number a').attr('href').replace('\n', '').trim(),
                    status: $(item).find('.registry-entry__header-mid__title').text().replace('\n', '').trim(),
                    object: $(item).find('.registry-entry__body-value').text().replace('\n', '').trim(),
                    owner: $(item).find('.registry-entry__body-href a').text().replace('\n', '').trim(),
                    price: $(item).find('.price-block__value').text().replace('\n', '').trim(),
                    dateStart: $(item).find('.data-block > .row .col-6:first-child .data-block__value').text().replace('\n', '').trim(),
                    dateUpdate: $(item).find('.data-block > .row .col-6:last-child .data-block__value').text().replace('\n', '').trim(),
                    dateEnd: $(item).find('.data-block > .data-block__value').text().replace('\n', '').trim(),
                }
                console.log(order);
            });
            
        });
    })
}