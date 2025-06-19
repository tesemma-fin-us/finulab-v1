const axios = require("axios");
const dotenv = require("dotenv");
const datefns = require("date-fns");
const router = require("express").Router();

const cryptosDesc = require("../models/cryptos-descs");
const watchlistDesc = require("../models/watchlist-descs");
const cryptosActivityDesc = require("../models/cryptos-activity");

const cryptoMarketOverview = require("../models/crypto-market-overview");

dotenv.config();

const parseResolution = (input) => {
    const match = input.match(/^(\d+)([a-zA-Z])?$/);
    if(match) {
        const numberPart = match[1]; // The number part (digits)
        const letterPart = match[2] || ''; // The letter part (if exists)
        return { numberPart, letterPart };
    } else {
        return null; // In case the input doesn't match the expected pattern
    }
}

router.put("/details/", async (req, res) => 
    {
        try {
            const q = `${req.query.q}`;
            const result = await axios.put(`http://localhost:8802/api/cryptoDataFeed/search?q=${q}`);

            if(result.data["data"].length === 0) {
                return res.status(200).json(result.data);
            } else {
                let query_cryptos = [];
                for(let i = 0; i < result.data["data"].length; i++) {
                    query_cryptos.push(result.data["data"][i]["symbol"]);
                }

                const support = await cryptosActivityDesc.find(
                    {
                        symbol: {$in: query_cryptos}
                    }
                ).lean();

                let data = [];
                for(let j = 0; j < result.data["data"].length; j++) {
                    const filteredSupport = support.filter(symblDesc => symblDesc.symbol === result.data["data"][j]["symbol"]);
                    if(filteredSupport.length > 0) {
                        data.push(
                            {
                                ...result.data["data"][j],
                                ...filteredSupport[0]
                            }
                        );
                    }
                }

                return res.status(200).json({"status": "success", "data": data});
            }
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/quick-descs", async (req, res) => 
    {
        try {
            const symbols = req.body.symbols;
            if(!Array.isArray(symbols)) {return res.status(200).json({"status": "error"});}
            if(symbols.length === 0) {return res.status(200).json({"status": "error"});}

            const data = await cryptosDesc.find(
                {
                    symbol: {$in: symbols}
                }
            ).select(`_id symbol name profileImage description`).exec();

            const support = await cryptosActivityDesc.find(
                {
                    symbol: {$in: symbols}
                }
            );

            return res.status(200).json({"status": "success", "data": data, "support": support});
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/description/:symbol", async (req, res) => 
    {
        try {
            const symbol = req.params.symbol;
            if(symbol.slice(0, 1) === "C") {
                await cryptosDesc.findOne(
                    {
                        symbol: symbol.slice(3, symbol.length)
                    }
                ).then(
                    (cryptoData) => {
                        if(!cryptoData) {return res.status(200).json({"status": "error"});}
                        if(cryptoData) {
                            const linkMap = ["website", "blockExplorer", "whitePaper", "sourceCode"];
                            const relevantLinks = [cryptoData.website, cryptoData.blockExplorer, cryptoData.whitePaper, cryptoData.sourceCode];
                            
                            let returnRelevantLinks = [];
                            for(let i = 0; i < relevantLinks.length; i++) {
                                if(relevantLinks[i] !== "") {
                                    returnRelevantLinks.push([linkMap[i], relevantLinks[i]]);
                                }
                            }

                            return res.status(200).json(
                                {
                                    "status": "success",
                                    "data": {
                                        "symbol": String(symbol),
                                        "name": cryptoData.name,
                                        "description": cryptoData.description,
                                        "circulatingSupply": cryptoData.circulatingSupply,
                                        "totalSupply": cryptoData.totalSupply,
                                        "maxSupply": cryptoData.maxSupply,
                                        "ath": cryptoData.ath,
                                        "atl": cryptoData.atl,
                                        "avgVol": cryptoData.avgVol,
                                        "profileImage": cryptoData.profileImage,
                                        "tradingActivity": cryptoData.priceTargets.length > 0 ? cryptoData.priceTargets[0] : {},
                                        "recommendations": cryptoData.recommendations,
                                        "relevantLinks": returnRelevantLinks,
                                        "watchedBy": cryptoData.watchlistCount
                                    }
                                }
                            )
                        }
                    }
                )
            } else {
                return res.status(200).json({"status": "error"});
            }
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/rankings", async (req, res) => 
    {
        try {
            let query;
            const sortBy = `${req.body.sortBy}`;
            if(sortBy === "marketCap") {
                query = {marketCap: -1};
            } else if(sortBy === "activity") {
                query = {volume: -1};
            } else if(sortBy === "winners") {
                query = {changePerc: -1};
            } else if(sortBy === "losers") {
                query = {changePerc: 1};
            } else {return res.status(200).json({"status": "error"});}

            const marketData = await cryptosActivityDesc.find({}).sort(query).limit(50);

            if(marketData.length === 0) {
                setTimeout(async () => {
                    const marketDataV2 = await cryptosActivityDesc.find({}).sort(query).limit(50);
                    return res.status(200).json({"status": "success", "data": marketDataV2});
                }, 1500);
            } else {return res.status(200).json({"status": "success", "data": marketData});}
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/finux-quote", async (req, res) => 
    {
        try {
            const finuxQuote = await cryptosActivityDesc.findOne(
                {
                    symbol: "FINUX"
                }
            );
            
            return res.status(200).json({"status": "success", "data": finuxQuote});
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/watchlist", async (req, res) => 
    {
        try {
            if(Array.isArray(req.body.watching)) {
                const marketSymbols = ["BTC", "ETH", "KDA", "FINUX"];

                if(req.body.watching.length === 0) {
                    const marketData = await cryptosActivityDesc.find(
                        {
                            symbol: {$in: marketSymbols}
                        }
                    ).sort({marketCap: -1});

                    const moreCryptos = await cryptosActivityDesc.find(
                        {
                            symbol: {$nin: marketSymbols}
                        }
                    ).sort({marketCap: -1}).limit(15);

                    return res.status(200).json({"status": "success", "market": marketData, "more": moreCryptos});
                } else {
                    let userWatching = [];
                    for(let i = 0; i < req.body.watching.length; i++) {
                        if(!marketSymbols.includes(req.body.watching[i])) {
                            userWatching.push(req.body.watching[i]);
                        }
                    }

                    const marketData = await cryptosActivityDesc.find(
                        {
                            symbol: {$in: marketSymbols}
                        }
                    ).sort({marketCap: -1});
                    const userCryptos = await cryptosActivityDesc.find(
                        {
                            symbol: {$in: userWatching}
                        }
                    );
                    const moreCryptos = await cryptosActivityDesc.find(
                        {
                            symbol: {$nin: marketSymbols.concat(userWatching)}
                        }
                    ).sort({marketCap: -1}).limit(15);

                    return res.status(200).json({"status": "success", "market": marketData, "watching": userCryptos , "more": moreCryptos});
                }
            } else {return res.status(200).json({"status": "error"});}
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

//https://dexapi.kadena.fun/udf/history?symbol=HERON%3AUSD%3AMERCATUS&resolution=60&from=1745613869&to=1746798269&countback=329

router.put("/price-history", async (req, res) => 
    {
        try {
            const to = req.body.to;
            const from = req.body.from;
            const symbol = `${req.body.symbol}`;
            const countBack = req.body.countBack;
            const resolution = parseResolution(req.body.resolution);

            const symbolDesc = await cryptosDesc.findOne({symbol: symbol});
            if(!symbolDesc) return res.status(200).json({"status": "error"});

            if(symbol === "FINUX") {
                let utilize_resolution = "";
                const diff_to_from = (to - from) / 86400;

                if(diff_to_from <= 7) {
                    utilize_resolution = "5";
                } else if(diff_to_from <= 365) {
                    utilize_resolution = "60";
                } else {
                    utilize_resolution = "1D";
                }

                try {
                    const cmcUrl = `https://dexapi.kadena.fun/udf/history?symbol=FINX%3AUSD%3AMERCATUS&resolution=${utilize_resolution}&from=${from}&to=${to}&countback=${countBack}`;
                    const cmcPriceData = await axios.get(cmcUrl, 
                        {
                            headers: {
                                "Accept": "application/json, text/plain, *"/"*",
                                "Origin": "https://www.mercatus.works",
                                "Referer": "https://www.mercatus.works/",
                                "Cache-Control": "no-cache",
                                "Accept-Language": "en-US,en;q=0.9",
                                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Connection": "keep-alive",
                                "platform": "web"
                            }
                        }
                    );

                    let priceHistory = [];
                    if(cmcPriceData.data["s"] === "ok") {
                        const increment = (to - from) / cmcPriceData.data["c"].length;
                        for(let i = 0; i < cmcPriceData.data["c"].length; i++) {
                            priceHistory.push(
                                {
                                    "o": cmcPriceData.data["o"][i],
                                    "h": cmcPriceData.data["h"][i],
                                    "l": cmcPriceData.data["l"][i],
                                    "c": cmcPriceData.data["c"][i],
                                    "v": cmcPriceData.data["v"][i],
                                    "t": Math.floor(from + (i * increment)) * 1000
                                }
                            );
                        }

                        let adjustedPriceHistory = [];
                        if(priceHistory.length < countBack) {
                            adjustedPriceHistory = Array(countBack - priceHistory.length).fill().map((_, index) => {
                                const firstElement = priceHistory[0];
                        
                                return {
                                    "o": firstElement["c"],
                                    "h": firstElement["c"],
                                    "l": firstElement["c"],
                                    "c": firstElement["c"],
                                    "v": firstElement["v"],
                                    "t": (Math.floor(from) * 1000), //(to - (increment * i)) * 1000
                                };
                            }).concat(
                                [
                                    ...priceHistory
                                ]
                            );
                        } else {
                            adjustedPriceHistory = priceHistory;
                        }

                        return res.status(200).json({"status": "success", "data": adjustedPriceHistory});
                    } else { return res.status(200).json({"status": "error"}); }
                } catch(error) { console.log(error); return res.status(200).json({"status": "error"}); }
            } else {
                let range = "";
                let rangeInt = (to - from) / 86400;
                rangeInt <= 2 ? range = "1D" : 
                    rangeInt <= 14 ? range = "7D" :
                    rangeInt <= 59 ? range = "1M" :
                    rangeInt <= 500 ? range = "1Y" : range = "ALL";

                let timeSpan = "", multiplier = "";
                if(resolution === null || resolution === undefined) {
                    return res.status(200).json({"status": "error"});
                } else if(Object.keys(resolution).length === 0) {
                    return res.status(200).json({"status": "error"});
                } else {
                    if(resolution.letterPart === '') {
                        timeSpan = "minute";
                    } else if(resolution.letterPart === 'S') {
                        timeSpan = "second";
                    } else if(resolution.letterPart === 'D') {
                        timeSpan = "day";
                    } else if(resolution.letterPart === 'W') {
                        timeSpan = "week";
                    } else if(resolution.letterPart === 'M') {
                        timeSpan = "month";
                    } else if(resolution.letterPart === 'Y') {
                        timeSpan = "year";
                    } else {
                        return res.status(500).json({"status": "error"});
                    }
                    multiplier = resolution.numberPart;
                }

                const cmcIndex = symbolDesc["cmcIndex"];
                const polygonIoTicker = symbolDesc["polygonIoTicker"];

                let priceHistory = [];
                if(polygonIoTicker === "") {
                    try {
                        const cmcUrl = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${cmcIndex}&range=${range}`;
                        const cmcPriceData = await axios.get(cmcUrl, 
                            {
                                headers: {
                                    "Accept": "application/json, text/plain, *"/"*",
                                    "Origin": "https://coinmarketcap.com",
                                    "Referer": "https://coinmarketcap.com/",
                                    "Cache-Control": "no-cache",
                                    "Host": "api.coinmarketcap.com",
                                    "Accept-Language": "en-US,en;q=0.9",
                                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "Connection": "keep-alive",
                                    // "x-request-id": "d04b5f188afe492f93e023b230dcb391",
                                    "platform": "web"
                                }
                            }
                        );

                        if(cmcPriceData.data["status"]["error_message"] === "SUCCESS") {
                            const cmcKeys = Object.keys(cmcPriceData.data["data"]["points"]);
                            const increment = (to - from) / cmcKeys.length;
                            for(let i = 0; i < cmcKeys.length; i++) {
                                priceHistory.push(
                                    {
                                        "o": i === 0 ? 
                                            cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0] : cmcPriceData.data["data"]["points"][cmcKeys[i - 1]]["v"][0],
                                        "h": i === 0 ? 
                                            Math.max(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i + 1]]["v"][0]) :
                                            i === cmcKeys.length - 1 ?   Math.max(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i - 1]]["v"][0]) :
                                            Math.max(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i - 1]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i + 1]]["v"][0]),
                                        "l": i === 0 ? 
                                            Math.min(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i + 1]]["v"][0]) :
                                            i === cmcKeys.length - 1 ?   Math.min(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i - 1]]["v"][0]) :
                                            Math.min(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i - 1]]["v"][0], cmcPriceData.data["data"]["points"][cmcKeys[i + 1]]["v"][0]),
                                        "c": cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0],
                                        "v": cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][1],
                                        "t": Math.floor(from + (i * increment)) * 1000 //Math.floor(Number(cmcKeys[i])) * 1000
                                    }
                                );
                            }

                            let adjustedPriceHistory = [];
                            if(priceHistory.length < countBack) {
                                adjustedPriceHistory = Array(countBack - priceHistory.length).fill().map((_, index) => {
                                    const firstElement = priceHistory[0];
                            
                                    return {
                                        "o": firstElement["c"],
                                        "h": firstElement["c"],
                                        "l": firstElement["c"],
                                        "c": firstElement["c"],
                                        "v": firstElement["v"],
                                        "t": (Math.floor(from) * 1000), //(to - (increment * i)) * 1000
                                    };
                                }).concat(
                                    [
                                        ...priceHistory
                                    ]
                                );
                            } else {
                                adjustedPriceHistory = priceHistory;
                            }

                            return res.status(200).json({"status": "success", "data": adjustedPriceHistory});
                        } else { return res.status(200).json({"status": "error"}); }
                    } catch(error) { return res.status(200).json({"status": "error"}); }
                } else {
                    const to_date = to * 1000;
                    const from_date = from * 1000;
                    const apiKey = process.env.polygon_io_api_key;
                    
                    const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${polygonIoTicker}/range/${multiplier}/${timeSpan}/${from_date}/${to_date}?adjusted=true&sort=asc&limit=50000&apikey=${apiKey}`;
                    const polygonPriceData = await axios.get(polygonUrl);

                    if(polygonPriceData.data["status"] === "OK") {
                        priceHistory = polygonPriceData.data["results"];

                        let adjustedPriceHistory = [];
                        if(priceHistory.length < countBack) {
                            adjustedPriceHistory = Array(countBack - priceHistory.length).fill().map((_, index) => {
                                const firstElement = priceHistory[0];
                        
                                return {
                                    "c": firstElement["c"],
                                    "h": firstElement["c"],
                                    "l": firstElement["c"],
                                    "n": 0,
                                    "o": firstElement["c"],
                                    "t": firstElement["t"], /*- (n * (secondElement["t"] - firstElement["t"])),*/
                                    "v": 0,
                                    "vw": 0
                                };
                            }).concat(
                                [
                                    ...priceHistory
                                ]
                            );
                        } else {
                            adjustedPriceHistory =  priceHistory;
                        }

                        return res.status(200).json({"status": "success", "data": adjustedPriceHistory});
                    } else { return res.status(200).json({"status": "error"}); }
                }
            }
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/quote", async (req, res) => 
    {
        try {
            const symbol = `${req.body.symbol}`;

            const symbolDesc = await cryptosDesc.findOne({symbol: symbol});
            if(!symbolDesc) return res.status(200).json({"status": "error"});

            if(symbol === "FINUX") {
                try {
                    const now = new Date();
                    const yesterdayNow = datefns.add(now, {"days": -1});
                    const nowFormatted = datefns.format(now, "yyyy-MM-dd");
                    const yesterdayNowFormatted = datefns.format(yesterdayNow, "yyyy-MM-dd");

                    const mercatusUrl = `https://dexapi.kadena.fun/candles?dateStart=${yesterdayNowFormatted}&dateEnd=${nowFormatted}%20%20&currency=coin&asset=free.finux`
                    const mercatusPriceData = await axios.get(mercatusUrl, 
                        {
                            headers: {
                                "Accept": "application/json, text/plain, *"/"*",
                                "Origin": "https://www.mercatus.works",
                                "Referer": "https://www.mercatus.works/",
                                "Cache-Control": "no-cache",
                                "Accept-Language": "en-US,en;q=0.9",
                                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Connection": "keep-alive",
                                "platform": "web"
                            }
                        }
                    );

                    return res.status(200).json(
                        {
                            "status": "success", 
                            "data": {
                                "open": mercatusPriceData.data[mercatusPriceData.data.length - 1]["usdPrice"]["open"],
                                "low": mercatusPriceData.data[mercatusPriceData.data.length - 1]["usdPrice"]["low"],
                                "high": mercatusPriceData.data[mercatusPriceData.data.length - 1]["usdPrice"]["high"],
                                "close": mercatusPriceData.data[mercatusPriceData.data.length - 1]["usdPrice"]["close"],
                                "volume": mercatusPriceData.data[mercatusPriceData.data.length - 1]["volume"]
                            }
                        }
                    );
                } catch(error) {return res.status(200).json({"status": "error"});}
            } else {
                const cmcIndex = symbolDesc["cmcIndex"];
                const polygonIoTicker = symbolDesc["polygonIoTicker"];

                if(polygonIoTicker === "") {
                    try {
                        const cmcUrl = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${cmcIndex}&range=1D`;
                        const cmcPriceData = await axios.get(cmcUrl, 
                            {
                                headers: {
                                    "Accept": "application/json, text/plain, *"/"*",
                                    "Origin": "https://coinmarketcap.com",
                                    "Referer": "https://coinmarketcap.com/",
                                    "Cache-Control": "no-cache",
                                    "Host": "api.coinmarketcap.com",
                                    "Accept-Language": "en-US,en;q=0.9",
                                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "Connection": "keep-alive",
                                    // "x-request-id": "d04b5f188afe492f93e023b230dcb391",
                                    "platform": "web"
                                }
                            }
                        );
    
                        if(cmcPriceData.data["status"]["error_message"] === "SUCCESS") {
                            let low = 0, high = 0;
                            const cmcKeys = Object.keys(cmcPriceData.data["data"]["points"]);
                            for(let i = 0; i < cmcKeys.length; i++) {
                                if(cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"] === null || cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"] === undefined) continue;
    
                                if(i === 0) {
                                    low = cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0];
                                    high = cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0];
                                } else {
                                    if(low > cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0]) {
                                        low = cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0];
                                    }
    
                                    if(high < cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0]) {
                                        high = cmcPriceData.data["data"]["points"][cmcKeys[i]]["v"][0];
                                    }
                                }
                            }
    
                            return res.status(200).json(
                                {
                                    "status": "success", 
                                    "data": {
                                        "open": cmcPriceData.data["data"]["points"][cmcKeys[0]]["v"][0],
                                        "low": low,
                                        "high": high,
                                        "close": cmcPriceData.data["data"]["points"][cmcKeys[cmcKeys.length - 1]]["v"][0],
                                        "volume": cmcPriceData.data["data"]["points"][cmcKeys[cmcKeys.length - 1]]["v"][1]
                                    }
                                }
                            );
                        } else { return res.status(200).json({"status": "error"}); }
                    } catch(error) { return res.status(200).json({"status": "error"}); }
                } else {
                    const endDate = new Date();
                    const apiKey = process.env.polygon_io_api_key;
                        
                    let startDate = datefns.add(endDate, {"hours": -48});
                    let formattedEndDate = datefns.getUnixTime(endDate) * 1000;
                    let formattedStartDate = datefns.getUnixTime(startDate) * 1000;
    
                    const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${polygonIoTicker}/range/1/day/${formattedStartDate}/${formattedEndDate}?adjusted=true&sort=asc&limit=50000&apikey=${apiKey}`;
                    const polygonPriceData = await axios.get(polygonUrl);
    
                    if(polygonPriceData.data["status"] === "OK") {
                        const priceHistory = polygonPriceData.data["results"];
                        return res.status(200).json(
                            {
                                "status": "success", 
                                "data": {
                                    "open": priceHistory[priceHistory.length - 1]["o"],
                                    "low": priceHistory[priceHistory.length - 1]["l"],
                                    "high": priceHistory[priceHistory.length - 1]["h"],
                                    "close": priceHistory[priceHistory.length - 1]["c"],
                                    "volume": priceHistory[priceHistory.length - 1]["v"]
                                }
                            }
                        );
                    } else { return res.status(200).json({"status": "error"}); }
                }
            }
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/historical", async (req, res) => 
    {
        try {
            const to = req.body.to;
            const from = req.body.from;
            const symbol = req.body.symbol;

            const symbolDesc = await cryptosDesc.findOne({symbol: symbol});
            if(!symbolDesc) return res.status(200).json({"status": "error"});

            if(symbol === "FINUX") {
                let utilize_resolution = "";
                const diff_to_from = (to - from) / 86400;

                if(diff_to_from <= 7) {
                    utilize_resolution = "5";
                } else if(diff_to_from <= 365) {
                    utilize_resolution = "60";
                } else {
                    utilize_resolution = "1D";
                }

                try {
                    const cmcUrl = `https://dexapi.kadena.fun/udf/history?symbol=FINX%3AUSD%3AMERCATUS&resolution=${utilize_resolution}&from=${from}&to=${to}&countback=${countBack}`;
                    const cmcPriceData = await axios.get(cmcUrl, 
                        {
                            headers: {
                                "Accept": "application/json, text/plain, *"/"*",
                                "Origin": "https://www.mercatus.works",
                                "Referer": "https://www.mercatus.works/",
                                "Cache-Control": "no-cache",
                                "Accept-Language": "en-US,en;q=0.9",
                                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Connection": "keep-alive",
                                "platform": "web"
                            }
                        }
                    );
                    
                    let priceHistory = [];
                    if(cmcPriceData.data["s"] === "ok") {
                        const increment = (to - from) / cmcPriceData.data["c"].length;
                        for(let i = 0; i < cmcPriceData.data["c"].length; i++) {
                            priceHistory.push(
                                {
                                    "o": cmcPriceData.data["o"][i],
                                    "h": cmcPriceData.data["h"][i],
                                    "l": cmcPriceData.data["l"][i],
                                    "c": cmcPriceData.data["c"][i],
                                    "v": cmcPriceData.data["v"][i],
                                    "t": Math.floor(from + (i * increment)) * 1000
                                }
                            );
                        }

                        let adjustedPriceHistory = [];
                        if(priceHistory.length < countBack) {
                            adjustedPriceHistory = Array(countBack - priceHistory.length).fill().map((_, index) => {
                                const firstElement = priceHistory[0];
                        
                                return {
                                    "o": firstElement["c"],
                                    "h": firstElement["c"],
                                    "l": firstElement["c"],
                                    "c": firstElement["c"],
                                    "v": firstElement["v"],
                                    "t": (Math.floor(from) * 1000), //(to - (increment * i)) * 1000
                                };
                            }).concat(
                                [
                                    ...priceHistory
                                ]
                            );
                        } else {
                            adjustedPriceHistory = priceHistory;
                        }

                        return res.status(200).json({"status": "success", "data": adjustedPriceHistory});
                    } else { return res.status(200).json({"status": "error"}); }
                } catch(error) { console.log(error); return res.status(200).json({"status": "error"}); }
            } else {
                const cmcIndex = symbolDesc["cmcIndex"];
                const polygonIoTicker = symbolDesc["polygonIoTicker"];

                let priceHistory = [];
                if(polygonIoTicker === "") {
                    const cmcUrl = `https://api.coinmarketcap.com/data-api/v3.1/cryptocurrency/historical?id=${cmcIndex}&timeStart=${from}&timeEnd=${to}&interval=1d&convertId=2781`;
                    const cmcPriceData = await axios.get(cmcUrl, 
                        {
                            headers: {
                                "Accept": "application/json, text/plain, *"/"*",
                                "Origin": "https://coinmarketcap.com",
                                "Referer": "https://coinmarketcap.com/",
                                "Cache-Control": "no-cache",
                                "Host": "api.coinmarketcap.com",
                                "Accept-Language": "en-US,en;q=0.9",
                                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Connection": "keep-alive",
                                // "x-request-id": "d04b5f188afe492f93e023b230dcb391",
                                "platform": "web"
                            }
                        }
                    );

                    if(cmcPriceData.data["status"]["error_message"] === "SUCCESS") {
                        for(let i = 0; i < cmcPriceData.data["data"]["quotes"].length; i++) {
                            const date = datefns.parseISO(cmcPriceData.data["data"]["quotes"][i]["quote"]["timestamp"]);
                            const t_ms = date.getTime();

                            priceHistory.push(
                                {
                                    "o": cmcPriceData.data["data"]["quotes"][i]["quote"]["open"],
                                    "h": cmcPriceData.data["data"]["quotes"][i]["quote"]["high"],
                                    "l": cmcPriceData.data["data"]["quotes"][i]["quote"]["low"],
                                    "c": cmcPriceData.data["data"]["quotes"][i]["quote"]["close"],
                                    "v": cmcPriceData.data["data"]["quotes"][i]["quote"]["volume"],
                                    "t": t_ms
                                }
                            );
                        }

                        return res.status(200).json({"status": "success", "data": priceHistory});
                    } else { return res.status(200).json({"status": "error"}); }
                } else {
                    const to_date = to * 1000;
                    const from_date = from * 1000;
                    const apiKey = process.env.polygon_io_api_key;
                    
                    const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${polygonIoTicker}/range/1/day/${from_date}/${to_date}?adjusted=true&sort=asc&limit=50000&apikey=${apiKey}`;
                    const polygonPriceData = await axios.get(polygonUrl);

                    if(polygonPriceData.data["status"] === "OK") {
                        priceHistory = polygonPriceData.data["results"];
                        return res.status(200).json({"status": "success", "data": priceHistory});
                    } else { return res.status(200).json({"status": "error"}); }
                }
            }
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.post("/modify-watchlist", async (req, res) => 
    {
        try {
            const action = `${req.body.action}`;
            const symbol = `${req.body.symbol}`;
            const uniqueId = `${req.body.uniqueId}`;
            const distinction = `${req.body.distinction}`;

            if(!(action === "add" || action === "removed")) {return res.status(200).json({"status": "error"});}
            if(!(distinction === "user" || distinction === "visitor")) {return res.status(200).json({"status": "error"});}

            const now = new Date();
            const nowUnix = datefns.getUnixTime(now);
            const priorResults = await watchlistDesc.find(
                {
                    username: uniqueId,
                    symbol: symbol
                }
            ).sort({timeStamp: -1}).limit(1);

            if(priorResults.length === 1) {
                let priorAction = priorResults[0]["action"];
                if(priorAction === action) {return res.status(200).json({"status": "error"});}

                const newWatchlistDesc = new watchlistDesc(
                    {
                        username: uniqueId,
                        distinction: distinction,
                        symbol: symbol,
                        action: action,
                        actionChangeIndicator: !(priorAction === action),
                        timeStamp: nowUnix
                    }
                );
                await newWatchlistDesc.save();
            } else {
                if(action === "removed") {return res.status(200).json({"status": "error"});}

                const newWatchlistDesc = new watchlistDesc(
                    {
                        username: uniqueId,
                        distinction: distinction,
                        symbol: symbol,
                        action: action,
                        actionChangeIndicator: false,
                        timeStamp: nowUnix
                    }
                );
                await newWatchlistDesc.save();
            }

            if(action === "add") {
                await cryptosDesc.updateOne({symbol: symbol.slice(3, symbol.length)}, {$inc: {watchlistCount: 1}});
            } else if(action === "removed") {
                await cryptosDesc.updateOne({symbol: symbol.slice(3, symbol.length)}, {$inc: {watchlistCount: -1}});
            }
            return res.status(200).json({"status": "success"});
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/crypto-market-overview", async (req, res) => 
    {
        try {
            const data = await cryptoMarketOverview.find({}).sort({timeStamp: -1}).limit(1);
            return res.status(200).json({"status": "success", "data": data});
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

module.exports = router;