import './index.css';
import '../../pages/stocks/largeView/innerPages/stocks.css';

import DOMPurify from 'dompurify';
import {format} from 'timeago.js';
import FadeLoader from 'react-spinners/FadeLoader';
import BeatLoader from 'react-spinners/BeatLoader';
import {useDispatch, useSelector} from 'react-redux';
import {useInView} from 'react-intersection-observer';
import {useNavigate, useLocation} from 'react-router-dom';
import {useRef, useState, useEffect, useMemo} from 'react';
import {FacebookShareButton, TwitterShareButton, TelegramShareButton, WhatsappShareButton, LinkedinShareButton, BlueskyShareButton, TwitterIcon, FacebookIcon, RedditShareButton, RedditIcon, LinkedinIcon, TelegramIcon, BlueskyIcon} from 'react-share';
import {Tsunami, ThumbUpOffAlt, ThumbDownOffAlt, Cached, Comment, ContentCopy, ThumbUp, ThumbDown, Add, Remove, ExpandMore, TrendingUp, TrendingDown, DeleteSharp, Verified, BlurOn, IosShare, Link, CheckCircleOutline, CheckCircle, ChatBubbleOutline, MoreHoriz, EditNoteSharp} from '@mui/icons-material';

import FinulabComment from '../comment/comment';
import MiniPost from '../miniaturized/post/mini-post';
import generalOpx from '../../functions/generalFunctions';
import MiniaturizedNews from '../miniaturized/news/mini-news';
import MiniMiniPred from '../miniaturized/miniMiniPred/miniMiniPred';

import {setEditPost} from '../../reduxStore/editPost';
import {setViewMedia} from '../../reduxStore/viewMedia';
import {selectModeratorStatus} from '../../reduxStore/moderatorStatus';
import {setInterests, selectInterests} from '../../reduxStore/interests';
import {updateStockPosts, selectStockPosts} from '../../reduxStore/stockPosts';
import {setPosts, setEngaged, selectProfileData} from '../../reduxStore/profileData';
import {setTop, setLatest, selectFinulabSearch} from '../../reduxStore/finulabSearch';
import {setStockPageSelection, selectStockPageSelection} from '../../reduxStore/stockPageSelection';
import {setComments, clearComments, updateComments, selectComments} from '../../reduxStore/comments';
import {addToPostEngagement, removeFromPostEngagement, selectPostEngagement} from '../../reduxStore/postEngagement';
import {setShortStart, setReturnTo, setReturnToScrollTop, setShortData, selectShortsData} from '../../reduxStore/shortsData';
import {updateHomePageData, updateHomePageFollowingData, updateSelection, selectHomePageData} from '../../reduxStore/homePageData';
import {addToCommentsEngagement, removeFromCommentsEngagement, setCommentsEngagement, clearCommentsEngagement, selectCommentsEngagement} from '../../reduxStore/commentsEngagement';

const override = {
    display: "flex",
    marginTop: "25px",
    marginLeft: "14.45px"
};
const overrideV2 = {
    display: "flex",
    marginTop: "13px",
    marginLeft: "14.45px"
};

export default function Post(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const v_page = useLocation();
    const idPage = (pathname) => {
        const pathnameSplit = String(pathname).split("/");
        return pathnameSplit[1];
    }
    const u_moderatorStatus = useSelector(selectModeratorStatus);

    const u_interests = useSelector(selectInterests);
    const u_postEngagement = useSelector(selectPostEngagement);

    const homePageData = useSelector(selectHomePageData);
    const profilePageData = useSelector(selectProfileData);
    const finulabShortsData = useSelector(selectShortsData);
    const finulabSearchData = useSelector(selectFinulabSearch);

    const comments = useSelector(selectComments);
    const stockPosts = useSelector(selectStockPosts);
    const stockSelection = useSelector(selectStockPageSelection);
    const commentsEngagement = useSelector(selectCommentsEngagement);

    const [uM_postId, setuM_postId] = useState("");
    const [postMedia, setPostMedia] = useState([]);
    const [repostCount, setRepostCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [engagementRatio, setEngagementRatio] = useState([0, 0]);
    useEffect(() => {
        if(!props.loading) {
            if(!(props.details === undefined || props.details === null)) {
                let postMediaFunction = [];
                for(let i = 0; i < props.details.photos.length; i++) {
                    postMediaFunction.push([props.details.photos[i], "photo"]);
                }
                for(let j = 0; j < props.details.videos.length; j++) {
                    postMediaFunction.push([props.details.videos[j], "video"]);
                }
                setPostMedia(postMediaFunction);
                setuM_postId(props.details._id);
            }
        }
    }, [props]);
    useEffect(() => {
        if(!props.loading) { 
            if(!(props.details === undefined || props.details === null)) {
                setRepostCount(props.details.reposts);
                setCommentCount(props.details.comments);
                setEngagementRatio([props.details.likes, props.details.dislikes]);
            }
        }
    }, [props]);

    const [selectedGradient, setSelectedGradient] = useState(Math.floor(Math.random() * 5));

    const setSideDisplaySelection = () => {
        navigate(`/post/${props.details._id}`);
    }

    const videoRef = useRef(null);
    const {ref, inView, entry} = useInView({threshold: 0.05, triggerOnce: false});
    useEffect(() => {
        if(videoRef.current) {
            try {
                const video = videoRef.current;
                const pathname = idPage(v_page.pathname)
                
                if(pathname === "short") {
                    if(video) {
                        if(inView) {
                            video.pause().catch(() => {});
                        }
                    }
                } else {
                    if(video) {
                        if(inView) {
                            video.play().catch(() => {});
                        } else {
                            video.pause().catch(() => {});
                        }
                    }
                }
            } catch(error) {}
        }
    }, [inView, v_page]);

    const setupViewMedia = (index) => {
        dispatch(
            setViewMedia(
                {
                    "index": index,
                    "media": postMedia
                }
            )
        );
    }

    const postTextRef = useRef();
    const [postTextHidden, setPostTextHidden] = useState(false);
    const checkOverflow = (el) => {
        let curOverflow = el.style.overflow;
        if (!curOverflow || curOverflow === "visible") {el.overflow = "hidden";}

        let isOverflowing = el.scrollHeight > el.offsetHeight;
        el.style.overflow = curOverflow;

        return isOverflowing;
    }
    useEffect(() => {
        if(!props.loading) {
            if(!(props.view === undefined || props.view === null)) {
                if(props.view === "mini" && postTextRef.current) {
                    const overflowResult = checkOverflow(postTextRef.current);
                    setPostTextHidden(overflowResult);
                }
            }
        }
    }, []);

    const engagePost = async (type) => {
        let engagementRatioFunction = [...engagementRatio];
        if(u_postEngagement.some(eng => eng.postId === props.details._id)) {
            const prevEngagement = u_postEngagement.filter(eng => eng.postId === props.details._id)[0]["type"];
            if(prevEngagement === type) {
                dispatch(
                    removeFromPostEngagement(props.details._id)
                );

                if(type === "like") {
                    engagementRatioFunction[0] = engagementRatioFunction[0] - 1;
                } else if(type === "dislike") {
                    engagementRatioFunction[1] = engagementRatioFunction[1] - 1;
                }
            } else {
                dispatch(
                    removeFromPostEngagement(props.details._id)
                );
                dispatch(
                    addToPostEngagement([{"postId": props.details._id, "type": type}])
                );

                if(type === "like") {
                    engagementRatioFunction[0] = engagementRatioFunction[0] + 1;
                    engagementRatioFunction[1] = engagementRatioFunction[1] - 1;
                } else if(type === "dislike") {
                    engagementRatioFunction[1] = engagementRatioFunction[1] + 1;
                    engagementRatioFunction[0] = engagementRatioFunction[0] - 1;
                }
            }
        } else {
            dispatch(
                addToPostEngagement([{"postId": props.details._id, "type": type}])
            );

            if(type === "like") {
                engagementRatioFunction[0] = engagementRatioFunction[0] + 1;
            } else if(type === "dislike") {
                engagementRatioFunction[1] = engagementRatioFunction[1] + 1;
            }
        }

        /* stocks & cryptos pages */
        let posts = [...stockPosts["posts"]["data"]];
        if(posts.length > 0) {
            if(posts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...posts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = posts.findIndex(pst => pst._id === props.details._id);
                posts[copyIndex] = postCopy;
                dispatch(
                    updateStockPosts(
                        {
                            "data": posts,
                            "dataCount": stockPosts["posts"]["dataCount"],
                            "dataLoading": stockPosts["posts"]["dataLoading"]
                        }
                    )
                );
            }
        }

        /* home for you page */
        let homePagePosts = [...homePageData["pageData"]["data"]];
        if(homePagePosts.length > 0) {
            if(homePagePosts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...homePagePosts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = homePagePosts.findIndex(pst => pst._id === props.details._id);
                homePagePosts[copyIndex] = postCopy;
                dispatch(
                    updateHomePageData(
                        {
                            "data": homePagePosts,
                            "dataLoading": homePageData["pageData"]["dataLoading"]
                        }
                    )
                );
            }
        }
        
        /* home following page */
        let homePageFollowingPosts = [...homePageData["followingData"]["data"]];
        if(homePageFollowingPosts.length > 0) {
            if(homePageFollowingPosts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...homePageFollowingPosts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = homePageFollowingPosts.findIndex(pst => pst._id === props.details._id);
                homePageFollowingPosts[copyIndex] = postCopy;
                dispatch(
                    updateHomePageFollowingData(
                        {
                            "data": homePageFollowingPosts,
                            "dataLoading": homePageData["followingData"]["dataLoading"]
                        }
                    )
                );
            }
        }

        /* home - post page */
        if(homePageData["selected"]["type"] === "Post") {
            if(homePageData["selected"]["selectedDesc"]["desc"]["_id"] === props.details._id) {
                let selectionCopy = {...homePageData["selected"]["selectedDesc"]["desc"]};
                selectionCopy["likes"] = engagementRatioFunction[0];
                selectionCopy["dislikes"] = engagementRatioFunction[1];

                dispatch(
                    updateSelection(
                        {
                            "type": "Post",
                            "selectedDesc": {
                                "desc": selectionCopy
                            }
                        }
                    )
                );
            }
        }

        /* profile - posts page */
        let profilePagePosts = [...profilePageData["posts"]["data"]];
        if(profilePagePosts.length > 0) {
            if(profilePagePosts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...profilePagePosts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = profilePagePosts.findIndex(pst => pst._id === props.details._id);
                profilePagePosts[copyIndex] = postCopy;
                dispatch(
                    setPosts(
                        {
                            "username": profilePageData["posts"]["username"],
                            "data": profilePagePosts,
                            "dataCount": profilePageData["posts"]["dataCount"],
                            "insightsExpand": profilePageData["posts"]["insightsExpand"],
                            "dataLoading": profilePageData["posts"]["dataLoading"]
                        }
                    )
                );
            }
        }

        /* profile - engaged posts page */
        if(profilePageData["engaged"]["type"] === "posts") {
            let profilePageEngagedPosts = [...profilePageData["engaged"]["data"]];
            if(profilePageEngagedPosts.length > 0) {
                if(profilePageEngagedPosts.some(pst => pst._id === props.details._id)) {
                    let postCopy = {...profilePageEngagedPosts.filter(pst => pst._id === props.details._id)[0]};
                    postCopy["likes"] = engagementRatioFunction[0];
                    postCopy["dislikes"] = engagementRatioFunction[1];

                    const copyIndex = profilePageEngagedPosts.findIndex(pst => pst._id === props.details._id);
                    profilePageEngagedPosts[copyIndex] = postCopy;
                    dispatch(
                        setEngaged(
                            {
                                "username": profilePageData["engaged"]["username"],
                                "type": "posts",
                                "data": profilePageEngagedPosts,
                                "support": profilePageData["engaged"]["support"],
                                "dataCount": profilePageData["engaged"]["dataCount"],
                                "dataLoading": profilePageData["engaged"]["dataLoading"]
                            }
                        )
                    );
                }
            }
        }

        /* search - top */
        if(finulabSearchData["top"]["data"].length > 0) {
            let finulabSearchTopPosts = [...finulabSearchData["top"]["data"]];

            if(finulabSearchTopPosts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...finulabSearchTopPosts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = finulabSearchTopPosts.findIndex(pst => pst._id === props.details._id);
                finulabSearchTopPosts[copyIndex] = postCopy;
                dispatch(
                    setTop(
                        {
                            "query": finulabSearchData["top"]["query"],
                            "data": finulabSearchTopPosts,
                            "dataCount": finulabSearchData["top"]["dataCount"],
                            "dataLoading": finulabSearchData["top"]["dataLoading"]
                        }
                    )
                );
            }
        }

        /* search - latest */
        if(finulabSearchData["latest"]["data"].length > 0) {
            let finulabSearchLatestPosts = [...finulabSearchData["latest"]["data"]];

            if(finulabSearchLatestPosts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...finulabSearchLatestPosts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = finulabSearchLatestPosts.findIndex(pst => pst._id === props.details._id);
                finulabSearchLatestPosts[copyIndex] = postCopy;
                dispatch(
                    setLatest(
                        {
                            "query": finulabSearchData["latest"]["query"],
                            "data": finulabSearchLatestPosts,
                            "dataCount": finulabSearchData["latest"]["dataCount"],
                            "dataLoading": finulabSearchData["latest"]["dataLoading"]
                        }
                    )
                );
            }
        }

        /* shorts - start */
        if(finulabShortsData["start"]["_id"] === props.details._id) {
            let postCopy = {...finulabShortsData["start"]};
            postCopy["likes"] = engagementRatioFunction[0];
            postCopy["dislikes"] = engagementRatioFunction[1];

            dispatch(
                setShortStart(postCopy)
            );
        }

        /* shorts - remainder */
        if(finulabShortsData["shorts"]["data"].length > 0) {
            let finulabShortsPosts = [...finulabShortsData["shorts"]["data"]];

            if(finulabShortsPosts.some(pst => pst._id === props.details._id)) {
                let postCopy = {...finulabShortsPosts.filter(pst => pst._id === props.details._id)[0]};
                postCopy["likes"] = engagementRatioFunction[0];
                postCopy["dislikes"] = engagementRatioFunction[1];

                const copyIndex = finulabShortsPosts.findIndex(pst => pst._id === props.details._id);
                finulabShortsPosts[copyIndex] = postCopy;
                dispatch(
                    setShortData(
                        {
                            "data": finulabShortsPosts,
                            "dataLoading": finulabShortsData["shorts"]["dataLoading"]
                        }
                    )
                );
            }
        }

        let u_interestsFunction = [];
        let u_interestsIntFunction = [];
        for(let finulab_i = 0; finulab_i < u_interests.length; finulab_i++) {
            if(!u_interestsFunction.includes(u_interests[finulab_i][0])) {
                u_interestsFunction.push(u_interests[finulab_i][0]);
                u_interestsIntFunction.push(u_interests[finulab_i][1]);
            } else {
                const u_interestsUpdateIndex = u_interestsFunction.findIndex(u_elem => u_elem === u_interests[finulab_i][0]);
                if(u_interestsUpdateIndex !== -1) {
                    u_interestsIntFunction[u_interestsUpdateIndex] = u_interestsIntFunction[u_interestsUpdateIndex] + u_interests[finulab_i][1];
                }
            }
        }

        for(let finulab_j = 0; finulab_j < props.details.postSubjects.length; finulab_j++) {
            if(!u_interestsFunction.includes(props.details.postSubjects[finulab_j])) {
                u_interestsFunction.push(props.details.postSubjects[finulab_j]);
                u_interestsIntFunction.push(5);
            } else {
                const u_interestsUpdateIndex = u_interestsFunction.findIndex(u_elem => u_elem === props.details.postSubjects[finulab_j]);
                if(u_interestsUpdateIndex !== -1) {
                    u_interestsIntFunction[u_interestsUpdateIndex] = u_interestsIntFunction[u_interestsUpdateIndex] + 5;
                }
            }
        }

        let newU_interestsFunction = [];
        for(let finulab_k = 0; finulab_k < u_interestsFunction.length; finulab_k++) {
            newU_interestsFunction.push(
                [u_interestsFunction[finulab_k], u_interestsIntFunction[finulab_k]]
            );
        }

        newU_interestsFunction = newU_interestsFunction.sort((a, b) => b[1] - a[1]);
        const criticalNewU_interests = newU_interestsFunction.slice(0, 100);
        dispatch(
            setInterests(criticalNewU_interests)
        );

        await generalOpx.axiosInstance.post(`/content/posts/post-engage`, {"type": type, "postId": props.details._id});
    }

    useMemo(() => {
        const setUpComments = async () => {
            dispatch(
                clearComments()
            );
            dispatch(
                clearCommentsEngagement()
            );

            await generalOpx.axiosInstance.put(`/content/posts/comments`, 
                {
                    postId: props.details._id,
                    comments: props.details.comments
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        let comments_data = [];
                        for(let i = 0; i < response.data["data"].length; i++) {
                            let primaryComments = [...response.data["support"].filter(doc => doc.commentId === response.data["data"][i]["_id"] && doc.index === 1)];

                            if(primaryComments.length > 0) {
                                comments_data.push(
                                    {"type": "comment", "l0": true, "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": response.data["data"][i]}
                                );

                                for(let j = 0; j < primaryComments.length; j++) {
                                    let secondaryComments = [...response.data["support"].filter(doc => doc.commentId === primaryComments[j]["_id"] && doc.index === 2)];

                                    if(secondaryComments.length > 0) {
                                        comments_data.push(
                                            {
                                                "type": "comment", 
                                                "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": true, "l2": false, "l3": false, 
                                                "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]
                                            }
                                        );
                                        
                                        for(let k = 0; k < secondaryComments.length; k++) {
                                            let tertiaryComments = [...response.data["support"].filter(doc => doc.commentId === secondaryComments[k]["_id"] && doc.index === 3)];

                                            if(tertiaryComments.length > 0) {
                                                comments_data.push(
                                                    {
                                                        "type": "comment", 
                                                        "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": true, "l3": false, 
                                                        "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]
                                                    }
                                                );
                                                
                                                tertiaryComments = tertiaryComments.sort((a, b) => a.timeStamp - b.timeStamp);
                                                for(let t = 0; t < tertiaryComments.length; t++) {
                                                    comments_data.push(
                                                        {
                                                            "type": "comment", 
                                                            "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": !(t === tertiaryComments.length - 1), "l3": false, 
                                                            "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": tertiaryComments[t]
                                                        }
                                                    );
                                                }
                                            } else {
                                                if(secondaryComments[k]["comments"] > 0) {
                                                    comments_data.push(
                                                        {
                                                            "type": "comment", 
                                                            "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": true, "l3": false, 
                                                            "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]
                                                        }
                                                    );
                                                    comments_data.push(
                                                        {
                                                            "type": "expand", 
                                                            "index": 3, 
                                                            "display": true, 
                                                            "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": false, "l3": false,
                                                            "commentId": secondaryComments[k]["_id"], 
                                                            "mainCommentId": response.data["data"][i]["_id"],
                                                            "value": secondaryComments[k]["comments"]
                                                        }
                                                    );
                                                } else {
                                                    comments_data.push(
                                                        {
                                                            "type": "comment", 
                                                            "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": false, "l3": false, 
                                                            "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]
                                                        }
                                                    );
                                                }
                                            }
                                        }
                                    } else {
                                        if(primaryComments[j]["comments"] > 0) {
                                            comments_data.push(
                                                {
                                                    "type": "comment", 
                                                    "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": true, "l2": false, "l3": false, 
                                                    "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]
                                                }
                                            );
                                            comments_data.push(
                                                {
                                                    "type": "expand", 
                                                    "index": 2, 
                                                    "display": true, 
                                                    "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": false, "l2": false, "l3": false, 
                                                    "commentId": primaryComments[j]["_id"], 
                                                    "mainCommentId": response.data["data"][i]["_id"],
                                                    "value": primaryComments[j]["comments"]
                                                }
                                            );
                                        } else {
                                            comments_data.push(
                                                {
                                                    "type": "comment", 
                                                    "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": false, "l2": false, "l3": false,  
                                                    "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]
                                                }
                                            );
                                        }
                                    }
                                }

                                if(response.data["data"][i]["comments"] > primaryComments.length) {
                                    comments_data.push(
                                        {
                                            "type": "expand", 
                                            "index": 1, 
                                            "display": true, 
                                            "l0": false, "l1": false, "l2": false, "l3": false,
                                            "commentId": "", 
                                            "mainCommentId": response.data["data"][i]["_id"],
                                            "value": response.data["data"][i]["comments"] - primaryComments.length
                                        }
                                    );
                                }
                            } else {
                                if(response.data["data"][i]["comments"] > 0) {
                                    comments_data.push(
                                        {"type": "comment", "l0": true, "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": response.data["data"][i]}
                                    );
                                    comments_data.push(
                                        {
                                            "type": "expand", 
                                            "index": 1, 
                                            "display": true, 
                                            "l0": false, "l1": false, "l2": false, "l3": false,
                                            "commentId": "", 
                                            "mainCommentId": response.data["data"][i]["_id"],
                                            "value": response.data["data"][i]["comments"]
                                        }
                                    );
                                } else {
                                    comments_data.push({"type": "comment", "l0": false, "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": response.data["data"][i]});
                                }
                            }
                        }

                        let engagementCommentIds = [
                            ...[...response.data["data"].map(desc => `m_${desc._id}`)],
                            ...[...response.data["support"].map(desc => `s_${desc._id}`)]
                        ]
                        const commentEngagements_req = await generalOpx.axiosInstance.put(`/content/posts/comments-engagements`, {commentIds: engagementCommentIds});
                        if(commentEngagements_req.data["status"] === "success") {
                            if(commentEngagements_req.data["data"].length > 0) {
                                dispatch(
                                    setCommentsEngagement(commentEngagements_req.data["data"])
                                );
                            }
                        }
                        let commentExpandLoadingFunction = comments_data.map(
                            (item, index) => {
                                if(item.type === "expand") {
                                    return {[index]: false};
                                }
                            }
                        ).filter(item => item !== undefined);

                        dispatch(
                            setComments(
                                {
                                    "_id": props.details._id,
                                    "type": "post",
                                    "data": comments_data,
                                    "viewCount": response.data["data"].length,
                                    "dataCount": response.data["dataCount"],
                                    "dataLoading": false,
                                    "commentExpandLoading": commentExpandLoadingFunction
                                }
                            )
                        );
                    }
                }
            );
        }

        if(!(props.view === undefined || props.view === null) && !(props.details === undefined || props.details === null)) {
            if(props.view === "max") {
                if((comments["type"] !== "post" || comments["_id"] !== props.details._id || comments["dataLoading"] === true) && uM_postId !== comments["_id"]) {
                    if(props.details.comments > 0) {
                        setUpComments();
                    } else {
                        dispatch(
                            clearCommentsEngagement()
                        );
                        dispatch(
                            setComments(
                                {
                                    "_id": props.details._id,
                                    "type": "post",
                                    "data": [],
                                    "viewCount": 0,
                                    "dataCount": 0,
                                    "dataLoading": false,
                                    "commentExpandLoading": []
                                }
                            )
                        );
                    }
                }
            }
        }
    }, [uM_postId]);

    const commentBlockDisplayToggle = (index, type) => {
        const innerIndex = comments["data"][index]["value"]["index"];
        if(innerIndex === 0 || innerIndex === 1 || innerIndex === 2) {
            let i = index;
            let spliceInArr = [];
            do {
                if(comments["data"][i + 1]["type"] === "comment") {
                    if(comments["data"][i + 1]["value"]["index"] > innerIndex) {
                        if(type === "hide") {
                            spliceInArr.push(
                                {
                                    ...comments["data"][i + 1],
                                    "display": false
                                }
                            );
                        } else if(type === "view") {
                            spliceInArr.push(
                                {
                                    ...comments["data"][i + 1],
                                    "display": true
                                }
                            );
                        }
                    }
                } else if(comments["data"][i + 1]["type"] === "expand") {
                    if(type === "hide") {
                        spliceInArr.push(
                            {
                                ...comments["data"][i + 1],
                                "display": false
                            }
                        );
                    } else if(type === "view") {
                        spliceInArr.push(
                            {
                                ...comments["data"][i + 1],
                                "display": true
                            }
                        );
                    }
                }
                i++;
            } while(i < (comments["data"].length - 1) && (comments["data"][i]["value"]["index"] > innerIndex || comments["data"][i]["type"] === "expand"));

            let comments_data = [
                ...comments["data"].slice(0, index + 1), 
                ...spliceInArr,
                ...comments["data"].slice(index + 1 + spliceInArr.length, comments["data"].length)
            ];

            dispatch(
                setComments(
                    {
                        "_id": props.details._id,
                        "type": "post",
                        "data": comments_data,
                        "viewCount": comments["viewCount"],
                        "dataCount": comments["dataCount"],
                        "dataLoading": false,
                        "commentExpandLoading": comments["commentExpandLoading"]
                    }
                )
            );
        }
    }

    const [viewMoreCommentsLoading, setViewMoreCommentsLoading] = useState(false);
    const viewMoreComments = async () => {
        setViewMoreCommentsLoading(true);

        let ni_commentIds = [];
        for(let i = 0; i < comments["data"].length; i++) {
            if(comments["data"][i]["type"] === "comment") {
                if(comments["data"][i]["value"]["index"] === 0) {
                    ni_commentIds.push(comments["data"][i]["value"]["_id"]);
                }
            }
        }

        await generalOpx.axiosInstance.put(`/content/posts/comments-expand`, 
            {
                postId: props.details._id,
                ni_commentIds: ni_commentIds
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    let comments_data = [];
                    for(let i = 0; i < response.data["data"].length; i++) {
                        let primaryComments = [...response.data["support"].filter(doc => doc.commentId === response.data["data"][i]["_id"] && doc.index === 1)];

                        if(primaryComments.length > 0) {
                            comments_data.push(
                                {"type": "comment", "l0": true, "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": response.data["data"][i]}
                            );

                            for(let j = 0; j < primaryComments.length; j++) {
                                let secondaryComments = [...response.data["support"].filter(doc => doc.commentId === primaryComments[j]["_id"] && doc.index === 2)];

                                if(secondaryComments.length > 0) {
                                    comments_data.push(
                                        {
                                            "type": "comment", 
                                            "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": true, "l2": false, "l3": false, 
                                            "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]
                                        }
                                    );
                                    
                                    for(let k = 0; k < secondaryComments.length; k++) {
                                        let tertiaryComments = [...response.data["support"].filter(doc => doc.commentId === secondaryComments[k]["_id"] && doc.index === 3)];

                                        if(tertiaryComments.length > 0) {
                                            comments_data.push(
                                                {
                                                    "type": "comment", 
                                                    "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": true, "l3": false, 
                                                    "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]
                                                }
                                            );
                                            
                                            tertiaryComments = tertiaryComments.sort((a, b) => a.timeStamp - b.timeStamp);
                                            for(let t = 0; t < tertiaryComments.length; t++) {
                                                comments_data.push(
                                                    {
                                                        "type": "comment", 
                                                        "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": !(t === tertiaryComments.length - 1), "l3": false, 
                                                        "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": tertiaryComments[t]
                                                    }
                                                );
                                            }
                                        } else {
                                            if(secondaryComments[k]["comments"] > 0) {
                                                comments_data.push(
                                                    {
                                                        "type": "comment", 
                                                        "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": true, "l3": false, 
                                                        "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]
                                                    }
                                                );
                                                comments_data.push(
                                                    {
                                                        "type": "expand", 
                                                        "index": 3, 
                                                        "display": true, 
                                                        "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": false, "l3": false,
                                                        "commentId": secondaryComments[k]["_id"], 
                                                        "mainCommentId": response.data["data"][i]["_id"],
                                                        "value": secondaryComments[k]["comments"]
                                                    }
                                                );
                                            } else {
                                                comments_data.push(
                                                    {
                                                        "type": "comment", 
                                                        "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": primaryComments[j]["comments"] <= secondaryComments.length ? !(k === secondaryComments.length - 1) : true, "l2": false, "l3": false, 
                                                        "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]
                                                    }
                                                );
                                            }
                                        }
                                    }
                                } else {
                                    if(primaryComments[j]["comments"] > 0) {
                                        comments_data.push(
                                            {
                                                "type": "comment", 
                                                "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": true, "l2": false, "l3": false, 
                                                "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]
                                            }
                                        );
                                        comments_data.push(
                                            {
                                                "type": "expand", 
                                                "index": 2, 
                                                "display": true, 
                                                "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": false, "l2": false, "l3": false, 
                                                "commentId": primaryComments[j]["_id"], 
                                                "mainCommentId": response.data["data"][i]["_id"],
                                                "value": primaryComments[j]["comments"]
                                            }
                                        );
                                    } else {
                                        comments_data.push(
                                            {
                                                "type": "comment", 
                                                "l0": response.data["data"][i]["comments"] <= primaryComments.length ? !(j === primaryComments.length - 1) : true, "l1": false, "l2": false, "l3": false,  
                                                "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]
                                            }
                                        );
                                    }
                                }
                            }

                            if(response.data["data"][i]["comments"] > primaryComments.length) {
                                comments_data.push(
                                    {
                                        "type": "expand", 
                                        "index": 1, 
                                        "display": true, 
                                        "l0": false, "l1": false, "l2": false, "l3": false,
                                        "commentId": "", 
                                        "mainCommentId": response.data["data"][i]["_id"],
                                        "value": response.data["data"][i]["comments"] - primaryComments.length
                                    }
                                );
                            }
                        } else {
                            if(response.data["data"][i]["comments"] > 0) {
                                comments_data.push({"type": "comment", "l0": true, "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": response.data["data"][i]});
                                comments_data.push(
                                    {
                                        "type": "expand", 
                                        "index": 1, 
                                        "display": true, 
                                        "l0": false, "l1": false, "l2": false, "l3": false,
                                        "commentId": "", 
                                        "mainCommentId": response.data["data"][i]["_id"],
                                        "value": response.data["data"][i]["comments"]
                                    }
                                );
                            } else {
                                comments_data.push({"type": "comment", "l0": false, "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": response.data["data"][i]});
                            }
                        }
                    }

                    let engagementCommentIds = [
                        ...[...response.data["data"].map(desc => `m_${desc._id}`)],
                        ...[...response.data["support"].map(desc => `s_${desc._id}`)]
                    ]
                    const commentEngagements_req = await generalOpx.axiosInstance.put(`/content/posts/comments-engagements`, {commentIds: engagementCommentIds});
                    if(commentEngagements_req.data["status"] === "success") {
                        if(commentEngagements_req.data["data"].length > 0) {
                            dispatch(
                                addToCommentsEngagement(commentEngagements_req.data["data"])
                            );
                        }
                    }
                    let commentExpandLoadingFunction = [...comments["data"], ...comments_data].map(
                        (item, index) => {
                            if(item.type === "expand") {
                                return {[index]: false};
                            }
                        }
                    ).filter(item => item !== undefined);

                    dispatch(
                        updateComments(
                            {
                                "data": [...comments["data"], ...comments_data],
                                "viewCount": comments["viewCount"] + response.data["data"].length,
                                "commentExpandLoading": commentExpandLoadingFunction
                            }
                        )
                    );
                }
            }
        );

        setViewMoreCommentsLoading(false);
    }

    const specificCommentExpand = async (index) => {
        let prevCommentExpandLoadingFunction = [...comments["commentExpandLoading"]];
        const prevCommentExpandLoadingFunctionIndex = prevCommentExpandLoadingFunction.findIndex(desc_obj => Object.keys(desc_obj)[0] === `${index}`);
        prevCommentExpandLoadingFunction[prevCommentExpandLoadingFunctionIndex] = {[index]: true};
        dispatch(
            updateComments(
                {
                    "data": comments["data"],
                    "viewCount": comments["viewCount"],
                    "commentExpandLoading": prevCommentExpandLoadingFunction
                }
            )
        );

        if(comments["data"][index]["type"] === "expand" && index !== 0) {
            let commentIdsToExclude = [];
            const commentIndex = comments["data"][index]["index"] - 1;
            commentIndex === 0 ? commentIdsToExclude = [...comments["data"].filter(desc => desc.value.mainCommentId === comments["data"][index]["mainCommentId"]).map(innerDesc => innerDesc.value._id)] : commentIdsToExclude = [];

            await generalOpx.axiosInstance.put(`/content/posts/comments-specific-expand`, 
                {
                    commentId: comments["data"][index]["commentId"],
                    mainCommentId: comments["data"][index]["mainCommentId"],
                    commentIndex: commentIndex,
                    commentIdsToExlude: commentIdsToExclude
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        let comments_data = [];
                        if(commentIndex === 0) {
                            let primaryComments = [...response.data["data"].filter(doc => doc.index === 1)];
                            for(let j = 0; j < primaryComments.length; j++) {
                                let secondaryComments = [...response.data["data"].filter(doc => doc.commentId === primaryComments[j]["_id"] && doc.index === 2)];

                                if(secondaryComments.length > 0) {
                                    comments_data.push(
                                        {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": true, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]}
                                    );
                                    
                                    for(let k = 0; k < secondaryComments.length; k++) {
                                        let tertiaryComments = [...response.data["data"].filter(doc => doc.commentId === secondaryComments[k]["_id"] && doc.index === 3)];

                                        if(tertiaryComments.length > 0) {
                                            comments_data.push(
                                                {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": !(k === secondaryComments.length - 1), "l2": true, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]}
                                            );
                                            
                                            tertiaryComments = tertiaryComments.sort((a, b) => a.timeStamp - b.timeStamp);
                                            for(let t = 0; t < tertiaryComments.length; t++) {
                                                comments_data.push(
                                                    {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": !(k === secondaryComments.length - 1), "l2": !(t === tertiaryComments.length - 1), "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": tertiaryComments[t]}
                                                );
                                            }
                                        } else {
                                            if(secondaryComments[k]["comments"] > 0) {
                                                comments_data.push(
                                                    {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": !(k === secondaryComments.length - 1), "l2": true, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]}
                                                );
                                                comments_data.push(
                                                    {
                                                        "type": "expand", 
                                                        "index": 3, 
                                                        "display": true, 
                                                        "l0": !(j === primaryComments.length - 1), "l1": !(k === secondaryComments.length - 1), "l2": false, "l3": false,
                                                        "commentId": secondaryComments[k]["_id"], 
                                                        "value": secondaryComments[k]["comments"]
                                                    }
                                                );
                                            } else {
                                                comments_data.push(
                                                    {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": !(k === secondaryComments.length - 1), "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]}
                                                );
                                            }
                                        }
                                    }
                                } else {
                                    if(primaryComments[j]["comments"] > 0) {
                                        comments_data.push(
                                            {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": true, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]}
                                        );
                                        comments_data.push(
                                            {
                                                "type": "expand", 
                                                "index": 2, 
                                                "display": true, 
                                                "l0": !(j === primaryComments.length - 1), "l1": false, "l2": false, "l3": false,
                                                "commentId": primaryComments[j]["_id"], 
                                                "value": primaryComments[j]["comments"]
                                            }
                                        );
                                    } else {
                                        comments_data.push(
                                            {"type": "comment", "l0": !(j === primaryComments.length - 1), "l1": false, "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": primaryComments[j]}
                                        );
                                    }
                                }
                            }
                        } else if(commentIndex === 1) {
                            let bool_l0 = comments["data"][index - 1]["l0"];
                            let secondaryComments = [...response.data["data"].filter(doc => doc.index === 2)];
                            for(let k = 0; k < secondaryComments.length; k++) {
                                let tertiaryComments = [...response.data["data"].filter(doc => doc.commentId === secondaryComments[k]["_id"] && doc.index === 3)];

                                if(tertiaryComments.length > 0) {
                                    comments_data.push(
                                        {"type": "comment", "l0": bool_l0, "l1": !(k === secondaryComments.length - 1), "l2": true, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]}
                                    );
                                    
                                    tertiaryComments = tertiaryComments.sort((a, b) => a.timeStamp - b.timeStamp);
                                    for(let t = 0; t < tertiaryComments.length; t++) {
                                        comments_data.push(
                                            {"type": "comment", "l0": bool_l0, "l1": !(k === secondaryComments.length - 1), "l2": !(t === tertiaryComments.length - 1), "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": tertiaryComments[t]}
                                        );
                                    }
                                } else {
                                    if(secondaryComments[k]["comments"] > 0) {
                                        comments_data.push(
                                            {"type": "comment", "l0": bool_l0, "l1": !(k === secondaryComments.length - 1), "l2": true, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]}
                                        );
                                        comments_data.push(
                                            {
                                                "type": "expand", 
                                                "index": 3, 
                                                "display": true, 
                                                "l0": bool_l0, "l1": !(k === secondaryComments.length - 1), "l2": false, "l3": false,
                                                "commentId": secondaryComments[k]["_id"], 
                                                "value": secondaryComments[k]["comments"]
                                            }
                                        );
                                    } else {
                                        comments_data.push(
                                            {"type": "comment", "l0": bool_l0, "l1": !(k === secondaryComments.length - 1), "l2": false, "l3": false, "display": true, "commentDisplay": false, "deleteDisplay": false, "deleteStatus": 0, "commentTruncated": false, "value": secondaryComments[k]}
                                        );
                                    }
                                }
                            }
                        }

                        let comments_setDataTo = [];
                        if(index === comments["data"].length - 1) {
                            comments_setDataTo = [
                                ...comments["data"].slice(0, index), 
                                ...comments_data
                            ];
                        } else {
                            comments_setDataTo = [
                                ...comments["data"].slice(0, index), 
                                ...comments_data,
                                ...comments["data"].slice(index + 1, comments["data"].length), 
                            ];
                        }

                        let engagementCommentIds = [
                            ...[...response.data["data"].map(desc => `s_${desc._id}`)]
                        ]
                        const commentEngagements_req = await generalOpx.axiosInstance.put(`/content/posts/comments-engagements`, {commentIds: engagementCommentIds});
                        if(commentEngagements_req.data["status"] === "success") {
                            if(commentEngagements_req.data["data"].length > 0) {
                                dispatch(
                                    addToCommentsEngagement(commentEngagements_req.data["data"])
                                );
                            }
                        }

                        let commentExpandLoadingFunction = comments_setDataTo.map(
                            (item, index) => {
                                if(item.type === "expand") {
                                    return {[index]: false};
                                }
                            }
                        ).filter(item => item !== undefined);

                        dispatch(
                            updateComments(
                                {
                                    "data": comments_setDataTo,
                                    "viewCount": comments["viewCount"],
                                    "commentExpandLoading": commentExpandLoadingFunction
                                }
                            )
                        );
                    }
                }
            );
        }
    }

    const engageComment = async (index, commentId, type) => {
        let commentsFunction = [...comments["data"]];
        if(commentsEngagement.some(eng => eng.commentId === commentId)) {
            const prevEngagement = commentsEngagement.filter(eng => eng.commentId === commentId)[0]["type"];
            if(prevEngagement === type) {
                dispatch(
                    removeFromCommentsEngagement(commentId)
                );

                if(type === "like") {
                    commentsFunction[index] = {
                        ...comments["data"][index],
                        "value": {
                            ...comments["data"][index]["value"],
                            "likes": comments["data"][index]["value"]["likes"] - 1
                        }
                    }
                } else if(type === "dislike") {
                    commentsFunction[index] = {
                        ...comments["data"][index],
                        "value": {
                            ...comments["data"][index]["value"],
                            "dislikes": comments["data"][index]["value"]["dislikes"] - 1
                        }
                    }
                }
            } else {
                dispatch(
                    removeFromCommentsEngagement(commentId)
                );
                dispatch(
                    addToCommentsEngagement([{"commentId": commentId, "type": type}])
                );

                if(type === "like") {
                    commentsFunction[index] = {
                        ...comments["data"][index],
                        "value": {
                            ...comments["data"][index]["value"],
                            "likes": comments["data"][index]["value"]["likes"] + 1,
                            "dislikes": comments["data"][index]["value"]["dislikes"] - 1
                        }
                    }
                } else if(type === "dislike") {
                    commentsFunction[index] = {
                        ...comments["data"][index],
                        "value": {
                            ...comments["data"][index]["value"],
                            "likes": comments["data"][index]["value"]["likes"] - 1,
                            "dislikes": comments["data"][index]["value"]["dislikes"] + 1
                        }
                    }
                }
            }
        } else {
            dispatch(
                addToCommentsEngagement([{"commentId": commentId, "type": type}])
            );

            if(type === "like") {
                commentsFunction[index] = {
                    ...comments["data"][index],
                    "value": {
                        ...comments["data"][index]["value"],
                        "likes": comments["data"][index]["value"]["likes"] + 1
                    }
                }
            } else if(type === "dislike") {
                commentsFunction[index] = {
                    ...comments["data"][index],
                    "value": {
                        ...comments["data"][index]["value"],
                        "dislikes": comments["data"][index]["value"]["dislikes"] + 1
                    }
                }
            }
        }
        
        dispatch(
            updateComments(
                {
                    "data": commentsFunction,
                    "viewCount": comments["viewCount"],
                    "commentExpandLoading": comments["commentExpandLoading"]
                }
            )
        );

        await generalOpx.axiosInstance.post(`/content/posts/comments-engage`, {"type": type, "commentId": commentId});
    }

    const commentDisplayToggle = (index) => {
        let commentsFunction = [...comments["data"]];
        comments["data"][index]["commentDisplay"] ? commentsFunction[index] = {
            ...comments["data"][index],
            "commentDisplay": false
        } :  commentsFunction[index] = {
            ...comments["data"][index],
            "commentDisplay": true
        };

        dispatch(
            updateComments(
                {
                    "data": commentsFunction,
                    "viewCount": comments["viewCount"],
                    "commentExpandLoading": comments["commentExpandLoading"]
                }
            )
        );
    }

    const commentDeleteToggle = (index) => {
        let commentsFunction = [...comments["data"]];
        comments["data"][index]["deleteDisplay"] ? commentsFunction[index] = {
            ...comments["data"][index],
            "deleteDisplay": false
        } :  commentsFunction[index] = {
            ...comments["data"][index],
            "deleteDisplay": true
        };

        dispatch(
            updateComments(
                {
                    "data": commentsFunction,
                    "viewCount": comments["viewCount"],
                    "commentExpandLoading": comments["commentExpandLoading"]
                }
            )
        );
    }

    const commentDelete = async (index) => {
        let commentsFunction = [...comments["data"]];
        commentsFunction[index] = {
            ...comments["data"][index],
            "deleteStatus": 1
        }
        dispatch(
            updateComments(
                {
                    "data": commentsFunction,
                    "viewCount": comments["viewCount"],
                    "commentExpandLoading": comments["commentExpandLoading"]
                }
            )
        );

        await generalOpx.axiosInstance.post(`/content/posts/delete-comment`,
            {
                "index": comments["data"][index]["value"]["index"],
                "commentId": comments["data"][index]["value"]["_id"]
            }
        ).then(
            (response) => {
                if(response.data["status"] === "success") {
                    let secondCommentsFunction = [...comments["data"]];
                    secondCommentsFunction[index] = {
                        ...comments["data"][index],
                        "deleteDisplay": false,
                        "deleteStatus": 0,
                        "value": {
                            ...comments["data"][index]["value"],
                            "username": "[deleted]",
                            "profileImage": "",
                            "comment": "[removed]",
                            "photos": [],
                            "videos": [],
                            "status": "inactive"
                        }
                    }

                    dispatch(
                        updateComments(
                            {
                                "data": secondCommentsFunction,
                                "viewCount": comments["viewCount"],
                                "commentExpandLoading": comments["commentExpandLoading"]
                            }
                        )
                    );
                } else {
                    let secondCommentsFunction = [...comments["data"]],
                    thirdCommentsFunction = [...comments["data"]];
                    secondCommentsFunction[index] = {
                        ...comments["data"][index],
                        "deleteStatus": 2
                    }
                    thirdCommentsFunction[index] = {
                        ...comments["data"][index],
                        "deleteStatus": 0
                    }

                    dispatch(
                        updateComments(
                            {
                                "data": secondCommentsFunction,
                                "viewCount": comments["viewCount"],
                                "commentExpandLoading": comments["commentExpandLoading"]
                            }
                        )
                    );

                    setTimeout(() => 
                        {
                            dispatch(
                                updateComments(
                                    {
                                        "data": thirdCommentsFunction,
                                        "viewCount": comments["viewCount"],
                                        "commentExpandLoading": comments["commentExpandLoading"]
                                    }
                                )
                            );
                        }, 2000
                    );
                }
            }
        ).catch(
            () => {
                let secondCommentsFunction = [...comments["data"]],
                    thirdCommentsFunction = [...comments["data"]];
                secondCommentsFunction[index] = {
                    ...comments["data"][index],
                    "deleteStatus": 2
                }
                thirdCommentsFunction[index] = {
                    ...comments["data"][index],
                    "deleteStatus": 0
                }

                dispatch(
                    updateComments(
                        {
                            "data": secondCommentsFunction,
                            "viewCount": comments["viewCount"],
                            "commentExpandLoading": comments["commentExpandLoading"]
                        }
                    )
                );

                setTimeout(() => 
                    {
                        dispatch(
                            updateComments(
                                {
                                    "data": thirdCommentsFunction,
                                    "viewCount": comments["viewCount"],
                                    "commentExpandLoading": comments["commentExpandLoading"]
                                }
                            )
                        );
                    }, 2000
                );
            }
        )
    }

    const setupViewCommentMedia = (index, commentMedia) => {
        dispatch(
            setViewMedia(
                {
                    "index": index,
                    "media": commentMedia
                }
            )
        );
    }

    const [displayShareLinkWrapper, setDisplayShareLinkWrapper] = useState(false);
    const [displayShareLinkOptnsContainerHeight, setDisplayShareLinkOptnsContainerHeight] = useState("0px");
    const displayShareLinkWrapperToggle = () => {
        if(!displayShareLinkWrapper) {
            setDisplayShareLinkWrapper(true);
            setTimeout(() => {setDisplayShareLinkOptnsContainerHeight("300px");}, 0);
        } else {
            setDisplayShareLinkOptnsContainerHeight("0px")
            setTimeout(() => {setDisplayShareLinkWrapper(false);}, 150);
        }
    }

    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    const unsecuredCopyToClipboard = (text) => {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {}

        document.body.removeChild(textArea);
    }

    const copyToClipboard = (content) => {
        if(window.isSecureContext && navigator.clipboard) {
          navigator.clipboard.writeText(content);
        } else {
            unsecuredCopyToClipboard(content);
        }

        setShareLinkCopied(true);
        setTimeout(() => {
            setShareLinkCopied(false);
            displayShareLinkWrapperToggle();
        }, 1000);
    };

    const share_overlayRef = useRef();
    const share_overlayContainerRef = useRef();
    useEffect(() => {
        if(share_overlayRef.current && share_overlayContainerRef.current && displayShareLinkWrapper) {
            const handleClickOutside = (event) => {
                if(share_overlayRef) {
                    if(!share_overlayContainerRef.current?.contains(event?.target)) {
                        displayShareLinkWrapperToggle();
                    }
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            }
        }
    }, [displayShareLinkWrapper, displayShareLinkOptnsContainerHeight]);

    const navigateToShort = () => {
        const currentPosition = window.scrollY;

        dispatch(
            setShortStart(
                {...props.details}
            )
        );
        dispatch(
            setReturnTo(v_page.pathname)
        );
        dispatch(
            setReturnToScrollTop(currentPosition)
        );

        setTimeout(() => {navigate(`/short/${props.details._id}`);}, 0);
    }

    const analyzePostCharCount = (text, timeStamp, type) => {
        let charPerLine = 0;
        if(type === "title") {
            charPerLine = (68 / 535.031) * (props.width - 65);
        } else if(type === "post") {
            charPerLine = (80 / 535.031) * (props.width - 65);
        }

        const capitalRegex = /[A-Z]/g;
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        if(timeStamp <= 1743517206) {
            const text_Breakdown = {
                "tabs": (text.match(/\t/g) || []).length,
                "lineBreaks": (text.match(/(\r\n|\n|\r)/g) || []).length,
                "formFeeds": (text.match(/\f/g) || []).length,
                "verticalTabs": (text.match(/\v/g) || []).length,
                "lineSeparators": (text.match(/\u2028/g) || []).length,
                "paragraphSeparators": (text.match(/\u2029/g) || []).length,
                "totalLength": (text.match(capitalRegex) || []).length / text.length <= 0.21 ? 
                    text.length + ((text.match(emojiRegex) || []).length * 1) :
                    text.length + ((text.match(emojiRegex) || []).length * 1) + ((text.match(capitalRegex) || []).length * 0.355)
            };

            const lines = Math.ceil(
                ((text_Breakdown.totalLength - (
                    text_Breakdown.lineBreaks + text_Breakdown.formFeeds + text_Breakdown.verticalTabs + text_Breakdown.lineSeparators + text_Breakdown.paragraphSeparators
                )) / charPerLine) + (text_Breakdown.lineBreaks + text_Breakdown.formFeeds + text_Breakdown.verticalTabs + text_Breakdown.lineSeparators + text_Breakdown.paragraphSeparators)
            );

            return lines;
        } else {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const innerText = doc.body.textContent.trim();

            const pTags = doc.getElementsByTagName('p').length;
            const brTags = doc.getElementsByTagName('br').length;
            const divTags = doc.getElementsByTagName('div').length;

            const text_Breakdown = {
                "tabs": (innerText.match(/\t/g) || []).length,
                "lineBreaks": (innerText.match(/(\r\n|\n|\r)/g) || []).length,
                "formFeeds": (innerText.match(/\f/g) || []).length,
                "verticalTabs": (innerText.match(/\v/g) || []).length,
                "lineSeparators": (innerText.match(/\u2028/g) || []).length,
                "paragraphSeparators": (innerText.match(/\u2029/g) || []).length,
                "totalLength": (innerText.match(capitalRegex) || []).length / innerText.length <= 0.21 ? 
                    innerText.length + ((innerText.match(emojiRegex) || []).length * 1) :
                    innerText.length + ((innerText.match(emojiRegex) || []).length * 1) + ((innerText.match(capitalRegex) || []).length * 0.355)
            };

            const lines = Math.ceil(
                ((text_Breakdown.totalLength - (
                    text_Breakdown.lineBreaks + text_Breakdown.formFeeds + text_Breakdown.verticalTabs + text_Breakdown.lineSeparators + text_Breakdown.paragraphSeparators
                )) / charPerLine) + (pTags + brTags + divTags - 1) +
                (text_Breakdown.lineBreaks + text_Breakdown.formFeeds + text_Breakdown.verticalTabs + text_Breakdown.lineSeparators + text_Breakdown.paragraphSeparators)
            );

            return lines;
        }
    }

    const [displayPostMoreOptns, setDisplayPostMoreOptns] = useState(false);
    const displayPostMoreOptnsToggle = () => {displayPostMoreOptns ? setDisplayPostMoreOptns(false) : setDisplayPostMoreOptns(true);}

    const displayPostOptns_overlayRef = useRef();
    const displayPostOptns_overlayContainerRef = useRef();
    useEffect(() => {
        if(displayPostOptns_overlayRef.current && displayPostOptns_overlayContainerRef.current && displayPostMoreOptns) {
            const handleClickOutside = (event) => {
                if(displayPostOptns_overlayRef) {
                    if(!displayPostOptns_overlayContainerRef.current?.contains(event?.target)) {
                        displayPostMoreOptnsToggle();
                    }
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            }
        }
    }, [displayPostMoreOptns]);

    const navigateToEditPost = () => {
        dispatch(
            setEditPost(
                {
                    "postId": props.details._id,
                    "post": props.details.post,
                    "postMedia": postMedia,
                    "groupDesc": {"name": props.details.groupId, "image": props.details.groupProfileImage},
                    "repostDesc": props.details.validTags
                }
            )
        );

        if(displayPostMoreOptns) {setDisplayPostMoreOptns(false);}
        navigate("/create-post");
    }

    const [displayPostDeleteOptns, setDisplayPostDeleteOptns] = useState(false);
    const displayPostDeleteOptnsToggle = () => {
        if(displayPostMoreOptns) {setDisplayPostMoreOptns(false);}
        displayPostDeleteOptns ? setDisplayPostDeleteOptns(false) : setDisplayPostDeleteOptns(true);
    }
    
    const displayPostDeleteOptns_overlayRef = useRef();
    const displayPostDeleteOptns_overlayContainerRef = useRef();
    const [deletePostLoading, setDeletePostLoading] = useState(false);
    useEffect(() => {
        if(displayPostDeleteOptns_overlayRef.current && displayPostDeleteOptns_overlayContainerRef.current && displayPostDeleteOptns) {
            const handleClickOutside = (event) => {
                if(displayPostDeleteOptns_overlayRef) {
                    if(!displayPostDeleteOptns_overlayContainerRef.current?.contains(event?.target)) {
                        if(!deletePostLoading) {displayPostDeleteOptnsToggle();}
                    }
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            }
        }
    }, [displayPostDeleteOptns, deletePostLoading]);

    const [deletePostErrorState, setDeletePostErrorState] = useState(0);
    const deletePost = async () => {
        setDeletePostLoading(true);

        await generalOpx.axiosInstance.post(`/content/posts/delete-post`, 
            {
                "postId": props.details._id
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    setDeletePostErrorState(2);

                    setTimeout(() => {
                        setDeletePostErrorState(0);
                        setDeletePostLoading(false);

                        /* stocks and crypto pages */
                        let assetPosts = [...stockPosts["posts"]["data"]];
                        if(assetPosts.length > 0) {
                            if(assetPosts.some(pst => pst._id === props.details._id)) {
                                let newAssetPosts = [...assetPosts.filter(pst => pst._id !== props.details._id)];
                                dispatch(
                                    updateStockPosts(
                                        {
                                            "data": newAssetPosts,
                                            "dataCount": stockPosts["posts"]["dataCount"] - 1,
                                            "dataLoading": stockPosts["posts"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }

                        /* home for you page */
                        let homePagePosts = [...homePageData["pageData"]["data"]];
                        if(homePagePosts.length > 0) {
                            if(homePagePosts.some(pst => pst._id === props.details._id)) {
                                let newHomePagePosts = [...homePagePosts.filter(pst => pst._id !== props.details._id)];
                                dispatch(
                                    updateHomePageData(
                                        {
                                            "data": newHomePagePosts,
                                            "dataLoading": homePageData["pageData"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }

                        /* home following page */
                        let homePageFollowingPosts = [...homePageData["followingData"]["data"]];
                        if(homePageFollowingPosts.length > 0) {
                            if(homePageFollowingPosts.some(pst => pst._id === props.details._id)) {
                                let newHomePageFollowingPosts = [...homePageFollowingPosts.filter(pst => pst._id !== props.details._id)];
                                dispatch(
                                    updateHomePageFollowingData(
                                        {
                                            "data": newHomePageFollowingPosts,
                                            "dataLoading": homePageData["followingData"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }

                        /* home - post page */
                        if(homePageData["selected"]["type"] === "Post") {
                            if(homePageData["selected"]["selectedDesc"]["desc"]["_id"] === props.details._id) {
                                dispatch(
                                    updateSelection(
                                        {
                                            "type": "",
                                            "selectedDesc": {
                                                "desc": {}
                                            }
                                        }
                                    )
                                );
                            }
                        }

                        /* profile - posts page */
                        let profilePagePosts = [...profilePageData["posts"]["data"]];
                        if(profilePagePosts.length > 0) {
                            if(profilePagePosts.some(pst => pst._id === props.details._id)) {
                                let targetIndex = profilePagePosts.findIndex(pst => pst._id === props.details._id);
                                let newProfilePagePosts = [...profilePagePosts.filter(pst => pst._id !== props.details._id)];
                                
                                dispatch(
                                    setPosts(
                                        {
                                            "username": profilePageData["posts"]["username"],
                                            "data": newProfilePagePosts,
                                            "dataCount": profilePageData["posts"]["dataCount"] - 1,
                                            "insightsExpand": [...profilePageData["posts"]["insightsExpand"].filter((isght_exp, index) => index !== targetIndex)],
                                            "dataLoading": profilePageData["posts"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }

                        /* profile - engaged posts page */
                        if(profilePageData["engaged"]["type"] === "posts") {
                            let profilePageEngagedPosts = [...profilePageData["engaged"]["data"]];
                            if(profilePageEngagedPosts.length > 0) {
                                if(profilePageEngagedPosts.some(pst => pst._id === props.details._id)) {
                                    let newProfilePageEngagedPosts = [...profilePageEngagedPosts.filter(pst => pst._id !== props.details._id)];
                                    
                                    dispatch(
                                        setEngaged(
                                            {
                                                "username": profilePageData["engaged"]["username"],
                                                "type": "posts",
                                                "data": newProfilePageEngagedPosts,
                                                "support": profilePageData["engaged"]["support"],
                                                "dataCount": profilePageData["engaged"]["dataCount"] - 1,
                                                "dataLoading": profilePageData["engaged"]["dataLoading"]
                                            }
                                        )
                                    );
                                }
                            }
                        }
                        
                        /* search - top */
                        if(finulabSearchData["top"]["data"].length > 0) {
                            let finulabSearchTopPosts = [...finulabSearchData["top"]["data"]];

                            if(finulabSearchTopPosts.some(pst => pst._id === props.details._id)) {
                                let newFinulabSearchTopPosts = [...finulabSearchTopPosts.filter(pst => pst._id !== props.details._id)];
                                dispatch(
                                    setTop(
                                        {
                                            "query": finulabSearchData["top"]["query"],
                                            "data": newFinulabSearchTopPosts,
                                            "dataCount": finulabSearchData["top"]["dataCount"] - 1,
                                            "dataLoading": finulabSearchData["top"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }

                        /* search - latest */
                        if(finulabSearchData["latest"]["data"].length > 0) {
                            let finulabSearchLatestPosts = [...finulabSearchData["latest"]["data"]];

                            if(finulabSearchLatestPosts.some(pst => pst._id === props.details._id)) {
                                let newFinulabSearchLatestPosts = [...finulabSearchLatestPosts.filter(pst => pst._id !== props.details._id)];
                                dispatch(
                                    setLatest(
                                        {
                                            "query": finulabSearchData["latest"]["query"],
                                            "data": newFinulabSearchLatestPosts,
                                            "dataCount": finulabSearchData["latest"]["dataCount"],
                                            "dataLoading": finulabSearchData["latest"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }

                        /* shorts - start */
                        if(finulabShortsData["start"]["_id"] === props.details._id) {
                            dispatch(
                                setShortStart({})
                            );
                        }

                        /* shorts - remainder */
                        if(finulabShortsData["shorts"]["data"].length > 0) {
                            let finulabShortsPosts = [...finulabShortsData["shorts"]["data"]];

                            if(finulabShortsPosts.some(pst => pst._id === props.details._id)) {
                                let newFinulabShortsPosts = [...finulabShortsPosts.filter(pst => pst._id !== props.details._id)];
                                dispatch(
                                    setShortData(
                                        {
                                            "data": newFinulabShortsPosts,
                                            "dataLoading": finulabShortsData["shorts"]["dataLoading"]
                                        }
                                    )
                                );
                            }
                        }
                    }, 2000);
                } else {
                    setDeletePostErrorState(1);

                    setTimeout(() => {
                        setDeletePostErrorState(0);
                        setDeletePostLoading(false);
                    }, 2000);
                }
            }
        ).catch(
            () => {
                setDeletePostErrorState(1);

                setTimeout(() => {
                    setDeletePostErrorState(0);
                    setDeletePostLoading(false);
                }, 2000);
            }
        );
    }

    const repostNavigation = () => {
        dispatch(
            setEditPost(
                {
                    "postId": "",
                    "post": "",
                    "postMedia": [],
                    "groupDesc": {"name": "", "image": ""},
                    "repostDesc": [
                        {
                            "type": "post",
                            "predType": "",
                            "data": props.details
                        }
                    ]
                }
            )
        );

        navigate("/create-post");
    }

    return(
        <div className="post-Wrapper">
            {props.loading ?
                null : 
                <>
                    {props.details.repostId === "" ?
                        null : 
                        <div className="post-repostContainer">
                            tesemma.fin-us reposted
                        </div>
                    }
                </>
            }
            <div className="post-headerContainer">
                {/*props.loading ?
                    null :
                    <>
                        {props.details.groupId === "" ? 
                            null : 
                            <>
                                {props.details.groupProfileImage === "" ? 
                                    <div className="post-headerProfileImageNone"
                                            style={generalOpx.profilePictureGradients[(`${props.details.groupId}`.length % 5)]}
                                        >
                                        <img src="/assets/Favicon.png" alt="" className="large-homePageHeaderProfileImgNonUser" />
                                        <Tsunami className="post-headerProfileImageNoneIcon"/>
                                    </div> : 
                                    <img src={props.details.groupProfileImage} alt="" className="post-headerProfileImage" />
                                }<span style={{"color": "var(--primary-bg-05)"}}>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
                            </>
                        }
                    </>
                    
                */}
                {props.loading ?
                    <div className="post-headerProfileImageLoading" /> :
                    <>
                        {props.details.profileImage === "" ? 
                            <button className="post-profileImageNavigateBtn"
                                    onClick={() => navigate(`/profile/${props.details.username}`)}
                                >
                                <div className="post-headerProfileImageNone"
                                        style={generalOpx.profilePictureGradients[`${props.details.username}`.length % 5]}
                                    >
                                    <BlurOn style={{"transform": "scale(1.5)", "color": `var(--primary-bg-${`${props.details.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                </div>
                            </button> : 
                            <button className="post-profileImageNavigateBtn"
                                    onClick={() => navigate(`/profile/${props.details.username}`)}
                                >
                                <img src={props.details.profileImage} alt="" className="post-headerProfileImage" />
                            </button>
                        }
                    </>
                    
                }
                {props.loading ?
                    <div className="post-headerNameLoading"/> : 
                    <div className="post-headerNameFullContainer"
                            style={props.details.groupId === "" ? {"justifyContent": "center"} : {}}
                        >
                        {props.details.groupId === "" ? 
                            null : 
                            <div className="post-headerSecondaryName">
                                <button className="post-profileImageNavigateBtn" onClick={() => navigate(`/profile/${props.details.groupId}`)}>{props.details.groupId}</button>
                            </div>
                        }
                        <div className="post-headerName">
                            <button className="post-profileImageNavigateBtn" onClick={() => navigate(`/profile/${props.details.username}`)}>{props.details.username}</button>
                            {props.details.verified ?
                                <Verified className="post-headerVerifiedIcon"/> : null
                            }
                            <span className="post-headerTimeAgo">&nbsp;&nbsp;•&nbsp;&nbsp;{format(props.details.timeStamp * 1000)}</span>
                            
                            {props.user === undefined || props.user === null || props.user === "visitor" ?
                                null : 
                                <>
                                    {props.user === props.details.username ?
                                        <button className="post-optnsContainerBtn"
                                                ref={displayPostOptns_overlayRef}
                                                onClick={() => displayPostMoreOptnsToggle()}
                                            >
                                            <MoreHoriz className="post-optnsContainerBtnIcon" />
                                        </button> : null
                                    }
                                </>
                            }
                        </div>
                        {props.user === undefined || props.user === null || props.user === "visitor" ?
                            null : 
                            <>
                                {props.user === props.details.username ?
                                    <div className="post-optnsContainerMoreOptnContainer"
                                            ref={displayPostOptns_overlayContainerRef}
                                            style={displayPostMoreOptns ? {"display": "flex"} : {"display": "none"}}
                                        >
                                        <button className="post-optnsContainerInnerOptnBtn"
                                                onClick={() => navigateToEditPost()}
                                            >
                                            <EditNoteSharp 
                                                style={{"marginLeft": "-2px", "marginRight": "10px"}}
                                            />
                                            Edit
                                        </button>
                                        <button className="post-optnsContainerInnerOptnBtn" style={{"border": "none"}}
                                                onClick={() => displayPostDeleteOptnsToggle()}
                                            >
                                            <DeleteSharp 
                                                style={{"transform": "scale(0.85)", "marginLeft": "-5px", "marginRight": "12px"}}
                                            />
                                            Delete
                                        </button>
                                    </div> : null
                                }
                            </>
                        }
                    </div>
                }
            </div>
            {props.loading ?
                null : 
                <>
                    {(props.target === "profile" && props.verified) || props.user === undefined || props.user === null || props.user === "visitor" ?
                        null : 
                        <>
                            {props.user === props.details.username && props.details.userRewards > 0 ?
                                <div className="post-rewardsDescContainer">
                                    Post-Rewards: {generalOpx.formatFiguresCrypto.format(props.details.userRewards)} FINUX
                                </div> : 
                                <>
                                    {u_moderatorStatus.some(modStat => modStat.community === props.details.groupId) && props.details.communityRewards > 0 ?
                                        <div className="post-rewardsDescContainer">
                                            Community-Rewards: {generalOpx.formatFiguresCrypto.format(props.details.communityRewards)} FINUX
                                        </div> : null
                                    }
                                </>
                            }
                        </>
                    }
                </>
            }
            {props.loading ?
                <div className="post-titleContainerLoading"></div> : 
                <>
                    {props.details.title === "" ?
                        null : 
                        <>
                            {props.view === "mini" ?
                                <button className="post-bodyTextDescBtn"
                                        onClick={() => setSideDisplaySelection()}
                                    >
                                    <div className="post-titleContainer">{props.details.title}</div>
                                </button> : 
                                <div className="post-bodyTitleDescContainer">
                                    <div className="post-titleContainer">{props.details.title}</div>
                                </div>
                            }
                        </>
                    }
                </>
            }
            {props.loading ?
                <div className="post-bodyTextDescLoadingContainer">
                    <div className="post-bodyTextDescLoading"/>
                    <div className="post-bodyTextDescLoading"/>
                </div> :
                <>
                    {props.details.post === "" ? 
                        null : 
                        <>
                            {props.view === "mini" ?
                                <button className="post-bodyTextDescBtn"
                                        onClick={() => setSideDisplaySelection()}
                                    >
                                    <div className="post-miniBodyTextDescContainer">
                                        <div className="post-miniBodyTextDesc" ref={postTextRef}>
                                            <div 
                                                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.details.post)}}
                                                className="post-bodyTextDescUpgradedMinimized"
                                            />
                                        </div>
                                    </div>
                                </button> :
                                <div className="post-bodyTextDesc">
                                    <div 
                                        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.details.post)}}
                                        className="post-bodyTextDescUpgraded"
                                    />
                                </div>
                            }
                        </>
                    }
                </>
            }
            {props.view === "mini" && analyzePostCharCount(props.details.post, props.details.timeStamp, "post") > 3 ?
                <button className="post-bodyTextShowMoreBtn" onClick={() => setSideDisplaySelection()}>Show More</button> : null
            }
            {props.loading ?
                null : 
                <>
                    {postMedia.length === 0 || props.shortFlag === "YES" ?
                        null : 
                        <div className="post-mediaContainer">
                            {postMedia.length === 1 ?
                                <>
                                    {postMedia[0][1] === "photo" ?
                                        <button className="post-mediaOneImgBtn"
                                                onClick={() => setupViewMedia(0)}
                                            >
                                            <img src={postMedia[0][0]} alt="" className="post-mediaOneImg" />
                                        </button> : 
                                        <div className="post-mediaVideoOneContainer" ref={ref}>
                                            <button className="post-mediaShortBtn"
                                                onClick={() => navigateToShort()}
                                            ></button>
                                            {props.view === "mini" ? 
                                                <>
                                                    <video className="post-video" ref={videoRef} 
                                                            loop muted controls playsInline
                                                        >
                                                        <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                    </video>
                                                    {/*inView ?
                                                        <video className="post-video" ref={videoRef} 
                                                                loop muted controls playsInline
                                                            >
                                                            <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                        </video> : 
                                                        <div className="post-video" style={{"backgroundColor": "var(--secondary-bg-03)"}}/>
                                                    */}
                                                </> : 
                                                <video className="post-video" muted controls>
                                                    <source src={`${postMedia[0][0]}#t=1.5`} type="video/mp4"/>
                                                </video>
                                            }
                                        </div>
                                    }
                                </> : 
                                <>
                                    {postMedia.length === 2 ?
                                        <>
                                            {postMedia[0][1] === "photo" ?
                                                <button className="post-mediaOneofTwoBtn"
                                                        onClick={() => setupViewMedia(0)}
                                                    >
                                                    <img src={postMedia[0][0]} alt="" className="post-mediaOneofTwoImg" />
                                                </button> : 
                                                <div className="post-mediaVideoOneofTwoContainer">
                                                    <video className="post-mediaOneofTwoImg" muted controls playsInline>
                                                        <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                    </video>
                                                    <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewMedia(0)}></button>
                                                </div>
                                            }
                                            {postMedia[1][1] === "photo" ?
                                                <button className="post-mediaTwoofTwoBtn"
                                                        onClick={() => setupViewMedia(1)}
                                                    >
                                                    <img src={postMedia[1][0]} alt="" className="post-mediaTwoofTwoImg" />
                                                </button> : 
                                                <div className="post-mediaVideoTwoofTwoContainer">
                                                    <video className="post-mediaTwoofTwoImg" muted controls playsInline>
                                                        <source src={`${postMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                    </video>
                                                    <button className="post-mediaTwoofTwoVideoBtn" onClick={() => setupViewMedia(1)}></button>
                                                </div>
                                            }
                                        </> : 
                                        <>
                                            {postMedia.length === 3 ?
                                                <>
                                                    {postMedia[0][1] === "photo" ?
                                                        <button className="post-mediaOneofTwoBtn"
                                                                onClick={() => setupViewMedia(0)}
                                                            >
                                                            <img src={postMedia[0][0]} alt="" className="post-mediaOneofTwoImg" />
                                                        </button> : 
                                                        <div className="post-mediaVideoOneofTwoContainer">
                                                            <video className="post-mediaOneofTwoImg" muted controls playsInline>
                                                                <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                            </video>
                                                            <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewMedia(0)}></button>
                                                        </div>
                                                    }
                                                    <div className="post-mediaThreeInnerContainer">
                                                        {postMedia[1][1] === "photo" ?
                                                            <button className="post-mediaTwoofThreeBtn"
                                                                    onClick={() => setupViewMedia(1)}
                                                                >
                                                                <img src={postMedia[1][0]} alt="" className="post-mediaTwoofThreeImg" />
                                                            </button> : 
                                                            <div className="post-mediaVideoTwoofThreeContainer">
                                                                <video className="post-mediaTwoofThreeImg" muted controls playsInline>
                                                                    <source src={`${postMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                </video>
                                                                <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewMedia(1)}></button>
                                                            </div>
                                                        }
                                                        {postMedia[2][1] === "photo" ?
                                                            <button className="post-mediaThreeofThreeBtn"
                                                                    onClick={() => setupViewMedia(2)}
                                                                >
                                                                <img src={postMedia[2][0]} alt="" className="post-mediaThreeofThreeImg" />
                                                            </button> : 
                                                            <div className="post-mediaVideoThreeofThreeContainer">
                                                                <video className="post-mediaThreeofThreeImg" muted controls playsInline>
                                                                    <source src={`${postMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                </video>
                                                                <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewMedia(2)}></button>
                                                            </div>
                                                        }
                                                    </div>
                                                </> : 
                                                <>
                                                    <div className="post-mediaThreeInnerContainer">
                                                        {postMedia[0][1] === "photo" ?
                                                            <button className="post-mediaOneofFourBtn"
                                                                    onClick={() => setupViewMedia(0)}
                                                                >
                                                                <img src={postMedia[0][0]} alt="" className="post-mediaOneofFourImg" />
                                                            </button> : 
                                                            <div className="post-mediaVideoOneofFourContainer">
                                                                <video className="post-mediaOneofFourImg" muted controls playsInline>
                                                                    <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                </video>
                                                                <button className="post-mediaVideoOneofFourBtn" onClick={() => setupViewMedia(0)}></button>
                                                            </div>
                                                        }
                                                        {postMedia[1][1] === "photo" ?
                                                            <button className="post-mediaTwoofFourBtn"
                                                                    onClick={() => setupViewMedia(1)}
                                                                >
                                                                <img src={postMedia[1][0]} alt="" className="post-mediaTwoofFourImg" />
                                                            </button> : 
                                                            <div className="post-mediaVideoTwoofFourContainer">
                                                                <video className="post-mediaTwoofFourImg" muted controls playsInline>
                                                                    <source src={`${postMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                </video>
                                                                <button className="post-mediaVideoTwoofFourBtn" onClick={() => setupViewMedia(1)}></button>
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="post-mediaThreeInnerContainer">
                                                        {postMedia[2][1] === "photo" ?
                                                            <button className="post-mediaTwoofThreeBtn"
                                                                    onClick={() => setupViewMedia(2)}
                                                                >
                                                                <img src={postMedia[2][0]} alt="" className="post-mediaTwoofThreeImg" />
                                                            </button> : 
                                                            <div className="post-mediaVideoTwoofThreeContainer">
                                                                <video className="post-mediaTwoofThreeImg" muted controls playsInline>
                                                                    <source src={`${postMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                </video>
                                                                <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewMedia(2)}></button>
                                                            </div>
                                                        }
                                                        {postMedia[3][1] === "photo" ?
                                                            <button className="post-mediaThreeofThreeBtn"
                                                                    onClick={() => setupViewMedia(3)}
                                                                >
                                                                <img src={postMedia[3][0]} alt="" className="post-mediaThreeofThreeImg" />
                                                            </button> : 
                                                            <div className="post-mediaVideoThreeofThreeContainer">
                                                                <video className="post-mediaThreeofThreeImg" muted controls playsInline>
                                                                    <source src={`${postMedia[3][0]}#t=0.5`} type="video/mp4"/>
                                                                </video>
                                                                <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewMedia(3)}></button>
                                                            </div>
                                                        }
                                                    </div>
                                                </>
                                            }
                                        </>
                                    }
                                </>
                            }
                        </div>
                    }
                </>
            }
            {props.loading ? 
                null : 
                <>
                    {props.details.validTags.length === 0 ?
                        null :
                        <>
                            {props.details.validTags[0]["type"] === "post" ? 
                                <div className="post-miniaturizedComponentContainer" style={{"marginTop": "0px"}}>
                                    <MiniPost 
                                        details={props.details.validTags[0]["data"]}
                                    />
                                </div> : 
                                <>
                                    {props.details.validTags[0]["type"] === "news" ?
                                        <div className="post-miniaturizedComponentContainer"
                                                style={{"height": "125px", "minHeight": "125px", "maxHeight": "125px"}}
                                            >
                                            <MiniaturizedNews 
                                                loading={false}
                                                type={"repost"}
                                                pred_ticker={props.details.validTags[0]["data"]["ticker"]}
                                                width={props.width}
                                                width_index={0}
                                                user={props.user}
                                                desc={props.details.validTags[0]["data"]}
                                            />
                                        </div> : 
                                        <>
                                            {props.details.validTags[0]["type"] === "pred" ?
                                                <div className="post-miniaturizedComponentContainer"
                                                        style={props.details.validTags[0]["predType"] === "yes-or-no" ?
                                                            {"height": "120px", "minHeight": "120px", "maxHeight": "120px"} : {"height": "175px", "minHeight": "175px", "maxHeight": "175px"}
                                                        }
                                                    >
                                                    <MiniMiniPred 
                                                        loading={false}
                                                        desc={props.details.validTags[0]["data"]}
                                                    />
                                                </div> : null
                                            }
                                        </>
                                    }
                                </>
                            }
                        </>
                    }
                </>
            }
            <div className="post-engagementContainer"
                    style={{"marginTop": "16px", 
                        "marginLeft": "45px", "width": "calc(100% - 45px)", "minWidth": "calc(100% - 45px)", "maxWidth": "calc(100% - 45px)"
                    }}
                >
                <div className="post-likeDislikeContainer">
                    <button className="post-likeDislikeBtn"
                            onClick={
                                (props.user === undefined || props.user === null || props.user === "visitor") ?
                                () => navigate("/login") : () => engagePost("like")
                            }
                        >
                        {props.loading ?
                            <TrendingUp className="post-likeDislikeIcon"
                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                            /> :
                            <>
                                {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                    <TrendingUp className="post-likeDislikeIcon"
                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                    /> :
                                    <>
                                        {u_postEngagement.some(eng => eng.postId === props.details._id) ?
                                            <>
                                                {u_postEngagement.filter(eng => eng.postId === props.details._id)[0]["type"] === "like" ?
                                                    <TrendingUp className="post-likedIcon" 
                                                        style={{"stroke": "var(--primary-green-09)", "strokeWidth": "1px"}}
                                                    /> :
                                                    <TrendingUp className="post-likeDislikeIcon"
                                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                    />
                                                }
                                            </> : 
                                            <TrendingUp className="post-likeDislikeIcon"
                                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                            />
                                        }
                                    </>
                                }
                            </>
                        }
                    </button>
                    {props.loading || engagementRatio[0] + engagementRatio[1] === 0 ?
                        null : 
                        <span className="comment-likeDislikeCounter">
                            {engagementRatio[0] - engagementRatio[1] > 0 ? "+ " : "-"}
                            {generalOpx.formatLargeFigures(Math.abs(engagementRatio[0] - engagementRatio[1]), 2)}
                        </span>
                    }
                    <button className="post-likeDislikeBtn"
                            onClick={
                                (props.user === undefined || props.user === null || props.user === "visitor") ?
                                () => navigate("/login") : () => engagePost("dislike")
                            }
                        >
                        {props.loading ?
                            <TrendingDown className="post-likeDislikeIcon"
                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px", "transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)"}}
                            /> :
                            <>
                                {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                   <TrendingDown className="post-likeDislikeIcon"
                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px", "transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)"}}
                                   /> :
                                    <>
                                        {u_postEngagement.some(eng => eng.postId === props.details._id) ?
                                            <>
                                                {u_postEngagement.filter(eng => eng.postId === props.details._id)[0]["type"] === "dislike" ?
                                                    <TrendingDown className="post-dislikedIcon" 
                                                        style={{"stroke": "var(--primary-red-09)", "strokeWidth": "1px", "transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)"}}
                                                    /> :
                                                    <TrendingDown className="post-likeDislikeIcon"
                                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px", "transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)"}}
                                                    />
                                                }
                                            </> : 
                                            <TrendingDown className="post-likeDislikeIcon"
                                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px", "transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)"}}
                                            />
                                        }
                                    </>
                                }
                            </>
                        }
                    </button>
                </div>
                <div className="post-additionalEngagementOptionsContainer">
                    <button className="post-additionalEngagementOptionsDesc"
                            onClick={() => repostNavigation()}
                        >
                        <Cached className="post-additionalEngagementOptionsDescIcon"/>
                        {props.loading || repostCount === 0 ?
                            null : 
                            <span className="post-additionalEngagementOptionsDescText">{generalOpx.formatLargeFigures(repostCount, 2)}</span>
                        }
                    </button>
                    <button className="post-additionalEngagementOptionsDesc"
                            onClick={() => navigate(`/post/${props.details._id}`)}
                        >
                        <ChatBubbleOutline className="post-additionalEngagementOptionsDescIcon" style={{"transform": "scaleX(-1)"}}/>
                        {props.loading || commentCount === 0 ?
                            null : 
                            <span className="post-additionalEngagementOptionsDescText">{generalOpx.formatLargeFigures(commentCount, 2)}</span>
                        }
                    </button>
                    <button className="post-additionalEngagementOptionsDesc"
                            onClick={() => displayShareLinkWrapperToggle()}
                        >
                        <IosShare className="post-additionalEngagementOptionsDescIcon"/>
                    </button>
                </div>
            </div>
            
            <div className="finulab-shareLinkAcrossMediaWrapper"
                    ref={displayPostDeleteOptns_overlayRef}
                    style={
                        {
                            "display": displayPostDeleteOptns ? "flex" : "none",
                            "width": `${props.width}px`, "minWidth": `${props.width}px`, "maxWidth": `${props.width}px`
                        }
                    }
                >
                {props.loading ?
                    null : 
                    <div className="finulab-deletePostOptnsContainer"
                            ref={displayPostDeleteOptns_overlayContainerRef}
                        >
                        <div className="finulab-deletePostOptnsContainerHeader">Delete Post</div>
                        <div className="finulab-deletePostOptnsContainerBody">
                            {deletePostErrorState === 1 ? 
                                <span style={{"color": "var(--primary-red-09)"}}>An error occured, please try later.</span> : 
                                <>
                                    {deletePostErrorState === 2 ? 
                                        <span style={{"color": "var(--primary-green-09)"}}>Successfuly Deleted</span> : 
                                        `Are you sure you want to delete this post?`
                                    }
                                </>
                            }
                        </div>
                        <div className="finulab-deletePostOptnsInnerContainer">
                            <button className="finulab-deletePostOptnBtn"
                                    disabled={deletePostLoading}
                                    style={{"color": "var(--primary-bg-05)", "border": "solid 2px var(--primary-bg-05)"}}
                                    onClick={() => displayPostDeleteOptnsToggle()}
                                >
                                Cancel
                            </button>
                            <button className="finulab-deletePostOptnBtn"
                                    disabled={deletePostLoading}
                                    onClick={() => deletePost()}
                                >
                                {deletePostLoading ? 
                                    <BeatLoader 
                                        color='#f6be76'
                                        loading={true}
                                        size={5}
                                    />: `Delete`
                                }
                            </button>
                        </div>
                    </div>
                }
            </div>

            <div className="finulab-shareLinkAcrossMediaWrapper"
                    ref={share_overlayRef}
                    style={
                        {
                            "display": displayShareLinkWrapper ? "flex" : "none",
                            "width": `${props.width}px`, "minWidth": `${props.width}px`, "maxWidth": `${props.width}px`
                        }
                    }
                >
                {props.loading ?
                    null : 
                    <div className="finulab-shareLinkAcrossMediaContainer"
                            ref={share_overlayContainerRef}
                            style={ 
                                {"height": `${displayShareLinkOptnsContainerHeight}`, "minHeight": `${displayShareLinkOptnsContainerHeight}`, "maxHeight": `${displayShareLinkOptnsContainerHeight}`}
                            }
                        >
                        <div className="finulab-shareLinkAcrossMediaHeader">Share Post</div>
                        <div className="finulab-shareLinkAcrossOptnsContainer">
                            <button className="finulab-shareLinkAcrossOptnBtn"
                                    onClick={() => copyToClipboard(`https://finulab.com/post/${props.details._id}`)}
                                >
                                <div className="finulab-shareLinkAcrossOptnBtnIconContainer"
                                        style={{"border": "solid 1px var(--primary-bg-01)"}}
                                    >
                                    {shareLinkCopied ? 
                                        <CheckCircle className="finulab-shareLinkAcrossOptnCopiedIconFull"/> :
                                        <Link className="finulab-shareLinkAcrossOptnBtnIcon"/>
                                    }
                                </div>
                                Copy Link
                            </button>
                        </div>
                        <div className="finulab-shareLinkAcrossOptnsContainer">
                            <div className="finulab-shareLinkAcrossOptn_fBtn">
                                <TwitterShareButton
                                        url={`https://finulab.com/post/${props.details._id}`}
                                        onClick={() => displayShareLinkWrapperToggle()}
                                    >
                                    <div className="finulab-shareLinkAcrossOptnBtnIconContainer">
                                        <TwitterIcon/>
                                    </div>
                                </TwitterShareButton>
                                X
                            </div>
                            <div className="finulab-shareLinkAcrossOptn_fBtn">
                                <FacebookShareButton
                                        url={`https://finulab.com/post/${props.details._id}`}
                                        onClick={() => displayShareLinkWrapperToggle()}
                                    >
                                    <div className="finulab-shareLinkAcrossOptnBtnIconContainer">
                                        <FacebookIcon/>
                                    </div>
                                </FacebookShareButton>
                                Facebook
                            </div>
                            <div className="finulab-shareLinkAcrossOptn_fBtn">
                                <RedditShareButton
                                        url={`https://finulab.com/post/${props.details._id}`}
                                        onClick={() => displayShareLinkWrapperToggle()}
                                    >
                                    <div className="finulab-shareLinkAcrossOptnBtnIconContainer">
                                        <RedditIcon/>
                                    </div>
                                </RedditShareButton>
                                Reddit
                            </div>
                            <div className="finulab-shareLinkAcrossOptn_fBtn">
                                <TelegramShareButton
                                        url={`https://finulab.com/post/${props.details._id}`}
                                        onClick={() => displayShareLinkWrapperToggle()}
                                    >
                                    <div className="finulab-shareLinkAcrossOptnBtnIconContainer">
                                        <TelegramIcon/>
                                    </div>
                                </TelegramShareButton>
                                Telegram
                            </div>
                            <div className="finulab-shareLinkAcrossOptn_fBtn">
                                <LinkedinShareButton
                                        url={`https://finulab.com/post/${props.details._id}`}
                                        onClick={() => displayShareLinkWrapperToggle()}
                                    >
                                    <div className="finulab-shareLinkAcrossOptnBtnIconContainer">
                                        <LinkedinIcon/>
                                    </div>
                                </LinkedinShareButton>
                                LinkedIn
                            </div>
                            <div className="finulab-shareLinkAcrossOptn_fBtn">
                                <BlueskyShareButton
                                        url={`https://finulab.com/post/${props.details._id}`}
                                        onClick={() => displayShareLinkWrapperToggle()}
                                    >
                                    <div className="finulab-shareLinkAcrossOptnBtnIconContainer">
                                        <BlueskyIcon/>
                                    </div>
                                </BlueskyShareButton>
                                Bluesky
                            </div>
                        </div>
                        <div className="finulab-shareLineAcrossOpntsUnderline">
                            <img src="/assets/Favicon.png" alt="" className="finulab-shareLikeAcrossProvidedByImg" />
                        </div>
                    </div>
                }
            </div>

            {props.view === "max" ?
                <div className="post-makeCommentBody">
                    <div className="post-makeCommentInputBox"
                            style={{
                                "bottom": props.v_display ? "75px" : "0px",
                                "width": `${props.width}px`, "minWidth": `${props.width}px`, "maxWidth": `${props.width}px`
                            }}
                        >
                        <FinulabComment type={"main"} commFor={"post"} location={props.type} desc={{"postId": props.details._id, "groupId": props.details.groupId}}/>
                    </div>
                    
                    {!comments["dataLoading"] && comments["type"] === "post" && comments["_id"] === props.details._id ?
                        <div className="post-commentsWrapper">
                            {comments["data"].length === 0  || comments["dataCount"] === 0 ?
                                <div className="post-noCommentContainer">
                                    <div className="post-noCommentFinulabLogoContainer">
                                        <img src="/assets/Finulab_Icon.png" alt="" className="post-noCommentFinulabLogoImg" />
                                    </div>
                                    <div className="post-noCommentFinulabAddToConversationContainer">
                                        <div className="post-noCommentHeader">Be the first to comment</div>
        
                                        <div className="post-noCommentBody" style={{"marginTop": "12.5px"}}>Nobody has responded to this post yet.</div>
                                        <div className="post-noCommentBody">Add your thoughts and get the conversation going.</div>
                                    </div>
                                </div> :
                                <>
                                    {comments["data"].map((desc, index) => {
                                            if(desc.type === "comment" && desc.value.index === 0) {
                                                let commentMedia = [
                                                    ...desc.value.photos,
                                                    ...desc.value.videos
                                                ];

                                                return <div className="post-commentContainer" key={`comment-data-${index}`} style={index === 0 ? {} : {"marginTop": "25px"}}>
                                                    <div className="post-commentHeader">
                                                        {`${desc.value.username}`.toLowerCase() === "[deleted]" ?
                                                            <div className="post-headerProfileImageCommentDeleted">
                                                                {`[ - ]`}
                                                            </div> : 
                                                            <>
                                                                {desc.value.profileImage === "" ? 
                                                                    <button className="comment-buttonLinkToProfileBtn"
                                                                            onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                        >
                                                                        <div className="post-headerCommentProfileImageNone"
                                                                                style={generalOpx.profilePictureGradients[`${desc.value.username}`.length % 5]}
                                                                            >
                                                                            <BlurOn style={{"color": `var(--primary-bg-${`${desc.value.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                                                        </div>
                                                                    </button> : 
                                                                    <button className="comment-buttonLinkToProfileBtn"
                                                                            onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                        >
                                                                        <img src={desc.value.profileImage} alt="" className="post-headerCommentProfileImage" />
                                                                    </button>
                                                                }
                                                            </>
                                                        }
                                                        <div className="post-headerCommentName">
                                                            <button className="comment-buttonLinkToProfileBtn"
                                                                    onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                >
                                                                {desc.value.username}
                                                            </button>
                                                            <span className="post-headerTimeAgo">&nbsp;&nbsp;•&nbsp;&nbsp;{format(desc.value.timeStamp * 1000)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="post-commentBody">
                                                        <div className="post-commentBodyLineUpContainer">
                                                            {desc["l0"] ?
                                                                <>
                                                                    <div className="post-commentBodyLineUp"/>
                                                                    {comments["data"][index + 1] === undefined ||  comments["data"][index + 1] === null ? 
                                                                        null : 
                                                                        <>
                                                                            {comments["data"][index + 1]["type"] === "expand" 
                                                                                || (comments["data"][index + 1]["type"] === "comment" && comments["data"][index + 1]["value"]["index"] === 0) ?
                                                                                null :
                                                                                <button className="post-commentBodyLineUpBtn"
                                                                                        onClick={comments["data"][index + 1]["display"] ?
                                                                                            () => commentBlockDisplayToggle(index, "hide") : () => commentBlockDisplayToggle(index, "view")
                                                                                        }
                                                                                    > 
                                                                                    {comments["data"][index + 1]["display"] ?
                                                                                        <Remove className="post-commentBodyLineUpBtnIcon"/>:
                                                                                        <Add className="post-commentBodyLineUpBtnIcon"/>
                                                                                    }
                                                                                </button>
                                                                            }
                                                                        </>
                                                                    }
                                                                </> : null
                                                            }
                                                        </div>
                                                        <div className="post-commentBodyCommentContainer">
                                                            <div className="post-commentBodyComment">
                                                                <div 
                                                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(desc.value.comment)}}
                                                                    className="post-bodyTextDescUpgraded"
                                                                />
                                                            </div>

                                                            {commentMedia.length === 0 ?
                                                                null : 
                                                                <div className="post-commentBodyMediaContainer">
                                                                    {commentMedia.length === 1 ?
                                                                        <>
                                                                            {commentMedia[0][1] === "photo" ?
                                                                                <button className="comment-mediaOneImgBtn"
                                                                                        onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                    >
                                                                                    <img src={commentMedia[0][0]} alt="" className="comment-mediaOneImg" />
                                                                                </button> : 
                                                                                <div className="comment-mediaVideoOneContainer">
                                                                                    <video className="comment-video" controls>
                                                                                        <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                    </video>
                                                                                </div>
                                                                            }
                                                                        </> : 
                                                                        <>
                                                                            {commentMedia.length === 2 ?
                                                                                <>
                                                                                    {commentMedia[0][1] === "photo" ?
                                                                                        <button className="comment-mediaOneofTwoBtn"
                                                                                                onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                            >
                                                                                            <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                        </button> : 
                                                                                        <div className="comment-mediaVideoOneofTwoContainer">
                                                                                            <video className="comment-mediaOneofTwoImg" controls>
                                                                                                <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                            </video>
                                                                                            <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                        </div>
                                                                                    }
                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                        <button className="comment-mediaTwoofTwoBtn"
                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                            >
                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofTwoImg" />
                                                                                        </button> : 
                                                                                        <div className="comment-mediaVideoTwoofTwoContainer">
                                                                                            <video className="comment-mediaTwoofTwoImg" controls>
                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                            </video>
                                                                                            <button className="post-mediaTwoofTwoVideoBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                        </div>
                                                                                    }
                                                                                </> : 
                                                                                <>
                                                                                    {commentMedia.length === 3 ?
                                                                                        <>
                                                                                            {commentMedia[0][1] === "photo" ?
                                                                                                <button className="comment-mediaOneofThreeBtn"
                                                                                                        onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                    >
                                                                                                    <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                                </button> : 
                                                                                                <div className="comment-mediaVideoOneofThreeContainer">
                                                                                                    <video className="comment-mediaOneofTwoImg" controls>
                                                                                                        <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                    </video>
                                                                                                    <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                </div>
                                                                                            }
                                                                                            <div className="comment-mediaThreeInnerContainer">
                                                                                                {commentMedia[1][1] === "photo" ?
                                                                                                    <button className="comment-mediaTwoofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                        <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                            <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                                {commentMedia[2][1] === "photo" ?
                                                                                                    <button className="comment-mediaThreeofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[2][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                        <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                            <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                            </div>
                                                                                        </> : 
                                                                                        <>
                                                                                            <div className="comment-mediaThreeInnerContainer">
                                                                                                {commentMedia[0][1] === "photo" ?
                                                                                                    <button className="comment-mediaOneofFourBtn"
                                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofFourImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoOneofFourContainer">
                                                                                                        <video className="comment-mediaOneofFourImg" controls>
                                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaVideoOneofFourBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                                {commentMedia[1][1] === "photo" ?
                                                                                                    <button className="comment-mediaTwoofFourBtn"
                                                                                                            onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofFourImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoTwoofFourContainer">
                                                                                                        <video className="comment-mediaTwoofFourImg" muted controls playsInline>
                                                                                                            <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaVideoTwoofFourBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                            </div>
                                                                                            <div className="comment-mediaThreeInnerContainer">
                                                                                                {commentMedia[2][1] === "photo" ?
                                                                                                    <button className="comment-mediaTwoofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[2][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                        <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                            <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                                {commentMedia[3][1] === "photo" ?
                                                                                                    <button className="comment-mediaThreeofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(3, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[3][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                        <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                            <source src={`${commentMedia[3][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(3, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                            </div>
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </>
                                                                    }
                                                                </div>
                                                            }
                        
                                                            <div className="post-engagementContainer">
                                                                <div className="post-likeDislikeContainer">
                                                                    <button className="post-likeDislikeBtn"
                                                                            onClick={
                                                                                (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                () => navigate("/login") : () => engageComment(index, `m_${desc.value._id}`, "like")
                                                                            }
                                                                        >
                                                                        {props.loading ?
                                                                            <TrendingUp className="post-likeDislikeIcon"
                                                                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                            /> :
                                                                            <>
                                                                                {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    <TrendingUp className="post-likeDislikeIcon"
                                                                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}    
                                                                                    /> :
                                                                                    <>
                                                                                        {commentsEngagement.some(eng => eng.commentId === `m_${desc.value._id}`) ?
                                                                                            <>
                                                                                                {commentsEngagement.filter(eng => eng.commentId === `m_${desc.value._id}`)[0]["type"] === "like" ?
                                                                                                    <TrendingUp className="post-likedIcon" 
                                                                                                        style={{"stroke": "var(--primary-green-09)", "strokeWidth": "1px"}}    
                                                                                                    /> :
                                                                                                    <TrendingUp className="post-likeDislikeIcon"
                                                                                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                    />
                                                                                                }
                                                                                            </> : 
                                                                                            <TrendingUp className="post-likeDislikeIcon"
                                                                                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                            />
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </button>
                                                                    {desc.value.likes - desc.value.dislikes === 0 ?
                                                                        null : 
                                                                        <span className="comment-likeDislikeCounter">
                                                                            {desc.value.likes - desc.value.dislikes > 0 ? "+ " : "-"}
                                                                            {generalOpx.formatLargeFigures(Math.abs(desc.value.likes - desc.value.dislikes), 2)}
                                                                        </span>
                                                                    }
                                                                    <button className="post-likeDislikeBtn"
                                                                            onClick={
                                                                                (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                () => navigate("/login") : () => engageComment(index, `m_${desc.value._id}`, "dislike")
                                                                            }
                                                                        >
                                                                        {props.loading ?
                                                                            <TrendingDown className="post-likeDislikeIcon" 
                                                                                style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                            /> :
                                                                            <>
                                                                                {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                <TrendingDown className="post-likeDislikeIcon"
                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                    <>
                                                                                        {commentsEngagement.some(eng => eng.commentId === `m_${desc.value._id}`) ?
                                                                                            <>
                                                                                                {commentsEngagement.filter(eng => eng.commentId === `m_${desc.value._id}`)[0]["type"] === "dislike" ?
                                                                                                    <TrendingDown className="post-dislikedIcon" 
                                                                                                        style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-red-09)", "strokeWidth": "1px"}}
                                                                                                    /> :
                                                                                                    <TrendingDown className="post-likeDislikeIcon"
                                                                                                        style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                    />
                                                                                                }
                                                                                            </> : 
                                                                                            <TrendingDown className="post-likeDislikeIcon" 
                                                                                                style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                            />
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </button>
                                                                </div>
                                                                <div className="post-additionalEngagementOptionsContainer">
                                                                    <button className="post-additionalEngagementOptionsDesc" onClick={() => commentDisplayToggle(index)}>
                                                                        <Comment className="post-additionalEngagementOptionsDescIcon"/>
                                                                    </button>
                                                                    {props.user === desc.value.username ?
                                                                        <button className="post-additionalEngagementOptionsDesc" 
                                                                                style={{"marginLeft": "20px"}}
                                                                                onClick={() => commentDeleteToggle(index)}
                                                                            >
                                                                            <DeleteSharp className="post-additionalEngagementOptionsDescIcon"/>
                                                                        </button> : null
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className="post-commentAddYourCommentContainer"
                                                                    style={desc.commentDisplay ? {"display": "flex"} : {"display": "none"}}
                                                                >
                                                                <FinulabComment type={"secondary"} commFor={"post"}
                                                                    location={props.type}
                                                                    desc={
                                                                        {
                                                                            "postId": props.details._id, 
                                                                            "groupId": props.details.groupId, 
                                                                            "index": index, 
                                                                            "mainCommentId": desc.value.index === 0 ? desc.value._id : desc.value.mainCommentId, 
                                                                            "commentId": desc.value.index === 3 ? desc.value.commentId : desc.value._id,
                                                                            "commentIndex": desc.value.index === 3 ? 3 : desc.value.index + 1
                                                                        }
                                                                    }
                                                                />
                                                            </div>
                                                            {desc.deleteDisplay ?
                                                                <div className="post-makeCommentNoticeContainer">
                                                                    <div className="post-makeCommentNoticeHeader">Are you sure you want to delete comment?</div>
                                                                    <div className="post-makeCommentNoticeBodyOptnsContainer">
                                                                        {desc.deleteStatus === 2 ?
                                                                            <div className="post-makeCommentAnErrorOccuredNotice">An error occured, please try again later.</div> :
                                                                            <>
                                                                                <button className="post-commentDeleteCommentBtn" onClick={() => commentDelete(index)}>
                                                                                    {desc.deleteStatus === 1 ?
                                                                                        <BeatLoader 
                                                                                            color='#f6be76'
                                                                                            loading={true}
                                                                                            size={5}
                                                                                        /> : `Delete`
                                                                                    }
                                                                                </button>
                                                                                <button className="post-commentDeleteCommentBtn"
                                                                                        onClick={() => commentDeleteToggle(index)}
                                                                                        style={{"color": "var(--primary-bg-05)", "border": "solid 1px var(--primary-bg-05)"}}
                                                                                    >
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        }
                                                                    </div>
                                                                </div> : null
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            } else if(desc.type === "comment" && desc.value.index === 1) {
                                                let commentMedia = [
                                                    ...desc.value.photos,
                                                    ...desc.value.videos
                                                ];

                                                return <div className="post-commentSecondary" key={`comment-data-${index}`} style={desc.display ? {} : {"display": "none"}}>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l0"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentSecondaryContainer">
                                                        <div className="post-commentHeader">
                                                            <div className="post-commentSecondaryLineMoreRepliesConnector"></div>
                                                            {`${desc.value.username}`.toLowerCase() === "[deleted]" ?
                                                                <div className="post-headerProfileImageCommentDeleted">
                                                                    {`[ - ]`}
                                                                </div> : 
                                                                <>
                                                                    {desc.value.profileImage === "" ? 
                                                                        <button className="comment-buttonLinkToProfileBtn"
                                                                                onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                            >
                                                                            <div className="post-headerCommentProfileImageNone"
                                                                                    style={generalOpx.profilePictureGradients[`${desc.value.username}`.length % 5]}
                                                                                >
                                                                                <BlurOn style={{"color": `var(--primary-bg-${`${desc.value.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                                                            </div>
                                                                        </button> : 
                                                                        <button className="comment-buttonLinkToProfileBtn"
                                                                                onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                            >
                                                                            <img src={desc.value.profileImage} alt="" className="post-headerCommentProfileImage" />
                                                                        </button>
                                                                    }
                                                                </>
                                                            }
                                                            <div className="post-headerCommentName">
                                                                <button className="comment-buttonLinkToProfileBtn"
                                                                        onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                    >
                                                                    {desc.value.username}
                                                                </button>
                                                                <span className="post-headerTimeAgo">&nbsp;&nbsp;•&nbsp;&nbsp;{format(desc.value.timeStamp * 1000)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="post-commentBody">
                                                            <div className="post-commentBodyLineUpContainer">
                                                                {desc["l1"] ?
                                                                    <>
                                                                        <div className="post-commentBodyLineUp"/>
                                                                        {comments["data"][index + 1] === undefined ||  comments["data"][index + 1] === null ? 
                                                                            null : 
                                                                            <>
                                                                                {comments["data"][index + 1]["type"] === "expand" 
                                                                                    || (comments["data"][index + 1]["type"] === "comment" && comments["data"][index + 1]["value"]["index"] <= 1) ?
                                                                                    null :
                                                                                    <button className="post-commentBodyLineUpBtn"
                                                                                            onClick={comments["data"][index + 1]["display"] ?
                                                                                                () => commentBlockDisplayToggle(index, "hide") : () => commentBlockDisplayToggle(index, "view")
                                                                                            }
                                                                                        > 
                                                                                        {comments["data"][index + 1]["display"] ?
                                                                                            <Remove className="post-commentBodyLineUpBtnIcon"/>:
                                                                                            <Add className="post-commentBodyLineUpBtnIcon"/>
                                                                                        }
                                                                                    </button>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </> : null
                                                                }
                                                            </div>
                                                            <div className="post-commentBodyCommentContainer">
                                                                <div className="post-commentBodyComment">
                                                                    <div 
                                                                        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(desc.value.comment)}}
                                                                        className="post-bodyTextDescUpgraded"
                                                                    />
                                                                </div>

                                                                {commentMedia.length === 0 ?
                                                                    null : 
                                                                    <div className="post-commentBodyMediaContainer">
                                                                        {commentMedia.length === 1 ?
                                                                            <>
                                                                                {commentMedia[0][1] === "photo" ?
                                                                                    <button className="comment-mediaOneImgBtn"
                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                        >
                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneImg" />
                                                                                    </button> : 
                                                                                    <div className="comment-mediaVideoOneContainer">
                                                                                        <video className="comment-video" controls>
                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                        </video>
                                                                                    </div>
                                                                                }
                                                                            </> : 
                                                                            <>
                                                                                {commentMedia.length === 2 ?
                                                                                    <>
                                                                                        {commentMedia[0][1] === "photo" ?
                                                                                            <button className="comment-mediaOneofTwoBtn"
                                                                                                    onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                >
                                                                                                <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                            </button> : 
                                                                                            <div className="comment-mediaVideoOneofTwoContainer">
                                                                                                <video className="comment-mediaOneofTwoImg" controls>
                                                                                                    <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                                <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                            </div>
                                                                                        }
                                                                                        {commentMedia[1][1] === "photo" ?
                                                                                            <button className="comment-mediaTwoofTwoBtn"
                                                                                                    onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                >
                                                                                                <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofTwoImg" />
                                                                                            </button> : 
                                                                                            <div className="comment-mediaVideoTwoofTwoContainer">
                                                                                                <video className="comment-mediaTwoofTwoImg" controls>
                                                                                                    <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                                <button className="post-mediaTwoofTwoVideoBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                            </div>
                                                                                        }
                                                                                    </> : 
                                                                                    <>
                                                                                        {commentMedia.length === 3 ?
                                                                                            <>
                                                                                                {commentMedia[0][1] === "photo" ?
                                                                                                    <button className="comment-mediaOneofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoOneofThreeContainer">
                                                                                                        <video className="comment-mediaOneofTwoImg" controls>
                                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                            <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[2][1] === "photo" ?
                                                                                                        <button className="comment-mediaThreeofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[2][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                            <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            </> : 
                                                                                            <>
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[0][1] === "photo" ?
                                                                                                        <button className="comment-mediaOneofFourBtn"
                                                                                                                onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofFourImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoOneofFourContainer">
                                                                                                            <video className="comment-mediaOneofFourImg" controls>
                                                                                                                <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoOneofFourBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofFourBtn"
                                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofFourImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofFourContainer">
                                                                                                            <video className="comment-mediaTwoofFourImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofFourBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[2][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[2][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                            <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[3][1] === "photo" ?
                                                                                                        <button className="comment-mediaThreeofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(3, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[3][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                            <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[3][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(3, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            </>
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </div>
                                                                }
                        
                                                                <div className="post-engagementContainer">
                                                                    <div className="post-likeDislikeContainer">
                                                                        <button className="post-likeDislikeBtn"
                                                                                onClick={
                                                                                    (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    () => navigate("/login") : () => engageComment(index, `s_${desc.value._id}`, "like")
                                                                                }
                                                                            >
                                                                            {props.loading ?
                                                                                <TrendingUp className="post-likeDislikeIcon"
                                                                                    style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                <>
                                                                                    {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                        <TrendingUp className="post-likeDislikeIcon"
                                                                                            style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}    
                                                                                        /> :
                                                                                        <>
                                                                                            {commentsEngagement.some(eng => eng.commentId === `s_${desc.value._id}`) ?
                                                                                                <>
                                                                                                    {commentsEngagement.filter(eng => eng.commentId === `s_${desc.value._id}`)[0]["type"] === "like" ?
                                                                                                        <TrendingUp className="post-likedIcon" 
                                                                                                            style={{"stroke": "var(--primary-green-09)", "strokeWidth": "1px"}}    
                                                                                                        /> :
                                                                                                        <TrendingUp className="post-likeDislikeIcon"
                                                                                                            style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                        />
                                                                                                    }
                                                                                                </> : 
                                                                                                <TrendingUp className="post-likeDislikeIcon"
                                                                                                    style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                />
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </button>
                                                                        {desc.value.likes - desc.value.dislikes === 0 ?
                                                                            null : 
                                                                            <span className="comment-likeDislikeCounter">
                                                                                {desc.value.likes - desc.value.dislikes > 0 ? "+ " : "-"}
                                                                                {generalOpx.formatLargeFigures(Math.abs(desc.value.likes - desc.value.dislikes), 2)}
                                                                            </span>
                                                                        }
                                                                        <button className="post-likeDislikeBtn"
                                                                                onClick={
                                                                                    (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    () => navigate("/login") : () => engageComment(index, `s_${desc.value._id}`, "dislike")
                                                                                }
                                                                            >
                                                                            {props.loading ?
                                                                                <TrendingDown className="post-likeDislikeIcon" 
                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                <>
                                                                                    {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    <TrendingDown className="post-likeDislikeIcon"
                                                                                        style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                    /> :
                                                                                        <>
                                                                                            {commentsEngagement.some(eng => eng.commentId === `s_${desc.value._id}`) ?
                                                                                                <>
                                                                                                    {commentsEngagement.filter(eng => eng.commentId === `s_${desc.value._id}`)[0]["type"] === "dislike" ?
                                                                                                        <TrendingDown className="post-dislikedIcon" 
                                                                                                            style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-red-09)", "strokeWidth": "1px"}}
                                                                                                        /> :
                                                                                                        <TrendingDown className="post-likeDislikeIcon"
                                                                                                            style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                        />
                                                                                                    }
                                                                                                </> : 
                                                                                                <TrendingDown className="post-likeDislikeIcon" 
                                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                />
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </button>
                                                                    </div>
                                                                    <div className="post-additionalEngagementOptionsContainer">
                                                                        <button className="post-additionalEngagementOptionsDesc" onClick={() => commentDisplayToggle(index)}>
                                                                            <Comment className="post-additionalEngagementOptionsDescIcon"/>
                                                                        </button>
                                                                        {props.user === desc.value.username ?
                                                                            <button className="post-additionalEngagementOptionsDesc" 
                                                                                    style={{"marginLeft": "20px"}}
                                                                                    onClick={() => commentDeleteToggle(index)}
                                                                                >
                                                                                <DeleteSharp className="post-additionalEngagementOptionsDescIcon"/>
                                                                            </button> : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="post-commentAddYourCommentContainer"
                                                                        style={desc.commentDisplay ? {"display": "flex"} : {"display": "none"}}
                                                                    >
                                                                    <FinulabComment type={"secondary"} commFor={"post"}
                                                                        location={props.type}
                                                                        desc={
                                                                            {
                                                                                "postId": props.details._id, 
                                                                                "groupId": props.details.groupId, 
                                                                                "index": index, 
                                                                                "mainCommentId": desc.value.index === 0 ? desc.value._id : desc.value.mainCommentId, 
                                                                                "commentId": desc.value.index === 3 ? desc.value.commentId : desc.value._id,
                                                                                "commentIndex": desc.value.index === 3 ? 3 : desc.value.index + 1
                                                                            }
                                                                        }
                                                                    />
                                                                </div>

                                                                {desc.deleteDisplay ?
                                                                    <div className="post-makeCommentNoticeContainer">
                                                                        <div className="post-makeCommentNoticeHeader">Are you sure you want to delete comment?</div>
                                                                        <div className="post-makeCommentNoticeBodyOptnsContainer">
                                                                            {desc.deleteStatus === 2 ?
                                                                                <div className="post-makeCommentAnErrorOccuredNotice">An error occured, please try again later.</div> :
                                                                                <>
                                                                                    <button className="post-commentDeleteCommentBtn" onClick={() => commentDelete(index)}>
                                                                                        {desc.deleteStatus === 1 ?
                                                                                            <BeatLoader 
                                                                                                color='#f6be76'
                                                                                                loading={true}
                                                                                                size={5}
                                                                                            /> : `Delete`
                                                                                        }
                                                                                    </button>
                                                                                    <button className="post-commentDeleteCommentBtn"
                                                                                            onClick={() => commentDeleteToggle(index)}
                                                                                            style={{"color": "var(--primary-bg-05)", "border": "solid 1px var(--primary-bg-05)"}}
                                                                                        >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            }
                                                                        </div>
                                                                    </div> : null
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            } else if(desc.type === "comment" && desc.value.index === 2) {
                                                let commentMedia = [
                                                    ...desc.value.photos,
                                                    ...desc.value.videos
                                                ];

                                                return <div className="post-commentSecondary" key={`comment-data-${index}`} style={desc.display ? {} : {"display": "none"}}>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l0"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l1"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentTertiaryContainer">
                                                        <div className="post-commentHeader">
                                                            <div className="post-commentSecondaryLineConnector"></div>
                                                            {`${desc.value.username}`.toLowerCase() === "[deleted]" ?
                                                                <div className="post-headerProfileImageCommentDeleted">
                                                                    {`[ - ]`}
                                                                </div> : 
                                                                <>
                                                                    {desc.value.profileImage === "" ? 
                                                                        <button className="comment-buttonLinkToProfileBtn"
                                                                                onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                            >
                                                                            <div className="post-headerCommentProfileImageNone"
                                                                                    style={generalOpx.profilePictureGradients[`${desc.value.username}`.length % 5]}
                                                                                >
                                                                                <BlurOn style={{"color": `var(--primary-bg-${`${desc.value.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                                                            </div>
                                                                        </button> : 
                                                                        <button className="comment-buttonLinkToProfileBtn"
                                                                                onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                            >
                                                                            <img src={desc.value.profileImage} alt="" className="post-headerCommentProfileImage" />
                                                                        </button>
                                                                    }
                                                                </>
                                                            }
                                                            <div className="post-headerCommentName">
                                                                <button className="comment-buttonLinkToProfileBtn"
                                                                        onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                    >
                                                                    {desc.value.username}
                                                                </button>
                                                                <span className="post-headerTimeAgo">&nbsp;&nbsp;•&nbsp;&nbsp;{format(desc.value.timeStamp * 1000)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="post-commentBody">
                                                            <div className="post-commentBodyLineUpContainer">
                                                                {desc["l2"] ?
                                                                    <>
                                                                        <div className="post-commentBodyLineUp"/> 
                                                                        {comments["data"][index + 1] === undefined ||  comments["data"][index + 1] === null ? 
                                                                            null : 
                                                                            <>
                                                                                {comments["data"][index + 1]["type"] === "expand" 
                                                                                    || (comments["data"][index + 1]["type"] === "comment" && comments["data"][index + 1]["value"]["index"] <= 2) ?
                                                                                    null :
                                                                                    <button className="post-commentBodyLineUpBtn"
                                                                                            onClick={comments["data"][index + 1]["display"] ?
                                                                                                () => commentBlockDisplayToggle(index, "hide") : () => commentBlockDisplayToggle(index, "view")
                                                                                            }
                                                                                        > 
                                                                                        {comments["data"][index + 1]["display"] ?
                                                                                            <Remove className="post-commentBodyLineUpBtnIcon"/>:
                                                                                            <Add className="post-commentBodyLineUpBtnIcon"/>
                                                                                        }
                                                                                    </button>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </> : null
                                                                }
                                                            </div>
                                                            <div className="post-commentBodyCommentContainer">
                                                                <div className="post-commentBodyComment">
                                                                    <div 
                                                                        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(desc.value.comment)}}
                                                                        className="post-bodyTextDescUpgraded"
                                                                    />
                                                                </div>
                                                                
                                                                {commentMedia.length === 0 ?
                                                                    null : 
                                                                    <div className="post-commentBodyMediaContainer">
                                                                        {commentMedia.length === 1 ?
                                                                            <>
                                                                                {commentMedia[0][1] === "photo" ?
                                                                                    <button className="comment-mediaOneImgBtn"
                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                        >
                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneImg" />
                                                                                    </button> : 
                                                                                    <div className="comment-mediaVideoOneContainer">
                                                                                        <video className="comment-video" controls>
                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                        </video>
                                                                                    </div>
                                                                                }
                                                                            </> : 
                                                                            <>
                                                                                {commentMedia.length === 2 ?
                                                                                    <>
                                                                                        {commentMedia[0][1] === "photo" ?
                                                                                            <button className="comment-mediaOneofTwoBtn"
                                                                                                    onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                >
                                                                                                <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                            </button> : 
                                                                                            <div className="comment-mediaVideoOneofTwoContainer">
                                                                                                <video className="comment-mediaOneofTwoImg" controls>
                                                                                                    <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                                <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                            </div>
                                                                                        }
                                                                                        {commentMedia[1][1] === "photo" ?
                                                                                            <button className="comment-mediaTwoofTwoBtn"
                                                                                                    onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                >
                                                                                                <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofTwoImg" />
                                                                                            </button> : 
                                                                                            <div className="comment-mediaVideoTwoofTwoContainer">
                                                                                                <video className="comment-mediaTwoofTwoImg" controls>
                                                                                                    <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                                <button className="post-mediaTwoofTwoVideoBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                            </div>
                                                                                        }
                                                                                    </> : 
                                                                                    <>
                                                                                        {commentMedia.length === 3 ?
                                                                                            <>
                                                                                                {commentMedia[0][1] === "photo" ?
                                                                                                    <button className="comment-mediaOneofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoOneofThreeContainer">
                                                                                                        <video className="comment-mediaOneofTwoImg" controls>
                                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                            <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[2][1] === "photo" ?
                                                                                                        <button className="comment-mediaThreeofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[2][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                            <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            </> : 
                                                                                            <>
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[0][1] === "photo" ?
                                                                                                        <button className="comment-mediaOneofFourBtn"
                                                                                                                onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofFourImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoOneofFourContainer">
                                                                                                            <video className="comment-mediaOneofFourImg" controls>
                                                                                                                <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoOneofFourBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofFourBtn"
                                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofFourImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofFourContainer">
                                                                                                            <video className="comment-mediaTwoofFourImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofFourBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[2][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[2][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                            <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[3][1] === "photo" ?
                                                                                                        <button className="comment-mediaThreeofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(3, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[3][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                            <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[3][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(3, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            </>
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </div>
                                                                }

                                                                <div className="post-engagementContainer">
                                                                    <div className="post-likeDislikeContainer">
                                                                        <button className="post-likeDislikeBtn"
                                                                                onClick={
                                                                                    (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    () => navigate("/login") : () => engageComment(index, `s_${desc.value._id}`, "like")
                                                                                }
                                                                            >
                                                                            {props.loading ?
                                                                                <TrendingUp className="post-likeDislikeIcon"
                                                                                    style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                <>
                                                                                    {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                        <TrendingUp className="post-likeDislikeIcon"
                                                                                            style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}    
                                                                                        /> :
                                                                                        <>
                                                                                            {commentsEngagement.some(eng => eng.commentId === `s_${desc.value._id}`) ?
                                                                                                <>
                                                                                                    {commentsEngagement.filter(eng => eng.commentId === `s_${desc.value._id}`)[0]["type"] === "like" ?
                                                                                                        <TrendingUp className="post-likedIcon" 
                                                                                                            style={{"stroke": "var(--primary-green-09)", "strokeWidth": "1px"}}    
                                                                                                        /> :
                                                                                                        <TrendingUp className="post-likeDislikeIcon"
                                                                                                            style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                        />
                                                                                                    }
                                                                                                </> : 
                                                                                                <TrendingUp className="post-likeDislikeIcon"
                                                                                                    style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                />
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </button>
                                                                        {desc.value.likes - desc.value.dislikes === 0 ?
                                                                            null : 
                                                                            <span className="comment-likeDislikeCounter">
                                                                                {desc.value.likes - desc.value.dislikes > 0 ? "+ " : "-"}
                                                                                {generalOpx.formatLargeFigures(Math.abs(desc.value.likes - desc.value.dislikes), 2)}
                                                                            </span>
                                                                        }
                                                                        <button className="post-likeDislikeBtn"
                                                                                onClick={
                                                                                    (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    () => navigate("/login") : () => engageComment(index, `s_${desc.value._id}`, "dislike")
                                                                                }
                                                                            >
                                                                            {props.loading ?
                                                                                <TrendingDown className="post-likeDislikeIcon" 
                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                <>
                                                                                    {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    <TrendingDown className="post-likeDislikeIcon"
                                                                                        style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                    /> :
                                                                                        <>
                                                                                            {commentsEngagement.some(eng => eng.commentId === `s_${desc.value._id}`) ?
                                                                                                <>
                                                                                                    {commentsEngagement.filter(eng => eng.commentId === `s_${desc.value._id}`)[0]["type"] === "dislike" ?
                                                                                                        <TrendingDown className="post-dislikedIcon" 
                                                                                                            style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-red-09)", "strokeWidth": "1px"}}
                                                                                                        /> :
                                                                                                        <TrendingDown className="post-likeDislikeIcon"
                                                                                                            style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                        />
                                                                                                    }
                                                                                                </> : 
                                                                                                <TrendingDown className="post-likeDislikeIcon" 
                                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                />
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </button>
                                                                    </div>
                                                                    <div className="post-additionalEngagementOptionsContainer">
                                                                        <button className="post-additionalEngagementOptionsDesc" onClick={() => commentDisplayToggle(index)}>
                                                                            <Comment className="post-additionalEngagementOptionsDescIcon"/>
                                                                        </button>
                                                                        {props.user === desc.value.username ?
                                                                            <button className="post-additionalEngagementOptionsDesc" 
                                                                                    style={{"marginLeft": "20px"}}
                                                                                    onClick={() => commentDeleteToggle(index)}
                                                                                >
                                                                                <DeleteSharp className="post-additionalEngagementOptionsDescIcon"/>
                                                                            </button> : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="post-commentAddYourCommentContainer"
                                                                        style={desc.commentDisplay ? {"display": "flex"} : {"display": "none"}}
                                                                    >
                                                                    <FinulabComment type={"secondary"} commFor={"post"}
                                                                        location={props.type}
                                                                        desc={
                                                                            {
                                                                                "postId": props.details._id, 
                                                                                "groupId": props.details.groupId, 
                                                                                "index": index, 
                                                                                "mainCommentId": desc.value.index === 0 ? desc.value._id : desc.value.mainCommentId, 
                                                                                "commentId": desc.value.index === 3 ? desc.value.commentId : desc.value._id,
                                                                                "commentIndex": desc.value.index === 3 ? 3 : desc.value.index + 1
                                                                            }
                                                                        }
                                                                    />
                                                                </div>

                                                                {desc.deleteDisplay ?
                                                                    <div className="post-makeCommentNoticeContainer">
                                                                        <div className="post-makeCommentNoticeHeader">Are you sure you want to delete comment?</div>
                                                                        <div className="post-makeCommentNoticeBodyOptnsContainer">
                                                                            {desc.deleteStatus === 2 ?
                                                                                <div className="post-makeCommentAnErrorOccuredNotice">An error occured, please try again later.</div> :
                                                                                <>
                                                                                    <button className="post-commentDeleteCommentBtn" onClick={() => commentDelete(index)}>
                                                                                        {desc.deleteStatus === 1 ?
                                                                                            <BeatLoader 
                                                                                                color='#f6be76'
                                                                                                loading={true}
                                                                                                size={5}
                                                                                            /> : `Delete`
                                                                                        }
                                                                                    </button>
                                                                                    <button className="post-commentDeleteCommentBtn"
                                                                                            onClick={() => commentDeleteToggle(index)}
                                                                                            style={{"color": "var(--primary-bg-05)", "border": "solid 1px var(--primary-bg-05)"}}
                                                                                        >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            }
                                                                        </div>
                                                                    </div> : null
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            } else if(desc.type === "comment" && desc.value.index === 3) {
                                                let commentMedia = [
                                                    ...desc.value.photos,
                                                    ...desc.value.videos
                                                ];

                                                return <div className="post-commentSecondary" key={`comment-data-${index}`} style={desc.display ? {} : {"display": "none"}}>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l0"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l1"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l2"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentQuaternaryContainer">
                                                        <div className="post-commentHeader">
                                                            <div className="post-commentSecondaryLineConnector"></div>
                                                            {`${desc.value.username}`.toLowerCase() === "[deleted]" ?
                                                                <div className="post-headerProfileImageCommentDeleted">
                                                                    {`[ - ]`}
                                                                </div> : 
                                                                <>
                                                                    {desc.value.profileImage === "" ? 
                                                                        <button className="comment-buttonLinkToProfileBtn"
                                                                                onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                            >
                                                                            <div className="post-headerCommentProfileImageNone"
                                                                                    style={generalOpx.profilePictureGradients[`${desc.value.username}`.length % 5]}
                                                                                >
                                                                                <BlurOn style={{"color": `var(--primary-bg-${`${desc.value.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                                                            </div>
                                                                        </button> : 
                                                                        <button className="comment-buttonLinkToProfileBtn"
                                                                                onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                            >
                                                                            <img src={desc.value.profileImage} alt="" className="post-headerCommentProfileImage" />
                                                                        </button>
                                                                    }
                                                                </>
                                                            }
                                                            <div className="post-headerCommentName">
                                                                <button className="comment-buttonLinkToProfileBtn"
                                                                        onClick={() => navigate(`/profile/${desc.value.username}`)}
                                                                    >
                                                                    {desc.value.username}
                                                                </button>
                                                                <span className="post-headerTimeAgo">&nbsp;&nbsp;•&nbsp;&nbsp;{format(desc.value.timeStamp * 1000)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="post-commentBody">
                                                            <div className="post-commentBodyLineUpContainer"></div>
                                                            <div className="post-commentBodyCommentContainer">
                                                                <div className="post-commentBodyComment">
                                                                    <div 
                                                                        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(desc.value.comment)}}
                                                                        className="post-bodyTextDescUpgraded"
                                                                    />
                                                                </div>

                                                                {commentMedia.length === 0 ?
                                                                    null : 
                                                                    <div className="post-commentBodyMediaContainer">
                                                                        {commentMedia.length === 1 ?
                                                                            <>
                                                                                {commentMedia[0][1] === "photo" ?
                                                                                    <button className="comment-mediaOneImgBtn"
                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                        >
                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneImg" />
                                                                                    </button> : 
                                                                                    <div className="comment-mediaVideoOneContainer">
                                                                                        <video className="comment-video" controls>
                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                        </video>
                                                                                    </div>
                                                                                }
                                                                            </> : 
                                                                            <>
                                                                                {commentMedia.length === 2 ?
                                                                                    <>
                                                                                        {commentMedia[0][1] === "photo" ?
                                                                                            <button className="comment-mediaOneofTwoBtn"
                                                                                                    onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                >
                                                                                                <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                            </button> : 
                                                                                            <div className="comment-mediaVideoOneofTwoContainer">
                                                                                                <video className="comment-mediaOneofTwoImg" controls>
                                                                                                    <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                                <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                            </div>
                                                                                        }
                                                                                        {commentMedia[1][1] === "photo" ?
                                                                                            <button className="comment-mediaTwoofTwoBtn"
                                                                                                    onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                >
                                                                                                <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofTwoImg" />
                                                                                            </button> : 
                                                                                            <div className="comment-mediaVideoTwoofTwoContainer">
                                                                                                <video className="comment-mediaTwoofTwoImg" controls>
                                                                                                    <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                                <button className="post-mediaTwoofTwoVideoBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                            </div>
                                                                                        }
                                                                                    </> : 
                                                                                    <>
                                                                                        {commentMedia.length === 3 ?
                                                                                            <>
                                                                                                {commentMedia[0][1] === "photo" ?
                                                                                                    <button className="comment-mediaOneofThreeBtn"
                                                                                                            onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                        >
                                                                                                        <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofTwoImg" />
                                                                                                    </button> : 
                                                                                                    <div className="comment-mediaVideoOneofThreeContainer">
                                                                                                        <video className="comment-mediaOneofTwoImg" controls>
                                                                                                            <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                        </video>
                                                                                                        <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                    </div>
                                                                                                }
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                            <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[2][1] === "photo" ?
                                                                                                        <button className="comment-mediaThreeofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[2][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                            <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            </> : 
                                                                                            <>
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[0][1] === "photo" ?
                                                                                                        <button className="comment-mediaOneofFourBtn"
                                                                                                                onClick={() => setupViewCommentMedia(0, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[0][0]} alt="" className="comment-mediaOneofFourImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoOneofFourContainer">
                                                                                                            <video className="comment-mediaOneofFourImg" controls>
                                                                                                                <source src={`${commentMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoOneofFourBtn" onClick={() => setupViewCommentMedia(0, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[1][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofFourBtn"
                                                                                                                onClick={() => setupViewCommentMedia(1, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[1][0]} alt="" className="comment-mediaTwoofFourImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofFourContainer">
                                                                                                            <video className="comment-mediaTwoofFourImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofFourBtn" onClick={() => setupViewCommentMedia(1, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                                <div className="comment-mediaThreeInnerContainer">
                                                                                                    {commentMedia[2][1] === "photo" ?
                                                                                                        <button className="comment-mediaTwoofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(2, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[2][0]} alt="" className="comment-mediaTwoofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoTwoofThreeContainer">
                                                                                                            <video className="comment-mediaTwoofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewCommentMedia(2, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                    {commentMedia[3][1] === "photo" ?
                                                                                                        <button className="comment-mediaThreeofThreeBtn"
                                                                                                                onClick={() => setupViewCommentMedia(3, commentMedia)}
                                                                                                            >
                                                                                                            <img src={commentMedia[3][0]} alt="" className="comment-mediaThreeofThreeImg" />
                                                                                                        </button> : 
                                                                                                        <div className="comment-mediaVideoThreeofThreeContainer">
                                                                                                            <video className="comment-mediaThreeofThreeImg" muted controls playsInline>
                                                                                                                <source src={`${commentMedia[3][0]}#t=0.5`} type="video/mp4"/>
                                                                                                            </video>
                                                                                                            <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewCommentMedia(3, commentMedia)}></button>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            </>
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </div>
                                                                }
                        
                                                                <div className="post-engagementContainer">
                                                                    <div className="post-likeDislikeContainer">
                                                                        <button className="post-likeDislikeBtn"
                                                                                onClick={
                                                                                    (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    () => navigate("/login") : () => engageComment(index, `s_${desc.value._id}`, "like")
                                                                                }
                                                                            >
                                                                            {props.loading ?
                                                                                <TrendingUp className="post-likeDislikeIcon"
                                                                                    style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                <>
                                                                                    {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                        <TrendingUp className="post-likeDislikeIcon"
                                                                                            style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}    
                                                                                        /> :
                                                                                        <>
                                                                                            {commentsEngagement.some(eng => eng.commentId === `s_${desc.value._id}`) ?
                                                                                                <>
                                                                                                    {commentsEngagement.filter(eng => eng.commentId === `s_${desc.value._id}`)[0]["type"] === "like" ?
                                                                                                        <TrendingUp className="post-likedIcon" 
                                                                                                            style={{"stroke": "var(--primary-green-09)", "strokeWidth": "1px"}}    
                                                                                                        /> :
                                                                                                        <TrendingUp className="post-likeDislikeIcon"
                                                                                                            style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                        />
                                                                                                    }
                                                                                                </> : 
                                                                                                <TrendingUp className="post-likeDislikeIcon"
                                                                                                    style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                />
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </button>
                                                                        {desc.value.likes - desc.value.dislikes === 0 ?
                                                                            null : 
                                                                            <span className="comment-likeDislikeCounter">
                                                                                {desc.value.likes - desc.value.dislikes > 0 ? "+ " : "-"}
                                                                                {generalOpx.formatLargeFigures(Math.abs(desc.value.likes - desc.value.dislikes), 2)}
                                                                            </span>
                                                                        }
                                                                        <button className="post-likeDislikeBtn"
                                                                                onClick={
                                                                                    (props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    () => navigate("/login") : () => engageComment(index, `s_${desc.value._id}`, "dislike")
                                                                                }
                                                                            >
                                                                            {props.loading ?
                                                                                <TrendingDown className="post-likeDislikeIcon" 
                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                /> :
                                                                                <>
                                                                                    {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                                                                    <TrendingDown className="post-likeDislikeIcon"
                                                                                        style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                    /> :
                                                                                        <>
                                                                                            {commentsEngagement.some(eng => eng.commentId === `s_${desc.value._id}`) ?
                                                                                                <>
                                                                                                    {commentsEngagement.filter(eng => eng.commentId === `s_${desc.value._id}`)[0]["type"] === "dislike" ?
                                                                                                        <TrendingDown className="post-dislikedIcon" 
                                                                                                            style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-red-09)", "strokeWidth": "1px"}}
                                                                                                        /> :
                                                                                                        <TrendingDown className="post-likeDislikeIcon"
                                                                                                            style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                        />
                                                                                                    }
                                                                                                </> : 
                                                                                                <TrendingDown className="post-likeDislikeIcon" 
                                                                                                    style={{"transform": "scaleX(-1)", "WebkitTransform": "scaleX(-1)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                                                                />
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </button>
                                                                    </div>
                                                                    <div className="post-additionalEngagementOptionsContainer">
                                                                        <button className="post-additionalEngagementOptionsDesc" onClick={() => commentDisplayToggle(index)}>
                                                                            <Comment className="post-additionalEngagementOptionsDescIcon"/>
                                                                        </button>
                                                                        {props.user === desc.value.username ?
                                                                            <button className="post-additionalEngagementOptionsDesc" 
                                                                                    style={{"marginLeft": "20px"}}
                                                                                    onClick={() => commentDeleteToggle(index)}
                                                                                >
                                                                                <DeleteSharp className="post-additionalEngagementOptionsDescIcon"/>
                                                                            </button> : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="post-commentAddYourCommentContainer"
                                                                        style={desc.commentDisplay ? {"display": "flex"} : {"display": "none"}}
                                                                    >
                                                                    <FinulabComment type={"secondary"} commFor={"post"}
                                                                        location={props.type}
                                                                        desc={
                                                                            {
                                                                                "postId": props.details._id, 
                                                                                "groupId": props.details.groupId, 
                                                                                "index": index, 
                                                                                "mainCommentId": desc.value.index === 0 ? desc.value._id : desc.value.mainCommentId, 
                                                                                "commentId": desc.value.index === 3 ? desc.value.commentId : desc.value._id,
                                                                                "commentIndex": desc.value.index === 3 ? 3 : desc.value.index + 1
                                                                            }
                                                                        }
                                                                    />
                                                                </div>

                                                                {desc.deleteDisplay ?
                                                                    <div className="post-makeCommentNoticeContainer">
                                                                        <div className="post-makeCommentNoticeHeader">Are you sure you want to delete comment?</div>
                                                                        <div className="post-makeCommentNoticeBodyOptnsContainer">
                                                                            {desc.deleteStatus === 2 ?
                                                                                <div className="post-makeCommentAnErrorOccuredNotice">An error occured, please try again later.</div> :
                                                                                <>
                                                                                    <button className="post-commentDeleteCommentBtn" onClick={() => commentDelete(index)}>
                                                                                        {desc.deleteStatus === 1 ?
                                                                                            <BeatLoader 
                                                                                                color='#f6be76'
                                                                                                loading={true}
                                                                                                size={5}
                                                                                            /> : `Delete`
                                                                                        }
                                                                                    </button>
                                                                                    <button className="post-commentDeleteCommentBtn"
                                                                                            onClick={() => commentDeleteToggle(index)}
                                                                                            style={{"color": "var(--primary-bg-05)", "border": "solid 1px var(--primary-bg-05)"}}
                                                                                        >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            }
                                                                        </div>
                                                                    </div> : null
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            } else if(desc.type === "expand" && desc.index === 1) {
                                                const faderDisplayObj = comments["commentExpandLoading"].find(desc_obj => Object.keys(desc_obj)[0] === `${index}`);
                                                return <div className="post-commentSecondary" key={`comment-expand-${index}`} style={desc.display ? {} : {"display": "none"}}>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        <div className="post-commentBodyLineUpMoreReplies"/>
                                                    </div>
                                                    <div className="post-commentSecondaryContainer">
                                                        <div className="post-commentHeader" style={{"marginTop": "10px"}}>
                                                            <div className="post-commentSecondaryLineMoreRepliesConnector"></div>
                                                            <button className="post-commentBodyLineUpConnectorBtn"
                                                                    onClick={() => specificCommentExpand(index)}
                                                                    disabled={faderDisplayObj === undefined || faderDisplayObj === null ? false : faderDisplayObj[`${index}`] ? true : false}
                                                                > 
                                                                <div className="post-commentBodyLineUpConnectorBtnIconContainer">
                                                                    {faderDisplayObj === undefined || faderDisplayObj === null ?
                                                                        <Add className="post-commentBodyLineUpBtnIcon"/> : 
                                                                        <>
                                                                            {faderDisplayObj[`${index}`] ?
                                                                                <FadeLoader
                                                                                    color={"#9E9E9E"}
                                                                                    loading={true}
                                                                                    height={5}
                                                                                    margin={-12}
                                                                                    cssOverride={override}
                                                                                    width={2}
                                                                                    radius={"4px"}
                                                                                /> : 
                                                                                <Add className="post-commentBodyLineUpBtnIcon"/>
                                                                            }
                                                                        </>
                                                                    }
                                                                </div>
                                                                {generalOpx.formatLargeFigures(desc.value, 2)}+ more replies
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            } else if(desc.type === "expand" && desc.index === 2) {
                                                const faderDisplayObj = comments["commentExpandLoading"].find(desc_obj => Object.keys(desc_obj)[0] === `${index}`);
                                                return <div className="post-commentSecondary" key={`comment-expand-${index}`} style={desc.display ? {} : {"display": "none"}}>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l0"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        <div className="post-commentBodyLineUpMoreReplies"/>
                                                    </div>
                                                    <div className="post-commentTertiaryContainer">
                                                        <div className="post-commentHeader" style={{"marginTop": "10px"}}>
                                                            <div className="post-commentSecondaryLineMoreRepliesConnector"></div>
                                                            <button className="post-commentBodyLineUpConnectorBtn"
                                                                    onClick={() => specificCommentExpand(index)}
                                                                    disabled={faderDisplayObj === undefined || faderDisplayObj === null ? false : faderDisplayObj[`${index}`] ? true : false}
                                                                > 
                                                                <div className="post-commentBodyLineUpConnectorBtnIconContainer">
                                                                    {faderDisplayObj === undefined || faderDisplayObj === null ?
                                                                        <Add className="post-commentBodyLineUpBtnIcon"/> : 
                                                                        <>
                                                                            {faderDisplayObj[`${index}`] ?
                                                                                <FadeLoader
                                                                                    color={"#9E9E9E"}
                                                                                    loading={true}
                                                                                    height={5}
                                                                                    margin={-12}
                                                                                    cssOverride={override}
                                                                                    width={2}
                                                                                    radius={"4px"}
                                                                                /> : 
                                                                                <Add className="post-commentBodyLineUpBtnIcon"/>
                                                                            }
                                                                        </>
                                                                    }
                                                                </div>
                                                                {generalOpx.formatLargeFigures(desc.value, 2)}+ more replies
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            } else if(desc.type === "expand" && desc.index === 3) {
                                                const faderDisplayObj = comments["commentExpandLoading"].find(desc_obj => Object.keys(desc_obj)[0] === `${index}`);
                                                return <div className="post-commentSecondary" key={`comment-expand-${index}`} style={desc.display ? {} : {"display": "none"}}>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l0"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        {desc["l1"] ?
                                                            <div className="post-commentBodyLineUp"/> : null
                                                        }
                                                    </div>
                                                    <div className="post-commentBodyLineUpContainer">
                                                        <div className="post-commentBodyLineUpMoreReplies"/>
                                                    </div>
                                                    <div className="post-commentQuaternaryContainer">
                                                        <div className="post-commentHeader" style={{"marginTop": "10px"}}>
                                                            <div className="post-commentSecondaryLineMoreRepliesConnector"></div>
                                                            <button className="post-commentBodyLineUpConnectorBtn"
                                                                    onClick={() => specificCommentExpand(index)}
                                                                    disabled={faderDisplayObj === undefined || faderDisplayObj === null ? false : faderDisplayObj[`${index}`] ? true : false}
                                                                > 
                                                                <div className="post-commentBodyLineUpConnectorBtnIconContainer">
                                                                    {faderDisplayObj === undefined || faderDisplayObj === null ?
                                                                        <Add className="post-commentBodyLineUpBtnIcon"/> : 
                                                                        <>
                                                                            {faderDisplayObj[`${index}`] ?
                                                                                <FadeLoader
                                                                                    color={"#9E9E9E"}
                                                                                    loading={true}
                                                                                    height={5}
                                                                                    margin={-12}
                                                                                    cssOverride={override}
                                                                                    width={2}
                                                                                    radius={"4px"}
                                                                                /> : 
                                                                                <Add className="post-commentBodyLineUpBtnIcon"/>
                                                                            }
                                                                        </>
                                                                    }
                                                                </div>
                                                                {generalOpx.formatLargeFigures(desc.value, 2)}+ more replies
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        })
                                    }
                                    {(comments["dataCount"] > comments["viewCount"]) && comments["viewCount"] !== 0 ?
                                        <button className="post-commentViewMoreCommentsBtn"
                                                onClick={() => viewMoreComments()}
                                                disabled={viewMoreCommentsLoading}
                                            >
                                            <div className="post-commentViewMoreCommentsBtnBox">
                                                {viewMoreCommentsLoading ?
                                                    <FadeLoader
                                                        color={"#9E9E9E"}
                                                        loading={true}
                                                        height={5}
                                                        margin={-12}
                                                        cssOverride={overrideV2}
                                                        width={2}
                                                        radius={"4px"}
                                                    /> :
                                                    <ExpandMore className="post-commentViewMoreCommentsBtnIcon"/>
                                                }
                                            </div>
                                            View More Comments
                                        </button> : null
                                    }
                                </>
                            }
                        </div> : null
                    }
                </div> : null
            }
        </div>
    )
}