import {useSelector, useDispatch} from "react-redux";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

import generalOpx from "../../../../functions/generalFunctions";
import ShortVideo from "../../../../components/shortVideo/shortVideo";

import {selectUser} from "../../../../reduxStore/user";
import {selectInterests} from '../../../../reduxStore/interests';
import {setPostEngagement, addToPostEngagement, selectPostEngagement} from '../../../../reduxStore/postEngagement';
import {setShortStart, setReturnTo, setShortIndex, setShortData, setNavigateShortUp, setNavigateShortDown, selectShortsData} from "../../../../reduxStore/shortsData";

export default function FinulabShort(props) {
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const u_interests = useSelector(selectInterests);
    const shortsData = useSelector(selectShortsData);
    const u_postEngagement = useSelector(selectPostEngagement);

    const shortContainerRef = useRef();
    const [shortContainerHeight, setShortContainerHeight] = useState([0, false]);
    useLayoutEffect(() => {
        const contentBodyHeightFunction = () => {
            if(shortContainerRef.current) {
                const bodyHeight = shortContainerRef.current.getBoundingClientRect().height;
                setShortContainerHeight([bodyHeight - 40, true]);
            }
        }

        window.addEventListener('resize', contentBodyHeightFunction);
        contentBodyHeightFunction();
        return () => window.removeEventListener('resize', contentBodyHeightFunction);
    }, []);
    
    const getRandomElements = (array, numElements) => {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numElements);
    }

    const interestAssesser = (interests) => {
        if(interests.length === 0) return {"interests": [], "confidenceLevel": 0};
        if(interests.length <= 3) return {"interests": [...interests.map(i_desc => i_desc[0])], "confidenceLevel": 0};

        let critical = interests.sort((a, b) => b[1] - a[1]), criticalSubjects = critical.slice(0, 20);
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

    const [shortsReady, setShortsReady] = useState(false);
    const pullStart = async () => {
        const postId = props.shortId;
        await generalOpx.axiosInstance.put(`/content/posts/specific-post`, 
            {
                "postId": postId
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    dispatch(
                        setShortStart(
                            {...response.data["data"]}
                        )
                    );
                    dispatch(
                        setReturnTo("/")
                    );

                    if(user && Object.keys(response.data["data"]).length > 0) {
                        if(u_postEngagement.length === 0) {
                            const postIds = [postId];
                            const postEngagements = await generalOpx.axiosInstance.put(`/content/posts/post-engagements`, {"postIds": postIds});

                            if(postEngagements.data["status"] === "success" && postEngagements.data["data"].length > 0) {
                                dispatch(
                                    setPostEngagement(postEngagements.data["data"])
                                );
                            }
                        } else {
                            const postIdsToEliminate = [...u_postEngagement.map(p_data => p_data.postId)];
                            const postIds = [...[postId].filter(({_id}) => !postIdsToEliminate.includes(_id)).map(({_id}) => _id)];

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

                    setShortsReady(true);
                }
            }
        );
    }

    const [shortsDataBeingUpdated, setShortsDataBeingUpdated] = useState(false);
    const pullShortsData = async (type, p_ninclude) => {
        const reqInterests = interestAssesser(u_interests);
        await generalOpx.axiosInstance.put(`/content/posts/shorts`,
            {
                "type": type,
                "interests": reqInterests["interests"],
                "idsToExclude": p_ninclude,
                "confidenceLevel": reqInterests["confidenceLevel"]
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    let currentData = {};

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
                        currentData = {
                            "data": [...shortsData["shorts"]["data"]].concat(response.data["data"]),
                            "dataLoading": false
                        }

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
                        setShortData(currentData)
                    );
                    if(response.data["data"].length > 0) {setShortsDataBeingUpdated(false);}
                    /*
                    if(props.f_viewPort === "small" 
                        && response.data["data"].length > 0 && p_ninclude.length === 1 && p_ninclude[0] === shortsData["start"]["_id"]
                    ) {
                        setTimeout(() => {document.documentElement.scrollTop = 0;}, 1000);
                    }
                    */
                }
            }
        );
    }

    const shortObserverRef = useRef();
    const lastShortElementRef = useCallback(node => 
        {
            if(shortsDataBeingUpdated) return;
            if(shortsData["shorts"]["dataLoading"]) return;
            if(shortObserverRef.current) shortObserverRef.current.disconnect();
            shortObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting) {
                        setShortsDataBeingUpdated(true);

                        let p_ninclude = [];
                        for(let i = 0; i < shortsData["shorts"]["data"].length; i++) {
                            p_ninclude.push(shortsData["shorts"]["data"][i]["_id"]);
                        }
                        pullShortsData("secondary", p_ninclude);
                    }
                }
            );
            if(node) shortObserverRef.current.observe(node);
        }, [shortsData, shortsDataBeingUpdated]
    );

    useEffect(() => {
        if(props.f_viewPort === "small") {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            if(scrollController.current) {
                scrollController.current.scrollTop = 0;
            }
        }

        if(Object.keys(shortsData["start"]).length === 0) {
            pullStart();
        } else {
            setShortsReady(true);
        }
    }, []);

    useEffect(() => {
        if(props.f_viewPort === "small") {
            if(scrollController.current) {
                scrollController.current.scrollTop = 0;
            }
            
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            //document.documentElement.style.scrollSnapType = 'y mandatory';
        }

        if(shortsData["callSecondaryShorts"]) {
            if(shortsData["shorts"]["dataLoading"]) {
                pullShortsData("secondary", [props.shortId]);
            } else {
                dispatch(
                    setShortData(
                        { 
                            "data": [],
                            "dataLoading": true
                        }
                    )
                );

                pullShortsData("secondary", [props.shortId]);
            }
        }
    }, [shortsData["callSecondaryShorts"]]);

    useEffect(() => {
        if(!shortsData["shorts"]["dataLoading"]
            && shortsData["shorts"]["data"].length > 0
        ) {
            setTimeout(() => {
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';

                document.documentElement.style.scrollSnapType = 'y mandatory';

                window.scrollTo(0, 0);
                document.body.style.overflow = 'visible';
                document.documentElement.style.overflow = 'visible';
            }, 1000);
        }
    }, [shortsData["shorts"]["dataLoading"]]);

    const scrollController = useRef();
    useEffect(() => {
        if(shortsData["navigateShortUp"]
            && scrollController.current
        ) {
            const currentScrollTop = scrollController.current.scrollTop;

            if(currentScrollTop <= shortContainerHeight[0]) {
                dispatch(
                    setNavigateShortUp(false)
                );
            } else {
                scrollController.current.scrollTop = currentScrollTop - shortContainerHeight[0];
                dispatch(
                    setNavigateShortUp(false)
                );
            }
        }
    }, [shortsData["navigateShortUp"]]);

    useEffect(() => {
        if(shortsData["navigateShortDown"]
            && scrollController.current
        ) {
            const currentScrollTop = scrollController.current.scrollTop;
            scrollController.current.scrollTop = currentScrollTop + shortContainerHeight[0];
            dispatch(
                setNavigateShortDown(false)
            );
        }
    }, [shortsData["navigateShortDown"]])

    return(
        <div
                ref={scrollController}
                className={props.f_viewPort === "small" ? "small-homePageContentBodyWrapper" : "large-homePageContentBodyWrapper"}
                style={props.f_viewPort === "small" ? 
                    { 
                        "position": "absolute",
                        "top": "0px",
                        "zIndex": "9999999",
                        "width": "100vw", "minWidth": "100vw", "maxWidth": "100vw",
                        "backgroundColor": "rgba(0, 0, 0, 1)"
                    } : {
                        "overflowX": "visible",
                        "scrollSnapType": "y mandatory",
                        "backgroundColor": "rgba(0, 0, 0, 0)"
                    }
                }
            >
            <div className={props.f_viewPort === "small" ? "finulab-smallShortWrapper" : "finulab-shortWrapper"}
                    ref={shortContainerRef}
                >
                {props.f_viewPort === "small" ? 
                    <>
                        {!shortsReady || !shortContainerHeight[1] || Object.keys(shortsData["start"]).length === 0 ?
                            <div className={props.f_viewPort === "small" ? "finulab-smallShortContainer" : "finulab-shortContainer"}>
                                <div className={props.f_viewPort === "small" ? "finulab-smallShortVideoLoading" : "finulab-shortVideoLoading"}
                                        style={{
                                            "width": `100vw`, "minWidth": `100vw`, "maxWidth": `100vw`
                                        }}
                                    >
                                    <div className="recommendation-GraphPieContainer">
                                        <div className="finulab-chartLoading">
                                            <div className="finulab-chartLoadingSpinner"/>
                                            <img src="/assets/Finulab_Icon.png" alt="" className="finulab-chartLoadingImg" />
                                        </div>
                                    </div> 
                                </div>
                            </div> : 
                            <ShortVideo f_viewPort={props.f_viewPort} containerHeight={shortContainerHeight[0]} selection={shortsData["start"]} index={0} />
                        }
                    </> : 
                    <>
                        {!shortsReady || Object.keys(shortsData["start"]).length === 0 ?
                            <>
                                {shortContainerHeight[1] ? 
                                    <div className={props.f_viewPort === "small" ? "finulab-smallShortContainer" : "finulab-shortContainer"}>
                                        <div className={props.f_viewPort === "small" ? "finulab-smallShortVideoLoading" : "finulab-shortVideoLoading"}
                                                style={{
                                                    "width": `${shortContainerHeight[0] * (440 / 809)}px`, "minWidth": `${shortContainerHeight[0] * (500 / 890)}px`, "maxWidth": `${shortContainerHeight[0] * (500 / 890)}px`
                                                }}
                                            >
                                            <div className="recommendation-GraphPieContainer">
                                                <div className="finulab-chartLoading">
                                                    <div className="finulab-chartLoadingSpinner"/>
                                                    <img src="/assets/Finulab_Icon.png" alt="" className="finulab-chartLoadingImg" />
                                                </div>
                                            </div> 
                                        </div>
                                    </div> : null
                                }
                            </> : 
                            <>
                                {shortContainerHeight[1] ? 
                                    <ShortVideo f_viewPort={props.f_viewPort} containerHeight={shortContainerHeight[0]} selection={shortsData["start"]} index={0} /> : null
                                }
                            </>
                        }
                    </>
                }
            </div>
            {Object.keys(shortsData["start"]).length === 0 
                && (shortsData["shorts"]["dataLoading"] || shortsData["shorts"]["data"].length === 0) ?
                null : 
                <>
                    {shortContainerHeight[1] ? 
                        <>
                            {shortsData["shorts"]["data"].map((post_desc, index) => (
                                    <div className={props.f_viewPort === "small" ? "finulab-smallShortWrapper" : "finulab-shortWrapper"}
                                            ref={shortsData["shorts"]["data"].length - 1 === index ? lastShortElementRef : null}
                                            key={`finulab-short-vid-${index}-${post_desc._id}`}
                                        >
                                        <ShortVideo f_viewPort={props.f_viewPort} containerHeight={shortContainerHeight[0]} selection={post_desc} index={index + 1} />
                                    </div>
                                ))
                            }
                        </> : null
                    }
                </>
            }
        </div>
    )
}