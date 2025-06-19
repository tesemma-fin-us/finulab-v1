const mongoose = require("mongoose");

const institutionalTradesSchema = mongoose.Schema(
    {
        symbol: String,
        ownerName: String,
        txDate: String,
        sharesHeld: Number,
        sharesChange: Number,
        sharesChangePCT: Number,
        marketValue: Number
    }
);

module.exports = mongoose.model("institutional-trades", institutionalTradesSchema, "institutional-trades");