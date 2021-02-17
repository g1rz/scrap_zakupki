
const Nightmare = require('nightmare');
const cheerio = require('cheerio');

let inn = 3808229774;
let inn2 = 1435193127;
const link = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${inn2}&morphology=on&recordsPerPage=50&af=on`;

var nightmare = Nightmare({ show: true });

nightmare
  .goto(link)
  
  .wait('body')
  .evaluate(() => document.querySelector('body').innerHTML)
  .end()
  .then(response => console.log(getData(response)))
  .catch(function (error) {
    console.error('Search failed:', error);
  });

const getData = (html) => {
    let $ = cheerio.load(html);
    let countPages = $(".pages li:last-of-type span").text();

    let activePage = Number($('.page__link_active span').text());

    let result = [];
            
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
        result.push(order);
    });

    return result;
}