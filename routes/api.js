'use strict';

var expect = require('chai').expect;
const mongodb = require('mongodb')
const mongoose = require('mongoose')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

module.exports = function (app) {
  
  const url = "mongodb+srv://lntshiba021:" + process.env.PW + "@cluster0.qwj3cvv.mongodb.net/stockchecker?retryWrites=true&w=majority";
  mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
  
  let stockSchema = new mongoose.Schema({
    name: {type: String, required: true},
    likes: {type: Number, default: 0},
    ips: [String]
  })

  let Stock = mongoose.model('Stock', stockSchema)

  app.route('/api/stock-prices')
    .get(function (req, res){
      let response = {}
      response['stockData'] = {}

      let twoStocks = false

      let outputResponse = () => {
        return res.json(response)
      }
      
      let findOrUpdateStock = (stockName, documentUpdate, nextStep) => {
          Stock.findOneAndUpdate(
            {name: stockName},
            documentUpdate,
            {new: true, upsert: true},
            (error, stockDocument) => {
              if (error){
                console.log(error)
              }else if (!error && stockDocument){
                if (twoStocks == false){
                  return nextStep(stockDocument, processOneStock)
                }
              }
            }
          )
      }

      const likeStock = (stockName, nextStep) => {

      }
      const getPrice = (stockDocument, nextStep) => {
        var xhr = new XMLHttpRequest()
        var requestUrl = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/' + stockDocument['name'] + '/quote'
        xhr.open('GET', requestUrl, true)
        xhr.onload = () => {
          let apiResponse = JSON.parse(xhr.responseText)
          stockDocument['price'] = apiResponse['latestPrice'].toFixed(2)
          nextStep(stockDocument,outputResponse)
        }
        xhr.send()
      }

      const processOneStock = (stockDocument, nextStep) => {
        response['stockData']['stock'] = stockDocument['name']
        response['stockData']['price'] = stockDocument['price']
        response['stockData']['likes'] = stockDocument['likesc']
        nextStep()
      }

      let stocks = []

      let processTwoStocks = (stockDocument, nextStep) => {

      }

      if (typeof (req.query.stock) == 'string'){
        let stockName = req.query.stock
        let documentUpdate = {}
        findOrUpdateStock(stockName, documentUpdate, getPrice)


       }else if (Array.isArray(req.query.stock)){
        twoStocks = true
      }
    });
    
};
