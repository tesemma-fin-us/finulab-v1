import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {AccountBalance, AccountBalanceWallet, AssuredWorkload, Cottage, PersonSharp, PostAdd, Verified} from '@mui/icons-material';
import {useRef, useState, useEffect, useLayoutEffect, useCallback} from 'react';

import Post from '../../../../components/post';
import News from '../../../../components/news/news';
import generalOpx from '../../../../functions/generalFunctions';

import {selectUser} from '../../../../reduxStore/user';
import {selectInterests} from '../../../../reduxStore/interests';
import {selectModeratorStatus} from '../../../../reduxStore/moderatorStatus';
import {updateHomePageInformationState, selectPageInformationState} from '../../../../reduxStore/pageInformation';
import {setPostEngagement, addToPostEngagement, selectPostEngagement} from '../../../../reduxStore/postEngagement';
import {setNewsEngagement, addToNewsEngagement, selectNewsEngagement} from '../../../../reduxStore/newsEngagement';
import {updateHomePageData, updateHomePageFollowingData, setFollowingDesc, updateSelection, selectHomePageData} from '../../../../reduxStore/homePageData';
import { throttle } from 'lodash';

export default function InnerHomePage(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const u_interests = useSelector(selectInterests);
    const homePageData = useSelector(selectHomePageData);
    const u_postEngagement = useSelector(selectPostEngagement);
    const u_newsEngagement = useSelector(selectNewsEngagement);
    const u_moderatorStatus = useSelector(selectModeratorStatus);

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
    const appState = useSelector(selectPageInformationState);
    useEffect(() => {
        if(props.f_viewPort === "small") {
            if(contentBodyWidth[1]) {
                const handleScrollHomePage = (e) => {
                    if(props.displayView === "" || props.displayView === "following") {
                        let profilePageInformation = {...appState["home"]};

                        if(profilePageInformation["view"] === props.displayView) {
                            if(props.displayView === "") {
                                profilePageInformation["scrollTop"] = document.documentElement.scrollTop;
                            } else if(props.displayView === "following") {
                                profilePageInformation["followingScrollTop"] = document.documentElement.scrollTop;
                            }

                            dispatch(
                                updateHomePageInformationState(profilePageInformation)
                            );
                        } else {
                            profilePageInformation["view"] = props.displayView;
                            dispatch(
                                updateHomePageInformationState(profilePageInformation)
                            );
                        }
                    }
                }
                
                const throttledHandleScrollHomePage = throttle(handleScrollHomePage, 50);
                document.addEventListener('scroll', throttledHandleScrollHomePage, { passive: true });
                document.addEventListener('touchmove', handleScrollHomePage, { passive: true });

                return () => {
                    document.removeEventListener('scroll', throttledHandleScrollHomePage);
                    document.removeEventListener('touchmove', handleScrollHomePage);
                };
            }
        }
    }, [contentBodyWidth, props.displayView, appState["home"]["view"]]);

    useEffect(() => {
        if(!(props.f_viewPort === "small")) {
            if(contentBodyWidth[1]) {
                const handleScrollHomePage = (e) => {
                    if(props.displayView === "" || props.displayView === "following") {
                        let profilePageInformation = {...appState["home"]};

                        if(profilePageInformation["view"] === props.displayView) {
                            if(props.displayView === "") {
                                profilePageInformation["scrollTop"] = scrollController.current.scrollTop;
                            } else if(props.displayView === "following") {
                                profilePageInformation["followingScrollTop"] = scrollController.current.scrollTop;
                            }

                            dispatch(
                                updateHomePageInformationState(profilePageInformation)
                            );
                        } else {
                            profilePageInformation["view"] = props.displayView;
                            dispatch(
                                updateHomePageInformationState(profilePageInformation)
                            );
                        }
                    }
                }
                
                const scrollElement = scrollController.current;
                const throttledHandleScrollSearchPage = throttle(handleScrollHomePage, 50);
                scrollElement.addEventListener('scroll', throttledHandleScrollSearchPage, {passive: true});
        
                return () => {
                    if(scrollElement) {
                        scrollElement.removeEventListener('scroll', throttledHandleScrollSearchPage);
                    }
                };
            }
        }
    }, [contentBodyWidth, props.displayView, appState["home"]["view"]]);

    const getRandomElements = (array, numElements) => {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numElements);
    }

    const interestAssesser = (interests) => {
        if(interests.length === 0) return {"interests": [], "confidenceLevel": 0};
        if(interests.length <= 3) return {"interests": [...interests.map(i_desc => i_desc[0])], "confidenceLevel": 0};

        let critical = interests.sort((a, b) => b[1] - a[1]);
        let criticalSubjects = critical.slice(0, 20);
        if(criticalSubjects.length === interests.length) {
            return {"interests": [...criticalSubjects.map(i_desc => i_desc[0])], "confidenceLevel": 0};
        } else {
            let selectPlus = [];
            critical.length - 20 > 10 ? selectPlus = getRandomElements([...critical.slice(20, critical.length)], 10) : selectPlus = [...critical.slice(20, critical.length)];
            const utilizedSubjects = [
                ...criticalSubjects.map(i_desc => i_desc[0]),
                ...selectPlus.map(i_desc => i_desc[0]),
            ];

            if(interests.length >= 50) {
                return {
                    "interests": utilizedSubjects, 
                    "confidenceLevel": 0
                };
            } else {
                const sumOfAll = interests.reduce((accumulator, currentValue) => {return accumulator + currentValue[1];}, 0);
                const sumofSelected = utilizedSubjects.reduce((accumulator, currentValue) => {return accumulator + currentValue[1];}, 0);

                return {
                    "interests": utilizedSubjects, 
                    "confidenceLevel": isNaN((sumofSelected / sumOfAll) * 100) || !isFinite((sumofSelected / sumOfAll) * 100) ? 0 : ((sumofSelected / sumOfAll) * 100)
                };
            }
        }
    }

    const pullSpecificNews = async () => {
        await generalOpx.axiosInstance.put(`/content/news/specific-news`, 
            {
                "type": `${props.newsId}`.slice(0, 1) === "S" ? "stock" : "crypto", 
                "newsId": `${props.newsId}`.slice(3, `${props.newsId}`.length)
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    if(user && response.data["data"].length > 0) {
                        if(u_newsEngagement.length === 0) {
                            const newsIds = [`${props.newsId}`];
                            const newsEngagements = await generalOpx.axiosInstance.put(`/content/news/news-engagements`, {"newsIds": newsIds});

                            if(newsEngagements.data["status"] === "success" && newsEngagements.data["data"].length > 0) {
                                dispatch(
                                    setNewsEngagement(newsEngagements.data["data"])
                                );
                            }
                        } else {
                            const newsIdsToEliminate = [...u_newsEngagement.map(n_data => n_data.newsId)];
                            const newsIdsInterlude = [`${props.newsId}`];
                            const newsIds = [...newsIdsInterlude.filter(n_id => !newsIdsToEliminate.includes(n_id))];

                            if(newsIds.length > 0) {
                                const newsEngagements = await generalOpx.axiosInstance.put(`/content/news/news-engagements`, {"newsIds": newsIds});
                                if(newsEngagements.data["status"] === "success" && newsEngagements.data["data"].length > 0) {
                                    dispatch(
                                        addToNewsEngagement(newsEngagements.data["data"])
                                    );
                                }
                            }
                        }
                    }

                    dispatch(
                        updateSelection(
                            {
                                "type": "News",
                                "selectedDesc": {
                                    "desc": response.data["data"]
                                }
                            }
                        )
                    );
                }
            }
        );
    }

    const pullSpecificPost = async () => {
        if(homePageData["pageData"]["data"].some(doc => doc._id === props.postId)) {
            dispatch(
                updateSelection(
                    {
                        "type": "Post",
                        "selectedDesc": {
                            "desc": homePageData["pageData"]["data"].filter(doc => doc._id === props.postId)[0]
                        }
                    }
                )
            );
        } else {
            await generalOpx.axiosInstance.put(`/content/posts/specific-post`, 
                {
                    "postId": props.postId
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        dispatch(
                            updateSelection(
                                {
                                    "type": "Post",
                                    "selectedDesc": {
                                        "desc": response.data["data"]
                                    }
                                }
                            )
                        );

                        if(user && Object.keys(response.data["data"]).length > 0) {
                            if(u_postEngagement.length === 0) {
                                const postIds = [props.postId];
                                const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});

                                if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                    dispatch(
                                        setPostEngagement(postEngagements.data["data"])
                                    );
                                }
                            } else {
                                const postIdsToEliminate = [...u_postEngagement.map(p_data => p_data.postId)];
                                const postIds = [...[props.postId].filter(({_id}) => !postIdsToEliminate.includes(_id)).map(({_id}) => _id)];

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
                    }
                }
            );
        }
    }

    const [homePageFollowingPostsBeingUpdated, setHomePageFollowingPostsBeingUpdated] = useState(false);
    const pullFollowingPosts = async (type, p_ninclude) => {
        if(homePageData["followingDesc"]["dataLoading"]) {
            const followingDesc = await generalOpx.axiosInstance.put(`/users/following`, {"username": user.user});
            if(followingDesc.data["status"] === "success") {
                dispatch(
                    setFollowingDesc(
                        {
                            "data": followingDesc.data["data"],
                            "dataLoading": false
                        }
                    )
                );

                if(followingDesc.data["data"].length === 0) {
                    dispatch(
                        updateHomePageFollowingData(
                            {
                                "data": [],
                                "dataLoading": false
                            }
                        )
                    );
                } else {
                    await generalOpx.axiosInstance.put(`/content/posts/following`,
                        {
                            type: type,
                            following: followingDesc.data["data"],
                            idsToExclude: p_ninclude
                        }
                    ).then(
                        async (response) => {
                            if(response.data["status"] === "success") {
                                let currentData = {...homePageData["followingData"]};
            
                                if(type === "primary") {
                                    currentData = {
                                        "data": response.data["data"],
                                        "dataLoading": false
                                    }
            
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
                                } else {
                                    currentData["data"] = [...currentData["data"]].concat(response.data["data"]);
            
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
                                }
            
                                dispatch(
                                    updateHomePageFollowingData(currentData)
                                );
                            }
                        }
                    );
                }
            } else {
                dispatch(
                    updateHomePageFollowingData(
                        {
                            "data": [],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else {
            await generalOpx.axiosInstance.put(`/content/posts/following`,
                {
                    type: type,
                    following: homePageData["followingDesc"]["data"],
                    idsToExclude: p_ninclude
                }
            ).then(
                async (response) => {
                    if(response.data["status"] === "success") {
                        let currentData = {...homePageData["followingData"]};
    
                        if(type === "primary") {
                            currentData = {
                                "data": response.data["data"],
                                "dataLoading": false
                            }
    
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
                        } else {
                            currentData["data"] = [...currentData["data"]].concat(response.data["data"]);
    
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
                        }
    
                        dispatch(
                            updateHomePageFollowingData(currentData)
                        );
                    }
                }
            );
        }

        setHomePageFollowingPostsBeingUpdated(false);
    }

    const [homePagePostsBeingUpdated, setHomePagePostsBeingUpdated] = useState(false);
    const pullPosts = async (type, p_ninclude) => {
        const reqInterests = interestAssesser([...u_interests]);
        await generalOpx.axiosInstance.put(`/content/posts/for-you`,
            {
                "type": type,
                "interests": reqInterests["interests"],
                "idsToExclude": p_ninclude,
                "confidenceLevel": reqInterests["confidenceLevel"]
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    let currentData = {...homePageData["pageData"]};

                    if(type === "primary") {
                        currentData = {
                            "data": response.data["data"],
                            "dataLoading": false
                        }

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
                    } else {
                        currentData["data"] = [...currentData["data"]].concat(response.data["data"]);

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
                    }

                    dispatch(
                        updateHomePageData(currentData)
                    );
                    setHomePagePostsBeingUpdated(false);
                }
            }
        );
    }

    const postsObserverRef = useRef();
    const lastPostElementRef = useCallback(node => 
        {
            if(homePageData["pageData"]["dataLoading"]) return;
            if(homePagePostsBeingUpdated) return;
            if(postsObserverRef.current) postsObserverRef.current.disconnect();
            postsObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting) {
                        setHomePagePostsBeingUpdated(true);

                        let p_ninclude = [];
                        for(let i = 0; i < homePageData["pageData"]["data"].length; i++) {
                            p_ninclude.push(homePageData["pageData"]["data"][i]["_id"]);
                        }
                        pullPosts("secondary", p_ninclude);
                    }
                }
            );
            if(node) postsObserverRef.current.observe(node);
        }, [homePageData, homePagePostsBeingUpdated]
    );

    const followingPostsObserverRef = useRef();
    const lastFollowingPostElementRef = useCallback(node => 
        {
            if(homePageData["followingData"]["dataLoading"]) return;
            if(homePageFollowingPostsBeingUpdated) return;
            if(followingPostsObserverRef.current) followingPostsObserverRef.current.disconnect();
            followingPostsObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting) {
                        setHomePageFollowingPostsBeingUpdated(true);

                        let p_ninclude = [];
                        for(let i = 0; i < homePageData["followingData"]["data"].length; i++) {
                            p_ninclude.push(homePageData["followingData"]["data"][i]["_id"]);
                        }
                        pullFollowingPosts("secondary", p_ninclude);
                    }
                }
            );
            if(node) followingPostsObserverRef.current.observe(node);
        }
    );

    
    useEffect(() => {
        if(props.displayView === "") {
            if(Object.keys(homePageData["pageData"]["data"]).length === 0) {
                pullPosts("primary", []);

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
                            document.documentElement.scrollTop = appState["home"]["scrollTop"];
                        } else {
                            scrollController.current.scrollTop = appState["home"]["scrollTop"];
                        }
                    }
                }, 0);
            }
        } else if(props.displayView === "following") {
            if(Object.keys(homePageData["followingData"]["data"]).length === 0) {
                pullFollowingPosts("primary", []);

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
                            document.documentElement.scrollTop = appState["home"]["followingScrollTop"];
                        } else {
                            scrollController.current.scrollTop = appState["home"]["followingScrollTop"];
                        }
                    }
                }, 0);
            }
        } else if(props.displayView === "Post") {
            if(!(props.postId === null || props.postId === undefined || props.postId === "")) {
                if(homePageData["selected"]["type"] !== "Post" || homePageData["selected"]["selectedDesc"]["desc"]["_id"] !== props.postId) {
                    pullSpecificPost();
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
            }
        } else if(props.displayView === "News") {
            if(!(props.newsId === null || props.newsId === undefined || props.newsId === "")) {
                if(homePageData["selected"]["type"] !== "News" || homePageData["selected"]["selectedDesc"]["desc"]["_id"] !== `${props.newsId}`.slice(3, `${props.newsId}`.length)) {
                    pullSpecificNews();
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
            }
        }
    }, [props.displayView, props.postId, props.newsId]);

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
                <div className="large-homePageContentBodyMargin"
                    style={props.f_viewPort === "small" 
                        && props.postId === "" && props.newsId === "" ?
                        {
                            "height": "101px", "minHeight": "101px", "maxHeight": "101px"
                        } : {}
                    }
                />
                <>
                    {props.displayView === "" ?
                        <>
                            {homePageData["pageData"]["dataLoading"] ?
                                <>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                    <div className="large-homePagePostContainer">
                                        <Post loading={true}/>
                                    </div>
                                </> : 
                                <>
                                    {homePageData["pageData"]["data"].map((post_desc, index) => (
                                            <div className="large-homePagePostContainer" key={`${post_desc._id}`}
                                                    ref={index === (homePageData["pageData"]["data"].length - 2) ? lastPostElementRef : null}
                                                    style={index === (homePageData["pageData"]["data"].length - 1) ? 
                                                        {} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                    }
                                                >
                                                <div className="large-stocksPostInnerContainer"
                                                        key={`home-fyp-post-${post_desc["_id"]}`}
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
                                                    loading={false} 
                                                    borderBottom={index === (homePageData["pageData"]["data"].length - 1)}
                                                />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </>
                            }
                            {/*contentBodyWidth[1] === true ?
                                <div className="large-homePageContentCreateWrapper" 
                                        style={homePageData["position"]["visible"] ? 
                                            {"marginLeft": `${contentBodyWidth[0] - 110}px`, "backgroundColor": "rgba(0, 110, 230, 0.85)"} :
                                            {"marginLeft": `${contentBodyWidth[0] - 110}px`, "backgroundColor": "rgba(0, 110, 230, 0.05)"}
                                        }
                                    >
                                    <button className="large-homePageContentCreateSection"
                                            onClick={() => navigate("/create-post")}
                                        >
                                        <PostAdd className="large-homePageContentCreateSectionIcon"/>
                                        <span className="large-homePageContentCreateSectionDesc">Post</span>
                                    </button>
                                    <div className="large-homePageContentCreateSectionDivider"/>
                                    <button className="large-homePageContentCreateSection">
                                        <AssuredWorkload className="large-homePageContentCreateSectionIcon"/>
                                        <span className="large-homePageContentCreateSectionDesc">Pair</span>
                                    </button>
                                </div> : null
                            */}
                        </> :
                        <>
                            {props.displayView === "following" ? 
                                <>
                                    {homePageData["followingData"]["dataLoading"] ?
                                        <>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                            <div className="large-homePagePostContainer">
                                                <Post loading={true}/>
                                            </div>
                                        </> : 
                                        <>
                                            {homePageData["followingData"]["data"].length === 0 ?
                                                <div className="large-homePageProfileNoDataContainer"
                                                        style={{
                                                            "minHeight": `calc(100vh - 51px)`
                                                        }}
                                                    >
                                                    <img src="/assets/Finulab_Icon.png" alt="" className="large-marketPageNoDateNoticeImg" />
                                                    <div className="large-marketPageNoDataONotice">
                                                        You haven't followed anyone yet.
                                                    </div>
                                                    <div className="large-marketPageNoDataTNotice">
                                                        Start following folks to fill up your feed.
                                                    </div>
                                                </div> : 
                                                <>
                                                    {homePageData["followingData"]["data"].map((post_desc, index) => (
                                                            <div className="large-homePagePostContainer" key={`following-${post_desc._id}`}
                                                                    ref={index === (homePageData["followingData"]["data"].length - 2) ? lastFollowingPostElementRef : null}
                                                                    style={index === (homePageData["followingData"]["data"].length - 1) ? 
                                                                        {} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                                    }
                                                                >
                                                                <div className="large-stocksPostInnerContainer"
                                                                        key={`home-following-post-${post_desc["_id"]}`}
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
                                                                    loading={false} 
                                                                    borderBottom={index === (homePageData["followingData"]["data"].length - 1)}
                                                                />
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            }
                                        </>
                                    }
                                </> : 
                                <>
                                    {homePageData["selected"]["type"] === "Post" ?
                                        <>
                                            {Object.keys(homePageData["selected"]["selectedDesc"]["desc"]).includes("_id") ?
                                                <>
                                                    {props.postId === homePageData["selected"]["selectedDesc"]["desc"]["_id"] ?
                                                        <div className="large-homePagePostContainer" key={'home-page-post-full'}
                                                                style={props.f_viewPort === "small" ? 
                                                                    {"minHeight": "100%"} :
                                                                    {"position": "absolute", "top": "51px", "minHeight": "100%"}
                                                                }
                                                            >
                                                            <Post 
                                                                view={"max"}
                                                                type={"home"}
                                                                width={contentBodyWidth[0]}
                                                                v_display={props.v_display}
                                                                user={user ? user.user : "visitor"}
                                                                details={homePageData["selected"]["selectedDesc"]["desc"]} 
                                                                loading={false} 
                                                            />
                                                        </div> : null
                                                    }
                                                </> : null
                                            }
                                        </> : 
                                        <>
                                            {homePageData["selected"]["type"] === "News" ?
                                                <>
                                                    {Object.keys(homePageData["selected"]["selectedDesc"]["desc"]).includes("_id") ?
                                                        <>
                                                            {`${props.newsId}`.slice(3, `${props.newsId}`.length) === homePageData["selected"]["selectedDesc"]["desc"]["_id"] ?
                                                                <div className="large-homePagePostContainer" key={'home-page-news-full'}
                                                                        style={props.f_viewPort === "small" ? 
                                                                            {"minHeight": "100%"} :
                                                                            {"position": "absolute", "top": "51px", "minHeight": "100%"}
                                                                        }
                                                                    >
                                                                    <News 
                                                                        type={"home"}
                                                                        width={contentBodyWidth[0]}
                                                                        v_display={props.v_display}
                                                                        pred_ticker={`${props.newsId}`.slice(0, 1)}
                                                                        user={user ? user.user : "visitor"}
                                                                        desc={homePageData["selected"]["selectedDesc"]["desc"]}
                                                                    />
                                                                </div> : null
                                                            }
                                                        </> : null
                                                    }
                                                </> : null
                                            }
                                        </>
                                    }
                                </>
                            }
                        </>
                    }
                </>
            </div>
        </div>
    )
}