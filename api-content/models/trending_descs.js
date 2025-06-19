const mongoose = require("mongoose");

const trendingDescsSchema = mongoose.Schema(
    {
        subjects: Array,
        timeStamp: Number
    }
);

module.exports = mongoose.model("trending_descs", trendingDescsSchema, "trending_descs");