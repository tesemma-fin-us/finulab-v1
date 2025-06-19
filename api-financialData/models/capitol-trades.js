const mongoose = require("mongoose");

const capitolTradesSchema = mongoose.Schema(
    {
        image: String,
        name: String,
        desc: Array,
        market: String,
        symbol: String,
        published: String,
        traded: String,
        filedAfter: String,
        owner: String,
        type: String,
        sizeLower: Number,
        sizeHigher: Number,
        price: Number
    }
);

module.exports = mongoose.model("capitol-trades", capitolTradesSchema, "capitol-trades");