import './app-layout.css';

import {useDispatch, useSelector} from 'react-redux';
import {ArrowForwardIos, KeyboardBackspace} from '@mui/icons-material';
import {useParams, useNavigate, Navigate} from 'react-router-dom';
import {useRef, useState, useMemo, useEffect, useLayoutEffect} from 'react';

import TopBar from './largeView/topBar';
import Login from '../pages/login/login';
import LargeHomePage from '../pages/home/largeView/home';
import LargeStocksPage from '../pages/stocks/largeView/innerPages/stocks';
import FinulabGetVerified from '../components/sendVerification/sendVerification';
import StockMarketDashboard from '../pages/stocks/largeView/innerPages/dashboard';

import Post from '../components/post';
import Logout from '../pages/login/logout';
import FinuxSend from '../components/send/send';
import Receive from '../components/receive/receive';
import MainLogin from '../pages/main-login/mainLogin';
import generalOpx from '../functions/generalFunctions';
import SmallHomePage from '../pages/home/smallView/home';
import MediumHomePage from '../pages/home/mediumView/home';
import FinulabShort from '../pages/home/largeView/innerPages/short';

import {selectUser} from '../reduxStore/user';
import {selectFinuxTxBeingSent} from '../reduxStore/finuxTxBeingSent';
import {updateAppViewState, selectAppViewState} from '../reduxStore/appView';
import {clearViewMedia, updateViewMediaIndex, selectViewMedia} from '../reduxStore/viewMedia';
import {setNavigateShortUp, setNavigateShortDown, resetShortsData, selectShortsData} from '../reduxStore/shortsData';

export default function AppLayout(props) {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const user = useSelector(selectUser);
    const media = useSelector(selectViewMedia);
    const shortData = useSelector(selectShortsData);
    const appView = useSelector(selectAppViewState);
    const finuxTxBeingSent = useSelector(selectFinuxTxBeingSent);

    useEffect(() => {
        if(props.page === "login" || props.page === "logout" 
            || props.page === "receive" || props.page === "send" || props.page === "get-verified" || props.page === "short"
        ) {
            if(appView["page"] === "") {
                dispatch(
                    updateAppViewState({"page": "home", "displayView": "", "params": {}})
                );
            }
        } else {
            if(appView["page"] !== `${props.page}` || appView["displayView"] !== `${props.displayView}`|| Object.keys(appView["params"]).length !== Object.keys(params).length) {
                dispatch(
                    updateAppViewState({"page": `${props.page}`, "displayView": `${props.displayView}`, "params": params})
                );
            } else {
                if(Object.keys(params).length > 0) {
                    if(Object.keys(params)[0] !== Object.keys(appView["params"])[0]) {
                        dispatch(
                            updateAppViewState({"page": `${props.page}`, "displayView": `${props.displayView}`, "params": params})
                        );
                    }
                }
            }
        }
    }, [props.page, params]);
    
    const overlayRef = useRef();
    const overlayContainerRef = useRef();
    useEffect(() => {
        if(overlayContainerRef.current && overlayRef.current) {
            const handleClickOutside = (event) => {
                if(overlayRef) {
                    if(overlayContainerRef.current?.contains(event?.target) && !overlayRef.current?.contains(event?.target)) {
                        if(!finuxTxBeingSent["state"]) {navigate(-1);}
                    }
                }
            }
    
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            }
        }
    }, [props, finuxTxBeingSent["state"]]);

    const [width, setWidth] = useState(0.0);
    useLayoutEffect(() => {
        const screenWidth = () => {setWidth(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);}
        window.addEventListener('resize', screenWidth);
        screenWidth();
        return () => window.removeEventListener('resize', screenWidth);
    }, []);

    const toggleMediaIndex = (type) => {
        const currentIndex = media["index"];

        if(type === "forward") {
            dispatch(
                updateViewMediaIndex(currentIndex + 1)
            );
        } else if(type === "back") {
            dispatch(
                updateViewMediaIndex(currentIndex - 1)
            );
        }
    }

    const overlayBtnOneRef = useRef(), overlayBtnTwoRef = useRef(), overlayMeidaRef = useRef();
    useEffect(() => {
        if(overlayContainerRef.current && overlayMeidaRef.current) {
            const handleMediaClickOutside = (event) => {
                if(overlayMeidaRef) {
                    if(overlayBtnOneRef.current && overlayBtnTwoRef.current) {
                        if(
                            overlayContainerRef.current?.contains(event?.target) 
                            && !overlayMeidaRef.current?.contains(event?.target)
                            && !overlayBtnOneRef.current?.contains(event?.target)
                            && !overlayBtnTwoRef.current?.contains(event?.target)
                            
                        ) {
                            dispatch(
                                clearViewMedia()
                            );
                        }
                    }

                    if(overlayBtnOneRef.current && !overlayBtnTwoRef.current) {
                        if(
                            overlayContainerRef.current?.contains(event?.target) 
                            && !overlayMeidaRef.current?.contains(event?.target)
                            && !overlayBtnOneRef.current?.contains(event?.target)
                            
                        ) {
                            dispatch(
                                clearViewMedia()
                            );
                        }
                    }

                    if(!overlayBtnOneRef.current && overlayBtnTwoRef.current) {
                        if(
                            overlayContainerRef.current?.contains(event?.target) 
                            && !overlayMeidaRef.current?.contains(event?.target)
                            && !overlayBtnTwoRef.current?.contains(event?.target)
                            
                        ) {
                            dispatch(
                                clearViewMedia()
                            );
                        }
                    }

                    if(!overlayBtnOneRef.current && !overlayBtnTwoRef.current) {
                        if(overlayContainerRef.current?.contains(event?.target) && !overlayMeidaRef.current?.contains(event?.target)) {
                            dispatch(
                                clearViewMedia()
                            );
                        }
                    }
                }
            }
    
            document.addEventListener("mousedown", handleMediaClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleMediaClickOutside);
            }
        }
    }, [media, props]);

    const largeShortGoBack = () => {
        navigate(shortData["returnTo"]);

        dispatch(
            resetShortsData()
        );
    }

    const largeShortNavigateUpDown = (direction) => {
        if(direction === "up") {
            dispatch(
                setNavigateShortUp(true)
            );
        } else if(direction === "down") {
            dispatch(
                setNavigateShortDown(true)
            );
        }
    }

    return(
        <>
            {width === 0.0 || appView["page"] === "" ?
                null : 
                <>
                    {width <= 1250 ?
                        <>
                            {width < 600 ?
                                <>
                                    {props.page === "main-login" ?
                                        <>
                                            <MainLogin displayView={props.displayView} f_viewPort={"small"}/>
                                        </> : 
                                        <>
                                            {(Object.keys(params).length === 0 && Object.keys(appView["params"]).length === 0)  ||
                                                (Object.keys(appView["params"]).length === 0 && Object.keys(params).includes("shortId")) ?
                                                <SmallHomePage page={appView["page"]} displayView={appView["displayView"]}
                                                    shortId={""} searchId={""} postId={""} newsId={""} marketType={""} predictionId={""} ticker={""} marketId={""} selection={""} userId={""}
                                                /> :
                                                <>
                                                    {Object.keys(params).includes("searchId") || Object.keys(appView["params"]).includes("searchId") ?
                                                        <SmallHomePage 
                                                            page={appView["page"]} 
                                                            displayView={appView["displayView"]}
                                                            searchId={Object.keys(params).length === 0 ? appView["params"]["searchId"] : params.searchId}
                                                            shortId={""}
                                                            postId={""}
                                                            newsId={""}
                                                            marketType={""}
                                                            predictionId={""}
                                                            ticker={""}
                                                            marketId={""}
                                                            selection={""}
                                                            userId={""}
                                                        /> : 
                                                        <>
                                                            {Object.keys(params).includes("newsId") || Object.keys(appView["params"]).includes("newsId") ?
                                                                <SmallHomePage 
                                                                    page={appView["page"]} 
                                                                    displayView={appView["displayView"]}
                                                                    searchId={""}
                                                                    shortId={""}
                                                                    postId={""}
                                                                    newsId={Object.keys(params).length === 0 ? appView["params"]["newsId"] : params.newsId}
                                                                    marketType={""}
                                                                    predictionId={""}
                                                                    ticker={""}
                                                                    marketId={""}
                                                                    selection={""}
                                                                    userId={""}
                                                                /> : 
                                                                <>
                                                                    {Object.keys(params).includes("postId") || Object.keys(appView["params"]).includes("postId") ?
                                                                        <SmallHomePage 
                                                                            page={appView["page"]} 
                                                                            displayView={appView["displayView"]}
                                                                            searchId={""}
                                                                            shortId={""}
                                                                            postId={Object.keys(params).length === 0 ? appView["params"]["postId"] : params.postId}
                                                                            newsId={""}
                                                                            marketType={""}
                                                                            predictionId={""}
                                                                            ticker={""}
                                                                            marketId={""}
                                                                            selection={""}
                                                                            userId={""}
                                                                        /> : 
                                                                        <>
                                                                            {Object.keys(params).includes("marketType") || Object.keys(appView["params"]).includes("marketType") ?
                                                                                <SmallHomePage 
                                                                                    page={appView["page"]} 
                                                                                    displayView={appView["displayView"]}
                                                                                    searchId={""}
                                                                                    shortId={""}
                                                                                    postId={""}
                                                                                    newsId={""}
                                                                                    marketType={Object.keys(params).length === 0 ? appView["params"]["marketType"] : params.marketType}
                                                                                    predictionId={""}
                                                                                    ticker={""}
                                                                                    marketId={""}
                                                                                    selection={""}
                                                                                    userId={""}
                                                                                /> :
                                                                                <>
                                                                                    {Object.keys(params).includes("predictionId") || Object.keys(appView["params"]).includes("predictionId") ?
                                                                                        <SmallHomePage 
                                                                                            page={appView["page"]} 
                                                                                            displayView={appView["displayView"]}
                                                                                            searchId={""}
                                                                                            shortId={""}
                                                                                            postId={""}
                                                                                            newsId={""}
                                                                                            marketType={""}
                                                                                            predictionId={Object.keys(params).length === 0 ? appView["params"]["predictionId"] : params.predictionId}
                                                                                            ticker={""}
                                                                                            marketId={""}
                                                                                            selection={""}
                                                                                            userId={""}
                                                                                        /> : 
                                                                                        <>
                                                                                            {Object.keys(params).includes("stockTicker") || Object.keys(appView["params"]).includes("stockTicker") ?
                                                                                                <SmallHomePage 
                                                                                                    page={appView["page"]} 
                                                                                                    displayView={appView["displayView"]}
                                                                                                    searchId={""}
                                                                                                    shortId={""}
                                                                                                    postId={""}
                                                                                                    newsId={""}
                                                                                                    marketType={""}
                                                                                                    predictionId={""}
                                                                                                    ticker={Object.keys(params).length === 0 ? appView["params"]["stockTicker"] : params.stockTicker}
                                                                                                    marketId={""}
                                                                                                    selection={""}
                                                                                                    userId={""}
                                                                                                /> : 
                                                                                                <>
                                                                                                    {Object.keys(params).includes("marketId") || Object.keys(appView["params"]).includes("marketId") ?
                                                                                                        <SmallHomePage 
                                                                                                            page={appView["page"]} 
                                                                                                            displayView={appView["displayView"]}
                                                                                                            searchId={""}
                                                                                                            shortId={""}
                                                                                                            postId={""}
                                                                                                            newsId={""}
                                                                                                            marketType={""}
                                                                                                            predictionId={""}
                                                                                                            ticker={""}
                                                                                                            marketId={Object.keys(params).length === 0 ? appView["params"]["marketId"] : params.marketId}
                                                                                                            selection={Object.keys(params).length === 0 ? appView["params"]["selection"] : params.selection}
                                                                                                            userId={""}
                                                                                                        /> : 
                                                                                                        <>
                                                                                                            {Object.keys(params).includes("userId") || Object.keys(appView["params"]).includes("userId") ?
                                                                                                                <>
                                                                                                                    {Object.keys(params).includes("userId") ?
                                                                                                                        <>
                                                                                                                            {params.userId.slice(0, 3) === "f:-" ?
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "markets" || appView["displayView"] === "engaged"
                                                                                                                                        || appView["displayView"] === "watchlist" || appView["displayView"] === "communities" || appView["displayView"] === "followers" ?
                                                                                                                                        <Navigate to={`/profile/${params.userId}`} replace/> : 
                                                                                                                                        <SmallHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            postId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={Object.keys(params).length === 0 ? appView["params"]["userId"] : params.userId}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </> : 
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "engaged" || appView["displayView"] === "notifications" ?
                                                                                                                                        <>
                                                                                                                                            {user ?
                                                                                                                                                <>
                                                                                                                                                    {user.user === params.userId ?
                                                                                                                                                        <SmallHomePage 
                                                                                                                                                            page={appView["page"]} 
                                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                                            searchId={""}
                                                                                                                                                            shortId={""}
                                                                                                                                                            postId={""}
                                                                                                                                                            newsId={""}
                                                                                                                                                            marketType={""}
                                                                                                                                                            predictionId={""}
                                                                                                                                                            ticker={""}
                                                                                                                                                            marketId={""}
                                                                                                                                                            selection={""}
                                                                                                                                                            userId={Object.keys(params).length === 0 ? appView["params"]["userId"] : params.userId}
                                                                                                                                                        /> : <Navigate to={`/profile/${params.userId}`} replace/>
                                                                                                                                                    }
                                                                                                                                                </> : <Navigate to={`/profile/${params.userId}`} replace/>
                                                                                                                                            }
                                                                                                                                        </> : 
                                                                                                                                        <SmallHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            postId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={Object.keys(params).length === 0 ? appView["params"]["userId"] : params.userId}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </>
                                                                                                                            }
                                                                                                                        </> : 
                                                                                                                        <>
                                                                                                                            {appView["params"]["userId"].slice(0, 3) === "f:-" ?
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "markets" || appView["displayView"] === "engaged"
                                                                                                                                        || appView["displayView"] === "watchlist" || appView["displayView"] === "communities" || appView["displayView"] === "followers" ?
                                                                                                                                        <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/> : 
                                                                                                                                        <SmallHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            postId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={appView["params"]["userId"]}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </> : 
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "engaged" || appView["displayView"] === "notifications" ?
                                                                                                                                        <>
                                                                                                                                            {user ?
                                                                                                                                                <>
                                                                                                                                                    {user.user === appView["params"]["userId"] ?
                                                                                                                                                        <SmallHomePage 
                                                                                                                                                            page={appView["page"]} 
                                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                                            searchId={""}
                                                                                                                                                            shortId={""}
                                                                                                                                                            postId={""}
                                                                                                                                                            newsId={""}
                                                                                                                                                            marketType={""}
                                                                                                                                                            predictionId={""}
                                                                                                                                                            ticker={""}
                                                                                                                                                            marketId={""}
                                                                                                                                                            selection={""}
                                                                                                                                                            userId={appView["params"]["userId"]}
                                                                                                                                                        /> : <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/>
                                                                                                                                                    }
                                                                                                                                                </> : <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/>
                                                                                                                                            }
                                                                                                                                        </> : 
                                                                                                                                        <SmallHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            postId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={appView["params"]["userId"]}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </>
                                                                                                                            }
                                                                                                                        </>
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
                                                                            }
                                                                        </>
                                                                    }
                                                                </>
                                                            }
                                                        </>
                                                    }
                                                </>
                                            }
                                            {props.page === "login" ?
                                                <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                    <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                        <Login />
                                                    </div>
                                                </div> : 
                                                <>
                                                    {props.page === "logout" ?
                                                        <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                            <div className="app-smallViewLogoutWindow" 
                                                                    ref={overlayRef}
                                                                    style={{"height": "183px", "minHeight": "183px", "maxHeight": "183px"}}
                                                                >
                                                                <Logout/>
                                                            </div>
                                                        </div> : 
                                                        <>
                                                            {props.page === "receive" ?
                                                                <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                    <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                                        <Receive/>
                                                                    </div>
                                                                </div> :
                                                                <>
                                                                    {props.page === "send" ?
                                                                        <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                            <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                                                <FinuxSend/>
                                                                            </div>
                                                                        </div> : 
                                                                        <>
                                                                            {props.page === "get-verified" ?
                                                                                <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                                    <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                                                        <FinulabGetVerified/>
                                                                                    </div>
                                                                                </div> : 
                                                                                <>
                                                                                    {props.page === "short" ?
                                                                                        <FinulabShort 
                                                                                            f_viewPort={"small"}
                                                                                            shortId={Object.keys(params).length === 0 ? appView["params"]["shortId"] : params.shortId} 
                                                                                        /> :
                                                                                        <>
                                                                                            {media["media"].length === 0 ?
                                                                                                null : 
                                                                                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                                                                                        <div className="app-largeViewMediaSide">
                                                                                                            {media["index"] === 0 ?
                                                                                                                null :
                                                                                                                <button className="app-largeViewMediaSideToggleBtn"
                                                                                                                        ref={overlayBtnOneRef}
                                                                                                                        onClick={() => toggleMediaIndex("back")}
                                                                                                                    >
                                                                                                                    <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon"/>
                                                                                                                </button>
                                                                                                            }
                                                                                                        </div>
                                                                                                        <div className="app-largeMediaContainer">
                                                                                                            {media["media"][media["index"]][1] === "photo" ?
                                                                                                                <img 
                                                                                                                    src={media["media"][media["index"]][0]} 
                                                                                                                    alt="" 
                                                                                                                    ref={overlayMeidaRef}
                                                                                                                    className="app-largeMediaImg" 
                                                                                                                /> : 
                                                                                                                <video className="app-largeMediaImg" 
                                                                                                                        ref={overlayMeidaRef} 
                                                                                                                        autoPlay loop controls playsInline
                                                                                                                    >
                                                                                                                    <source src={`${media["media"][media["index"]][0]}#t=0.5`} type="video/mp4"/>
                                                                                                                </video>
                                                                                                            }
                                                                                                        </div>
                                                                                                        <div className="app-largeViewMediaSide">
                                                                                                            {media["index"] === media["media"].length - 1 ?
                                                                                                                null :
                                                                                                                <button className="app-largeViewMediaSideToggleBtn"
                                                                                                                        ref={overlayBtnTwoRef}
                                                                                                                        onClick={() => toggleMediaIndex("forward")}
                                                                                                                    >
                                                                                                                    <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon" style={{"rotate": "180deg"}}/>
                                                                                                                </button>
                                                                                                            }
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
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
                                                </>
                                            }
                                        </>
                                    }
                                </> : 
                                <>
                                    {props.page === "main-login" ?
                                        <>
                                            <MainLogin displayView={props.displayView} f_viewPort={"small"}/>
                                        </> : 
                                        <>
                                            {(Object.keys(params).length === 0 && Object.keys(appView["params"]).length === 0)  ||
                                                (Object.keys(appView["params"]).length === 0 && Object.keys(params).includes("shortId")) ?
                                                <MediumHomePage page={appView["page"]} displayView={appView["displayView"]}
                                                    shortId={""} searchId={""} postId={""} newsId={""} marketType={""} predictionId={""} ticker={""} marketId={""} selection={""} userId={""}
                                                /> : 
                                                <>
                                                    {Object.keys(params).includes("searchId") || Object.keys(appView["params"]).includes("searchId") ?
                                                        <MediumHomePage 
                                                            page={appView["page"]} 
                                                            displayView={appView["displayView"]}
                                                            postId={""}
                                                            searchId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["searchId"] : params.searchId}
                                                            shortId={""}
                                                            newsId={""}
                                                            marketType={""}
                                                            predictionId={""}
                                                            ticker={""}
                                                            marketId={""}
                                                            selection={""}
                                                            userId={""}
                                                        /> : 
                                                        <>
                                                            {Object.keys(params).includes("newsId") || Object.keys(appView["params"]).includes("newsId") ?
                                                                <MediumHomePage 
                                                                    page={appView["page"]} 
                                                                    displayView={appView["displayView"]}
                                                                    postId={""}
                                                                    searchId={""}
                                                                    shortId={""}
                                                                    newsId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["newsId"] : params.newsId}
                                                                    marketType={""}
                                                                    predictionId={""}
                                                                    ticker={""}
                                                                    marketId={""}
                                                                    selection={""}
                                                                    userId={""}
                                                                /> : 
                                                                <>
                                                                    {Object.keys(params).includes("postId") || Object.keys(appView["params"]).includes("postId") ?
                                                                        <MediumHomePage 
                                                                            page={appView["page"]} 
                                                                            displayView={appView["displayView"]}
                                                                            postId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["postId"] : params.postId}
                                                                            searchId={""}
                                                                            shortId={""}
                                                                            newsId={""}
                                                                            marketType={""}
                                                                            predictionId={""}
                                                                            ticker={""}
                                                                            marketId={""}
                                                                            selection={""}
                                                                            userId={""}
                                                                        /> : 
                                                                        <>
                                                                            {Object.keys(params).includes("marketType") || Object.keys(appView["params"]).includes("marketType") ?
                                                                                <MediumHomePage 
                                                                                    page={appView["page"]} 
                                                                                    displayView={appView["displayView"]}
                                                                                    postId={""}
                                                                                    searchId={""}
                                                                                    shortId={""}
                                                                                    newsId={""}
                                                                                    marketType={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["marketType"] : params.marketType}
                                                                                    predictionId={""}
                                                                                    ticker={""}
                                                                                    marketId={""}
                                                                                    selection={""}
                                                                                    userId={""}
                                                                                /> :
                                                                                <>
                                                                                    {Object.keys(params).includes("predictionId") || Object.keys(appView["params"]).includes("predictionId") ?
                                                                                        <MediumHomePage 
                                                                                            page={appView["page"]} 
                                                                                            displayView={appView["displayView"]}
                                                                                            postId={""}
                                                                                            searchId={""}
                                                                                            shortId={""}
                                                                                            newsId={""}
                                                                                            marketType={""}
                                                                                            predictionId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["predictionId"] : params.predictionId}
                                                                                            ticker={""}
                                                                                            marketId={""}
                                                                                            selection={""}
                                                                                            userId={""}
                                                                                        /> : 
                                                                                        <>
                                                                                            {Object.keys(params).includes("stockTicker") || Object.keys(appView["params"]).includes("stockTicker") ?
                                                                                                <MediumHomePage 
                                                                                                    page={appView["page"]} 
                                                                                                    displayView={appView["displayView"]}
                                                                                                    postId={""}
                                                                                                    searchId={""}
                                                                                                    shortId={""}
                                                                                                    newsId={""}
                                                                                                    marketType={""}
                                                                                                    predictionId={""}
                                                                                                    ticker={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["stockTicker"] : params.stockTicker}
                                                                                                    marketId={""}
                                                                                                    selection={""}
                                                                                                    userId={""}
                                                                                                /> : 
                                                                                                <>
                                                                                                    {Object.keys(params).includes("marketId") || Object.keys(appView["params"]).includes("marketId") ?
                                                                                                        <MediumHomePage 
                                                                                                            page={appView["page"]} 
                                                                                                            displayView={appView["displayView"]}
                                                                                                            postId={""}
                                                                                                            searchId={""}
                                                                                                            shortId={""}
                                                                                                            newsId={""}
                                                                                                            marketType={""}
                                                                                                            predictionId={""}
                                                                                                            ticker={""}
                                                                                                            marketId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["marketId"] : params.marketId}
                                                                                                            selection={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["selection"] : params.selection}
                                                                                                            userId={""}
                                                                                                        /> : 
                                                                                                        <>
                                                                                                            {Object.keys(params).includes("userId") || Object.keys(appView["params"]).includes("userId") ?
                                                                                                                <>
                                                                                                                    {Object.keys(params).includes("userId") ?
                                                                                                                        <>
                                                                                                                            {params.userId.slice(0, 3) === "f:-" ?
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "markets" || appView["displayView"] === "engaged"
                                                                                                                                        || appView["displayView"] === "watchlist" || appView["displayView"] === "communities" || appView["displayView"] === "followers" ?
                                                                                                                                        <Navigate to={`/profile/${params.userId}`} replace/> : 
                                                                                                                                        <MediumHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            postId={""}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["userId"] : params.userId}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </> : 
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "engaged" || appView["displayView"] === "notifications" ?
                                                                                                                                        <>
                                                                                                                                            {user ?
                                                                                                                                                <>
                                                                                                                                                    {user.user === params.userId ?
                                                                                                                                                        <MediumHomePage 
                                                                                                                                                            page={appView["page"]} 
                                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                                            postId={""}
                                                                                                                                                            searchId={""}
                                                                                                                                                            shortId={""}
                                                                                                                                                            newsId={""}
                                                                                                                                                            marketType={""}
                                                                                                                                                            predictionId={""}
                                                                                                                                                            ticker={""}
                                                                                                                                                            marketId={""}
                                                                                                                                                            selection={""}
                                                                                                                                                            userId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["userId"] : params.userId}
                                                                                                                                                        /> : <Navigate to={`/profile/${params.userId}`} replace/>
                                                                                                                                                    }
                                                                                                                                                </> : <Navigate to={`/profile/${params.userId}`} replace/>
                                                                                                                                            }
                                                                                                                                        </> : 
                                                                                                                                        <MediumHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            postId={""}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["userId"] : params.userId}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </>
                                                                                                                            }
                                                                                                                        </> : 
                                                                                                                        <>
                                                                                                                            {appView["params"]["userId"].slice(0, 3) === "f:-" ?
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "markets" || appView["displayView"] === "engaged"
                                                                                                                                        || appView["displayView"] === "watchlist" || appView["displayView"] === "communities" || appView["displayView"] === "followers" ?
                                                                                                                                        <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/> : 
                                                                                                                                        <MediumHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            postId={""}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={appView["params"]["userId"]}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </> : 
                                                                                                                                <>
                                                                                                                                    {appView["displayView"] === "engaged" || appView["displayView"] === "notifications" ?
                                                                                                                                        <>
                                                                                                                                            {user ?
                                                                                                                                                <>
                                                                                                                                                    {user.user === appView["params"]["userId"] ?
                                                                                                                                                        <MediumHomePage 
                                                                                                                                                            page={appView["page"]} 
                                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                                            postId={""}
                                                                                                                                                            searchId={""}
                                                                                                                                                            shortId={""}
                                                                                                                                                            newsId={""}
                                                                                                                                                            marketType={""}
                                                                                                                                                            predictionId={""}
                                                                                                                                                            ticker={""}
                                                                                                                                                            marketId={""}
                                                                                                                                                            selection={""}
                                                                                                                                                            userId={appView["params"]["userId"]}
                                                                                                                                                        /> : <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/>
                                                                                                                                                    }
                                                                                                                                                </> : <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/>
                                                                                                                                            }
                                                                                                                                        </> : 
                                                                                                                                        <MediumHomePage 
                                                                                                                                            page={appView["page"]} 
                                                                                                                                            displayView={appView["displayView"]}
                                                                                                                                            postId={""}
                                                                                                                                            searchId={""}
                                                                                                                                            shortId={""}
                                                                                                                                            newsId={""}
                                                                                                                                            marketType={""}
                                                                                                                                            predictionId={""}
                                                                                                                                            ticker={""}
                                                                                                                                            marketId={""}
                                                                                                                                            selection={""}
                                                                                                                                            userId={appView["params"]["userId"]}
                                                                                                                                        />
                                                                                                                                    }
                                                                                                                                </>
                                                                                                                            }
                                                                                                                        </>
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
                                                                            }
                                                                        </>
                                                                    }
                                                                </>
                                                            }
                                                        </>
                                                    }
                                                </>
                                            }
                                            {props.page === "login" ?
                                                <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                    <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                        <Login />
                                                    </div>
                                                </div> : 
                                                <>
                                                    {props.page === "logout" ?
                                                        <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                            <div className="app-smallViewLogoutWindow" 
                                                                    ref={overlayRef}
                                                                    style={{"height": "183px", "minHeight": "183px", "maxHeight": "183px"}}
                                                                >
                                                                <Logout/>
                                                            </div>
                                                        </div> : 
                                                        <>
                                                            {props.page === "receive" ?
                                                                <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                    <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                                        <Receive/>
                                                                    </div>
                                                                </div> :
                                                                <>
                                                                    {props.page === "send" ?
                                                                        <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                            <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                                                <FinuxSend/>
                                                                            </div>
                                                                        </div> : 
                                                                        <>
                                                                            {props.page === "get-verified" ?
                                                                                <div className="app-smallViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                                    <div className="app-smallViewLogoutWindow" ref={overlayRef}>
                                                                                        <FinulabGetVerified/>
                                                                                    </div>
                                                                                </div> : 
                                                                                <>
                                                                                    {props.page === "short" ?
                                                                                        <>
                                                                                            {width >= 1045 ?
                                                                                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                                                                                        <div className="app-largeViewPrimaryFocusContainer"
                                                                                                                style={
                                                                                                                    {
                                                                                                                        "width": shortData["displayComments"] ? "calc(100% - 450px)" : "100%", 
                                                                                                                        "minWidth": shortData["displayComments"] ? "calc(100% - 450px)" : "100%",  
                                                                                                                        "maxWidth": shortData["displayComments"] ? "calc(100% - 450px)" : "100%"
                                                                                                                    }
                                                                                                                }
                                                                                                            >
                                                                                                            <button className="app-largeViewMediaSideToggleonFocusBtn"
                                                                                                                    onClick={() => largeShortGoBack()}
                                                                                                                >
                                                                                                                <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon"/>
                                                                                                            </button>
                                                                                                            <div className="app-largeViewPrimaryFocusInnerContainer"
                                                                                                                    style={
                                                                                                                        {
                                                                                                                            "marginLeft": shortData["displayComments"] ? "0px" : "165px",
                                                                                                                            "width": shortData["displayComments"] ? "100%" : "calc(92.5% - 331px)", 
                                                                                                                            "minWidth": shortData["displayComments"] ? "100%" : "calc(92.5% - 331px)", 
                                                                                                                            "maxWidth": shortData["displayComments"] ? "100%" : "calc(92.5% - 331px)"
                                                                                                                        }
                                                                                                                    }
                                                                                                                >
                                                                                                                <FinulabShort shortId={Object.keys(params).length === 0 ? appView["params"]["shortId"] : params.shortId} />
                                                                                                            </div>
                                                                                                            <div className="app-largeViewPrimaryFocusNavigationContainer">
                                                                                                                <button className="app-largeViewMediaSideToggleonFocusBtn"
                                                                                                                        style={{"position": "relative"}}
                                                                                                                        onClick={() => largeShortNavigateUpDown("up")}
                                                                                                                    >
                                                                                                                    <ArrowForwardIos 
                                                                                                                        style={{"rotate": "-90deg"}}
                                                                                                                        className="app-largeViewMediaSideToggleBtnIcon"
                                                                                                                    />
                                                                                                                </button>
                                                                                                                <button className="app-largeViewMediaSideToggleonFocusBtn"
                                                                                                                        style={{"position": "relative", "marginTop": "25px"}}
                                                                                                                        onClick={() => largeShortNavigateUpDown("down")}
                                                                                                                    >
                                                                                                                    <ArrowForwardIos 
                                                                                                                        style={{"rotate": "90deg"}}
                                                                                                                        className="app-largeViewMediaSideToggleBtnIcon"
                                                                                                                    />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="app-largeViewSecondaryFocusContainer"
                                                                                                                style={
                                                                                                                    {
                                                                                                                        "width": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                                        "minWidth": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                                        "maxWidth": shortData["displayComments"] ? "450px" : "0px"
                                                                                                                    }
                                                                                                                }
                                                                                                            >
                                                                                                            <div className="app-largeViewSecondaryFocusHeader"
                                                                                                                    style={
                                                                                                                        {
                                                                                                                            "width": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                                            "minWidth": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                                            "maxWidth": shortData["displayComments"] ? "450px" : "0px"
                                                                                                                        }
                                                                                                                    }
                                                                                                                >
                                                                                                                <span className="app-largeViewSecondaryFocusHeaderTxt">Post</span>
                                                                                                            </div>
                                                                                                            <div className="app-largeViewSecondaryFocusHeaderMargin"/>
                                                                                                            <div className="app-largeViewSecondaryFocusBody">
                                                                                                                {shortData["displayComments"] ?
                                                                                                                    <>
                                                                                                                        {Object.keys(shortData["start"]).length === 0 ?
                                                                                                                            null : 
                                                                                                                            <Post
                                                                                                                                view={"max"}
                                                                                                                                type={"home"}
                                                                                                                                width={450}
                                                                                                                                v_display={false}
                                                                                                                                shortFlag={"YES"}
                                                                                                                                user={user ? user.user : "visitor"}
                                                                                                                                details={shortData["index"] === 0 ? shortData["start"] : shortData["shorts"]["data"][shortData["index"] - 1]} 
                                                                                                                                loading={false} 
                                                                                                                            />
                                                                                                                        }
                                                                                                                    </> : null
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div> : 
                                                                                                <FinulabShort 
                                                                                                    f_viewPort={"small"}
                                                                                                    shortId={Object.keys(params).length === 0 ? appView["params"]["shortId"] : params.shortId} 
                                                                                                />
                                                                                            }
                                                                                        </> :
                                                                                        <>
                                                                                            {media["media"].length === 0 ?
                                                                                                null : 
                                                                                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                                                                                        <div className="app-largeViewMediaSide">
                                                                                                            {media["index"] === 0 ?
                                                                                                                null :
                                                                                                                <button className="app-largeViewMediaSideToggleBtn"
                                                                                                                        ref={overlayBtnOneRef}
                                                                                                                        onClick={() => toggleMediaIndex("back")}
                                                                                                                    >
                                                                                                                    <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon"/>
                                                                                                                </button>
                                                                                                            }
                                                                                                        </div>
                                                                                                        <div className="app-largeMediaContainer">
                                                                                                            {media["media"][media["index"]][1] === "photo" ?
                                                                                                                <img 
                                                                                                                    src={media["media"][media["index"]][0]} 
                                                                                                                    alt="" 
                                                                                                                    ref={overlayMeidaRef}
                                                                                                                    className="app-largeMediaImg" 
                                                                                                                /> : 
                                                                                                                <video className="app-largeMediaImg" 
                                                                                                                        ref={overlayMeidaRef} 
                                                                                                                        autoPlay loop controls playsInline
                                                                                                                    >
                                                                                                                    <source src={`${media["media"][media["index"]][0]}#t=0.5`} type="video/mp4"/>
                                                                                                                </video>
                                                                                                            }
                                                                                                        </div>
                                                                                                        <div className="app-largeViewMediaSide">
                                                                                                            {media["index"] === media["media"].length - 1 ?
                                                                                                                null :
                                                                                                                <button className="app-largeViewMediaSideToggleBtn"
                                                                                                                        ref={overlayBtnTwoRef}
                                                                                                                        onClick={() => toggleMediaIndex("forward")}
                                                                                                                    >
                                                                                                                    <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon" style={{"rotate": "180deg"}}/>
                                                                                                                </button>
                                                                                                            }
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
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
                                                </>
                                            }
                                        </>
                                    }
                                </>
                            }
                        </> : 
                        <div className="app-largeViewWindowWrapper">
                            <div className="app-largeViewPageWrapper">
                                {props.page === "main-login" ?
                                    <>
                                        <MainLogin displayView={props.displayView}/>
                                    </> : 
                                    <>
                                        {(Object.keys(params).length === 0 && Object.keys(appView["params"]).length === 0)  ||
                                            (Object.keys(appView["params"]).length === 0 && Object.keys(params).includes("shortId")) ?
                                            <LargeHomePage page={appView["page"]} displayView={appView["displayView"]}
                                                searchId={""} shortId={""} postId={""} newsId={""} marketType={""} predictionId={""} ticker={""} marketId={""} selection={""} userId={""}
                                            /> : 
                                            <>
                                                {Object.keys(params).includes("searchId") || Object.keys(appView["params"]).includes("searchId") ?
                                                    <LargeHomePage 
                                                        page={appView["page"]} 
                                                        displayView={appView["displayView"]}
                                                        postId={""}
                                                        shortId={""}
                                                        searchId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["searchId"] : params.searchId}
                                                        newsId={""}
                                                        marketType={""}
                                                        predictionId={""}
                                                        ticker={""}
                                                        marketId={""}
                                                        selection={""}
                                                        userId={""}
                                                    /> : 
                                                    <>
                                                        {Object.keys(params).includes("newsId") || Object.keys(appView["params"]).includes("newsId") ?
                                                            <LargeHomePage 
                                                                page={appView["page"]} 
                                                                displayView={appView["displayView"]}
                                                                postId={""}
                                                                searchId={""}
                                                                shortId={""}
                                                                newsId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["newsId"] : params.newsId}
                                                                marketType={""}
                                                                predictionId={""}
                                                                ticker={""}
                                                                marketId={""}
                                                                selection={""}
                                                                userId={""}
                                                            /> : 
                                                            <>
                                                                {Object.keys(params).includes("postId") || Object.keys(appView["params"]).includes("postId") ?
                                                                    <LargeHomePage 
                                                                        page={appView["page"]} 
                                                                        displayView={appView["displayView"]}
                                                                        postId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["postId"] : params.postId}
                                                                        searchId={""}
                                                                        shortId={""}
                                                                        newsId={""}
                                                                        marketType={""}
                                                                        predictionId={""}
                                                                        ticker={""}
                                                                        marketId={""}
                                                                        selection={""}
                                                                        userId={""}
                                                                    /> : 
                                                                    <>
                                                                        {Object.keys(params).includes("marketType") || Object.keys(appView["params"]).includes("marketType") ?
                                                                            <LargeHomePage 
                                                                                page={appView["page"]} 
                                                                                displayView={appView["displayView"]}
                                                                                postId={""}
                                                                                searchId={""}
                                                                                shortId={""}
                                                                                newsId={""}
                                                                                marketType={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["marketType"] : params.marketType}
                                                                                predictionId={""}
                                                                                ticker={""}
                                                                                marketId={""}
                                                                                selection={""}
                                                                                userId={""}
                                                                            /> :
                                                                            <>
                                                                                {Object.keys(params).includes("predictionId") || Object.keys(appView["params"]).includes("predictionId") ?
                                                                                    <LargeHomePage 
                                                                                        page={appView["page"]} 
                                                                                        displayView={appView["displayView"]}
                                                                                        postId={""}
                                                                                        searchId={""}
                                                                                        shortId={""}
                                                                                        newsId={""}
                                                                                        marketType={""}
                                                                                        predictionId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["predictionId"] : params.predictionId}
                                                                                        ticker={""}
                                                                                        marketId={""}
                                                                                        selection={""}
                                                                                        userId={""}
                                                                                    /> : 
                                                                                    <>
                                                                                        {Object.keys(params).includes("stockTicker") || Object.keys(appView["params"]).includes("stockTicker") ?
                                                                                            <LargeHomePage 
                                                                                                page={appView["page"]} 
                                                                                                displayView={appView["displayView"]}
                                                                                                postId={""}
                                                                                                searchId={""}
                                                                                                shortId={""}
                                                                                                newsId={""}
                                                                                                marketType={""}
                                                                                                predictionId={""}
                                                                                                ticker={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["stockTicker"] : params.stockTicker}
                                                                                                marketId={""}
                                                                                                selection={""}
                                                                                                userId={""}
                                                                                            /> : 
                                                                                            <>
                                                                                                {Object.keys(params).includes("marketId") || Object.keys(appView["params"]).includes("marketId") ?
                                                                                                    <LargeHomePage 
                                                                                                        page={appView["page"]} 
                                                                                                        displayView={appView["displayView"]}
                                                                                                        postId={""}
                                                                                                        searchId={""}
                                                                                                        shortId={""}
                                                                                                        newsId={""}
                                                                                                        marketType={""}
                                                                                                        predictionId={""}
                                                                                                        ticker={""}
                                                                                                        marketId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["marketId"] : params.marketId}
                                                                                                        selection={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["selection"] : params.selection}
                                                                                                        userId={""}
                                                                                                    /> : 
                                                                                                    <>
                                                                                                        {Object.keys(params).includes("userId") || Object.keys(appView["params"]).includes("userId") ?
                                                                                                            <>
                                                                                                                {Object.keys(params).includes("userId") ?
                                                                                                                    <>
                                                                                                                        {params.userId.slice(0, 3) === "f:-" ?
                                                                                                                            <>
                                                                                                                                {appView["displayView"] === "markets" || appView["displayView"] === "engaged"
                                                                                                                                    || appView["displayView"] === "watchlist" || appView["displayView"] === "communities" || appView["displayView"] === "followers" ?
                                                                                                                                    <Navigate to={`/profile/${params.userId}`} replace/> : 
                                                                                                                                    <LargeHomePage 
                                                                                                                                        page={appView["page"]} 
                                                                                                                                        displayView={appView["displayView"]}
                                                                                                                                        postId={""}
                                                                                                                                        searchId={""}
                                                                                                                                        shortId={""}
                                                                                                                                        newsId={""}
                                                                                                                                        marketType={""}
                                                                                                                                        predictionId={""}
                                                                                                                                        ticker={""}
                                                                                                                                        marketId={""}
                                                                                                                                        selection={""}
                                                                                                                                        userId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["userId"] : params.userId}
                                                                                                                                    />
                                                                                                                                }
                                                                                                                            </> : 
                                                                                                                            <>
                                                                                                                                {appView["displayView"] === "engaged" || appView["displayView"] === "notifications" ?
                                                                                                                                    <>
                                                                                                                                        {user ?
                                                                                                                                            <>
                                                                                                                                                {user.user === params.userId ?
                                                                                                                                                    <LargeHomePage 
                                                                                                                                                        page={appView["page"]} 
                                                                                                                                                        displayView={appView["displayView"]}
                                                                                                                                                        postId={""}
                                                                                                                                                        searchId={""}
                                                                                                                                                        shortId={""}
                                                                                                                                                        newsId={""}
                                                                                                                                                        marketType={""}
                                                                                                                                                        predictionId={""}
                                                                                                                                                        ticker={""}
                                                                                                                                                        marketId={""}
                                                                                                                                                        selection={""}
                                                                                                                                                        userId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["userId"] : params.userId}
                                                                                                                                                    /> : <Navigate to={`/profile/${params.userId}`} replace/>
                                                                                                                                                }
                                                                                                                                            </> : <Navigate to={`/profile/${params.userId}`} replace/>
                                                                                                                                        }
                                                                                                                                    </> : 
                                                                                                                                    <LargeHomePage 
                                                                                                                                        page={appView["page"]} 
                                                                                                                                        displayView={appView["displayView"]}
                                                                                                                                        postId={""}
                                                                                                                                        searchId={""}
                                                                                                                                        shortId={""}
                                                                                                                                        newsId={""}
                                                                                                                                        marketType={""}
                                                                                                                                        predictionId={""}
                                                                                                                                        ticker={""}
                                                                                                                                        marketId={""}
                                                                                                                                        selection={""}
                                                                                                                                        userId={Object.keys(params).length === 0 || Object.keys(params).includes("shortId") ? appView["params"]["userId"] : params.userId}
                                                                                                                                    />
                                                                                                                                }
                                                                                                                            </>
                                                                                                                        }
                                                                                                                    </> : 
                                                                                                                    <>
                                                                                                                        {appView["params"]["userId"].slice(0, 3) === "f:-" ?
                                                                                                                            <>
                                                                                                                                {appView["displayView"] === "markets" || appView["displayView"] === "engaged"
                                                                                                                                    || appView["displayView"] === "watchlist" || appView["displayView"] === "communities" || appView["displayView"] === "followers" ?
                                                                                                                                    <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/> : 
                                                                                                                                    <LargeHomePage 
                                                                                                                                        page={appView["page"]} 
                                                                                                                                        displayView={appView["displayView"]}
                                                                                                                                        postId={""}
                                                                                                                                        searchId={""}
                                                                                                                                        shortId={""}
                                                                                                                                        newsId={""}
                                                                                                                                        marketType={""}
                                                                                                                                        predictionId={""}
                                                                                                                                        ticker={""}
                                                                                                                                        marketId={""}
                                                                                                                                        selection={""}
                                                                                                                                        userId={appView["params"]["userId"]}
                                                                                                                                    />
                                                                                                                                }
                                                                                                                            </> : 
                                                                                                                            <>
                                                                                                                                {appView["displayView"] === "engaged" || appView["displayView"] === "notifications" ?
                                                                                                                                    <>
                                                                                                                                        {user ?
                                                                                                                                            <>
                                                                                                                                                {user.user === appView["params"]["userId"] ?
                                                                                                                                                    <LargeHomePage 
                                                                                                                                                        page={appView["page"]} 
                                                                                                                                                        displayView={appView["displayView"]}
                                                                                                                                                        postId={""}
                                                                                                                                                        searchId={""}
                                                                                                                                                        shortId={""}
                                                                                                                                                        newsId={""}
                                                                                                                                                        marketType={""}
                                                                                                                                                        predictionId={""}
                                                                                                                                                        ticker={""}
                                                                                                                                                        marketId={""}
                                                                                                                                                        selection={""}
                                                                                                                                                        userId={appView["params"]["userId"]}
                                                                                                                                                    /> : <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/>
                                                                                                                                                }
                                                                                                                                            </> : <Navigate to={`/profile/${appView["params"]["userId"]}`} replace/>
                                                                                                                                        }
                                                                                                                                    </> : 
                                                                                                                                    <LargeHomePage 
                                                                                                                                        page={appView["page"]} 
                                                                                                                                        displayView={appView["displayView"]}
                                                                                                                                        postId={""}
                                                                                                                                        searchId={""}
                                                                                                                                        shortId={""}
                                                                                                                                        newsId={""}
                                                                                                                                        marketType={""}
                                                                                                                                        predictionId={""}
                                                                                                                                        ticker={""}
                                                                                                                                        marketId={""}
                                                                                                                                        selection={""}
                                                                                                                                        userId={appView["params"]["userId"]}
                                                                                                                                    />
                                                                                                                                }
                                                                                                                            </>
                                                                                                                        }
                                                                                                                    </>
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
                            {props.page === "login" ?
                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                        <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                        <div className="app-largeViewFixedInnerWindowMainFixer">
                                            <div className="app-largeViewLogoutWindow" ref={overlayRef}>
                                                <Login />
                                            </div>
                                        </div>
                                        <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                    </div>
                                </div> : 
                                <>
                                    {props.page === "logout" ?
                                        <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                            <div className="app-largeViewFixedInnerWindowWrapper">
                                                <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                <div className="app-largeViewFixedInnerWindowMainFixer">
                                                    <div className="app-largeViewLogoutWindowV2" ref={overlayRef}>
                                                        <Logout/>
                                                    </div>
                                                </div>
                                                <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                            </div>
                                        </div> : 
                                        <>
                                            {props.page === "receive" ?
                                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                                        <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                        <div className="app-largeViewFixedInnerWindowMainFixer">
                                                            <div className="app-largeViewPostWindow" ref={overlayRef}>
                                                                <Receive/>
                                                            </div>
                                                        </div>
                                                        <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                    </div>
                                                </div> :
                                                <>
                                                    {props.page === "send" ?
                                                        <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                            <div className="app-largeViewFixedInnerWindowWrapper">
                                                                <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                                <div className="app-largeViewFixedInnerWindowMainFixer">
                                                                    <div className="app-largeViewPostWindow" ref={overlayRef}>
                                                                        <FinuxSend/>
                                                                    </div>
                                                                </div>
                                                                <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                            </div>
                                                        </div> : 
                                                        <>
                                                            {props.page === "get-verified" ? 
                                                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                                                        <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                                        <div className="app-largeViewFixedInnerWindowMainFixer">
                                                                            <div className="app-largeViewPostWindow" ref={overlayRef}>
                                                                                <FinulabGetVerified/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="app-largeViewFixedInnerWindowSideFixers"/>
                                                                    </div>
                                                                </div> : 
                                                                <>
                                                                    {props.page === "short" ?
                                                                        <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                            <div className="app-largeViewFixedInnerWindowWrapper">
                                                                                <div className="app-largeViewPrimaryFocusContainer"
                                                                                        style={
                                                                                            {
                                                                                                "width": shortData["displayComments"] ? "calc(100% - 450px)" : "100%", 
                                                                                                "minWidth": shortData["displayComments"] ? "calc(100% - 450px)" : "100%",  
                                                                                                "maxWidth": shortData["displayComments"] ? "calc(100% - 450px)" : "100%"
                                                                                            }
                                                                                        }
                                                                                    >
                                                                                    <button className="app-largeViewMediaSideToggleonFocusBtn"
                                                                                            onClick={() => largeShortGoBack()}
                                                                                        >
                                                                                        <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon"/>
                                                                                    </button>
                                                                                    <div className="app-largeViewPrimaryFocusInnerContainer"
                                                                                            style={
                                                                                                {
                                                                                                    "marginLeft": shortData["displayComments"] ? "0px" : "165px",
                                                                                                    "width": shortData["displayComments"] ? "100%" : "calc(92.5% - 331px)", 
                                                                                                    "minWidth": shortData["displayComments"] ? "100%" : "calc(92.5% - 331px)", 
                                                                                                    "maxWidth": shortData["displayComments"] ? "100%" : "calc(92.5% - 331px)"
                                                                                                }
                                                                                            }
                                                                                        >
                                                                                        <FinulabShort shortId={Object.keys(params).length === 0 ? appView["params"]["shortId"] : params.shortId} />
                                                                                    </div>
                                                                                    <div className="app-largeViewPrimaryFocusNavigationContainer">
                                                                                        <button className="app-largeViewMediaSideToggleonFocusBtn"
                                                                                                style={{"position": "relative"}}
                                                                                                onClick={() => largeShortNavigateUpDown("up")}
                                                                                            >
                                                                                            <ArrowForwardIos 
                                                                                                style={{"rotate": "-90deg"}}
                                                                                                className="app-largeViewMediaSideToggleBtnIcon"
                                                                                            />
                                                                                        </button>
                                                                                        <button className="app-largeViewMediaSideToggleonFocusBtn"
                                                                                                style={{"position": "relative", "marginTop": "25px"}}
                                                                                                onClick={() => largeShortNavigateUpDown("down")}
                                                                                            >
                                                                                            <ArrowForwardIos 
                                                                                                style={{"rotate": "90deg"}}
                                                                                                className="app-largeViewMediaSideToggleBtnIcon"
                                                                                            />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="app-largeViewSecondaryFocusContainer"
                                                                                        style={
                                                                                            {
                                                                                                "width": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                "minWidth": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                "maxWidth": shortData["displayComments"] ? "450px" : "0px"
                                                                                            }
                                                                                        }
                                                                                    >
                                                                                    <div className="app-largeViewSecondaryFocusHeader"
                                                                                            style={
                                                                                                {
                                                                                                    "width": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                    "minWidth": shortData["displayComments"] ? "450px" : "0px", 
                                                                                                    "maxWidth": shortData["displayComments"] ? "450px" : "0px"
                                                                                                }
                                                                                            }
                                                                                        >
                                                                                        <span className="app-largeViewSecondaryFocusHeaderTxt">Post</span>
                                                                                    </div>
                                                                                    <div className="app-largeViewSecondaryFocusHeaderMargin"/>
                                                                                    <div className="app-largeViewSecondaryFocusBody">
                                                                                        {shortData["displayComments"] ?
                                                                                            <>
                                                                                                {Object.keys(shortData["start"]).length === 0 ?
                                                                                                    null : 
                                                                                                    <Post
                                                                                                        view={"max"}
                                                                                                        type={"home"}
                                                                                                        width={450}
                                                                                                        v_display={false}
                                                                                                        shortFlag={"YES"}
                                                                                                        user={user ? user.user : "visitor"}
                                                                                                        details={shortData["index"] === 0 ? shortData["start"] : shortData["shorts"]["data"][shortData["index"] - 1]} 
                                                                                                        loading={false} 
                                                                                                    />
                                                                                                }
                                                                                            </> : null
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div> : 
                                                                        <>
                                                                            {media["media"].length === 0 ?
                                                                                null : 
                                                                                <div className="app-largeViewFixedWindowWrapper" ref={overlayContainerRef}>
                                                                                    <div className="app-largeViewFixedInnerWindowWrapper">
                                                                                        <div className="app-largeViewMediaSide">
                                                                                            {media["index"] === 0 ?
                                                                                                null :
                                                                                                <button className="app-largeViewMediaSideToggleBtn"
                                                                                                        ref={overlayBtnOneRef}
                                                                                                        onClick={() => toggleMediaIndex("back")}
                                                                                                    >
                                                                                                    <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon"/>
                                                                                                </button>
                                                                                            }
                                                                                        </div>
                                                                                        <div className="app-largeMediaContainer">
                                                                                            {media["media"][media["index"]][1] === "photo" ?
                                                                                                <img 
                                                                                                    src={media["media"][media["index"]][0]} 
                                                                                                    alt="" 
                                                                                                    ref={overlayMeidaRef}
                                                                                                    className="app-largeMediaImg" 
                                                                                                /> : 
                                                                                                <video className="app-largeMediaImg" 
                                                                                                        ref={overlayMeidaRef} 
                                                                                                        autoPlay loop controls playsInline
                                                                                                    >
                                                                                                    <source src={`${media["media"][media["index"]][0]}#t=0.5`} type="video/mp4"/>
                                                                                                </video>
                                                                                            }
                                                                                        </div>
                                                                                        <div className="app-largeViewMediaSide">
                                                                                            {media["index"] === media["media"].length - 1 ?
                                                                                                null :
                                                                                                <button className="app-largeViewMediaSideToggleBtn"
                                                                                                        ref={overlayBtnTwoRef}
                                                                                                        onClick={() => toggleMediaIndex("forward")}
                                                                                                    >
                                                                                                    <KeyboardBackspace className="app-largeViewMediaSideToggleBtnIcon" style={{"rotate": "180deg"}}/>
                                                                                                </button>
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
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
                                </>
                            }
                        </div>
                    }
                </>
            }
        </>
    )
}