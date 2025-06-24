const router = require("express").Router();

const communitiesIndex = require("../models/communities-index.js");

router.put("/search/", async (req, res) => 
    {
        try {
            const q = `${req.query.q}`;

            const queryResults = await communitiesIndex.aggregate(
                [
                    {
                        $search: {
                            index: "communities-search-index",
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
                            _id: 0,
                            communityName: 1,
                            profilePicture: 1,
                            profileWallpaper: 1,
                            bio: 1
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

module.exports = router;
