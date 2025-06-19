const mongoose = require("mongoose");

const stockMarketOverviewSchema = mongoose.Schema(
    {
        totVolume: Number,
        totVolumeChg: Number,
        totMarketCap: Number,
        totMarketCapChg: Number,
        totGainLoss: Number,
        totGainLossChg: Number,
        absTotGainLoss: Number,
        fearGreedIndex: Number,
        dominance: Object,
        timeStamp: Number
    }
);

module.exports = mongoose.model("stock-market-overview", stockMarketOverviewSchema, "stock-market-overview");