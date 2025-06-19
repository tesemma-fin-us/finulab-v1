const router = require("express").Router();

const yn_predictionsIndex = require("../models/yn-predictions-index");

router.put("/search/", async (req, res) => 
    {
        try {
            const q = `${req.query.q}`;

            const queryResults = await yn_predictionsIndex.aggregate(
                [
                    {
                        $search: {
                            index: "yn_predictions-search-index",
                            text: {
                                query: q,
                                path: {
                                    wildcard: "*"
                                }
                            }
                        }
                    }, 
                    {
                        $project: {
                            _id: 1
                        }
                    }, {$limit: 10}
                ]
            );

            return res.status(200).json({"status": "success", "data": queryResults});
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);


router.put("/details/", async (req, res) => 
    {
        try {
            const q = `${req.query.q}`;
            const type = `${req.body.type}`;
            const ninpredictionIds = req.body.ninpredictionIds;
            if(!Array.isArray(ninpredictionIds)) {return res.status(200).json({"status": "error"});}
            if(!(type === "primary" || type === "secondary")) {return res.status(200).json({"status": "error"});}

            if(type === "primary") {
                /*
                const queryCount_desc = await yn_predictionsIndex.aggregate(
                    [
                        {
                            $search: {
                                index: "yn_predictions-search-index",
                                text: {
                                    query: q,
                                    path: {
                                        wildcard: "*"
                                    }
                                }
                            }
                        }, 
                        {
                            $count: "totalCount"
                        }
                    ]
                );
                const queryCount = queryCount_desc.length > 0 ? queryCount_desc[0].totalCount : 0;
                */
                const queryCount = 100;

                const queryResults = await yn_predictionsIndex.aggregate(
                    [
                        {
                            $search: {
                                index: "yn_predictions-search-index",
                                text: {
                                    query: q,
                                    path: {
                                        wildcard: "*"
                                    }
                                }
                            }
                        }, 
                        {
                            $project: {
                                _id: 1
                            }
                        }, {$limit: 15}
                    ]
                );

                return res.status(200).json({"status": "success", "data": queryResults, "dataCount": queryCount});
            } else if(type === "secondary") {
                const queryResults = await yn_predictionsIndex.aggregate(
                    [
                        {
                            $search: {
                                index: "yn_predictions-search-index",
                                text: {
                                    query: q,
                                    path: {
                                        wildcard: "*"
                                    }
                                }
                            }
                        }, 
                        {
                            $match: {
                                _id: {$nin: ninpredictionIds}
                            }
                        },
                        {
                            $project: {
                                _id: 1
                            }
                        }, {$limit: 15}
                    ]
                );

                return res.status(200).json({"status": "success", "data": queryResults});
            }
        } catch(error) {
            return res.status(500).json({"status": "error"});
        }
    }
);

module.exports = router;