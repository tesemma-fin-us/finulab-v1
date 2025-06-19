const mongoose = require("mongoose");

const cryptoMarketOverviewSchema = mongoose.Schema(
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

module.exports = mongoose.model("crypto-market-overview", cryptoMarketOverviewSchema, "crypto-market-overview");