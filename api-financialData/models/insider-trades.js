const mongoose = require("mongoose");

const insiderTradesSchema = mongoose.Schema(
    {
        symbol: String,
        insider: String,
        relation: String,
        txDate: String,
        transactionType: String,
        ownType: String,
        sharesTraded: Number,
        lastPrice: Number,
        sharesHeld: Number
    }
);

module.exports = mongoose.model("insider-trades", insiderTradesSchema, "insider-trades");