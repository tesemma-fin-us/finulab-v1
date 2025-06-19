const router = require("express").Router();

const postsIndex = require("../models/posts-index");

router.put("/search/", async (req, res) => 
    {
        try {
            const q = `${req.query.q}`;
            const type = `${req.body.type}`;
            const ninpostIds = req.body.ninpostIds;
            if(!Array.isArray(ninpostIds)) {return res.status(200).json({"status": "error"});}
            if(!(type === "primary" || type === "secondary")) {return res.status(200).json({"status": "error"});}

            if(type === "primary") {
                /*
                const queryCount_desc = await postsIndex.aggregate(
                    [
                        {
                            $search: {
                                index: "posts-search-index",
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
                                status: "active"
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
                
                const queryResults = await postsIndex.aggregate(
                    [
                        {
                            $search: {
                                index: "posts-search-index",
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
                                status: "active"
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
                const queryResults = await postsIndex.aggregate(
                    [
                        {
                            $search: {
                                index: "posts-search-index",
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
                                _id: {$nin: ninpostIds},
                                status: "active"
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