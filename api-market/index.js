const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");

const market = require("./router/market");

dotenv.config();
mongoose.connect(process.env.mongo_market).then(() => {console.log("api-market is connected to mongoDB")});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/market", market);

app.listen(8901, () => 
    {
        console.log("api-market is live");
    }
);