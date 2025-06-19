const mongoose = require("mongoose");

const postsIndexSchema = mongoose.Schema(
    {
        username: String,
        usernameEmbedding: Array,
        profileImage: String,
        groupId: String,
        groupProfileImage: String,
        title: String,
        post: String,
        postEmbedding: Array,
        language: String,
        translation: String,
        repostId: String,
        photos: Array,
        videos: Array,
        taggedAssets: Array,
        spam: Boolean,
        helpful: Boolean,
        postSubjects: Array,
        postSubjectsEmbedding: Array,
        likes: Number,
        dislikes: Number,
        views: Number,
        comments: Number,
        reposts: Number,
        shares: Number,
        trendingScore: Number,
        confidenceScore: Number,
        userRewards: Number,
        communityRewards: Number,
        status: String,
        flair: Array,
        validTags: Array,
        timeStamp: Number
    }
);

module.exports = mongoose.model("posts-index", postsIndexSchema, "posts-index");