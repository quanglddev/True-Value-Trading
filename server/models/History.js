// server/models/History.js
/*
 |--------------------------------------
 | History Model
 |--------------------------------------
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    ticker: { type: String, required: true },
    candles: { type: Array, default: [] },
    lastUpdatedTime: { type: Date, required: true },
});

module.exports = mongoose.model('History', eventSchema);
