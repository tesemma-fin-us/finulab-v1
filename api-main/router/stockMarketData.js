const axios = require("axios");
const router = require("express").Router();

const auth = require("./auth");

router.put("/holidays", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/holidays`);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/details/", auth.verify, async (req, res) => 
    {
        try {
            const q = `${req.query.q}`;
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/details?q=${q}`);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/quick-descs", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/quick-descs`, req.body);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/description/:symbol", auth.verify, async (req, res) => 
    {
        try {
            const symbol = req.params.symbol;
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/description/${symbol}`);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/rankings", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/rankings`, req.body);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/watchlist", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/watchlist`, req.body);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/provided-recommendation", auth.verify, async (req, res) => 
    {
        try {
            const body = {
                ...req.body,
                "username": req.data.user
            };
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/provided-recommendation`, body);

            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/latest-trading-activity", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/latest-trading-activity`, req.body);
            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/congress-txs", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/congress-txs`, req.body);
            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/institutions-txs", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/institutions-txs`, req.body);
            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/insider-txs", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/insider-txs`, req.body);
            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/earnings-calendar", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/earnings-calendar`, req.body);
            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

router.put("/stock-market-overview", auth.verify, async (req, res) => 
    {
        try {
            const result = await axios.put(`http://localhost:8801/api/stock-market-data/stock-market-overview`, req.body);
            return res.status(200).json(result.data);
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

module.exports = router;