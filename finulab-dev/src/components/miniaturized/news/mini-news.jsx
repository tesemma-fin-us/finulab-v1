import './mini-news.css';
import '../../../pages/stocks/largeView/innerPages/stocks.css';

import {format} from 'timeago.js';
import {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {ThumbUpOffAlt, ThumbDownOffAlt, Comment, Cached, ContentCopy, ThumbDown, ThumbUp, TrendingUp, TrendingDown, IosShare, ChatBubbleOutline, Link, CheckCircle} from '@mui/icons-material';
import {FacebookShareButton, TwitterShareButton, TelegramShareButton, WhatsappShareButton, LinkedinShareButton, BlueskyShareButton, TwitterIcon, FacebookIcon, RedditShareButton, RedditIcon, LinkedinIcon, TelegramIcon, BlueskyIcon} from 'react-share';

import generalOpx from '../../../functions/generalFunctions';

import {setEditPost} from '../../../reduxStore/editPost';
import {setInterests, selectInterests} from '../../../reduxStore/interests';
import {updateStockNews, selectStockNews} from '../../../reduxStore/stockNews';
import {updateSelection, selectHomePageData} from '../../../reduxStore/homePageData';
import {setStockPageSelection, selectStockPageSelection} from '../../../reduxStore/stockPageSelection';
import {updateStockDashboardNews, selectStockDashboardNews} from '../../../reduxStore/stockDashboardNews';
import {addToNewsEngagement, removeFromNewsEngagement, selectNewsEngagement} from '../../../reduxStore/newsEngagement';
import {setStockDashboardMarketsSelected, selectStockDashboardMarkets} from '../../../reduxStore/stockDashboardMarkets';

const chunkArray = (arr, size) => {
    let chunkedArray = [];
    for(let i = 0; i < arr.length; i += size) {
        chunkedArray.push(arr.slice(i, i + size));
    }

    return chunkedArray
}

export default function MiniaturizedNews(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const u_interests = useSelector(selectInterests);
    const u_engagement = useSelector(selectNewsEngagement);
    
    const stockNews = useSelector(selectStockNews);
    const homePageData = useSelector(selectHomePageData);
    const dashboardNews = useSelector(selectStockDashboardNews);
    const stockSelection = useSelector(selectStockPageSelection);
    const dashboardSelection = useSelector(selectStockDashboardMarkets);

    const [repostCount, setRepostCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [engagementRatio, setEngagementRatio] = useState([0, 0]);
    useEffect(() => {
        if(!props.loading) {
            if(!(props.desc === undefined || props.desc === null)) {
                setRepostCount(props.desc.shares);
                setCommentCount(props.desc.comments);
                setEngagementRatio([props.desc.likes, props.desc.dislikes]);
            }
        }
    }, [props]);

    const setSideDisplaySelection = () => {
        if(!(props.pred_ticker === undefined || props.pred_ticker === null)) {
            navigate(`/news/${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`);
        }
    }

    const engageNews = async (type) => {
        let engagementRatioFunction = [...engagementRatio];
        if(u_engagement.some(eng => eng.newsId === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)) {
            const prevEngagement = u_engagement.filter(eng => eng.newsId === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)[0]["type"];
            if(prevEngagement === type) {
                dispatch(
                    removeFromNewsEngagement(`${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)
                );

                if(type === "like") {
                    engagementRatioFunction[0] = engagementRatioFunction[0] - 1;
                } else if(type === "dislike") {
                    engagementRatioFunction[1] = engagementRatioFunction[1] - 1;
                }
            } else {
                dispatch(
                    removeFromNewsEngagement(`${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)
                );
                dispatch(
                    addToNewsEngagement([{"newsId": `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`, "type": type}])
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
                addToNewsEngagement([{"newsId": `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`, "type": type}])
            );

            if(type === "like") {
                engagementRatioFunction[0] = engagementRatioFunction[0] + 1;
            } else if(type === "dislike") {
                engagementRatioFunction[1] = engagementRatioFunction[1] + 1;
            }
        }

        /* home news page */
        if(homePageData["selected"]["type"] === "News") {
            if(`${props.pred_ticker.slice(0, 1)}:-${homePageData["selected"]["selectedDesc"]["desc"]["_id"]}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`) {
                let selectionCopy = {...homePageData["selected"]["selectedDesc"]["desc"]};
                selectionCopy["likes"] = engagementRatioFunction[0];
                selectionCopy["dislikes"] = engagementRatioFunction[1];

                dispatch(
                    updateSelection(
                        {
                            "type": "News",
                            "selectedDesc": {
                                "desc": selectionCopy
                            }
                        }
                    )
                );
            }
        }

        /* stock & crypto Dashboard */
        if(props.type === "stock_dashboardPage" || props.type === "stockPage") {
            let newsStockPage = [...stockNews["news"]["data"].flatMap(arr => arr.map(obj => obj))], 
                newsDashboard = [...dashboardNews["news"]["data"].flatMap(arr => arr.map(obj => obj))];

            if(newsStockPage.length > 0) {
                if(newsStockPage.some(nws => `${props.pred_ticker.slice(0, 1)}:-${nws._id}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)) {
                    let newsCopy = {...newsStockPage.filter(nws => `${props.pred_ticker.slice(0, 1)}:-${nws._id}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)[0]};
                    newsCopy["likes"] = engagementRatioFunction[0];
                    newsCopy["dislikes"] = engagementRatioFunction[1];

                    const copyIndex = newsStockPage.findIndex(nws => `${props.pred_ticker.slice(0, 1)}:-${nws._id}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`);
                    newsStockPage[copyIndex] = newsCopy;

                    dispatch(
                        updateStockNews(
                            {
                                "data": chunkArray(newsStockPage, 4), "dataLoading": stockNews["news"]["dataLoading"]
                            }
                        )
                    );
                }
            }

            if(newsDashboard.length > 0) {
                if(newsDashboard.some(nws => `${props.pred_ticker.slice(0, 1)}:-${nws._id}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)) {
                    let newsCopy = {...newsDashboard.filter(nws => `${props.pred_ticker.slice(0, 1)}:-${nws._id}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)[0]};
                    newsCopy["likes"] = engagementRatioFunction[0];
                    newsCopy["dislikes"] = engagementRatioFunction[1];

                    const copyIndex = newsDashboard.findIndex(nws => `${props.pred_ticker.slice(0, 1)}:-${nws._id}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`);
                    newsDashboard[copyIndex] = newsCopy;

                    dispatch(
                        updateStockDashboardNews(
                            {
                                "data": chunkArray(newsDashboard, 4), "dataLoading": dashboardNews["news"]["dataLoading"]
                            }
                        )
                    );
                }
            }

            if(stockSelection["selection"]["type"] === "News") {
                if(`${props.pred_ticker.slice(0, 1)}:-${stockSelection["selection"]["selectedDesc"]["desc"]["_id"]}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`) {
                    let selectionCopy = {...stockSelection["selection"]["selectedDesc"]["desc"]};
                    selectionCopy["likes"] = engagementRatioFunction[0];
                    selectionCopy["dislikes"] = engagementRatioFunction[1];

                    dispatch(
                        setStockPageSelection(
                            {
                                "type": "News",
                                "selectedDesc": {
                                    "desc": selectionCopy
                                }
                            }
                        )
                    );
                }
            }

            if(dashboardSelection["selected"]["type"] === "News") {
                if(`${props.pred_ticker.slice(0, 1)}:-${dashboardSelection["selected"]["selectedDesc"]["desc"]["_id"]}` === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`) {
                    let selectionCopy = {...dashboardSelection["selected"]["selectedDesc"]["desc"]};
                    selectionCopy["likes"] = engagementRatioFunction[0];
                    selectionCopy["dislikes"] = engagementRatioFunction[1];

                    dispatch(
                        setStockDashboardMarketsSelected(
                            {
                                "type": "News",
                                "scrollTop": dashboardSelection["selected"]["scrollTop"],
                                "selectedDesc": {
                                    "desc": selectionCopy
                                }
                            }
                        )
                    );
                }
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
        
        for(let finulab_j = 0; finulab_j < props.desc.newsSubjects.length; finulab_j++) {
            if(!u_interestsFunction.includes(props.desc.newsSubjects[finulab_j])) {
                u_interestsFunction.push(props.desc.newsSubjects[finulab_j]);
                u_interestsIntFunction.push(5);
            } else {
                const u_interestsUpdateIndex = u_interestsFunction.findIndex(u_elem => u_elem === props.desc.newsSubjects[finulab_j]);
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
        console.log(criticalNewU_interests);
        dispatch(
            setInterests(criticalNewU_interests)
        );

        await generalOpx.axiosInstance.post(`/content/news/news-engage`, {"type": type, "newsId": `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`});
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
                            "type": "news",
                            "predType": "",
                            "data": {
                                "ticker": `${props.pred_ticker.slice(0, 1)}`,
                                ...props.desc
                            }
                        }
                    ]
                }
            )
        );

        navigate("/create-post");
    }

    return(
        <>
            <div className="miniaturizedNews-Wrapper"
                    style={props.type === "repost" ? 
                        {
                            padding: "10px 10px 10px 10px",
                            borderRadius: "10px",
                            border: "solid 1px var(--primary-bg-08)",
                            width: "calc(100% - 20px)", minWidth: "calc(100% - 20px)", maxWidth: "calc(100% - 20px)",
                            height: "calc(100% - 20px)", minHeight: "calc(100% - 20px)", maxHeight: "calc(100% - 20px)"
                        } : {}
                    }
                >
                <div className="large-stocksNewsInnerSegment"
                        style={props.type === "repost" ? 
                            {
                                height: "100%", minHeight: "100%", maxHeight: "100%"
                            } : {}
                        }
                    >
                    {props.loading ?
                        <div className="large-stocksNewsSegmentImgLoading"/> :
                        <button className="large-stocksNewsSegmentImgBtn" onClick={() => setSideDisplaySelection()}>
                            <img src={props.desc["imageUrl"]} 
                                alt="" 
                                onError={(e) => 
                                    {
                                        e.target.src="/assets/Finulab_HighRes.jpg";
                                        e.target.className="miniaturizedNews-ErrorImg"
                                    }
                                }
                                className="large-stocksNewsSegmentImg"
                            />
                        </button>
                    }
                    <button className="large-stocksNewsInnerSegmentBody" onClick={() => setSideDisplaySelection()}>
                        {props.loading ?
                            <div className="large-stocksNewsInnerSegementPreTitleLoading"/> : 
                            <div className="large-stocksNewsInnerSegementPreTitle">{format(props.desc["timeStamp"] * 1000)}</div>
                        }
                        {props.loading ?
                            <div className="large-stocksNewsInnerSegmentBodyTitleLoading"/> :
                            <>
                                {props.type === "profilePage" || props.type === "repost" ? 
                                    <div
                                            style={{
                                                "display": "flex", 
                                                "width": "100%", "minWidth": "100%", "maxWidth": "100%",
                                                "height": "15px", "minHeight": "15px", "maxHeight": "15px",
                                                "fontSize": "0.76rem", "fontWeight": "500", "color": "var(--primary-bg-01)", "overflow": "hidden"
                                            }}
                                        >
                                        <div
                                                style={{
                                                    "display": "block",
                                                    "width": "100%", "minWidth": "100%", "maxWidth": "100%",
                                                    "textOverflow": "ellipsis", "whiteSpace": "nowrap", "overflow": "hidden"
                                                }}
                                            >
                                            {props.desc["title"]}
                                        </div>
                                    </div> : 
                                    <div className="large-stocksNewsInnerSegmentBodyNewTitle">
                                        <div className="large-stocksNewsInnerSegmentBodyNewTitleText">{props.desc["title"]}</div>
                                    </div>
                                }
                            </>
                        }
                        {props.loading ?
                            <div className="large-stocksNewsInnerSegmentBodyDescContainerLoading">
                                <div className="large-stocksNewsInnerSegmentBodyDescLoading" style={{"marginBottom": "3px"}}/>
                                <div className="large-stocksNewsInnerSegmentBodyDescLoading"/>
                            </div> : 
                            <>
                                {props.type === "profilePage" || props.type === "repost" ?
                                    <div className="large-stocksNewsInnerSegmentBodyDescContainer" >
                                        <div className="large-stocksNewsInnerSegmentBodyDesc">
                                            {props.desc["summary"]}
                                        </div>
                                    </div> : null
                                }
                            </>
                        }
                    </button>
                </div>
                {props.type === "repost" ? 
                    null : 
                    <div className="large-stocksNewsEngagementContainer">
                        <div className="post-likeDislikeContainer">
                            <button className="miniaturizedPrediction-IconBtn"
                                    onClick={
                                        (props.user === undefined || props.user === null || props.user === "visitor") ?
                                        () => navigate("/login") : () => engageNews("like")
                                    }
                                >
                                {props.loading || (props.pred_ticker === undefined || props.pred_ticker === null) ?
                                    <TrendingUp className="large-stocksNewsEngagementIcon"
                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                    /> :
                                    <>
                                        {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                            <TrendingUp className="large-stocksNewsEngagementIcon"
                                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}    
                                            /> :
                                            <>
                                                {u_engagement.some(eng => eng.newsId === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`) ?
                                                    <>
                                                        {u_engagement.filter(eng => eng.newsId === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)[0]["type"] === "like" ?
                                                            <TrendingUp className="large-stocksFullyLikedIcon" 
                                                                style={{"stroke": "var(--primary-green-09)", "strokeWidth": "1px"}}    
                                                            /> :
                                                            <TrendingUp className="large-stocksNewsEngagementIcon"
                                                                style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                            />
                                                        }
                                                    </> : 
                                                    <TrendingUp className="large-stocksNewsEngagementIcon"
                                                        style={{"stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                    />
                                                }
                                            </>
                                        }
                                    </>
                                }
                            </button>
                            <div className="miniaturized-newsLikeDislikeRatioDesc">
                                {props.loading || engagementRatio[0] + engagementRatio[1] === 0 ?
                                    null : 
                                    `${engagementRatio[0] + engagementRatio[1] === 0 ?
                                        `` : engagementRatio[0] + engagementRatio[1] > 0 ?
                                        `+` : `-`
                                    } ${generalOpx.formatLargeFigures(Math.abs(engagementRatio[0] + engagementRatio[1]))}`
                                }
                            </div>
                            <button className="miniaturizedPrediction-IconBtn"
                                    onClick={
                                        (props.user === undefined || props.user === null || props.user === "visitor") ?
                                        () => navigate("/login") : () => engageNews("dislike")
                                    }
                                    style={{"marginRight": "10px"}}
                                >
                                {props.loading || (props.pred_ticker === undefined || props.pred_ticker === null) ?
                                    <TrendingDown className="large-stocksNewsEngagementIcon" 
                                        style={{"transform": "scale(-0.7, 0.7)", "WebkitTransform": "scale(-0.7, 0.7)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                    /> :
                                    <>
                                        {(props.user === undefined || props.user === null || props.user === "visitor") ?
                                            <TrendingDown className="large-stocksNewsEngagementIcon" 
                                                style={{"transform": "scale(-0.7, 0.7)", "WebkitTransform": "scale(-0.7, 0.7)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                            /> :
                                            <>
                                                {u_engagement.some(eng => eng.newsId === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`) ?
                                                    <>
                                                        {u_engagement.filter(eng => eng.newsId === `${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)[0]["type"] === "dislike" ?
                                                            <TrendingDown className="large-stocksFullyDislikedIcon" 
                                                                style={{"transform": "scale(-0.7, 0.7)", "WebkitTransform": "scale(-0.7, 0.7)", "stroke": "var(--primary-red-09)", "strokeWidth": "1px"}}
                                                            /> :
                                                            <TrendingDown className="large-stocksNewsEngagementIcon" 
                                                                style={{"transform": "scale(-0.7, 0.7)", "WebkitTransform": "scale(-0.7, 0.7)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                            />
                                                        }
                                                    </> : 
                                                    <TrendingDown className="large-stocksNewsEngagementIcon" 
                                                        style={{"transform": "scale(-0.7, 0.7)", "WebkitTransform": "scale(-0.7, 0.7)", "stroke": "var(--primary-bg-05)", "strokeWidth": "1px"}}
                                                    />
                                                }
                                            </>
                                        }
                                    </>
                                }
                            </button>
                        </div>
                        <div className="large-stocksNewsEngagementContainerFurtherOptn">
                            <button className="post-additionalEngagementOptionsDesc"
                                    style={{"marginRight": "3px"}}
                                    onClick={() => repostNavigation()}
                                >
                                <Cached className="large-stocksNewsEngagementIcon"/>
                                {props.loading || repostCount === 0 ?
                                    null : 
                                    <span className="post-additionalEngagementOptionsDescText">{generalOpx.formatLargeFigures(repostCount, 2)}</span>
                                }
                            </button>
                            <button className="post-additionalEngagementOptionsDesc"
                                    style={{"marginLeft": "0"}}
                                    onClick={() => navigate(`/news/${props.pred_ticker.slice(0, 1)}:-${props.desc._id}`)}
                                >
                                <ChatBubbleOutline className="large-stocksNewsEngagementIcon" style={{"transform": "scale(-0.7, 0.7)"}}/>
                                {props.loading || commentCount === 0?
                                    null : 
                                    <span className="post-additionalEngagementOptionsDescText">{generalOpx.formatLargeFigures(commentCount, 2)}</span>
                                }
                            </button>
                            <button className="post-additionalEngagementOptionsDesc"
                                    style={{"marginLeft": "5px"}}
                                    onClick={() => displayShareLinkWrapperToggle()}
                                >
                                <IosShare className="large-stocksNewsEngagementIcon"/>
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
                            "width": `${props.width}px`, "minWidth": `${props.width}px`, "maxWidth": `${props.width}px`,
                            "marginLeft": props.width_index === 0 || props.width_index === 2 ? "-16px" : `calc(-${(props.width - 32 - 10) / 2}px - 16px - 10px)`
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
                        <div className="finulab-shareLinkAcrossMediaHeader">Share Markets</div>
                        <div className="finulab-shareLinkAcrossOptnsContainer">
                            <button className="finulab-shareLinkAcrossOptnBtn"
                                    onClick={() => copyToClipboard(`${props.desc["newsUrl"]}`)}
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
                                        url={`${props.desc["newsUrl"]}`}
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
                                        url={`${props.desc["newsUrl"]}`}
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
                                        url={`${props.desc["newsUrl"]}`}
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
                                        url={`${props.desc["newsUrl"]}`}
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
                                        url={`${props.desc["newsUrl"]}`}
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
                                        url={`${props.desc["newsUrl"]}`}
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
        </>
    )
}