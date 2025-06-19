import {throttle} from 'lodash';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {useRef, useState, useLayoutEffect, useEffect, useCallback} from "react";
import {ArrowForwardIos, ArrowRightAlt, BlurOn, DoubleArrow, ExpandLess, TrendingUp, Verified} from "@mui/icons-material";

import Post from '../../../../components/post';
import generalOpx from "../../../../functions/generalFunctions";
import FinulabTrending from "../../../../components/trending/trending";
import MiniaturizedPrediction from '../../../../components/miniaturized/prediction/mini-prediction';

import {selectUser} from '../../../../reduxStore/user';
import {selectMarketHoldings} from '../../../../reduxStore/marketHoldings';
import {selectModeratorStatus} from '../../../../reduxStore/moderatorStatus';
import {setPostEngagement, addToPostEngagement, selectPostEngagement} from '../../../../reduxStore/postEngagement';
import {updateSearchPageInformationState, selectPageInformationState} from '../../../../reduxStore/pageInformation';
import {setQueryRecentAccounts, setQueryRecentTxtSearch, selectFinulabSearchRecent} from '../../../../reduxStore/finulabSearchRecent';
import {setPredictionEngagement, addToPredictionEngagement, selectPredictionEngagement} from '../../../../reduxStore/predictionEngagement';
import {setQuery, setQueryDisplay, setTrending, setTop, setLatest, set_s_markets, selectFinulabSearch} from '../../../../reduxStore/finulabSearch';

export default function FinulabSearchPage(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const appState = useSelector(selectPageInformationState);

    const user = useSelector(selectUser);
    const searchData = useSelector(selectFinulabSearch);
    const u_postEngagement = useSelector(selectPostEngagement);
    const u_marketHoldings = useSelector(selectMarketHoldings);
    const u_moderatorStatus = useSelector(selectModeratorStatus);
    const searchRecentData = useSelector(selectFinulabSearchRecent);
    const u_predictionEngagement = useSelector(selectPredictionEngagement);

    const contentBodyRef = useRef();
    const [contentBodyWidth, setContentBodyWidth] = useState([0, false]);
    useLayoutEffect(() => {
        const contentBodyWidthFunction = () => {
            if(contentBodyRef.current) {
                const bodyWidth = contentBodyRef.current.getBoundingClientRect().width;
                setContentBodyWidth([bodyWidth, true]);
            }
        }

        window.addEventListener('resize', contentBodyWidthFunction);
        contentBodyWidthFunction();
        return () => window.removeEventListener('resize', contentBodyWidthFunction);
    }, []);

    const scrollController = useRef();
    useEffect(() => {
        if(props.f_viewPort === "small") {
            if(contentBodyWidth[1]) {
                const handleScrollSearchPage = (e) => {
                    if(props.searchId !== "") {
                        let profilePageInformation = {...appState["search"]};

                        if(profilePageInformation["view"] === props.displayView) {
                            if(props.displayView === "") {
                                profilePageInformation["scrollTop"] = document.documentElement.scrollTop;
                            } else if(props.displayView === "latest") {
                                profilePageInformation["latestScrollTop"] = document.documentElement.scrollTop;
                            } else if(props.displayView === "markets") {
                                profilePageInformation["marketScrollTop"] = document.documentElement.scrollTop;
                            }

                            dispatch(
                                updateSearchPageInformationState(profilePageInformation)
                            );
                        } else {
                            profilePageInformation["view"] = props.displayView;
                            dispatch(
                                updateSearchPageInformationState(profilePageInformation)
                            );
                        }
                    }
                }
                
                const throttledHandleScrollSearchPage = throttle(handleScrollSearchPage, 50);
                document.addEventListener('scroll', throttledHandleScrollSearchPage, { passive: true });
                document.addEventListener('touchmove', handleScrollSearchPage, { passive: true });

                return () => {
                    document.removeEventListener('scroll', throttledHandleScrollSearchPage);
                    document.removeEventListener('touchmove', handleScrollSearchPage);
                };
            }
        }
    }, [contentBodyWidth, props.searchId, props.displayView, appState["search"]["view"]]);

    useEffect(() => {
        if(!(props.f_viewPort === "small")) {
            if(contentBodyWidth[1]) {
                const handleScrollSearchPage = (e) => {
                    if(props.searchId !== "") {
                        let profilePageInformation = {...appState["search"]};

                        if(profilePageInformation["view"] === props.displayView) {
                            if(props.displayView === "") {
                                profilePageInformation["scrollTop"] = scrollController.current.scrollTop;
                            } else if(props.displayView === "latest") {
                                profilePageInformation["latestScrollTop"] = scrollController.current.scrollTop;
                            } else if(props.displayView === "markets") {
                                profilePageInformation["marketScrollTop"] = scrollController.current.scrollTop;
                            }

                            dispatch(
                                updateSearchPageInformationState(profilePageInformation)
                            );
                        } else {
                            profilePageInformation["view"] = props.displayView;
                            dispatch(
                                updateSearchPageInformationState(profilePageInformation)
                            );
                        }
                    }
                }
                
                const scrollElement = scrollController.current;
                const throttledHandleScrollSearchPage = throttle(handleScrollSearchPage, 50);
                scrollElement.addEventListener('scroll', throttledHandleScrollSearchPage, {passive: true});
        
                return () => {
                    if(scrollElement) {
                        scrollElement.removeEventListener('scroll', throttledHandleScrollSearchPage);
                    }
                };
            }
        }
    }, [contentBodyWidth, props.searchId, props.displayView, appState["search"]["view"]]);

    const pullTrending = async () => {
        await generalOpx.axiosInstance.put(`/content/posts/trending-now`).then(
            (response) => {
                if(response.data["status"] === "success") {
                    dispatch(
                        setTrending(
                            {
                                "data": response.data["data"],
                                "dataLoading": false
                            }
                        )
                    );
                }
            }
        )
    }

    const [topBeingUpdated, setTopBeingUpdated] = useState(false);
    const pullTop = async (type, ninpostIds) => {
        if(type === "primary" || searchData["top"]["data"].length < searchData["top"]["dataCount"]) {
            await generalOpx.axiosInstance.put(`/content/posts/search?q=${props.searchId}`,
                {
                    "type": type,
                    "ninpostIds": ninpostIds
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        if(type === "primary") {
                            if(user && response.data["data"].length > 0) {
                                if(u_postEngagement.length === 0) {
                                    const postIds = [...response.data["data"].map(p_data => p_data._id)];
                                    const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});

                                    if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                        dispatch(
                                            setPostEngagement(postEngagements.data["data"])
                                        );
                                    }
                                } else {
                                    const postIdsToEliminate = [...u_postEngagement.map(p_data => p_data.postId)];
                                    const postIds = [...response.data["data"].filter(({_id}) => !postIdsToEliminate.includes(_id)).map(({_id}) => _id)];

                                    if(postIds.length > 0) {
                                        const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});
                                        if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                            dispatch(
                                                addToPostEngagement(postEngagements.data["data"])
                                            );
                                        }
                                    }
                                }
                            }
                            
                            dispatch(
                                setTop(
                                    {
                                        "query": props.searchId,
                                        "data": response.data["data"],
                                        "dataCount": response.data["dataCount"],
                                        "dataLoading": false
                                    }
                                )
                            );
                        } else if(type === "secondary") {
                            if(user && response.data["data"].length > 0) {
                                const postIdsToEliminate = [...u_postEngagement.map(p_data => p_data.postId)];
                                const postIds = [...response.data["data"].filter(({_id}) => !postIdsToEliminate.includes(_id)).map(({_id}) => _id)];

                                if(postIds.length > 0) {
                                    const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});
                                    if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                        dispatch(
                                            addToPostEngagement(postEngagements.data["data"])
                                        );
                                    }
                                }
                            }

                            dispatch(
                                setTop(
                                    {
                                        "query": props.searchId,
                                        "data": [...searchData["top"]["data"], ...response.data["data"]],
                                        "dataCount": searchData["top"]["dataCount"],
                                        "dataLoading": false
                                    }
                                )
                            );
                        }

                        if(response.data["data"].length > 0) {setTopBeingUpdated(false);}
                    }
                }
            );
        }
    }
    
    const topObserverRef = useRef();
    const lastTopPostElementRef = useCallback(node => 
        {
            if(topBeingUpdated) return;
            if(props.displayView !== "") return;
            if(searchData["top"]["dataLoading"]) return;
            if(topObserverRef.current) topObserverRef.current.disconnect();
            topObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting && searchData["top"]["data"].length < searchData["top"]["dataCount"]) {
                        setTopBeingUpdated(true);

                        let ninpostIds = [];
                        for(let i = 0; i < searchData["top"]["data"].length; i++) {
                            ninpostIds.push(searchData["top"]["data"][i]["_id"]);
                        }
                        pullTop("secondary", ninpostIds);
                    }
                }
            );
            if(node) topObserverRef.current.observe(node);
        }, [searchData["top"], topBeingUpdated]
    );

    const [latestBeingUpdated, setLatestBeingUpdated] = useState(false);
    const pullLatest = async (type, ninpostIds) => {
        if(type === "primary" || searchData["latest"]["data"].length < searchData["latest"]["dataCount"]) {
            await generalOpx.axiosInstance.put(`/content/posts/latest?q=${props.searchId}`,
                {
                    "type": type,
                    "ninpostIds": ninpostIds
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        if(type === "primary") {
                            if(user && response.data["data"].length > 0) {
                                if(u_postEngagement.length === 0) {
                                    const postIds = [...response.data["data"].map(p_data => p_data._id)];
                                    const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});

                                    if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                        dispatch(
                                            setPostEngagement(postEngagements.data["data"])
                                        );
                                    }
                                } else {
                                    const postIdsToEliminate = [...u_postEngagement.map(p_data => p_data.postId)];
                                    const postIds = [...response.data["data"].filter(({_id}) => !postIdsToEliminate.includes(_id)).map(({_id}) => _id)];

                                    if(postIds.length > 0) {
                                        const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});
                                        if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                            dispatch(
                                                addToPostEngagement(postEngagements.data["data"])
                                            );
                                        }
                                    }
                                }
                            }
                            
                            dispatch(
                                setLatest(
                                    {
                                        "query": props.searchId,
                                        "data": response.data["data"],
                                        "dataCount": response.data["dataCount"],
                                        "dataLoading": false
                                    }
                                )
                            );
                        } else if(type === "secondary") {
                            if(user && response.data["data"].length > 0) {
                                const postIdsToEliminate = [...u_postEngagement.map(p_data => p_data.postId)];
                                const postIds = [...response.data["data"].filter(({_id}) => !postIdsToEliminate.includes(_id)).map(({_id}) => _id)];

                                if(postIds.length > 0) {
                                    const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});
                                    if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                        dispatch(
                                            addToPostEngagement(postEngagements.data["data"])
                                        );
                                    }
                                }
                            }

                            dispatch(
                                setLatest(
                                    {
                                        "query": props.searchId,
                                        "data": [...searchData["latest"]["data"], ...response.data["data"]],
                                        "dataCount": searchData["latest"]["dataCount"],
                                        "dataLoading": false
                                    }
                                )
                            );
                        }

                        if(response.data["data"].length > 0) {setLatestBeingUpdated(false);}
                    }
                }
            );
        }
    }

    const latestObserverRef = useRef();
    const lastLatestPostElementRef = useCallback(node => 
        {
            if(latestBeingUpdated) return;
            if(props.displayView !== "latest") return;
            if(searchData["latest"]["dataLoading"]) return;
            if(latestObserverRef.current) latestObserverRef.current.disconnect();
            latestObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting && searchData["latest"]["data"].length < searchData["latest"]["dataCount"]) {
                        setLatestBeingUpdated(true);

                        let ninpostIds = [];
                        for(let i = 0; i < searchData["latest"]["data"].length; i++) {
                            ninpostIds.push(searchData["latest"]["data"][i]["_id"]);
                        }
                        pullLatest("secondary", ninpostIds);
                    }
                }
            );
            if(node) latestObserverRef.current.observe(node);
        }, [searchData["latest"], latestBeingUpdated]
    );

    const [marketsBeingUpdated, setMarketsBeingUpdated] = useState(false);
    const pullMarkets = async (type, ninpredictionIds) => {
        if(type === "primary" || searchData["s_markets"]["data"].length < searchData["s_markets"]["dataCount"]) {
            await generalOpx.axiosInstance.put(`/market/details?q=${props.searchId}`,
                {
                    "type": type,
                    "ninpredictionIds": ninpredictionIds
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        if(type === "primary") {
                            if(user && response.data["data"].length > 0) {
                                if(u_predictionEngagement.length === 0) {
                                    const predictionIds = [...response.data["data"].map(p_data => p_data._id)];
                                    const predictionEngagements = await generalOpx.axiosInstance.put(`/market/prediction-engagements`, {"predictionIds": predictionIds});

                                    if(predictionEngagements.data["status"] === "success" && predictionEngagements.data["data"].length > 0) {
                                        dispatch(
                                            setPredictionEngagement(predictionEngagements.data["data"])
                                        );
                                    }
                                } else {
                                    const predictionIdsToEliminate = [...u_predictionEngagement.map(h_data => h_data.predictionId)];
                                    const predictionIds = [...response.data["data"].filter(({_id}) => !predictionIdsToEliminate.includes(_id)).map(({_id}) => _id)];

                                    if(predictionIds.length > 0) {
                                        const predictionEngagements = await generalOpx.axiosInstance.put(`/market/prediction-engagements`, {"predictionIds": predictionIds});

                                        if(predictionEngagements.data["status"] === "success" && predictionEngagements.data["data"].length > 0) {
                                            dispatch(
                                                addToPredictionEngagement(predictionEngagements.data["data"])
                                            );
                                        }
                                    }
                                }
                            }

                            dispatch(
                                set_s_markets(
                                    {
                                        "query": props.searchId,
                                        "data": response.data["data"],
                                        "markets": response.data["markets"],
                                        "dataCount": response.data["dataCount"],
                                        "dataLoading": false
                                    }
                                )
                            );
                        } else if(type === "secondary") {
                            if(user && response.data["data"].length > 0) {
                                const engPredictionIdsToEliminate = [...u_predictionEngagement.map(h_data => h_data.predictionId)];
                                const engPredictionIds = [...response.data["data"].filter(({_id}) => !engPredictionIdsToEliminate.includes(_id)).map(({_id}) => _id)];

                                if(engPredictionIds.length > 0) {
                                    const predictionEngagements = await generalOpx.axiosInstance.put(`/market/prediction-engagements`, {"predictionIds": engPredictionIds});

                                    if(predictionEngagements.data["status"] === "success" && predictionEngagements.data["data"].length > 0) {
                                        dispatch(
                                            addToPredictionEngagement(predictionEngagements.data["data"])
                                        );
                                    }
                                }
                            }

                            dispatch(
                                set_s_markets(
                                    {
                                        "query": props.searchId,
                                        "data": [...searchData["s_markets"]["data"], ...response.data["data"]],
                                        "markets": [...searchData["s_markets"]["markets"], ...response.data["markets"]],
                                        "dataCount": searchData["s_markets"]["dataCount"],
                                        "dataLoading": false
                                    }
                                )
                            );
                        }

                        if(response.data["data"].length > 0) {setMarketsBeingUpdated(false);}
                    }
                }
            )
        }
    }
    
    const marketsObserverRef = useRef();
    const lastMarketsElementRef = useCallback(node => 
        {
            if(marketsBeingUpdated) return;
            if(props.displayView !== "markets") return;
            if(searchData["s_markets"]["dataLoading"]) return;
            if(marketsObserverRef.current) marketsObserverRef.current.disconnect();
            marketsObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting && searchData["s_markets"]["data"].length < searchData["s_markets"]["dataCount"]) {
                        setMarketsBeingUpdated(true);

                        let ninpredictionIds = [];
                        for(let i = 0; i < searchData["s_markets"]["data"].length; i++) {
                            ninpredictionIds.push(searchData["s_markets"]["data"][i]["_id"]);
                        }
                        pullMarkets("secondary", ninpredictionIds);
                    }
                }
            );
            if(node) marketsObserverRef.current.observe(node);
        }, [searchData["s_markets"], marketsBeingUpdated]
    );

    useEffect(() => {
        if(!(props.searchId === null || props.searchId === undefined)) {
            if(props.searchId === "") {
                dispatch(
                    setQuery("")
                );
    
                if(searchData["trending"]["dataLoading"]) {
                    pullTrending();
                }

                setTimeout(() => {
                    if(scrollController.current) {
                        if(props.f_viewPort === "small") {
                            document.documentElement.scrollTop = 0;
                        } else {
                            scrollController.current.scrollTop = 0;
                        }
                    }
                }, 0);
            } else {
                if(searchData["query"] !== props.searchId) {
                    if(props.searchId === null || props.searchId === undefined) {
                        dispatch(
                            setQuery("")
                        );
                    } else {
                        dispatch(
                            setQuery(props.searchId)
                        );
                    }
                }
    
                if(props.displayView === "") {
                    if(searchData["top"]["dataLoading"]) {
                        pullTop("primary", []);

                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = 0;
                                } else {
                                    scrollController.current.scrollTop = 0;
                                }
                            }
                        }, 0);
                    } else if(searchData["top"]["query"] !== props.searchId) {
                        dispatch(
                            setTop(
                                {
                                    "query": "",
                                    "data": [],
                                    "dataCount": 0,
                                    "dataLoading": true
                                }
                            )
                        );
    
                        pullTop("primary", []);

                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = 0;
                                } else {
                                    scrollController.current.scrollTop = 0;
                                }
                            }
                        }, 0);
                    } else {
                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = appState["search"]["scrollTop"];
                                } else {
                                    scrollController.current.scrollTop = appState["search"]["scrollTop"];
                                }
                            }
                        }, 0);
                    }
                } else if(props.displayView === "latest") {
                    if(searchData["latest"]["dataLoading"]) {
                        pullLatest("primary", []);

                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = 0;
                                } else {
                                    scrollController.current.scrollTop = 0;
                                }
                            }
                        }, 0);
                    } else if(searchData["latest"]["query"] !== props.searchId) {
                        dispatch(
                            setLatest(
                                {
                                    "query": "",
                                    "data": [],
                                    "dataCount": 0,
                                    "dataLoading": true
                                }
                            )
                        );
    
                        pullLatest("primary", []);

                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = 0;
                                } else {
                                    scrollController.current.scrollTop = 0;
                                }
                            }
                        }, 0);
                    } else {
                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = appState["search"]["latestScrollTop"];
                                } else {
                                    scrollController.current.scrollTop = appState["search"]["latestScrollTop"];
                                }
                            }
                        }, 0);
                    }
                } else if(props.displayView === "markets") {
                    if(searchData["s_markets"]["dataLoading"]) {
                        pullMarkets("primary", []);

                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = 0;
                                } else {
                                    scrollController.current.scrollTop = 0;
                                }
                            }
                        }, 0);
                    } else if(searchData["s_markets"]["query"] !== props.searchId) {
                        dispatch(
                            set_s_markets(
                                {
                                    "query": "",
                                    "data": [],
                                    "markets": [],
                                    "dataCount": 0,
                                    "dataLoading": true
                                }
                            )
                        );
    
                        pullMarkets("primary", []);

                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = 0;
                                } else {
                                    scrollController.current.scrollTop = 0;
                                }
                            }
                        }, 0);
                    } else {
                        setTimeout(() => {
                            if(scrollController.current) {
                                if(props.f_viewPort === "small") {
                                    document.documentElement.scrollTop = appState["search"]["marketScrollTop"];
                                } else {
                                    scrollController.current.scrollTop = appState["search"]["marketScrollTop"];
                                }
                            }
                        }, 0);
                    }
                } else if(props.displayView === "pages") {
                    setTimeout(() => {
                        if(scrollController.current) {
                            if(props.f_viewPort === "small") {
                                document.documentElement.scrollTop = 0;
                            } else {
                                scrollController.current.scrollTop = 0;
                            }
                        }
                    }, 0);
                }
            }
        }
    }, [props.searchId, props.displayView]);

    const finulabSearchNavigator = (type, txt, img, verified, link) => {
        if(type === "text") {
            if(searchRecentData["queryRecentTxtSearch"].includes(txt)) {
                let searchRecentTxtsCopy = [...searchRecentData["queryRecentTxtSearch"]];
                let searchRecentTxtsCopy_updateIndex = searchRecentTxtsCopy.indexOf(txt);

                if(searchRecentTxtsCopy_updateIndex !== -1) {
                    searchRecentTxtsCopy.splice(searchRecentTxtsCopy_updateIndex, 1);

                    dispatch(
                        setQueryRecentTxtSearch(
                            [
                                txt,
                                ...searchRecentTxtsCopy
                            ]
                        )
                    );
                }
            } else {
                dispatch(
                    setQueryRecentTxtSearch(
                        [
                            txt,
                            ...searchRecentData["queryRecentTxtSearch"]
                        ]
                    )
                );
            }

            navigate(`/search/${txt}`)
        } else if(type === "account") {
            if(searchRecentData["queryRecentAccounts"].some(qRecent_acct => qRecent_acct[1] === txt)) {
                let queryRecentAccountsCopy = [...searchRecentData["queryRecentAccounts"]];
                let queryRecentAccountsCopy_updateIndex = queryRecentAccountsCopy.findIndex(qRecent_acct => qRecent_acct[1] === txt);

                if(queryRecentAccountsCopy_updateIndex !== -1) {
                    queryRecentAccountsCopy.splice(queryRecentAccountsCopy_updateIndex, 1);

                    dispatch(
                        setQueryRecentAccounts(
                            [
                                [img, txt, verified, link],
                                ...queryRecentAccountsCopy
                            ]
                        )
                    );
                }
            } else {
                dispatch(
                    setQueryRecentAccounts(
                        [
                            [img, txt, verified, link],
                            ...searchRecentData["queryRecentAccounts"]
                        ]
                    )
                );
            }

            navigate(link);
        }

        dispatch(
            setQuery("")
        );
        dispatch(
            setQueryDisplay(false)
        );
    }

    const finulabSearchRecentClear = () => {
        dispatch(
            setQueryRecentTxtSearch([])
        );
        dispatch(
            setQueryRecentAccounts([])
        );
    }

    const analyzePostCharCount = (text, timeStamp, type) => {
        let charPerLine = 0;
        if(type === "title") {
            charPerLine = (68 / 535.031) * (contentBodyWidth[0] - 65);
        } else if(type === "post") {
            charPerLine = (80 / 535.031) * (contentBodyWidth[0] - 65);
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

    return(
        <div
                ref={scrollController}
                className={props.f_viewPort === "small" ? "small-homePageContentBodyWrapper" : "large-homePageContentBodyWrapper"}
            >
            <div 
                    ref={contentBodyRef}
                    className={props.f_viewPort === "small" ? "small-homePageContentBody" : "large-homePageContentBody"}
                >
                <div className="large-homePageContentBodyMargin"/>
                {searchData["queryDisplay"] ? 
                    <>
                        {(searchData["u_results"].length + searchData["c_results"].length
                            + searchData["st_results"].length + searchData["cr_results"].length === 0) || searchData["query"].length === 0 ?
                            <>
                                {searchData["query"].length === 0 ?
                                    <>
                                        {searchRecentData["queryRecentAccounts"].length + searchRecentData["queryRecentTxtSearch"].length === 0 ?
                                            <div className="large-homeFinulabSearchPageSearchDesc">
                                                Try searching for people, markets, or keywords
                                            </div> : 
                                            <>
                                                <div className="large-homeRecentSearchHeader">
                                                    Recent searches
                                                    <button className="large-homeRecentSearchClearBtn"
                                                            onClick={() => finulabSearchRecentClear()}
                                                        >
                                                        Clear
                                                    </button>
                                                </div>
                                                {searchRecentData["queryRecentAccounts"].length === 0 ?
                                                    null : 
                                                    <div className="large-homeRecentlySearchedAccountsWrapper">
                                                        {searchRecentData["queryRecentAccounts"].map((desc, index) => (
                                                                <button className="large-homeRecentlySearchedAccountBtn"
                                                                        onClick={() => navigate(desc[3])}
                                                                    >
                                                                    {desc[0] === "" ?
                                                                        <div className="large-homeFinulabSearchProfileImageNoneContV2"
                                                                                style={{...generalOpx.profilePictureGradients[`${desc[1]}`.length % 5]}}
                                                                            >
                                                                            <BlurOn style={{"transform": "scale(1.85)", "color": `var(--primary-bg-${`${desc[1]}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                                                        </div> : 
                                                                        <img src={desc[0]} alt="" className="large-homeRecentlySearchedAccountImg" />
                                                                    }
                                                                    <div className="large-homeRecentlySearchedAccountBtnDesc">
                                                                        {desc[2] ? 
                                                                            <span className="large-homeRecentlySearchedAccountDescLine">{desc[1]}</span> : 
                                                                            <span className="large-homeRecentlySearchedAccountDescLineV2">{desc[1]}</span>
                                                                        }
                                                                        {desc[2] ?
                                                                            <Verified className="large-homeRecentlySearchedAccountVerifiedIcon" /> : 
                                                                            null
                                                                        }
                                                                    </div>
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                }
                                                {searchRecentData["queryRecentTxtSearch"].length === 0 ?
                                                    <div className="large-homeRecentlySearchedTxtsLineUpWrapper"
                                                        style={{
                                                            "minHeight": `calc(100vh - 51px - 31px - 80px - 10px)`
                                                        }}
                                                    /> : 
                                                    <div className="large-homeRecentlySearchedTxtsLineUpWrapper"
                                                            style={{
                                                                "minHeight": searchRecentData["queryRecentAccounts"].length === 0 ?
                                                                    `calc(100vh - 51px - 31px - 10px)` : `calc(100vh - 51px - 31px - 80px - 10px)`
                                                            }}
                                                        >
                                                        {searchRecentData["queryRecentTxtSearch"].map((qRecent_txt, index) => (
                                                                <button className="finulab-trendingBtn"
                                                                        key={`finulab-txt-search-${qRecent_txt}`}
                                                                        onClick={() => finulabSearchNavigator("text", qRecent_txt, "", false, "")}
                                                                    >
                                                                    <div className="large-homeFinulabSearchPageSearchForSpecifiedContainer">
                                                                        <span className="large-homeFinulabSearchPageSearchForSpecifiedContainerTxt">{qRecent_txt}</span>
                                                                        <ArrowRightAlt className="large-homeFinulabSearchPageSearchForSpecifiedContainerIcon"/>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                }
                                            </>
                                        }
                                    </> : 
                                    <div className="large-homeFinulabSearchPageSearchDesc"
                                            style={{
                                                "padding": "0",
                                                "minHeight": `calc(100vh - 51px)`
                                            }}
                                        >
                                        <button className="finulab-trendingBtn"
                                                onClick={() => finulabSearchNavigator("text", searchData["query"], "", false, "")}
                                            >
                                            <div className="large-homeFinulabSearchPageSearchForSpecifiedContainer">
                                                <span className="large-homeFinulabSearchPageSearchForSpecifiedContainerTxt">Search for {searchData["query"]}</span>
                                                <ArrowRightAlt className="large-homeFinulabSearchPageSearchForSpecifiedContainerIcon"/>
                                            </div>
                                        </button>
                                    </div>
                                }
                            </> :
                            <div className="large-finulabSearchResultsDisplayContainer">
                                <div className="large-homePageMainNavigationSearchResultsContainer" 
                                        style={{
                                            "marginTop": "0", "height": "100%", "minHeight": "100%", "maxHeight": "100%"
                                        }}
                                    >
                                    {searchData["u_results"].length === 0 ?
                                        null : 
                                        <>
                                            <div className="large-homePageSearchResultsSectionHeader">Users</div>
                                            {searchData["u_results"].map((desc, index) => {
                                                    if(desc.verified) {
                                                        return <button className="large-homePageSearchResultsInnerDescContainer" 
                                                                key={`fs-user-search-rslt-${index}`}
                                                                onClick={() => finulabSearchNavigator("account", desc.username, desc.profilePicture, true, `/profile/${desc.username}`)}
                                                            >
                                                            <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                <img src={desc.profilePicture} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                <div className="large-homePageSearchResultsFullVerifiedTextCont">
                                                                    <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.username}</span>
                                                                </div>
                                                                <Verified className="large-homePageMainNavigationAccountVerifiedIcon" />
                                                            </div>
                                                        </button>
                                                    } else {
                                                        return <button className="large-homePageSearchResultsInnerDescContainer" 
                                                                key={`fs-user-search-rslt-${index}`}
                                                                onClick={() => finulabSearchNavigator("account", desc.username, desc.profilePicture, false, `/profile/${desc.username}`)}
                                                            >
                                                            <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                {desc.profilePicture === "" ?
                                                                    <div className="large-homepageMainNavigationSrchrsultNoPic"
                                                                            style={generalOpx.profilePictureGradients[index % 5]}
                                                                        >
                                                                        <img src="/assets/Favicon.png" alt="" className="large-homepageMainNavigationSrcrsultNoPicFinulabLogo" />
                                                                    </div> :
                                                                    <img src={desc.profilePicture} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                }
                                                                <div className="large-homePageSearchResultsFullTextCont">
                                                                    <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.username}</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    }
                                                })
                                            }
                                        </>
                                    }
                                    {searchData["c_results"].length === 0 ?
                                        null : 
                                        <>
                                            <div className="large-homePageSearchResultsSectionHeader">Communities</div>
                                            {searchData["c_results"].map((desc, index) => (
                                                    <div className="large-homePageSearchResultsInnerDescContainer" key={`fs-community-search-rslt-${index}`}>
                                                        <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                            <img src={desc.profilePicture} alt="" className="large-homePageMainNavigationAccountImg" />
                                                            <div className="large-homePageSearchResultsFullTextCont">
                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.communityName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    }
                                    {searchData["st_results"].length === 0 ?
                                        null : 
                                        <>
                                            <div className="large-homePageSearchResultsSectionHeader">Stocks</div>
                                            {searchData["st_results"].map((desc, index) => (
                                                    <button className="large-homePageSearchResultsInnerDescContainer" 
                                                            key={`fs-stock-search-rslt-${index}`}
                                                            onClick={(desc.alphaVantageName.length < desc.polygonIoName.length) && desc.alphaVantageName !== "" ?
                                                                () => finulabSearchNavigator("account", desc.alphaVantageName, desc.profileImage, false, `/stocks/S:-${desc.symbol}`) :
                                                                () => finulabSearchNavigator("account", desc.polygonIoName, desc.profileImage, false, `/stocks/S:-${desc.symbol}`)
                                                            }
                                                        >
                                                        <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                            <img src={desc.profileImage} alt="" className="large-homePageMainNavigationAccountImg" />
                                                            <div className="large-homePageSearchResultsTickerText">
                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.symbol}</span>
                                                            </div>
                                                            <div className="large-homePageSearchResultsNameText">
                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">
                                                                    {(desc.alphaVantageName.length < desc.polygonIoName.length) && desc.alphaVantageName !== "" ?
                                                                        `${desc.alphaVantageName}` : `${desc.polygonIoName}`
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                        </>
                                    }
                                    {searchData["cr_results"].length === 0 ?
                                        null : 
                                        <>
                                            <div className="large-homePageSearchResultsSectionHeader">Cryptos</div>
                                            {searchData["cr_results"].map((desc, index) => (
                                                    <button className="large-homePageSearchResultsInnerDescContainer" 
                                                            key={`fs-crypto-search-rslt-${index}`}
                                                            onClick={() => finulabSearchNavigator("account", desc.name, desc.profileImage, false, `/cryptos/C:-${desc.symbol}`)}
                                                        >
                                                        <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                            <img src={desc.profileImage} alt="" className="large-homePageMainNavigationAccountImg" />
                                                            <div className="large-homePageSearchResultsTickerText">
                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.symbol}</span>
                                                            </div>
                                                            <div className="large-homePageSearchResultsNameText">
                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.name}</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                        </>
                                    }
                                </div>
                            </div>
                        }
                    </> : 
                    <>
                        {props.searchId === "" ? 
                            <>
                                <div className="large-homePageInnerTopOptionsContainer"
                                        style={{
                                                ...{"width": `${contentBodyWidth[0]}px`, "minWidth": `${contentBodyWidth[0]}px`, "maxWidth": `${contentBodyWidth[0]}px`},
                                                ...({"position": "fixed", "top": "51px"})
                                            }
                                        }
                                    >
                                    <span className="large-homePageInnerTopOptionsBtnDesc" 
                                            style={{
                                                "marginLeft": "12px",
                                                "fontWeight": "500",
                                                "fontSize": "1.15rem",
                                                "color": "var(--primary-bg-01)"
                                            }}
                                        >
                                        <TrendingUp style={{"marginRight": "5px"}}/>
                                        Trending on Finulab
                                    </span>
                                </div>
                                <div className="large-homePageContentBodyMargin"
                                    style={{"height": "36px", "minHeight": "36px", "maxHeight": "36px"}}
                                />
                                {searchData["trending"]["dataLoading"] ? 
                                    <>
                                        {Array(15).fill(null).map((desc, index) => (
                                                <div className="large-homePagePostContainer" 
                                                        key={`trending-now-loading-${index}`}
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <FinulabTrending loading={true} />
                                                </div>
                                            ))
                                        }
                                    </> : 
                                    <>
                                        {searchData["trending"]["data"].map((desc, index) => (
                                                <div className="large-homePagePostContainer" 
                                                        key={`trending-now-complete-${index}`}
                                                        style={searchData["trending"]["data"].length - 1 === index ? {} : {"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <FinulabTrending index={index} desc={desc} loading={false} />
                                                </div>
                                            ))
                                        }
                                    </>
                                }
                            </> : 
                            <>
                                <div className="large-homePageInnerTopOptionsContainer"
                                        style={
                                            {
                                                ...{"width": `${contentBodyWidth[0]}px`, "minWidth": `${contentBodyWidth[0]}px`, "maxWidth": `${contentBodyWidth[0]}px`},
                                                ...({"position": "fixed", "top": "51px"})
                                            }
                                        }
                                    >
                                    <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                            onClick={() => navigate(`/search/${props.searchId}`)}
                                        >
                                        <span className="large-homePageInnerTopOptionsBtnDesc" 
                                                style={props.displayView === "" ? {"color": "var(--primary-bg-01)"} : {}}
                                            >
                                            Top
                                            {props.displayView === "" ?
                                                <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                            }
                                        </span>
                                    </button>
                                    <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                            onClick={() => navigate(`/search/${props.searchId}/latest`)}
                                        >
                                        <span className="large-homePageInnerTopOptionsBtnDesc"
                                                style={props.displayView === "latest" ? {"color": "var(--primary-bg-01)"} : {}}
                                            >
                                            Latest
                                            {props.displayView === "latest" ?
                                                <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                            }
                                        </span>
                                    </button>
                                    <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                            onClick={() => navigate(`/search/${props.searchId}/markets`)}
                                        >
                                        <span className="large-homePageInnerTopOptionsBtnDesc" 
                                                style={props.displayView === "markets" ? {"color": "var(--primary-bg-01)"} : {}}
                                            >
                                            Markets
                                            {props.displayView === "markets" ?
                                                <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                            }
                                        </span>
                                    </button>
                                    <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                            onClick={() => navigate(`/search/${props.searchId}/pages`)}
                                        >
                                        <span className="large-homePageInnerTopOptionsBtnDesc"
                                                style={props.displayView === "pages" ? {"color": "var(--primary-bg-01)"} : {}}
                                            >
                                            Pages
                                            {props.displayView === "pages" ?
                                                <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                            }
                                        </span>
                                    </button>
                                </div>
                                <div className="large-homePageContentBodyMargin"
                                    style={{"height": "36px", "minHeight": "36px", "maxHeight": "36px"}}
                                />
                                {props.displayView === "" ? 
                                    <>
                                        {searchData["u_results"].length + searchData["c_results"].length
                                            + searchData["st_results"].length + searchData["cr_results"].length === 0 ?
                                            null : 
                                            <>
                                                <div className="large-homeRecentSearchHeader">
                                                    Pages
                                                </div>
                                                <div className="large-homeFinulabSearchAvailablePagesWrapper">
                                                    {searchData["u_results"].length === 0 ? 
                                                        null : 
                                                        <>
                                                            {searchData["u_results"].map((u_rslt, index) => (
                                                                    <button className="large-homeFinulabSearchAvailablePagesBtn"
                                                                            onClick={() => finulabSearchNavigator("account", u_rslt.username, u_rslt.profilePicture, u_rslt.verified, `/profile/${u_rslt.username}`)}
                                                                        >
                                                                        {u_rslt.profileWallpaper === "" ? 
                                                                            <div className="large-homeFinulabSearchWallpaperContainer"/> : 
                                                                            <img src={u_rslt.profileWallpaper} alt="" className="large-homeFinulabSearchWallpaperImg" />
                                                                        }
                                                                        {u_rslt.profilePicture === "" ? 
                                                                            <div className="large-homeFinulabSearchProfileImageNoneCont"
                                                                                    style={{...generalOpx.profilePictureGradients[`${u_rslt.username}`.length % 5]}}
                                                                                >
                                                                                <BlurOn style={{"transform": "scale(1.85)", "color": `var(--primary-bg-${`${u_rslt.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                                                            </div> : 
                                                                            <img src={u_rslt.profilePicture} alt="" className="large-homeFinulabSearchPageProfileImage" />
                                                                        }
                                                                        <div className="large-homeFinulabSearchPageUsernameDesc">
                                                                            <span className="large-homeFinulabSearchPageUsernameInnerDesc">{u_rslt.username}</span>
                                                                            {u_rslt.verified ?
                                                                                <Verified className="large-homeRecentlySearchedAccountVerifiedIcon" style={{"marginLeft": "3px"}}/> : null
                                                                            }
                                                                        </div>
                                                                        <div className="large-profilePageBioDescContainer"
                                                                                style={
                                                                                    {
                                                                                        "marginLeft": "13px",
                                                                                        "width": "calc(100% - 20px)", "minWidth": "calc(100% - 20px)", "maxWidth": "calc(100% - 20px)"
                                                                                    }
                                                                                }
                                                                            >
                                                                            <div className="large-profilePageBioDesc">
                                                                                {u_rslt.bio}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            }
                                                        </>
                                                    }
                                                    {searchData["cr_results"].length === 0 ? 
                                                        null : 
                                                        <>
                                                            {searchData["cr_results"].map((cr_rslt, index) => (
                                                                    <button className="large-homeFinulabSearchAvailableEquitiesBtn"
                                                                            onClick={() => finulabSearchNavigator("account", cr_rslt.name, cr_rslt.profileImage, false, `/cryptos/C:-${cr_rslt.symbol}`)}
                                                                        >
                                                                        <img src={cr_rslt.profileImage} alt="" className="large-homeFinulabSearchPageEquityProfileImage" />
                                                                        <img src="/assets/Favicon.png" alt="" className="large-homeFinulabSearchAvailableEquitiesBtnFinulabIcon"/>
                                                                        <div className="large-homeFinulabSearchPageUsernameDesc"
                                                                                style={{"marginTop": "5px", "marginLeft": "10px"}}
                                                                            >
                                                                            <span className="large-homeFinulabSearchPageUsernameInnerDesc">{cr_rslt.name}</span>
                                                                        </div>
                                                                        <div className="large-homeFinulabSearchPageEquityChangeToday"
                                                                                style={cr_rslt.change >= 0 ? {"color": "var(--primary-green-09)"} : {"color": "var(--primary-red-09)"}}
                                                                            >
                                                                            {cr_rslt.change >= 0 ?
                                                                                <div className="large-homeFinulabSearchPageEquityCheveronContainer">
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronMainIcon"/>
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronSecondaryIcon"/>
                                                                                    <ExpandLess className="large-homeFinulabSearchPageEquityCheveronTertiaryIcon"/>
                                                                                </div> : 
                                                                                <div className="large-homeFinulabSearchPageEquityCheveronContainer">
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronMainIconV1"/>
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronSecondaryIconV1"/>
                                                                                    <ExpandLess className="large-homeFinulabSearchPageEquityCheveronTertiaryIconV1"/>
                                                                                </div>
                                                                            }
                                                                            {generalOpx.formatFigures.format(Math.abs(cr_rslt.changePerc * 100))}%
                                                                        </div>
                                                                        <div className="large-homeFinulabSearchPageEquityChangeNumericsContainerWrapper">
                                                                            <div className="large-homeFinulabSearchPageEquityChangeNumericsContainer">
                                                                                <div className="large-homeFinulabSearchPageEquityChangeNumericsSect">
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectHead">Change</span>
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectBody">
                                                                                        {cr_rslt.change >= 0 ? `+` : `-`}&nbsp;{generalOpx.formatFiguresCrypto.format(Math.abs(cr_rslt.change))}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="large-homeFinulabSearchPageEquityChangeNumericsDivider"/>
                                                                                <div className="large-homeFinulabSearchPageEquityChangeNumericsSect">
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectHead">Price</span>
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectBody">${generalOpx.formatFiguresCrypto.format(Math.abs(cr_rslt.close))}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="large-homeFInulabSearchPageEquityChangeNumericsTickerDesc">
                                                                                {cr_rslt.symbol}
                                                                                <span className="large-homeFinulabSearchPageEquityChangeTickerExchangeDesc">&nbsp;</span>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            }
                                                        </>
                                                    }
                                                    {searchData["st_results"].length === 0 ? 
                                                        null : 
                                                        <>
                                                            {searchData["st_results"].map((st_rslt, index) => (
                                                                    <button className="large-homeFinulabSearchAvailableEquitiesBtn"
                                                                            onClick={(st_rslt.alphaVantageName.length < st_rslt.polygonIoName.length) && st_rslt.alphaVantageName !== "" ?
                                                                                () => finulabSearchNavigator("account", st_rslt.alphaVantageName, st_rslt.profileImage, false, `/stocks/S:-${st_rslt.symbol}`) :
                                                                                () => finulabSearchNavigator("account", st_rslt.polygonIoName, st_rslt.profileImage, false, `/stocks/S:-${st_rslt.symbol}`)
                                                                            }
                                                                        >
                                                                        <img src={st_rslt.profileImage} alt="" className="large-homeFinulabSearchPageEquityProfileImage" />
                                                                        <img src="/assets/Favicon.png" alt="" className="large-homeFinulabSearchAvailableEquitiesBtnFinulabIcon"/>
                                                                        <div className="large-homeFinulabSearchPageUsernameDesc"
                                                                                style={{"marginTop": "5px", "marginLeft": "10px"}}
                                                                            >
                                                                            <span className="large-homeFinulabSearchPageUsernameInnerDesc">
                                                                                {st_rslt.alphaVantageName.length <= st_rslt.polygonIoName.length && st_rslt.alphaVantageName.length !== 0?
                                                                                    `${st_rslt.alphaVantageName}` : `${st_rslt.polygonIoName}`
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="large-homeFinulabSearchPageEquityChangeToday"
                                                                                style={st_rslt.change >= 0 ? {"color": "var(--primary-green-09)"} : {"color": "var(--primary-red-09)"}}
                                                                            >
                                                                            {st_rslt.change >= 0 ? 
                                                                                <div className="large-homeFinulabSearchPageEquityCheveronContainer">
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronMainIcon"/>
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronSecondaryIcon"/>
                                                                                    <ExpandLess className="large-homeFinulabSearchPageEquityCheveronTertiaryIcon"/>
                                                                                </div> : 
                                                                                <div className="large-homeFinulabSearchPageEquityCheveronContainer">
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronMainIconV1"/>
                                                                                    <DoubleArrow className="large-homeFinulabSearchPageEquityCheveronSecondaryIconV1"/>
                                                                                    <ExpandLess className="large-homeFinulabSearchPageEquityCheveronTertiaryIconV1"/>
                                                                                </div>
                                                                            }
                                                                            {generalOpx.formatFigures.format(Math.abs(st_rslt.changePerc * 100))}%
                                                                        </div>
                                                                        <div className="large-homeFinulabSearchPageEquityChangeNumericsContainerWrapper">
                                                                            <div className="large-homeFinulabSearchPageEquityChangeNumericsContainer">
                                                                                <div className="large-homeFinulabSearchPageEquityChangeNumericsSect">
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectHead">Change</span>
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectBody">
                                                                                        {st_rslt.change >= 0 ? `+` : `-`}&nbsp;{generalOpx.formatFigures.format(Math.abs(st_rslt.change))}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="large-homeFinulabSearchPageEquityChangeNumericsDivider"/>
                                                                                <div className="large-homeFinulabSearchPageEquityChangeNumericsSect">
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectHead">Price</span>
                                                                                    <span className="large-homeFInulabSearchPageEquityChangeNumericSectBody">
                                                                                        ${generalOpx.formatFigures.format(st_rslt.close)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="large-homeFInulabSearchPageEquityChangeNumericsTickerDesc">
                                                                                {st_rslt.symbol}
                                                                                <span className="large-homeFinulabSearchPageEquityChangeTickerExchangeDesc">{st_rslt.exchange}</span>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            }
                                                        </>
                                                    }
                                                </div>
                                            </>
                                        }
                                        {!contentBodyWidth[1] || searchData["top"]["dataLoading"] ?
                                            <>
                                                <div className="large-homePagePostContainer"
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePagePostContainer"
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePagePostContainer"
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePagePostContainer"
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePagePostContainer"
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePagePostContainer"
                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                    >
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePagePostContainer">
                                                    <Post loading={true}/>
                                                </div>
                                                <div className="large-homePageProfileNoDataContainer"
                                                    style={{
                                                        "minHeight": searchData["u_results"].length + searchData["c_results"].length
                                                            + searchData["st_results"].length + searchData["cr_results"].length === 0 ?
                                                            `calc(100vh - (51px + 36px))` : `calc(100vh - (261px + 51px + 36px))`
                                                    }}
                                                />
                                            </> : 
                                            <>
                                                {searchData["top"]["data"].length === 0 ?
                                                    <div className="large-homePageProfileNoDataContainer"
                                                            style={{
                                                                "minHeight": searchData["u_results"].length + searchData["c_results"].length
                                                                    + searchData["st_results"].length + searchData["cr_results"].length === 0 ?
                                                                    `calc(100vh - (51px + 36px))` : `calc(100vh - (261px + 51px + 36px))`
                                                            }}
                                                        >
                                                        <img src="/assets/Finulab_Icon.png" alt="" className="large-marketPageNoDateNoticeImg" />
                                                        <div className="large-marketPageNoDataONotice">
                                                            No results found.
                                                        </div>
                                                    </div> :
                                                    <>
                                                        {searchData["top"]["data"].map((post_desc, index) => (
                                                                <div className="large-homePagePostContainer" key={`search-post-${post_desc._id}`}
                                                                        ref={index === (searchData["top"]["data"].length - 2) ? lastTopPostElementRef : null}
                                                                        style={index === (searchData["top"]["data"].length - 1) ? 
                                                                            {} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                                        }
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            key={`search-inner-cont-post-${post_desc["_id"]}`}
                                                                            style={
                                                                                {
                                                                                    "height": `calc(20px + 40px + ${
                                                                                        !user ? 0 : (post_desc.username === user.user || u_moderatorStatus.some(modStat => modStat.community === post_desc.groupId)) && post_desc.userRewards > 0 ? 33 : 0
                                                                                    }px + ${
                                                                                        post_desc.title === "" ? 0 : (10 + (analyzePostCharCount(post_desc.title, post_desc.timeStamp, "title") * 20))
                                                                                    }px + ${
                                                                                        post_desc.post === "" ? 0 : analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") > 3 ? 
                                                                                        79 + 5 + 18 : (16 + (analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") * 21.58))
                                                                                    }px + ${
                                                                                        post_desc.photos.length + post_desc.videos.length > 0 ? 16 + 275 : 0
                                                                                    }px + 16px + 28px + ${post_desc.title !== "" && post_desc.post === "" ? 10 : 0}px + ${post_desc.validTags.length === 0 ? 0 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                        + post_desc.validTags[0]["data"]["videos"].length === 0 ? 169 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                        + post_desc.validTags[0]["data"]["videos"].length > 0 ? 468.5 : post_desc.validTags[0]["type"] === "news" ? 135 : post_desc.validTags[0]["type"] === "pred"
                                                                                        && post_desc.validTags[0]["predType"] === "categorical" ? 185 : 130
                                                                                    }px + 5px)`,
            
                                                                                    "minHeight": `calc(20px + 40px + ${
                                                                                        !user ? 0 : (post_desc.username === user.user || u_moderatorStatus.some(modStat => modStat.community === post_desc.groupId)) && post_desc.userRewards > 0 ? 33 : 0
                                                                                    }px + ${
                                                                                        post_desc.title === "" ? 0 : (10 + (analyzePostCharCount(post_desc.title, post_desc.timeStamp, "title") * 20))
                                                                                    }px + ${
                                                                                        post_desc.post === "" ? 0 : analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") > 3 ? 
                                                                                        79 + 5 + 18 : (16 + (analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") * 21.58))
                                                                                    }px + ${
                                                                                        post_desc.photos.length + post_desc.videos.length > 0 ? 16 + 275 : 0
                                                                                    }px + 16px + 28px + ${post_desc.title !== "" && post_desc.post === "" ? 10 : 0}px + ${post_desc.validTags.length === 0 ? 0 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                        + post_desc.validTags[0]["data"]["videos"].length === 0 ? 169 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                        + post_desc.validTags[0]["data"]["videos"].length > 0 ? 468.5 : post_desc.validTags[0]["type"] === "news" ? 135 : post_desc.validTags[0]["type"] === "pred"
                                                                                        && post_desc.validTags[0]["predType"] === "categorical" ? 185 : 130
                                                                                    }px + 5px)`,
            
                                                                                    "maxHeight": `calc(20px + 40px + ${
                                                                                        !user ? 0 :(post_desc.username === user.user || u_moderatorStatus.some(modStat => modStat.community === post_desc.groupId)) && post_desc.userRewards > 0 ? 33 : 0
                                                                                    }px + ${
                                                                                        post_desc.title === "" ? 0 : (10 + (analyzePostCharCount(post_desc.title, post_desc.timeStamp, "title") * 20))
                                                                                    }px + ${
                                                                                        post_desc.post === "" ? 0 : analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") > 3 ? 
                                                                                        79 + 5 + 18 : (16 + (analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") * 21.58))
                                                                                    }px + ${
                                                                                        post_desc.photos.length + post_desc.videos.length > 0 ? 16 + 275 : 0
                                                                                    }px + 16px + 28px + ${post_desc.title !== "" && post_desc.post === "" ? 10 : 0}px + ${post_desc.validTags.length === 0 ? 0 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                        + post_desc.validTags[0]["data"]["videos"].length === 0 ? 169 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                        + post_desc.validTags[0]["data"]["videos"].length > 0 ? 468.5 : post_desc.validTags[0]["type"] === "news" ? 135 : post_desc.validTags[0]["type"] === "pred"
                                                                                        && post_desc.validTags[0]["predType"] === "categorical" ? 185 : 130
                                                                                    }px + 5px)`,
                                                                                }
                                                                            }
                                                                        >
                                                                    <Post 
                                                                        user={user ? user.user : "visitor"}
                                                                        type={"home"}
                                                                        view={"mini"}
                                                                        width={contentBodyWidth[0]}
                                                                        details={post_desc}
                                                                        target={"profile"}
                                                                        verified={false}
                                                                        loading={false}
                                                                    />
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                        <div className="large-homePageProfileNoDataContainer"
                                                            style={{
                                                                "minHeight": searchData["u_results"].length + searchData["c_results"].length
                                                                    + searchData["st_results"].length + searchData["cr_results"].length === 0 ?
                                                                    `calc(100vh - (51px + 36px))` : `calc(100vh - (261px + 51px + 36px))`
                                                            }}
                                                        />
                                                    </>
                                                }
                                            </>
                                        }
                                    </> : 
                                    <>
                                        {props.displayView === "latest" ? 
                                            <>
                                                {!contentBodyWidth[1] || searchData["latest"]["dataLoading"] ?
                                                    <>
                                                        <div className="large-homePagePostContainer"
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePagePostContainer"
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePagePostContainer"
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePagePostContainer"
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePagePostContainer"
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePagePostContainer"
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePagePostContainer">
                                                            <Post loading={true}/>
                                                        </div>
                                                        <div className="large-homePageProfileNoDataContainer"
                                                            style={{
                                                                "minHeight": `calc(100vh - (51px + 36px))`
                                                            }}
                                                        />
                                                    </> : 
                                                    <>
                                                        {searchData["latest"]["data"].length === 0 ?
                                                            <div className="large-homePageProfileNoDataContainer"
                                                                    style={{
                                                                        "minHeight": `calc(100vh - (51px + 36px))`
                                                                    }}
                                                                >
                                                                <img src="/assets/Finulab_Icon.png" alt="" className="large-marketPageNoDateNoticeImg" />
                                                                <div className="large-marketPageNoDataONotice">
                                                                    No results found.
                                                                </div>
                                                            </div> :
                                                            <>
                                                                {searchData["latest"]["data"].map((post_desc, index) => (
                                                                        <div className="large-homePagePostContainer" key={`search-post-${post_desc._id}`}
                                                                                ref={index === (searchData["latest"]["data"].length - 2) ? lastLatestPostElementRef : null}
                                                                                style={index === (searchData["latest"]["data"].length - 1) ? 
                                                                                    {} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                                                }
                                                                            >
                                                                            <div className="large-stocksPostInnerContainer"
                                                                                    key={`search-inner-cont-post-${post_desc["_id"]}`}
                                                                                    style={
                                                                                        {
                                                                                            "height": `calc(20px + 40px + ${
                                                                                                !user ? 0 : (post_desc.username === user.user || u_moderatorStatus.some(modStat => modStat.community === post_desc.groupId)) && post_desc.userRewards > 0 ? 33 : 0
                                                                                            }px + ${
                                                                                                post_desc.title === "" ? 0 : (10 + (analyzePostCharCount(post_desc.title, post_desc.timeStamp, "title") * 20))
                                                                                            }px + ${
                                                                                                post_desc.post === "" ? 0 : analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") > 3 ? 
                                                                                                79 + 5 + 18 : (16 + (analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") * 21.58))
                                                                                            }px + ${
                                                                                                post_desc.photos.length + post_desc.videos.length > 0 ? 16 + 275 : 0
                                                                                            }px + 16px + 28px + ${post_desc.title !== "" && post_desc.post === "" ? 10 : 0}px + ${post_desc.validTags.length === 0 ? 0 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                                + post_desc.validTags[0]["data"]["videos"].length === 0 ? 169 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                                + post_desc.validTags[0]["data"]["videos"].length > 0 ? 468.5 : post_desc.validTags[0]["type"] === "news" ? 135 : post_desc.validTags[0]["type"] === "pred"
                                                                                                && post_desc.validTags[0]["predType"] === "categorical" ? 185 : 130
                                                                                            }px + 5px)`,
                    
                                                                                            "minHeight": `calc(20px + 40px + ${
                                                                                                !user ? 0 : (post_desc.username === user.user || u_moderatorStatus.some(modStat => modStat.community === post_desc.groupId)) && post_desc.userRewards > 0 ? 33 : 0
                                                                                            }px + ${
                                                                                                post_desc.title === "" ? 0 : (10 + (analyzePostCharCount(post_desc.title, post_desc.timeStamp, "title") * 20))
                                                                                            }px + ${
                                                                                                post_desc.post === "" ? 0 : analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") > 3 ? 
                                                                                                79 + 5 + 18 : (16 + (analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") * 21.58))
                                                                                            }px + ${
                                                                                                post_desc.photos.length + post_desc.videos.length > 0 ? 16 + 275 : 0
                                                                                            }px + 16px + 28px + ${post_desc.title !== "" && post_desc.post === "" ? 10 : 0}px + ${post_desc.validTags.length === 0 ? 0 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                                + post_desc.validTags[0]["data"]["videos"].length === 0 ? 169 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                                + post_desc.validTags[0]["data"]["videos"].length > 0 ? 468.5 : post_desc.validTags[0]["type"] === "news" ? 135 : post_desc.validTags[0]["type"] === "pred"
                                                                                                && post_desc.validTags[0]["predType"] === "categorical" ? 185 : 130
                                                                                            }px + 5px)`,
                    
                                                                                            "maxHeight": `calc(20px + 40px + ${
                                                                                                !user ? 0 :(post_desc.username === user.user || u_moderatorStatus.some(modStat => modStat.community === post_desc.groupId)) && post_desc.userRewards > 0 ? 33 : 0
                                                                                            }px + ${
                                                                                                post_desc.title === "" ? 0 : (10 + (analyzePostCharCount(post_desc.title, post_desc.timeStamp, "title") * 20))
                                                                                            }px + ${
                                                                                                post_desc.post === "" ? 0 : analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") > 3 ? 
                                                                                                79 + 5 + 18 : (16 + (analyzePostCharCount(post_desc.post, post_desc.timeStamp, "post") * 21.58))
                                                                                            }px + ${
                                                                                                post_desc.photos.length + post_desc.videos.length > 0 ? 16 + 275 : 0
                                                                                            }px + 16px + 28px + ${post_desc.title !== "" && post_desc.post === "" ? 10 : 0}px + ${post_desc.validTags.length === 0 ? 0 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                                + post_desc.validTags[0]["data"]["videos"].length === 0 ? 169 : post_desc.validTags[0]["type"] === "post" && post_desc.validTags[0]["data"]["photos"].length
                                                                                                + post_desc.validTags[0]["data"]["videos"].length > 0 ? 468.5 : post_desc.validTags[0]["type"] === "news" ? 135 : post_desc.validTags[0]["type"] === "pred"
                                                                                                && post_desc.validTags[0]["predType"] === "categorical" ? 185 : 130
                                                                                            }px + 5px)`,
                                                                                        }
                                                                                    }
                                                                                >
                                                                            <Post 
                                                                                user={user ? user.user : "visitor"}
                                                                                type={"home"}
                                                                                view={"mini"}
                                                                                width={contentBodyWidth[0]}
                                                                                details={post_desc}
                                                                                target={"profile"}
                                                                                verified={false}
                                                                                loading={false}
                                                                            />
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                                <div className="large-homePageProfileNoDataContainer"
                                                                    style={{
                                                                        "minHeight": `calc(100vh - (51px + 36px))`
                                                                    }}
                                                                />
                                                            </>
                                                        }
                                                    </>
                                                }
                                            </> : 
                                            <>
                                                {props.displayView === "markets" ? 
                                                    <>
                                                        {!contentBodyWidth[1] || searchData["s_markets"]["dataLoading"] ?
                                                            <>
                                                                <div className="large-homePagePostContainer"
                                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePagePostContainer"
                                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePagePostContainer"
                                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePagePostContainer"
                                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePagePostContainer"
                                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePagePostContainer"
                                                                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                    >
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePagePostContainer">
                                                                    <div className="large-stocksPostInnerContainer"
                                                                            style={{"height": "313px", "minHeight": "313px", "maxHeight": "313px"}}
                                                                        >
                                                                        <MiniaturizedPrediction loading={true}/>
                                                                    </div>
                                                                </div>
                                                                <div className="large-homePageProfileNoDataContainer"
                                                                    style={{
                                                                        "minHeight": `calc(100vh - (51px + 36px))`
                                                                    }}
                                                                />
                                                            </> : 
                                                            <>
                                                                {searchData["s_markets"]["data"].length === 0 ?
                                                                    <div className="large-homePageProfileNoDataContainer"
                                                                            style={{
                                                                                "minHeight": `calc(100vh - (51px + 36px))`
                                                                            }}
                                                                        >
                                                                        <img src="/assets/Finulab_Icon.png" alt="" className="large-marketPageNoDateNoticeImg" />
                                                                        <div className="large-marketPageNoDataONotice">
                                                                            No results found.
                                                                        </div>
                                                                        {user ?
                                                                            <>
                                                                                {props.userId === user.user ?
                                                                                    <>
                                                                                        {user.verified ?
                                                                                            null : 
                                                                                            <div className="large-marketPageNoDataTNotice">
                                                                                                <button className="large-marketPageNoDataONoticeBtn" onClick={() => navigate("/get-verified")}>
                                                                                                    Get verified
                                                                                                </button>&nbsp;to create one and earn 50% of the collected fees.
                                                                                            </div>
                                                                                        }
                                                                                    </> : null
                                                                                }
                                                                            </> : null
                                                                        }
                                                                    </div> :
                                                                    <>
                                                                        {searchData["s_markets"]["data"].map((prediction_desc, index) => {
                                                                                const marketDesc_toProvide = searchData["s_markets"]["markets"].filter(doc => doc.predictionId == prediction_desc._id);
                    
                                                                                return <div className="large-homePagePostContainer" key={`profile-market-${prediction_desc._id}`}
                                                                                        ref={index === (searchData["s_markets"]["data"].length - 2) ? lastMarketsElementRef : null}
                                                                                        style={index === (searchData["s_markets"]["data"].length - 1) ? 
                                                                                            {} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                                                        }
                                                                                    >
                                                                                    <div className="large-stocksPostInnerContainer"
                                                                                            key={`profile-inner-cont-market-${prediction_desc["_id"]}`}
                                                                                            style={prediction_desc["status"] !== "live" ? {"height": "359px", "minHeight": "359px", "maxHeight": "359px"} :
                                                                                                
                                                                                                prediction_desc["outcomeType"] === "yes-or-no" ?
                                                                                                {"height": "442px", "minHeight": "442px", "maxHeight": "442px"} :
                                                                                                marketDesc_toProvide.length === 1 ? {"height": "402px", "minHeight": "402px", "maxHeight": "402px"} : 
                                                                                                marketDesc_toProvide.length === 2 ? {"height": "452px", "minHeight": "452px", "maxHeight": "452px"} :
                                                                                                marketDesc_toProvide.length === 3 ? {"height": "502px", "minHeight": "502px", "maxHeight": "502px"} :
                                                                                                {"height": "542px", "minHeight": "542px", "maxHeight": "542px"}
                                                                                            }
                                                                                        >
                                                                                    <MiniaturizedPrediction
                                                                                        pred_location={"market"}
                                                                                        f_viewPort={props.f_viewPort}
                                                                                        mouseOnComponent={1}
                                                                                        predictionDesc={prediction_desc} 
                                                                                        width={contentBodyWidth[0]}
                                                                                        user={user ? user.user : "visitor"}
                                                                                        marketDesc={marketDesc_toProvide}
                                                                                        ownership={u_marketHoldings.filter(doc => doc.predictionId === prediction_desc._id)}
                                                                                    />
                                                                                    </div>
                                                                                </div>
                                                                            })
                                                                        }
                                                                        <div className="large-homePageProfileNoDataContainer"
                                                                            style={{
                                                                                "minHeight": `calc(100vh - (51px + 36px))`
                                                                            }}
                                                                        />
                                                                    </>
                                                                }
                                                            </>
                                                        }
                                                    </> : 
                                                    <>
                                                        {props.displayView === "pages" ? 
                                                            <div className="large-finulabSearchResultsDisplayContainer">
                                                                <div className="large-homePageMainNavigationSearchResultsContainer" 
                                                                        style={{
                                                                            "marginTop": "0", "height": "100%", "minHeight": "100%", "maxHeight": "100%"
                                                                        }}
                                                                    >
                                                                    {searchData["u_results"].length === 0 ?
                                                                        null : 
                                                                        <>
                                                                            <div className="large-homePageSearchResultsSectionHeader">Users</div>
                                                                            {searchData["u_results"].map((desc, index) => {
                                                                                    if(desc.verified) {
                                                                                        return <button className="large-homePageSearchResultsInnerDescContainer" 
                                                                                                key={`fs-user-search-rslt-${index}`}
                                                                                                onClick={() => finulabSearchNavigator("account", desc.username, desc.profilePicture, true, `/profile/${desc.username}`)}
                                                                                            >
                                                                                            <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                                                <img src={desc.profilePicture} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                                                <div className="large-homePageSearchResultsFullVerifiedTextCont">
                                                                                                    <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.username}</span>
                                                                                                </div>
                                                                                                <Verified className="large-homePageMainNavigationAccountVerifiedIcon" />
                                                                                            </div>
                                                                                        </button>
                                                                                    } else {
                                                                                        return <button className="large-homePageSearchResultsInnerDescContainer" 
                                                                                                key={`fs-user-search-rslt-${index}`}
                                                                                                onClick={() => finulabSearchNavigator("account", desc.username, desc.profilePicture, false, `/profile/${desc.username}`)}
                                                                                            >
                                                                                            <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                                                {desc.profilePicture === "" ?
                                                                                                    <div className="large-homepageMainNavigationSrchrsultNoPic"
                                                                                                            style={generalOpx.profilePictureGradients[index % 5]}
                                                                                                        >
                                                                                                        <img src="/assets/Favicon.png" alt="" className="large-homepageMainNavigationSrcrsultNoPicFinulabLogo" />
                                                                                                    </div> :
                                                                                                    <img src={desc.profilePicture} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                                                }
                                                                                                <div className="large-homePageSearchResultsFullTextCont">
                                                                                                    <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.username}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </button>
                                                                                    }
                                                                                })
                                                                            }
                                                                        </>
                                                                    }
                                                                    {searchData["c_results"].length === 0 ?
                                                                        null : 
                                                                        <>
                                                                            <div className="large-homePageSearchResultsSectionHeader">Communities</div>
                                                                            {searchData["c_results"].map((desc, index) => (
                                                                                    <div className="large-homePageSearchResultsInnerDescContainer" key={`fs-community-search-rslt-${index}`}>
                                                                                        <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                                            <img src={desc.profilePicture} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                                            <div className="large-homePageSearchResultsFullTextCont">
                                                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.communityName}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </>
                                                                    }
                                                                    {searchData["st_results"].length === 0 ?
                                                                        null : 
                                                                        <>
                                                                            <div className="large-homePageSearchResultsSectionHeader">Stocks</div>
                                                                            {searchData["st_results"].map((desc, index) => (
                                                                                    <button className="large-homePageSearchResultsInnerDescContainer" 
                                                                                            key={`fs-stock-search-rslt-${index}`}
                                                                                            onClick={(desc.alphaVantageName.length < desc.polygonIoName.length) && desc.alphaVantageName !== "" ?
                                                                                                () => finulabSearchNavigator("account", desc.alphaVantageName, desc.profileImage, false, `/stocks/S:-${desc.symbol}`) :
                                                                                                () => finulabSearchNavigator("account", desc.polygonIoName, desc.profileImage, false, `/stocks/S:-${desc.symbol}`)
                                                                                            }
                                                                                        >
                                                                                        <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                                            <img src={desc.profileImage} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                                            <div className="large-homePageSearchResultsTickerText">
                                                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.symbol}</span>
                                                                                            </div>
                                                                                            <div className="large-homePageSearchResultsNameText">
                                                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">
                                                                                                    {(desc.alphaVantageName.length < desc.polygonIoName.length) && desc.alphaVantageName !== "" ?
                                                                                                        `${desc.alphaVantageName}` : `${desc.polygonIoName}`
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </button>
                                                                                ))
                                                                            }
                                                                        </>
                                                                    }
                                                                    {searchData["cr_results"].length === 0 ?
                                                                        null : 
                                                                        <>
                                                                            <div className="large-homePageSearchResultsSectionHeader">Cryptos</div>
                                                                            {searchData["cr_results"].map((desc, index) => (
                                                                                    <button className="large-homePageSearchResultsInnerDescContainer" 
                                                                                            key={`fs-crypto-search-rslt-${index}`}
                                                                                            onClick={() => finulabSearchNavigator("account", desc.name, desc.profileImage, false, `/cryptos/C:-${desc.symbol}`)}
                                                                                        >
                                                                                        <div className="large-homePageSearchResultsInnerDescInsideContainer">
                                                                                            <img src={desc.profileImage} alt="" className="large-homePageMainNavigationAccountImg" />
                                                                                            <div className="large-homePageSearchResultsTickerText">
                                                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.symbol}</span>
                                                                                            </div>
                                                                                            <div className="large-homePageSearchResultsNameText">
                                                                                                <span className="large-homepageMainNavigationSrchrsultDescBlock">{desc.name}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </button>
                                                                                ))
                                                                            }
                                                                        </>
                                                                    }
                                                                </div>
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
                    </>
                }
            </div>
        </div>
    )
}