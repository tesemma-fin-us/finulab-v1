const mongoose = require("mongoose");

const earningsCalendarSchema = mongoose.Schema(
    {
        date: String,
        lastYearRptDt: String,
        lastYearEPS: Number,
        time: String,
        symbol: String,
        name: String,
        marketCap: Number,
        fiscalQuarterEnding: String,
        epsForecast: String,
        noOfEsts: String
    }
);

module.exports = mongoose.model("earnings-calendar", earningsCalendarSchema, "earnings-calendar");