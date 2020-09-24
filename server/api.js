// server/api.js
/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

const axios = require('axios').default;
const History = require('./models/History');
const CONFIG = require('./config');

/*
 |--------------------------------------
 | Authentication Middleware
 |--------------------------------------
 */

// GET from TDAmeritrade
function pullLatest5DaysPrice(ticker) {
    return new Promise((resolve, reject) => {
        const endpoint = `https://api.tdameritrade.com/v1/marketdata/${ticker}/pricehistory`;

        const payload = {
            apikey: CONFIG.client_id,
            periodType: 'day',
            frequencyType: 'minute',
            frequency: '30',
            period: 5,
            needExtendedHoursData: 'false'
        };

        axios.get(endpoint, { params: payload }).then((response) => {
            console.log("functionpullLatest5DaysPrice -> response", response.data)
            resolve(response.data.candles);
        }).catch((error) => {
            reject(error);
        });
    });
}

function extractDataBasedOnPeriods(priceHistory, period) {
    const latestDay = new Date(priceHistory.candles[priceHistory.candles.length - 1].datetime).getDate();
    priceHistory.candles = priceHistory.candles.filter((candle) => (new Date(candle.datetime).getDate() + period) - latestDay >= 0)
}

module.exports = function (app, config) {

    /*
     |--------------------------------------
     | API Routes
     |--------------------------------------
     */

    // GET price history from MongoDB or TDAmeritrade
    app.get('/api/pricehistory/:ticker/:period', (req, res) => {
        console.log('yeah')
        History.find({ ticker: req.params.ticker }, (err, priceHistories) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (priceHistories) {
                if (priceHistories.length === 0) {
                    pullLatest5DaysPrice(req.params.ticker).then((candles) => {
                        const newHistory = new History({
                            ticker: req.params.ticker,
                            candles: candles,
                            lastUpdatedTime: new Date(),
                        });
                        newHistory.save((err) => {
                            if (err) {
                                console.log('err', err);
                                return res.status(500).send({ message: err.message });
                            }
                            return res.send(newHistory);
                        });
                    }).catch((err) => {
                        console.log("err", err)
                        return res.status(404).send({ message: err });
                    })
                }
                else {
                    const differenceInTime = new Date().getTime() - new Date(priceHistories[0].lastUpdatedTime).getTime();
                    const differenceInEvery3Hours = differenceInTime / (1000 * 3600 * 3);
                    if (differenceInEvery3Hours > 1) {
                        // Needs to pull new data
                        pullLatest5DaysPrice(req.params.ticker).then((candles) => {
                            priceHistories[0].candles = candles;
                            priceHistories[0].lastUpdatedTime = new Date();
                            priceHistories[0].save((err) => {
                                if (err) {
                                    console.log('err', err);
                                    return res.status(500).send({ message: err.message });
                                }
                                // extractDataBasedOnPeriods(priceHistories[0], req.params.period)
                                return res.send(priceHistories[0]);
                            });
                        });
                    }
                    else {
                        return res.send(priceHistories[0]);
                    }
                }
            }
        });
    });

    // GET API root
    app.get('/api/', (req, res) => {
        res.send('API works');
    });

};