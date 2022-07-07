//packages
const axios = require('axios')
const cheerio = require('cheerio')
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

const url =
  'https://www.amazon.sg/dp/B08HNRSVQP/?coliid=I2AUOUGDKVB1CD&colid=3PA5L4UDJ1RBC&ref_=lv_ov_lig_dp_it&th=1'

const product = { name: '', price: '', link: '' }

// Set interval for scraping
const handle = setInterval(scrape, 60000)

async function scrape() {
  // fetch the data from the url
  const { data } = await axios.get(url)
  // parse html with cheerio
  const $ = cheerio.load(data)
  const item = $('div#dp-container')
  // find the product name
  product.name = $(item).find('h1 span#productTitle').text()
  // find the product link
  product.link = url
  //find the product price
  const price = $(item)
    .find('span .a-price-whole')
    .first()
    .text()
    .replace(/[,.]/g, '')
  const priceNum = parseInt(price)
  product.price = priceNum
  console.log(product)

  // Send an SMS notification
  if (priceNum < 1000) {
    client.messages
      .create({
        body: `${product.name} went down to ${product.price} SGD. Purchase it at ${product.link}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.PHONE_NUMBER,
      })
      .then((message) => {
        console.log(message)
        clearInterval(handle)
      })
  }
}

scrape()
