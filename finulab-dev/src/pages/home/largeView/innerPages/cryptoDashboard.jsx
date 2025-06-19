import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {useRef, useState, useLayoutEffect, useEffect} from 'react';
import {ArrowDropUp, AssuredWorkload, ChevronLeft, ChevronRight, DataObject, DisplaySettings, PieChart, PostAdd, Verified} from '@mui/icons-material';

import Post from '../../../../components/post';
import generalOpx from '../../../../functions/generalFunctions';
import MiniaturizedNews from '../../../../components/miniaturized/news/mini-news';

//critical
import {updateProfilePageInformationState, selectPageInformationState} from '../../../../reduxStore/pageInformation';
//critical

import {selectUser} from '../../../../reduxStore/user';
import {setNewsEngagement, addToNewsEngagement, selectNewsEngagement} from '../../../../reduxStore/newsEngagement';
import {setTopFiftyMC, setTopFiftyVol, setTopFiftyGL, setMarketOverview, clearMarketOverview, selectMarketOverview} from '../../../../reduxStore/marketOverview';
import {setDashboardCongress, setDashboardTradingActivity, clearDashboardTradingActivity, selectDashboardTradingActivity} from '../../../../reduxStore/dashboardTradingActivity';
import {clearStockDashboardNews, setDashboardNews, updateStockDashboardNews, updateStockDashboardNewsIndex, selectStockDashboardNews} from '../../../../reduxStore/stockDashboardNews';
import {clearStockDashboardData, updateStockDashboardData, updateStockDashboardSelection, updateStockDashboardIndex, selectStockDashboardData} from '../../../../reduxStore/stockDashboardData';
import FearGreedGuage from '../../../../components/fearGreedGuage/fearGreedGuage';
import DominanceChart from '../../../../components/tradingActivity/dominanceChart';


export default function CryptoMarketDashboard_Home(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const appState = useSelector(selectPageInformationState);

    const user = useSelector(selectUser);
    const marketOverview = useSelector(selectMarketOverview);
    const u_newsEngagement = useSelector(selectNewsEngagement);
    const dashboardNews = useSelector(selectStockDashboardNews);
    const dashboardState = useSelector(selectStockDashboardData);
    const dashboardTradingActivity = useSelector(selectDashboardTradingActivity);

    const [selectedView, setSelectedView] = useState("gainLoss");
    const [selectedViewSliderLeft, setSelectedViewSliderLeft] = useState("0px");

    const [updateWidth, setUpdateWidth] = useState("116px");
    const [secondaryTranslate, setSecondaryTranslate] = useState("0px");
    const [updateInnerTranslate, setUpdateInnerTranslate] = useState("0px");

    const updateTradingActivitySlider = (type) => {
        updateWidth === "325px" ? setUpdateWidth("116px") : setUpdateWidth("325px");
        if(updateWidth === "325px") {
            type === "gainLoss" ? setUpdateInnerTranslate("0px") : type === "volume" ? setUpdateInnerTranslate("calc(-80px - 23.25px)") : setUpdateInnerTranslate("calc(-2 * (80px + 23.25px))");
        } else {setUpdateInnerTranslate("0px");}
    }

    const submitSelectedViewToSlider = (from, to) => {
        if(from === to) {
            updateTradingActivitySlider(from);
        } else {
            updateTradingActivitySlider(to);

            setSelectedView(to);
            if(to === "gainLoss") {
                setSelectedViewSliderLeft("0px");
            } else if(to === "volume") {
                setSelectedViewSliderLeft("calc(-100% - 10px)");
            } else {
                setSelectedViewSliderLeft("calc(-200% - 20px)");
            }
        }
    }

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

    const rankingRef = useRef();
    const [visibleElementsCount, setVisibleElementsCount] = useState(0);
    useLayoutEffect(() => {
        const visibleRankingsCountResizeUpdater = () => {
            if(rankingRef.current) {
                const visibleTableElementsCount = Math.floor(rankingRef.current.clientHeight / 55);
                setVisibleElementsCount(visibleTableElementsCount);
            }
        }

        window.addEventListener('resize', visibleRankingsCountResizeUpdater);
        visibleRankingsCountResizeUpdater();
        return () => window.removeEventListener('resize', visibleRankingsCountResizeUpdater);
    }, []);

    const dashboardIndexUpdate = (type, selection) => {
        if(visibleElementsCount > 0) {
            let currentIndex = dashboardState["index"];

            if(type === "back" && currentIndex > 0) {
                dispatch(
                    updateStockDashboardIndex(currentIndex - 1)
                );
            } else if(type === "forward" && currentIndex < (Math.ceil(50 / visibleElementsCount) - 1)) {
                dispatch(
                    updateStockDashboardIndex(currentIndex + 1)
                );
            } else if(type === "set") {
                dispatch(
                    updateStockDashboardIndex(selection)
                );
            }
        }
    }

    const displaySortRef = useRef();
    const [pageError, setPageError] =  useState(false);
    const [displaySort, setDisplaySort] = useState(false);
    const [rankingsLoading, setRankingsLoading] = useState(false);
    const pullDashboardRankings = async (type, selection) => {
        setRankingsLoading(true);

        const dataKeys = Object.keys(dashboardState["page"]["data"]);
        if(!dataKeys.includes(selection) || dashboardState["type"] !== "cryptos") {
            await generalOpx.axiosInstance.put(`/crypto-market-data/rankings`, {"sortBy": selection}).then(
                (response) => {
                    if(response.data["status"] === "success") {
                        if(pageError) {
                            setPageError(false);
                        }
    
                        if(type === "primary") {
                            let dashboardRankingData = {
                                [selection] : response.data["data"]
                            }

                            dispatch(
                                updateStockDashboardData(
                                    {
                                        "data": dashboardRankingData, "dataLoading": false
                                    }
                                )
                            );
                        } else if(type === "secondary") {
                            let dashboardRankingData = {
                                ...dashboardState["page"]["data"], [selection] : response.data["data"]
                            }
    
                            dispatch(
                                updateStockDashboardData(
                                    {
                                        "data": dashboardRankingData, "dataLoading": false
                                    }
                                )
                            );
                        }

                        dispatch(
                            updateStockDashboardSelection(selection)
                        );
                        dispatch(
                            updateStockDashboardIndex(0)
                        );
                        setDisplaySort(false);
                        setRankingsLoading(false);
                    } else {
                        setPageError(true);
                    }
                }
            ).catch(
                () => {
                    setPageError(true);
                }
            );
        } else {
            dispatch(
                updateStockDashboardSelection(selection)
            );
            dispatch(
                updateStockDashboardIndex(0)
            );
            setDisplaySort(false);
            setRankingsLoading(false);
        }
    }

    const displaySortToggle = () => {
        displaySort ? setDisplaySort(false) : setDisplaySort(true);
    }

    const [dashboardNewsBeingUpdated, setDashboardNewsBeingUpdated] = useState(false);
    const pullDashboardNews = async (ninclude) => {
        const symbol = "c_finulab-general";
        await generalOpx.axiosInstance.put(`/content/news/assets/${symbol}`,
            {
                "ninclude": ninclude
            }
        ).then(
            async (response) => {
                if(response.data["status"] === "success") {
                    let currentData = [];
                    
                    if(ninclude.length === 0) {
                        currentData = [...response.data["data"]];
                    } else {
                        currentData = [...dashboardNews["news"]["data"]].concat(response.data["data"]);
                    }

                    if(user && response.data["data"].length > 0) {
                        if(u_newsEngagement.length === 0) {
                            const newsIds = [...response.data["data"]].flatMap(insideArr => insideArr.map(obj => `C:-${obj._id}`));
                            const newsEngagements = await generalOpx.axiosInstance.put(`/content/news/news-engagements`, {"newsIds": newsIds});

                            if(newsEngagements.data["status"] === "success" && newsEngagements.data["data"].length > 0) {
                                dispatch(
                                    setNewsEngagement(newsEngagements.data["data"])
                                );
                            }
                        } else {
                            const newsIdsToEliminate = [...u_newsEngagement.map(n_data => n_data.newsId)];
                            const newsIdsInterlude = [...response.data["data"]].flatMap(insideArr => insideArr.map(obj => `C:-${obj._id}`));
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

                    if(ninclude.length === 0) {
                        dispatch(
                            setDashboardNews(
                                {
                                    "type": "cryptos",
                                    "news": {
                                        "data": currentData,
                                        "dataLoading": false
                                    },
                                    "index": 0
                                }
                            )
                        )
                    } else {
                        dispatch(
                            updateStockDashboardNews(
                                {
                                    "data": currentData, "dataLoading": false
                                }
                            )
                        );
                    }
                }
            }
        );
    }
    const updateDashboardNewsView = async (type) => {
        const currentIndex = dashboardNews["index"];

        if(type === "forward") {
            dispatch(
                updateStockDashboardNewsIndex(currentIndex + 1)
            );

            if(currentIndex % 2 === 0) {
                let ninclude = [];
                for(let i = 0; i < dashboardNews["news"]["data"].length; i++) {
                    for(let j = 0; j < dashboardNews["news"]["data"][i].length; j++) {
                        ninclude.push(dashboardNews["news"]["data"][i][j]["_id"]);
                    }
                }

                setDashboardNewsBeingUpdated(true);
                pullDashboardNews(ninclude);
                setDashboardNewsBeingUpdated(false);
            }
        } else if(type === "back") {
            if(currentIndex !== 0) {
                dispatch(
                    updateStockDashboardNewsIndex(currentIndex - 1)
                );
            }
        }
    }

    const pullCongressionalTradingActivity = async () => {
        await generalOpx.axiosInstance.put(`/stock-market-data/latest-trading-activity`, 
            {
                "type": "market",
                "goal": "primary",
                "market": "crypto",
                "symbol": "",
                "ninclude": []
            }
        ).then(
            (response) => {
                if(response.data["status"] === "success") {
                    dispatch(
                        setDashboardTradingActivity(
                            {
                                "page": "cryptos",
                                "congress": {
                                    "index": 0,
                                    "data": response.data["data"],
                                    "dataCount": response.data["dataCount"],
                                    "dataLoading": false
                                }
                            }
                        )
                    );
                }
            }
        );
    }

    const pullMarketOverview = async () => {
        await generalOpx.axiosInstance.put(`/crypto-market-data/crypto-market-overview`, 
            {}
        ).then(
            (response) => {
                if(response.data["status"] === "success") {
                    dispatch(
                        setMarketOverview(
                            {
                                "page": "cryptos",
                                "overview": {
                                    "data": {
                                        "totVolume": response.data["data"][0]["totVolume"],
                                        "totMarketCap": response.data["data"][0]["totMarketCap"],
                                        "totGainLoss": response.data["data"][0]["totGainLoss"],
                                        "absTotGainLoss": response.data["data"][0]["absTotGainLoss"],
                                        "fearGreedIndex": response.data["data"][0]["fearGreedIndex"]
                                    },
                                    "dataLoading": false
                                },
                                "topFiftyMC": {
                                    "index": 0,
                                    "data": [...response.data["data"][0]["dominance"]["marketCap"]],
                                    "dataLoading": false
                                },
                                "topFiftyVol": {
                                    "index": 0,
                                    "data": [...response.data["data"][0]["dominance"]["volume"]],
                                    "dataLoading": false
                                },
                                "topFiftyGL": {
                                    "index": 0,
                                    "data": [...response.data["data"][0]["dominance"]["gainLoss"]],
                                    "dataLoading": false
                                }
                            }
                        )
                    )
                }
            }
        )
    }

    const [disableNavTMOMC, setDisableNavTMOMC] = useState(false);
    const navigateThroughMarketOverviewByMC = (type) => {
        setDisableNavTMOMC(true);
        const currentIndex = marketOverview["topFiftyMC"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setTopFiftyMC(
                        {
                            "index": currentIndex - 1,
                            "data": marketOverview["topFiftyMC"]["data"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(marketOverview["topFiftyMC"]["data"].length / 5);

            if(currentIndex < limit) {
                dispatch(
                    setTopFiftyMC(
                        {
                            "index": currentIndex + 1,
                            "data": marketOverview["topFiftyMC"]["data"],
                            "dataLoading": false
                        }
                    )
                );
            }
        }

        setDisableNavTMOMC(false);
    }

    const [disableNavTMOV, setDisableNavTMOV] = useState(false);
    const navigateThroughMarketOverviewByVolume = (type) => {
        setDisableNavTMOV(true);
        const currentIndex = marketOverview["topFiftyVol"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setTopFiftyVol(
                        {
                            "index": currentIndex - 1,
                            "data": marketOverview["topFiftyVol"]["data"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(marketOverview["topFiftyVol"]["data"].length / 5);

            if(currentIndex < limit) {
                dispatch(
                    setTopFiftyVol(
                        {
                            "index": currentIndex + 1,
                            "data": marketOverview["topFiftyVol"]["data"],
                            "dataLoading": false
                        }
                    )
                )
            }
        }

        setDisableNavTMOV(false);
    }

    const [disableNavTMOGL, setDisableNavTMOGL] = useState(false);
    const navigateThroughMarketOverviewByGainLoss = (type) => {
        setDisableNavTMOGL(true);
        const currentIndex = marketOverview["topFiftyGL"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setTopFiftyGL(
                        {
                            "index": currentIndex - 1,
                            "data": marketOverview["topFiftyGL"]["data"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(marketOverview["topFiftyGL"]["data"].length / 5);

            if(currentIndex < limit) {
                dispatch(
                    setTopFiftyGL(
                        {
                            "index": currentIndex + 1,
                            "data": marketOverview["topFiftyGL"]["data"],
                            "dataLoading": false
                        }
                    )
                );
            }
        }

        setDisableNavTMOGL(false);
    }

    useEffect(() => {
        if(dashboardState["type"] !== "cryptos") {
            dispatch(
                clearStockDashboardData("cryptos")
            );
            pullDashboardRankings("primary", "marketCap");
        }

        if(dashboardNews["type"] !== "cryptos") {
            dispatch(
                clearStockDashboardNews()
            );
            setTimeout(() => {pullDashboardNews([]);}, 0);
        }

        if(dashboardTradingActivity["page"] !== "cryptos") {
            dispatch(
                clearDashboardTradingActivity()
            );
            setTimeout(() => {pullCongressionalTradingActivity()}, 0);
        }

        if(marketOverview["page"] !== "cryptos") {
            dispatch(
                clearMarketOverview()
            );
            setTimeout(() => {pullMarketOverview();}, 0);
        }

        if(props.f_viewPort === "small") {document.documentElement.scrollTop = 0;}
    }, []);

    const [disableCongressNav, setDisableCongressNav] = useState(false);
    const navigateThroughCongressTxs = async (type) => {
        setDisableCongressNav(true);
        const currentIndex = dashboardTradingActivity["congress"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setDashboardCongress(
                        {
                            "index": currentIndex - 1,
                            "data": dashboardTradingActivity["congress"]["data"],
                            "dataCount": dashboardTradingActivity["congress"]["dataCount"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(dashboardTradingActivity["congress"]["dataCount"] / 5);

            if(currentIndex < limit) {
                const availableNowLimit = Math.ceil(dashboardTradingActivity["congress"]["data"].length / 5);
                if(availableNowLimit - (currentIndex + 1) < 2) {
                    let ninclude_funct = [];
                    for(let i = 0; i < dashboardTradingActivity["congress"]["data"].length; i++) {
                        ninclude_funct.push(dashboardTradingActivity["congress"]["data"][i]["_id"]);
                    }

                    await generalOpx.axiosInstance.put(`/stock-market-data/latest-trading-activity`, 
                        {
                            "type": "market",
                            "goal": "secondary",
                            "market": "crypto",
                            "symbol": "",
                            "ninclude": ninclude_funct
                        }
                    ).then(
                        async (response) => {
                            if(response.data["status"] === "success") {
                                dispatch(
                                    setDashboardCongress(
                                        {
                                            "index": currentIndex + 1,
                                            "data": [...dashboardTradingActivity["congress"]["data"], ...response.data["data"]],
                                            "dataCount": dashboardTradingActivity["congress"]["dataCount"],
                                            "dataLoading": false
                                        }
                                    )
                                );
                            }
                        }
                    );
                } else {
                    dispatch(
                        setDashboardCongress(
                            {
                                "index": currentIndex + 1,
                                "data": dashboardTradingActivity["congress"]["data"],
                                "dataCount": dashboardTradingActivity["congress"]["dataCount"],
                                "dataLoading": false
                            }
                        )
                    );
                }
            }
        }

        setDisableCongressNav(false);
    }

    return(
        <div
                className={props.f_viewPort === "small" ? "small-homePageContentBodyWrapper" : "large-homePageContentBodyWrapper"}
            >
            <div 
                    ref={contentBodyRef}
                    className={props.f_viewPort === "small" ? "small-homePageContentBody" : "large-homePageContentBody"}
                >
                <div className="large-homePageContentBodyMargin"/>
                <div className="large-stocksDashboardUnderlineHeader">
                    <div className="large-stocksDashboardUnderlineRank">Rank</div>
                    <div className="large-stocksDashboardUnderlineName">Name</div>
                    <div className="large-stocksDashboardUnderlineFigure"
                            style={props.f_viewPort === "small" ? 
                                {
                                    "width": "calc(100% - 45px - 70px - 25% - 40px)", "minWidth": "calc(100% - 45px - 70px - 25% - 40px)", "maxWidth": "calc(100% - 45px - 70px - 25% - 40px)"
                                } : {}
                            }
                        >
                        Market Cap
                    </div>
                    {props.f_viewPort === "small" ? 
                        null : 
                        <div className="large-stocksDashboardUnderlineFigure">Price</div>
                    }
                </div>
                <div className="large-stocksDashboardBodyContainer" 
                        ref={rankingRef}
                        style={dashboardState["index"] === (Math.ceil(50 / visibleElementsCount) - 1) && (50 - (dashboardState["index"] * visibleElementsCount)) < visibleElementsCount ? 
                            {"justifyContent": "start"} : {}
                        }
                    >
                    {dashboardState["page"]["dataLoading"] || rankingsLoading ?
                        <div className="recommendation-GraphPieContainer" 
                                style={{"width": "100%", "minWidth": "100%", "maxWidth": "100%"}}
                            >
                            <div className="finulab-chartLoading">
                                <div className="finulab-chartLoadingSpinner"/>
                                <img src="/assets/Finulab_Icon.png" alt="" className="finulab-chartLoadingImg" />
                            </div>
                        </div> : 
                        <>
                            {dashboardState["page"]["data"][dashboardState["selection"]].slice(dashboardState["index"] * visibleElementsCount, (visibleElementsCount * (dashboardState["index"] + 1))).map((desc, index) => (
                                    <div className="large-stocksDashboardBodyLine" key={desc["symbol"]}>
                                        <button className="large-stocksDashboardBodyLineBtn"
                                                onClick={() => navigate(`/cryptos/C:-${desc["symbol"]}`)}
                                            >
                                            <img src={desc["profileImage"]} alt="" className="large-stocksDashboardBodyLineImg" />
                                            <div className="large-stocksDashboardBodyLineRank">
                                                <span className="large-stocksDashboardBodyLineDesc" style={{"textAlign": "center"}}>
                                                    {(index + 1 + (dashboardState["index"] * visibleElementsCount))}
                                                </span>
                                            </div>
                                            <div className="large-stocksDashboardBodyLineName">
                                                <span className="large-stocksDashboardBodyLineDesc">{desc["name"]}</span>
                                            </div>
                                            <div className="large-stocksDashboardBodyLineFigure"
                                                    style={props.f_viewPort === "small" ? 
                                                        {
                                                            "width": "calc(100% - 45px - 70px - 25% - 40px)", "minWidth": "calc(100% - 45px - 70px - 25% - 40px)", "maxWidth": "calc(100% - 45px - 70px - 25% - 40px)"
                                                        } : {}
                                                    }
                                                >
                                                {props.f_viewPort === "small" ? 
                                                    <>
                                                        <span className="large-stocksDashboardBodyLineFigureDescOne">
                                                            {`$${generalOpx.formatLargeFigures(desc["marketCap"], 2)}`}
                                                        </span>
                                                        <span className="large-stocksDashboardBodyLineFigureDescTwo" 
                                                                style={desc["changePerc"] >= 0 ? {"color": "var(--primary-green-09)"} : {"color": "var(--primary-red-09)"}}
                                                            >
                                                            {desc["changePerc"] >= 0 ?
                                                                <ArrowDropUp className="large-stocksDashboardBodyLineFigureDescTwoGreenIcon"/> :
                                                                <ArrowDropUp className="large-stocksDashboardBodyLineFigureDescTwoGreenIcon" style={{"color": "var(--primary-red-09)", "rotate": "180deg"}}/>
                                                            }
                                                            {`${generalOpx.formatFigures.format(Math.abs(desc["changePerc"] * 100))}%`}
                                                        </span>
                                                    </> : 
                                                    <span className="large-stocksDashboardBodyLineDesc">
                                                        {`$${generalOpx.formatLargeFigures(desc["marketCap"], 2)}`}
                                                    </span>
                                                }
                                            </div>
                                            {props.f_viewPort === "small" ? 
                                                null : 
                                                <div className="large-stocksDashboardBodyLineFigure">
                                                    <span className="large-stocksDashboardBodyLineFigureDescOne">
                                                        {`$${generalOpx.formatFigures.format(desc["close"])}` }
                                                    </span>
                                                    <span className="large-stocksDashboardBodyLineFigureDescTwo" 
                                                            style={desc["changePerc"] >= 0 ? {"color": "var(--primary-green-09)"} : {"color": "var(--primary-red-09)"}}
                                                        >
                                                        {desc["changePerc"] >= 0 ?
                                                            <ArrowDropUp className="large-stocksDashboardBodyLineFigureDescTwoGreenIcon"/> :
                                                            <ArrowDropUp className="large-stocksDashboardBodyLineFigureDescTwoGreenIcon" style={{"color": "var(--primary-red-09)", "rotate": "180deg"}}/>
                                                        }
                                                        {`${generalOpx.formatFigures.format(Math.abs(desc["changePerc"] * 100))}%`}
                                                    </span>
                                                </div>
                                            }
                                        </button>
                                    </div>
                                ))
                            }
                        </>
                    }
                </div>
                <div className="large-stocksDashboardBodyUnderline">
                    {/*
                    <div className="large-stocksDashboardUnderlineDesc">
                        Ranked By: Market Cap
                    </div>
                    */}
                    {visibleElementsCount === 0 ?
                        null :
                        <div className="large-stocksDashboardBodyDisplayToggler">
                            {Math.ceil(50 / visibleElementsCount) >= 8 ?
                                <button className="priceHistory-TranslateBtn"
                                        onClick={() => dashboardIndexUpdate("back", undefined)}
                                    >
                                    <ChevronLeft className="priceHistory-TranslateBtnIcon" />
                                </button> : null
                            }
                            <div className="priceHistory-translateOptnsInnerContainer"
                                    style={Math.ceil(50 / visibleElementsCount) >= 8 ?
                                        {} : {"marginLeft": "auto"}
                                    }
                                >
                                {Math.ceil(50 / visibleElementsCount) <= 8 ?
                                    <>
                                        {Array(Math.ceil(50 / visibleElementsCount)).fill(0).map((e, i) => (
                                                <button className="priceHistory-translateOptnBtn" 
                                                        key={`dashboard-stock-index-key-${i}`}
                                                        onClick={() => dashboardIndexUpdate("set", i)}
                                                        style={i === dashboardState["index"] ?
                                                            {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                        }
                                                    >
                                                    {i + 1}
                                                </button>
                                            ))
                                        }
                                    </> : 
                                    <>
                                        {dashboardState["index"] === 0 || dashboardState["index"] === 1 || dashboardState["index"] === 2 ?
                                            <>
                                                {Array(Math.ceil(50 / visibleElementsCount)).fill(0).map((e, i) => {
                                                        if(i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) {
                                                            return <button className="priceHistory-translateOptnBtn" 
                                                                    key={`dashboard-stock-index-key-${i}`}
                                                                    onClick={() => dashboardIndexUpdate("set", i)}
                                                                    style={i === dashboardState["index"] ?
                                                                        {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                                    }
                                                                >
                                                                {i + 1}
                                                            </button>
                                                        } else if(i === (Math.ceil(50 / visibleElementsCount) - 2)) {
                                                            return <button className="priceHistory-translateOptnBtn" 
                                                                    key={`dashboard-stock-index-key-${i}`}
                                                                >
                                                                ...
                                                            </button>
                                                        } else if(i === (Math.ceil(50 / visibleElementsCount) - 1)) {
                                                            return <button className="priceHistory-translateOptnBtn" 
                                                                    key={`dashboard-stock-index-key-${i}`}
                                                                    onClick={() => dashboardIndexUpdate("set", i)}
                                                                    style={i === dashboardState["index"] ?
                                                                        {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                                    }
                                                                >
                                                                {i + 1}
                                                            </button>
                                                        }
                                                    })
                                                }
                                            </> : 
                                            <>
                                                {dashboardState["index"] >= (Math.ceil(50 / visibleElementsCount) - 5) ?
                                                    <>
                                                        {Array(Math.ceil(50 / visibleElementsCount)).fill(0).map((e, i) => {
                                                                if(i === Math.ceil(50 / visibleElementsCount) - 1 
                                                                    || i === Math.ceil(50 / visibleElementsCount) - 2 
                                                                    || i === Math.ceil(50 / visibleElementsCount) - 3 
                                                                    || i === Math.ceil(50 / visibleElementsCount) - 4 
                                                                    || i === Math.ceil(50 / visibleElementsCount) - 5 
                                                                    || i === Math.ceil(50 / visibleElementsCount) - 6
                                                                ) {
                                                                    return <button className="priceHistory-translateOptnBtn" 
                                                                            key={`dashboard-stock-index-key-${i}`}
                                                                            onClick={() => dashboardIndexUpdate("set", i)}
                                                                            style={i === dashboardState["index"] ?
                                                                                {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                                            }
                                                                        >
                                                                        {i + 1}
                                                                    </button>
                                                                } else if(i === 1) {
                                                                    return <button className="priceHistory-translateOptnBtn" 
                                                                            key={`dashboard-stock-index-key-${i}`}
                                                                        >
                                                                        ...
                                                                    </button>
                                                                } else if(i === 0) {
                                                                    return <button className="priceHistory-translateOptnBtn" 
                                                                            key={`dashboard-stock-index-key-${i}`}
                                                                            onClick={() => dashboardIndexUpdate("set", i)}
                                                                            style={i === dashboardState["index"] ?
                                                                                {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                                            }
                                                                        >
                                                                        {i + 1}
                                                                    </button>
                                                                }
                                                            })
                                                        }
                                                    </> : 
                                                    <>
                                                        {Array(Math.ceil(50 / visibleElementsCount)).fill(0).map((e, i) => {
                                                                if(i === dashboardState["index"] - 1 
                                                                    || i === dashboardState["index"] 
                                                                    || i === dashboardState["index"] + 1 
                                                                    || i === dashboardState["index"] + 2
                                                                ) {
                                                                    return <button className="priceHistory-translateOptnBtn" 
                                                                            key={`dashboard-stock-index-key-${i}`}
                                                                            onClick={() => dashboardIndexUpdate("set", i)}
                                                                            style={i === dashboardState["index"] ?
                                                                                {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                                            }
                                                                        >
                                                                        {i + 1}
                                                                    </button>
                                                                } else if(i === 1 || i === Math.ceil(50 / visibleElementsCount) - 2) {
                                                                    return <button className="priceHistory-translateOptnBtn" 
                                                                            key={`dashboard-stock-index-key-${i}`}
                                                                        >
                                                                        ...
                                                                    </button>
                                                                } else if(i === 0 || i === Math.ceil(50 / visibleElementsCount) - 1) {
                                                                    return <button className="priceHistory-translateOptnBtn" 
                                                                            key={`dashboard-stock-index-key-${i}`}
                                                                            onClick={() => dashboardIndexUpdate("set", i)}
                                                                            style={i === dashboardState["index"] ?
                                                                                {"color": "var(--primary-bg-01)", "boxShadow": "0px 0px 2px var(--primary-bg-05)"} : {}
                                                                            }
                                                                        >
                                                                        {i + 1}
                                                                    </button>
                                                                }
                                                            })
                                                        }
                                                    </>
                                                }
                                            </>
                                        }
                                    </>
                                }
                            </div>
                            {Math.ceil(50 / visibleElementsCount) >= 8 ?
                                <button className="priceHistory-TranslateBtn"
                                        onClick={() => dashboardIndexUpdate("forward", undefined)}
                                    >
                                    <ChevronRight className="priceHistory-TranslateBtnIcon" />
                                </button> : null
                            }
                        </div>
                    }
                </div>
                <div className="asset-dashboardEarningsCalendarContainer"
                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                    >
                    <div className="asset-dashboardTodayOverviewDataContainer" style={{"marginTop": "0px"}}>
                        <div className="asset-dashboardTodayOverviewDataInnerContainer">
                            <div className="asset-dashboardTodayOverviewDataTopDesc">Total Cap.</div>
                            <div className="asset-dashboardTodayOverviewDataUnderDesc">
                                {marketOverview["page"] !== "cryptos"
                                    || marketOverview["overview"]["dataLoading"] ?
                                    <span className="asset-dashboardTodayOverviewUnderDescLoading"/> : 
                                    `$${generalOpx.formatLargeFigures(marketOverview["overview"]["data"]["totMarketCap"], 2)}`
                                }
                            </div>
                        </div>
                        <div className="asset-dashboardTodayOverviewDataInnerContainerDivider"/>
                        <div className="asset-dashboardTodayOverviewDataInnerContainer"
                                style={{"alignItems": "center"}}
                            >
                            <div className="asset-dashboardTodayOverviewDataTopDesc" style={{"marginLeft": "-10px"}}>Total Vol.</div>
                            <div className="asset-dashboardTodayOverviewDataUnderDesc">
                                {marketOverview["page"] !== "cryptos"
                                    || marketOverview["overview"]["dataLoading"] ?
                                    <span className="asset-dashboardTodayOverviewUnderDescLoadingv1"/> : 
                                    `${generalOpx.formatLargeFigures(marketOverview["overview"]["data"]["totVolume"], 2)}`
                                }
                            </div>
                        </div>
                        <div className="asset-dashboardTodayOverviewDataInnerContainerDivider"/>
                        <div className="asset-dashboardTodayOverviewDataInnerContainer">
                            <div className="asset-dashboardTodayOverviewDataTopDesc" style={{"marginLeft": "auto", "marginRight": "47px"}}>
                                {marketOverview["overview"]["data"]["totGainLoss"] >= 0 ?
                                    `Gain` : `Loss`
                                }
                            </div>
                            <div className="asset-dashboardTodayOverviewDataUnderDesc" style={{"marginLeft": "auto"}}>
                                {marketOverview["page"] !== "cryptos"
                                    || marketOverview["overview"]["dataLoading"] ?
                                    <span className="asset-dashboardTodayOverviewUnderDescLoading"/> : 
                                    `$${generalOpx.formatLargeFigures(Math.abs(marketOverview["overview"]["data"]["totGainLoss"]), 1)}`
                                }
                            </div>
                        </div>
                    </div>
                    <div className="asset-dashboardFearGreedIndexnOtherDataContainer">
                        <div className="asset-dashboardFearGreedIndexCont">
                            {marketOverview["page"] !== "cryptos"
                                    || marketOverview["overview"]["dataLoading"] ?
                                <div className="asset-dashboardFearGreedIndexChartLoading"/> : 
                                <FearGreedGuage plotData={[Math.round(marketOverview["overview"]["data"]["fearGreedIndex"]), 100 - Math.round(marketOverview["overview"]["data"]["fearGreedIndex"])]} />
                            }
                        </div>
                        <div className="asset-dashboardFGOtherDataContainer">
                            <div className="asset-dashboardFGOtherDataLine" 
                                    style={{
                                        "marginTop": "-5px",
                                        "color": marketOverview["overview"]["data"]["totGainLoss"] >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"
                                    }}
                                >
                                {marketOverview["page"] !== "cryptos"
                                    || marketOverview["overview"]["dataLoading"] ?
                                    <span className="asset-dashboardTodayOverviewUnderDescLoadingv2"/> : 
                                    `${generalOpx.formatFigures.format(Math.abs(marketOverview["overview"]["data"]["totGainLoss"] / marketOverview["overview"]["data"]["totMarketCap"]) * 100)}%`
                                }
                            </div>
                            <div className="asset-dashboardFGOtherDataLineUnderDesc" style={{"marginBottom": "15px"}}>
                                {marketOverview["overview"]["data"]["totGainLoss"] >= 0 ?
                                    `Capitalization Gain` : `Capitalization Loss`
                                }
                            </div>
                            <div className="asset-dashboardFGOtherDataLine">
                                {marketOverview["page"] !== "cryptos"
                                    || marketOverview["overview"]["dataLoading"] ?
                                    <span className="asset-dashboardTodayOverviewUnderDescLoadingv2"/> : 
                                    <>
                                        {marketOverview["overview"]["data"]["fearGreedIndex"] <= 20 ?
                                            <span style={{"color": "var(--primary-red-09)"}}>Extreme Fear</span> : 
                                            <>
                                                {marketOverview["overview"]["data"]["fearGreedIndex"] <= 40 ?
                                                    <span style={{"color": "#E9692D"}}>Pessimistic</span> : 
                                                    <>
                                                        {marketOverview["overview"]["data"]["fearGreedIndex"] <= 60 ?
                                                            <span style={{"color": "var(--primary-amber-09)"}}>Neutral</span> :
                                                            <>
                                                                {marketOverview["overview"]["data"]["fearGreedIndex"] <= 80 ?
                                                                    <span style={{"color": "#90A644"}}>Optimistic</span> :
                                                                    <span style={{"color": "var(--primary-green-09)"}}>Extreme Greed</span>
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
                            <div className="asset-dashboardFGOtherDataLineUnderDesc">Sentimental Outlook</div>
                        </div>
                    </div>
                </div>
                <div className="assetMainPageNewsContainer"
                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                    >
                    <div className="large-stocksNewsHeaderContainer"
                            style={{"height": "25px", "minHeight": "25px", "maxHeight": "25px"}}
                        >
                        <div className="large-stocksNewsHeader">News</div>
                    </div>

                    {dashboardNews["news"]["dataLoading"] || dashboardNews["news"]["data"].length === 0 ||
                        (dashboardNews["news"]["data"].length <= dashboardNews["index"]) ?
                        <>
                            <div className="assets-dashboardNewsContainer">
                                <div className="asset-dashboardNewsElementFirst">
                                    <MiniaturizedNews loading={true}/>
                                </div>
                                <div className="asset-dashboardNewsElementSecond">
                                    <MiniaturizedNews loading={true}/>
                                </div>
                            </div>
                            <div className="assets-dashboardNewsDivider">
                                <div className="assets-dashboardNewsDividerOne"/>
                                <div className="assets-dashboardNewsDividerTwo"/>
                            </div>
                            <div className="assets-dashboardNewsContainerSecond">
                                <div className="asset-dashboardNewsElementFirst">
                                    <MiniaturizedNews loading={true}/>
                                </div>
                                <div className="asset-dashboardNewsElementSecond">
                                    <MiniaturizedNews loading={true}/>
                                </div>
                            </div>
                        </> : 
                        <>
                            <div className="assets-dashboardNewsContainer">
                                <div className="asset-dashboardNewsElementFirst">
                                    <MiniaturizedNews  
                                        loading={false}
                                        type={"stock_dashboardPage"}
                                        pred_ticker={"C"}
                                        width={contentBodyWidth[0]}
                                        width_index={0}
                                        user={user ? user.user : "visitor"}
                                        desc={dashboardNews["news"]["data"][dashboardNews["index"]][0]}
                                    />
                                </div>
                                <div className="asset-dashboardNewsElementSecond">
                                    <MiniaturizedNews  
                                        loading={false}
                                        type={"stock_dashboardPage"}
                                        pred_ticker={"C"}
                                        width={contentBodyWidth[0]}
                                        width_index={1}
                                        user={user ? user.user : "visitor"}
                                        desc={dashboardNews["news"]["data"][dashboardNews["index"]][1]}
                                    />
                                </div>
                            </div>
                            <div className="assets-dashboardNewsDivider">
                                <div className="assets-dashboardNewsDividerOne"/>
                                <div className="assets-dashboardNewsDividerTwo"/>
                            </div>
                            <div className="assets-dashboardNewsContainerSecond">
                                <div className="asset-dashboardNewsElementFirst">
                                    <MiniaturizedNews  
                                        loading={false}
                                        type={"stock_dashboardPage"}
                                        pred_ticker={"C"}
                                        width={contentBodyWidth[0]}
                                        width_index={2}
                                        user={user ? user.user : "visitor"}
                                        desc={dashboardNews["news"]["data"][dashboardNews["index"]][2]}
                                    />
                                </div>
                                <div className="asset-dashboardNewsElementSecond">
                                    <MiniaturizedNews  
                                        loading={false}
                                        type={"stock_dashboardPage"}
                                        pred_ticker={"C"}
                                        width={contentBodyWidth[0]}
                                        width_index={3}
                                        user={user ? user.user : "visitor"}
                                        desc={dashboardNews["news"]["data"][dashboardNews["index"]][3]}
                                    />
                                </div>
                            </div>
                        </>
                    }
                    <div className="finulab-tradingActivityLatestTxRecordsContainer" style={{"marginTop": "10px"}}>
                        {dashboardNews["index"] + 1} | {dashboardNews["news"]["data"].length}
                        <div className="large-stocksNewsViewToggleInnerContainer"
                                style={{}}
                            >
                            <button className="asset-congressTxsViewMoreToggleBtn" 
                                    onClick={() => updateDashboardNewsView("back")}
                                    style={dashboardNews["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
                                >
                                <ChevronLeft className="large-stocksNewsViewToggleOutlineIcon"/>
                            </button>
                            <div className="large-stocksNewsViewToggleOutlineDivider" 
                                style={{
                                    "marginLeft": "10px", "marginRight": "10px",
                                    "height": "10px", "minHeight": "10px", "maxHeight": "10px"
                                }}
                            />
                            <button className="asset-congressTxsViewMoreToggleBtn" 
                                    disabled={dashboardNewsBeingUpdated || (dashboardNews["news"]["data"].length <= dashboardNews["index"])}
                                    onClick={() => updateDashboardNewsView("forward")}
                                    style={{"display": "flex"}}
                                >
                                <ChevronRight className="large-stocksNewsViewToggleOutlineIcon"/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="asset-dashboardEarningsCalendarContainer"
                        style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                    >
                    <div className="large-stocksNewsHeaderContainer"
                            style={{"height": "25px", "minHeight": "25px", "maxHeight": "25px"}}
                        >
                        <div className="large-stocksNewsHeader">Dominance</div>
                    </div>
                    <div className="asset-dashboardDominanceAnalyticsContainer">
                        {selectedView === "" ?
                            <div className="recommendation-GraphUpdateOptnsContainerLoading" style={{"marginTop": "0px", "marginBottom": "21px"}} /> : 
                            <div className="recommendation-GraphUpdateOptnsContainer"
                                    style={{"marginTop": "0px", "marginBottom": "21px", "transform": `translateX(${secondaryTranslate})`}}
                                >
                                <div className="recommendation-GraphUpdateOptnsInnerContainer"
                                        style={{"width": `${updateWidth}`, "minWidth": `${updateWidth}`, "maxWidth": `${updateWidth}`}}
                                    >
                                    <button className="recommendation-GraphUpdateOptnsViewBtn"
                                            onClick={() => updateTradingActivitySlider(selectedView)}
                                        >
                                        <DisplaySettings className="recommendation-GraphUpdateOptnsViewBtnIcon"/>
                                    </button>
                                    <div className="recommendation-GraphUpdateOptnsViewSeperator"/>
                                    <div className="recommendation-GraphUpdateOptnsActButnsContainer">
                                        <div className="recommendation-GraphUpdateOptnsActButnsInnerContainer"
                                                style={{"transform": `translateX(${updateInnerTranslate})`}}
                                            >
                                            <button className="asset-tradingActivityViewSliderBtn"
                                                    style={{"marginRight": "23.25px"}}
                                                    onClick={() => submitSelectedViewToSlider(selectedView, "gainLoss")}
                                                >
                                                Gain-Loss
                                            </button>
                                            <button className="asset-tradingActivityViewSliderBtn"
                                                    style={{"marginRight": "23.25px"}}
                                                    onClick={() => submitSelectedViewToSlider(selectedView, "volume")}
                                                >
                                                Volume
                                            </button>
                                            <button className="asset-tradingActivityViewSliderBtn"
                                                    onClick={() => submitSelectedViewToSlider(selectedView, "marketCap")}
                                                >
                                                Market Cap
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="finulab-tradingActivityChartandTableWrapper"
                                style={{"height": "600px", "minHeight": "600px", "maxHeight": "600px"}}
                            >
                            <div className="finulab-tradingActivityChartandTableContainer"
                                    style={selectedView === "" ? {} : {"transform": `translateX(${selectedViewSliderLeft})`}}
                                >
                                {selectedView === "" ?
                                    <div className="finulab-tradingActivityChartandTableInsideContainer">
                                        <div className="finulab-tradingActivityChartWrapperLoading"/>
                                    </div> : 
                                    <>
                                        <div className="finulab-tradingActivityChartandTableInsideContainer">
                                            <div className="finulab-tradingActivityChartWrapper">
                                                {marketOverview["topFiftyGL"]["dataLoading"] ?
                                                    null :
                                                    <DominanceChart
                                                        type={"GL"}
                                                        totalMarketCap={marketOverview["overview"]["data"]["totGainLoss"]}
                                                        plotLabels={marketOverview["topFiftyGL"]["data"].map(topTenDesc => topTenDesc.symbol).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                        plotDominanceData={marketOverview["topFiftyGL"]["data"].map(topTenDesc => topTenDesc.dominance_gainLoss).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                        plotMarketCapSupport={marketOverview["topFiftyGL"]["data"].map(topTenDesc => topTenDesc.gainLoss).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                    />
                                                }
                                            </div>
                                            <div className="finulab-tradingActivityChartTableContainer">
                                                <div className="asset-congressTxsTableContainer">
                                                    <div className="asset-congressTxsTableSupport"
                                                        >
                                                        <div className="asset-congressTxsTableHeaderContainer">
                                                            <div className="asset-congressTxsTableHeaderNamev7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Name</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderStockv7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Market Cap</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Dominance</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Volume</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Change-%</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Gain-Loss</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Price</p>
                                                            </div>
                                                        </div>
                                                        {marketOverview["topFiftyGL"]["dataLoading"] ?
                                                            <>
                                                                {Array(5).fill("").map((a, b) => (
                                                                        <div className="asset-congressTxsTableHeaderContainer"
                                                                                style={b === 4 ? {"borderBottom": "none"} : {}}
                                                                            >
                                                                            <div className="asset-congressTxsTableHeaderNamev7"
                                                                                    style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                >
                                                                                <div className="home-topHoldersLineImgLoading"/>
                                                                                <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                                    <span className="asset-contressTxsToplineDescLoading"/>
                                                                                    <span className="asset-contressTxsUnderlineDescLoading"/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderStockv7"
                                                                                    style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                >
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </> : 
                                                            <>
                                                                {marketOverview["topFiftyGL"]["data"].length > 0 ?
                                                                    <>
                                                                        {marketOverview["topFiftyGL"]["data"].slice(5 * marketOverview["topFiftyGL"]["index"], 5 * (marketOverview["topFiftyGL"]["index"] + 1)).map((txData, index) => (
                                                                                <button className={props.f_viewPort === "small" ? "small-stocksDashboardBodyLineBtn" : "large-stocksDashboardBodyLineBtn"}
                                                                                        onClick={() => navigate(`/cryptos/C:-${txData.symbol}`)}
                                                                                    >
                                                                                    <div className="asset-congressTxsTableHeaderContainer"
                                                                                            style={index === 4 ? {"borderBottom": "none"} : {}}
                                                                                        >
                                                                                        <div className="asset-congressTxsTableHeaderNamev7"
                                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                            >
                                                                                            <img src={txData.profileImage} alt="" className="home-topHoldersLineImg" />
                                                                                            <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                                                <p className="asset-TopHoldersTableHeaderDesc" style={{"color": "var(--primary-bg-01)"}}>{txData.symbol}</p>
                                                                                                <div className="asset-congressTxsTableBodyUnderDesc">
                                                                                                    {txData.name}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderStockv7"
                                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                            >
                                                                                            <div className="asset-congressTxsTableBodyDescColumnContainerV1">
                                                                                                <p className="asset-congressTxsTableBodyTopDesc">
                                                                                                    {generalOpx.formatLargeFigures(txData.marketCap, 2)}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc">
                                                                                                {generalOpx.formatFigures.format(txData.dominance_volume)}%
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                                    style={{"textAlign": "right"}}
                                                                                                >
                                                                                                {generalOpx.formatLargeFigures(txData.volume, 2)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                                    style={{"textAlign": "right", "color": txData.change >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"}}
                                                                                                >
                                                                                                {generalOpx.formatFigures.format(txData.changePerc * 100)}%
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc"
                                                                                                    style={{"textAlign": "right", "color": txData.change >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"}}
                                                                                                >
                                                                                                ${generalOpx.formatLargeFigures(Math.abs(txData.changePerc * txData.marketCap), 2)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>${generalOpx.formatFigures.format(txData.close)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </button>
                                                                            ))
                                                                        }
                                                                    </> : 
                                                                    <div className="finulab-tradingActivityTableNoData"
                                                                            style={{"width": `${contentBodyWidth[0]}px`, "minWidth": `${contentBodyWidth[0]}px`, "maxWidth": `${contentBodyWidth[0]}px`}}
                                                                        >
                                                                        <DataObject
                                                                            style={{
                                                                                "color": "var(--primary-bg-05)",
                                                                                "transform": "scale(2.5)"
                                                                            }}
                                                                        />
                                                                        <div
                                                                                style={{
                                                                                    "marginTop": "20px",
                                                                                    "fontWeight": "500",
                                                                                    "fontSize": "1rem",
                                                                                    "color": "var(--primary-bg-05)"
                                                                                }}
                                                                            >
                                                                            No Market Cap Overview.
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {marketOverview["topFiftyGL"]["dataLoading"] ?
                                                null : 
                                                <>
                                                    {marketOverview["topFiftyGL"]["data"].length > 0 
                                                        && marketOverview["topFiftyGL"]["data"].length > 5 ?
                                                        <div className="finulab-tradingActivityLatestTxRecordsContainer">
                                                            {marketOverview["topFiftyGL"]["index"] + 1} | {Math.ceil(marketOverview["topFiftyGL"]["data"].length / 5)}
                                                            <div className="large-stocksNewsViewToggleInnerContainer"
                                                                    style={{}}
                                                                >
                                                                <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                        disabled={disableNavTMOGL}
                                                                        onClick={() => navigateThroughMarketOverviewByGainLoss("back")}
                                                                        style={marketOverview["topFiftyGL"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
                                                                    >
                                                                    <ChevronLeft className="large-stocksNewsViewToggleOutlineIcon"/>
                                                                </button>
                                                                <div className="large-stocksNewsViewToggleOutlineDivider" 
                                                                    style={{
                                                                        "marginLeft": "10px", "marginRight": "10px",
                                                                        "height": "10px", "minHeight": "10px", "maxHeight": "10px"
                                                                    }}
                                                                />
                                                                <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                        disabled={disableNavTMOGL}
                                                                        onClick={() => navigateThroughMarketOverviewByGainLoss("forward")}
                                                                        style={marketOverview["topFiftyGL"]["index"] + 1 === Math.ceil(marketOverview["topFiftyGL"]["data"].length / 5) ? {"display": "none"} : {"display": "flex"}}
                                                                    >
                                                                    <ChevronRight className="large-stocksNewsViewToggleOutlineIcon"/>
                                                                </button>
                                                            </div>
                                                        </div> : 
                                                        <div className="finulab-tradingActivityLatestTxRecordsContainer">1 | 1</div>
                                                    }
                                                </>
                                            }
                                            <div className="asset-marketOverviewDominanceUnderlineDescContainer">
                                                <div className="asset-earningsCalendaryKeyContainer">
                                                    Key:&nbsp;&nbsp;&nbsp;
                                                    <PieChart
                                                        style={{
                                                            "color": "var(--primary-amber-09)", 
                                                            "maxWidth": "14px",
                                                            "maxHeight": "14px"
                                                        }}
                                                    />&nbsp;Top 50% of Stock Market By Gain-Loss
                                                </div>
                                                <div className="asset-earningsCalendaryKeyContainer" style={{"marginTop": "5px"}}>
                                                    Dominance percentages aggregated and calculated every minute.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="finulab-tradingActivityChartandTableInsideContainer">
                                            <div className="finulab-tradingActivityChartWrapper">
                                                {marketOverview["topFiftyVol"]["dataLoading"] ?
                                                    null :
                                                    <DominanceChart 
                                                        type={"VOL"}
                                                        totalMarketCap={marketOverview["overview"]["data"]["totVolume"]}
                                                        plotLabels={marketOverview["topFiftyVol"]["data"].map(topTenDesc => topTenDesc.symbol).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                        plotDominanceData={marketOverview["topFiftyVol"]["data"].map(topTenDesc => topTenDesc.dominance_volume).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                        plotMarketCapSupport={marketOverview["topFiftyVol"]["data"].map(topTenDesc => topTenDesc.volume).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                    />
                                                }
                                            </div>
                                            <div className="finulab-tradingActivityChartTableContainer">
                                                <div className="asset-congressTxsTableContainer">
                                                    <div className="asset-congressTxsTableSupport"
                                                        >
                                                        <div className="asset-congressTxsTableHeaderContainer">
                                                            <div className="asset-congressTxsTableHeaderNamev7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Name</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderStockv7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Market Cap</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Dominance</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Volume</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Change-%</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Gain-Loss</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Price</p>
                                                            </div>
                                                        </div>
                                                        {marketOverview["topFiftyVol"]["dataLoading"] ?
                                                            <>
                                                                {Array(5).fill("").map((a, b) => (
                                                                        <div className="asset-congressTxsTableHeaderContainer"
                                                                                style={b === 4 ? {"borderBottom": "none"} : {}}
                                                                            >
                                                                            <div className="asset-congressTxsTableHeaderNamev7"
                                                                                    style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                >
                                                                                <div className="home-topHoldersLineImgLoading"/>
                                                                                <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                                    <span className="asset-contressTxsToplineDescLoading"/>
                                                                                    <span className="asset-contressTxsUnderlineDescLoading"/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderStockv7"
                                                                                    style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                >
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </> : 
                                                            <>
                                                                {marketOverview["topFiftyVol"]["data"].length > 0 ?
                                                                    <>
                                                                        {marketOverview["topFiftyVol"]["data"].slice(5 * marketOverview["topFiftyVol"]["index"], 5 * (marketOverview["topFiftyVol"]["index"] + 1)).map((txData, index) => (
                                                                                <button className={props.f_viewPort === "small" ? "small-stocksDashboardBodyLineBtn" : "large-stocksDashboardBodyLineBtn"}
                                                                                        onClick={() => navigate(`/cryptos/C:-${txData.symbol}`)}
                                                                                    >
                                                                                    <div className="asset-congressTxsTableHeaderContainer"
                                                                                            style={index === 4 ? {"borderBottom": "none"} : {}}
                                                                                        >
                                                                                        <div className="asset-congressTxsTableHeaderNamev7"
                                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                            >
                                                                                            <img src={txData.profileImage} alt="" className="home-topHoldersLineImg" />
                                                                                            <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                                                <p className="asset-TopHoldersTableHeaderDesc" style={{"color": "var(--primary-bg-01)"}}>{txData.symbol}</p>
                                                                                                <div className="asset-congressTxsTableBodyUnderDesc">
                                                                                                    {txData.name}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderStockv7"
                                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                            >
                                                                                            <div className="asset-congressTxsTableBodyDescColumnContainerV1">
                                                                                                <p className="asset-congressTxsTableBodyTopDesc">
                                                                                                    {generalOpx.formatLargeFigures(txData.marketCap, 2)}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc">
                                                                                                {generalOpx.formatFigures.format(txData.dominance_volume)}%
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                                    style={{"textAlign": "right"}}
                                                                                                >
                                                                                                {generalOpx.formatLargeFigures(txData.volume, 2)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                                    style={{"textAlign": "right", "color": txData.change >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"}}
                                                                                                >
                                                                                                {generalOpx.formatFigures.format(txData.changePerc * 100)}%
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc"
                                                                                                    style={{"textAlign": "right", "color": txData.change >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"}}
                                                                                                >
                                                                                                ${generalOpx.formatLargeFigures(Math.abs(txData.changePerc * txData.marketCap), 2)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>${generalOpx.formatFigures.format(txData.close)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </button>
                                                                            ))
                                                                        }
                                                                    </> : 
                                                                    <div className="finulab-tradingActivityTableNoData"
                                                                            style={{"width": `${contentBodyWidth[0]}px`, "minWidth": `${contentBodyWidth[0]}px`, "maxWidth": `${contentBodyWidth[0]}px`}}
                                                                        >
                                                                        <DataObject 
                                                                            style={{
                                                                                "color": "var(--primary-bg-05)",
                                                                                "transform": "scale(2.5)"
                                                                            }}
                                                                        />
                                                                        <div
                                                                                style={{
                                                                                    "marginTop": "20px",
                                                                                    "fontWeight": "500",
                                                                                    "fontSize": "1rem",
                                                                                    "color": "var(--primary-bg-05)"
                                                                                }}
                                                                            >
                                                                            No Market Cap Overview.
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {marketOverview["topFiftyVol"]["dataLoading"] ?
                                                null : 
                                                <>
                                                    {marketOverview["topFiftyVol"]["data"].length > 0 
                                                        && marketOverview["topFiftyVol"]["data"].length > 5 ?
                                                        <div className="finulab-tradingActivityLatestTxRecordsContainer">
                                                            {marketOverview["topFiftyVol"]["index"] + 1} | {Math.ceil(marketOverview["topFiftyVol"]["data"].length / 5)}
                                                            <div className="large-stocksNewsViewToggleInnerContainer"
                                                                    style={{}}
                                                                >
                                                                <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                        disabled={disableNavTMOV}
                                                                        onClick={() => navigateThroughMarketOverviewByVolume("back")}
                                                                        style={marketOverview["topFiftyVol"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
                                                                    >
                                                                    <ChevronLeft className="large-stocksNewsViewToggleOutlineIcon"/>
                                                                </button>
                                                                <div className="large-stocksNewsViewToggleOutlineDivider" 
                                                                    style={{
                                                                        "marginLeft": "10px", "marginRight": "10px",
                                                                        "height": "10px", "minHeight": "10px", "maxHeight": "10px"
                                                                    }}
                                                                />
                                                                <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                        disabled={disableNavTMOV}
                                                                        onClick={() => navigateThroughMarketOverviewByVolume("forward")}
                                                                        style={marketOverview["topFiftyVol"]["index"] + 1 === Math.ceil(marketOverview["topFiftyVol"]["data"].length / 5) ? {"display": "none"} : {"display": "flex"}}
                                                                    >
                                                                    <ChevronRight className="large-stocksNewsViewToggleOutlineIcon"/>
                                                                </button>
                                                            </div>
                                                        </div> : 
                                                        <div className="finulab-tradingActivityLatestTxRecordsContainer">1 | 1</div>
                                                    }
                                                </>
                                            }
                                            <div className="asset-marketOverviewDominanceUnderlineDescContainer">
                                                <div className="asset-earningsCalendaryKeyContainer">
                                                    Key:&nbsp;&nbsp;&nbsp;
                                                    <PieChart 
                                                        style={{
                                                            "color": "var(--primary-amber-09)", 
                                                            "maxWidth": "14px",
                                                            "maxHeight": "14px"
                                                        }}
                                                    />&nbsp;Top 70% of Stock Market By Volume
                                                </div>
                                                <div className="asset-earningsCalendaryKeyContainer" style={{"marginTop": "5px"}}>
                                                    Dominance percentages aggregated and calculated every minute.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="finulab-tradingActivityChartandTableInsideContainer">
                                            <div className="finulab-tradingActivityChartWrapper">
                                                {marketOverview["topFiftyMC"]["dataLoading"] ?
                                                    null :
                                                    <DominanceChart 
                                                        type={"MC"}
                                                        totalMarketCap={marketOverview["overview"]["data"]["totMarketCap"]}
                                                        plotLabels={marketOverview["topFiftyMC"]["data"].map(topTenDesc => topTenDesc.symbol).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                        plotDominanceData={marketOverview["topFiftyMC"]["data"].map(topTenDesc => topTenDesc.dominance_marketCap).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                        plotMarketCapSupport={marketOverview["topFiftyMC"]["data"].map(topTenDesc => topTenDesc.marketCap).slice(0, Math.ceil((25 / 390) * contentBodyWidth[0]))}
                                                    />
                                                }
                                            </div>
                                            <div className="finulab-tradingActivityChartTableContainer">
                                                <div className="asset-congressTxsTableContainer">
                                                    <div className="asset-congressTxsTableSupport"
                                                        >
                                                        <div className="asset-congressTxsTableHeaderContainer">
                                                            <div className="asset-congressTxsTableHeaderNamev7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Name</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderStockv7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Market Cap</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Dominance</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Volume</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Change-%</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Gain-Loss</p>
                                                            </div>
                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                <p className="asset-TopHoldersTableHeaderDesc">Price</p>
                                                            </div>
                                                        </div>
                                                        {marketOverview["topFiftyMC"]["dataLoading"] ?
                                                            <>
                                                                {Array(5).fill("").map((a, b) => (
                                                                        <div className="asset-congressTxsTableHeaderContainer"
                                                                                style={b === 4 ? {"borderBottom": "none"} : {}}
                                                                            >
                                                                            <div className="asset-congressTxsTableHeaderNamev7"
                                                                                    style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                >
                                                                                <div className="home-topHoldersLineImgLoading"/>
                                                                                <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                                    <span className="asset-contressTxsToplineDescLoading"/>
                                                                                    <span className="asset-contressTxsUnderlineDescLoading"/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderStockv7"
                                                                                    style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                >
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                            <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </> : 
                                                            <>
                                                                {marketOverview["topFiftyMC"]["data"].length > 0 ?
                                                                    <>
                                                                        {marketOverview["topFiftyMC"]["data"].slice(5 * marketOverview["topFiftyMC"]["index"], 5 * (marketOverview["topFiftyMC"]["index"] + 1)).map((txData, index) => (
                                                                                <button className={props.f_viewPort === "small" ? "small-stocksDashboardBodyLineBtn" : "large-stocksDashboardBodyLineBtn"}
                                                                                        onClick={() => navigate(`/cryptos/C:-${txData.symbol}`)}
                                                                                    >
                                                                                    <div className="asset-congressTxsTableHeaderContainer"
                                                                                            style={index === 4 ? {"borderBottom": "none"} : {}}
                                                                                        >
                                                                                        <div className="asset-congressTxsTableHeaderNamev7"
                                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                            >
                                                                                            <img src={txData.profileImage} alt="" className="home-topHoldersLineImg" />
                                                                                            <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                                                <p className="asset-TopHoldersTableHeaderDesc" style={{"color": "var(--primary-bg-01)"}}>{txData.symbol}</p>
                                                                                                <div className="asset-congressTxsTableBodyUnderDesc">
                                                                                                    {txData.name}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderStockv7"
                                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                            >
                                                                                            <div className="asset-congressTxsTableBodyDescColumnContainerV1">
                                                                                                <p className="asset-congressTxsTableBodyTopDesc">
                                                                                                    {generalOpx.formatLargeFigures(txData.marketCap, 2)}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeDatev7">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc">
                                                                                                {generalOpx.formatFigures.format(txData.dominance_marketCap)}%
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                                    style={{"textAlign": "right"}}
                                                                                                >
                                                                                                {generalOpx.formatLargeFigures(txData.volume, 2)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                                    style={{"textAlign": "right", "color": txData.change >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"}}
                                                                                                >
                                                                                                {generalOpx.formatFigures.format(txData.changePerc * 100)}%
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc"
                                                                                                    style={{"textAlign": "right", "color": txData.change >= 0 ? "var(--primary-green-09)" : "var(--primary-red-09)"}}
                                                                                                >
                                                                                                ${generalOpx.formatLargeFigures(Math.abs(txData.changePerc * txData.marketCap), 2)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="asset-congressTxsTableHeaderTradeRest">
                                                                                            <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>${generalOpx.formatFigures.format(txData.close)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </button>
                                                                            ))
                                                                        }
                                                                    </> : 
                                                                    <div className="finulab-tradingActivityTableNoData"
                                                                            style={{"width": `${contentBodyWidth[0]}px`, "minWidth": `${contentBodyWidth[0]}px`, "maxWidth": `${contentBodyWidth[0]}px`}}
                                                                        >
                                                                        <DataObject 
                                                                            style={{
                                                                                "color": "var(--primary-bg-05)",
                                                                                "transform": "scale(2.5)"
                                                                            }}
                                                                        />
                                                                        <div
                                                                                style={{
                                                                                    "marginTop": "20px",
                                                                                    "fontWeight": "500",
                                                                                    "fontSize": "1rem",
                                                                                    "color": "var(--primary-bg-05)"
                                                                                }}
                                                                            >
                                                                            No Market Cap Overview.
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {marketOverview["topFiftyMC"]["dataLoading"] ?
                                                null : 
                                                <>
                                                    {marketOverview["topFiftyMC"]["data"].length > 0 
                                                        && marketOverview["topFiftyMC"]["data"].length > 5 ?
                                                        <div className="finulab-tradingActivityLatestTxRecordsContainer">
                                                            {marketOverview["topFiftyMC"]["index"] + 1} | {Math.ceil(marketOverview["topFiftyMC"]["data"].length / 5)}
                                                            <div className="large-stocksNewsViewToggleInnerContainer"
                                                                    style={{}}
                                                                >
                                                                <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                        disabled={disableNavTMOMC}
                                                                        onClick={() => navigateThroughMarketOverviewByMC("back")}
                                                                        style={marketOverview["topFiftyMC"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
                                                                    >
                                                                    <ChevronLeft className="large-stocksNewsViewToggleOutlineIcon"/>
                                                                </button>
                                                                <div className="large-stocksNewsViewToggleOutlineDivider" 
                                                                    style={{
                                                                        "marginLeft": "10px", "marginRight": "10px",
                                                                        "height": "10px", "minHeight": "10px", "maxHeight": "10px"
                                                                    }}
                                                                />
                                                                <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                        disabled={disableNavTMOMC}
                                                                        onClick={() => navigateThroughMarketOverviewByMC("forward")}
                                                                        style={marketOverview["topFiftyMC"]["index"] + 1 === Math.ceil(marketOverview["topFiftyMC"]["data"].length / 5) ? {"display": "none"} : {"display": "flex"}}
                                                                    >
                                                                    <ChevronRight className="large-stocksNewsViewToggleOutlineIcon"/>
                                                                </button>
                                                            </div>
                                                        </div> : 
                                                        <div className="finulab-tradingActivityLatestTxRecordsContainer">1 | 1</div>
                                                    }
                                                </>
                                            }
                                            <div className="asset-marketOverviewDominanceUnderlineDescContainer">
                                                <div className="asset-earningsCalendaryKeyContainer">
                                                    Key:&nbsp;&nbsp;&nbsp;
                                                    <PieChart 
                                                        style={{
                                                            "color": "var(--primary-amber-09)", 
                                                            "maxWidth": "14px",
                                                            "maxHeight": "14px"
                                                        }}
                                                    />&nbsp;Top 50% of Stock Market By Market Cap
                                                </div>
                                                <div className="asset-earningsCalendaryKeyContainer" style={{"marginTop": "5px"}}>
                                                    Dominance percentages aggregated and calculated every minute.
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="asset-dashboardEarningsCalendarContainer">
                    <div className="large-stocksNewsHeaderContainer"
                            style={{"height": "25px", "minHeight": "25px", "maxHeight": "25px"}}
                        >
                        <div className="large-stocksNewsHeader">Congress</div>
                    </div>
                    <div className="finulab-tradingActivityChartTableContainer" style={{"marginTop": "0px"}}>
                        <div className="asset-congressTxsTableContainer">
                            <div className="asset-congressTxsTableSupport">
                                <div className="asset-congressTxsTableHeaderContainer">
                                    <div className="asset-congressTxsTableHeaderName">
                                        <p className="asset-TopHoldersTableHeaderDesc">Member</p>
                                    </div>
                                    <div className="asset-congressTxsTableHeaderStock">
                                        <p className="asset-TopHoldersTableHeaderDesc">Stock</p>
                                    </div>
                                    <div className="asset-congressTxsTableHeaderTradeDate">
                                        <p className="asset-TopHoldersTableHeaderDesc">Traded</p>
                                    </div>
                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                        <p className="asset-TopHoldersTableHeaderDesc">Owner</p>
                                    </div>
                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                        <p className="asset-TopHoldersTableHeaderDesc">Type</p>
                                    </div>
                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                        <p className="asset-TopHoldersTableHeaderDesc">Size</p>
                                    </div>
                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                        <p className="asset-TopHoldersTableHeaderDesc">Price</p>
                                    </div>
                                </div>
                                {dashboardTradingActivity["congress"]["dataLoading"] ?
                                    <>
                                        {Array(5).fill("").map((a, b) => (
                                                <div className="asset-congressTxsTableHeaderContainer"
                                                        style={b === 4 ? {"borderBottom": "none"} : {}}
                                                    >
                                                    <div className="asset-congressTxsTableHeaderName"
                                                            style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                        >
                                                        <div className="home-topHoldersLineImgLoading"/>
                                                        <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                            <span className="asset-contressTxsToplineDescLoading"/>
                                                            <span className="asset-contressTxsUnderlineDescLoading"/>
                                                        </div>
                                                    </div>
                                                    <div className="asset-congressTxsTableHeaderStock"
                                                            style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                        >
                                                        <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                    </div>
                                                    <div className="asset-congressTxsTableHeaderTradeDate">
                                                        <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                    </div>
                                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                                        <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                    </div>
                                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                                        <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                    </div>
                                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                                        <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                    </div>
                                                    <div className="asset-congressTxsTableHeaderTradeRest">
                                                        <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </> : 
                                    <>
                                        {dashboardTradingActivity["congress"]["data"].length > 0 ?
                                            <>
                                                {dashboardTradingActivity["congress"]["data"].slice(5 * dashboardTradingActivity["congress"]["index"], 5 * (dashboardTradingActivity["congress"]["index"] + 1)).map((txData, index) => (
                                                        <button className={props.f_viewPort === "small" ? "small-stocksDashboardBodyLineBtn" : "large-stocksDashboardBodyLineBtn"}
                                                                onClick={() => navigate(`/cryptos/C:-${txData.symbol}`)}
                                                            >
                                                            <div className="asset-congressTxsTableHeaderContainer"
                                                                    style={index === 4 ? {"borderBottom": "none"} : {}}
                                                                >
                                                                <div className="asset-congressTxsTableHeaderName"
                                                                        style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                    >
                                                                    <img src={txData.image} alt="" className="home-topHoldersLineImg" />
                                                                    <div className="asset-congressTxsTableBodyDescColumnContainerV0">
                                                                        <p className="asset-TopHoldersTableHeaderDesc" style={{"color": "var(--primary-bg-01)"}}>{txData.name}</p>
                                                                        <div className="asset-congressTxsTableBodyUnderDesc">
                                                                            {Array.isArray(txData.desc) ? 
                                                                                <>
                                                                                    {txData.desc.map((inner_capDesc, index) => (
                                                                                            `${inner_capDesc}${index === txData.desc.length - 1 ? `` : ` • `}`
                                                                                        ))
                                                                                    }
                                                                                </> : `-`
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="asset-congressTxsTableHeaderStock"
                                                                        style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                    >
                                                                    <div className="asset-congressTxsTableBodyDescColumnContainerV1">
                                                                        <p className="asset-congressTxsTableBodyTopDesc">{txData.symbol}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="asset-congressTxsTableHeaderTradeDate">
                                                                    <p className="asset-congressTxsTableBodyTopDesc">{txData.traded}</p>
                                                                </div>
                                                                <div className="asset-congressTxsTableHeaderTradeRest">
                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>{txData.owner}</p>
                                                                </div>
                                                                <div className="asset-congressTxsTableHeaderTradeRest">
                                                                    <p className="asset-congressTxsTableBodyTopDesc" 
                                                                            style={{"textAlign": "right", "color": txData.type === "buy" ? "var(--primary-green-09)" : txData.type === "sell" ? "var(--primary-red-09)" : "var(--primary-bg-01)"}}
                                                                        >
                                                                        {txData.type}
                                                                    </p>
                                                                </div>
                                                                <div className="asset-congressTxsTableHeaderTradeRest">
                                                                    <p className="asset-congressTxsTableBodyTopDesc"
                                                                            style={{"textAlign": "right", "color": txData.type === "buy" ? "var(--primary-green-09)" : txData.type === "sell" ? "var(--primary-red-09)" : "var(--primary-bg-01)"}}
                                                                        >
                                                                        ${generalOpx.formatLargeFigures(txData.sizeLower)} - ${generalOpx.formatLargeFigures(txData.sizeHigher)}
                                                                    </p>
                                                                </div>
                                                                <div className="asset-congressTxsTableHeaderTradeRest">
                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>${generalOpx.formatFigures.format(txData.price)}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                }
                                            </> : 
                                            <div className="finulab-tradingActivityTableNoData"
                                                    style={{"width": `${props.width}px`, "minWidth": `${props.width}px`, "maxWidth": `${props.width}px`}}
                                                >
                                                <DataObject 
                                                    style={{
                                                        "color": "var(--primary-bg-05)",
                                                        "transform": "scale(2.5)"
                                                    }}
                                                />
                                                <div
                                                        style={{
                                                            "marginTop": "20px",
                                                            "fontWeight": "500",
                                                            "fontSize": "1rem",
                                                            "color": "var(--primary-bg-05)"
                                                        }}
                                                    >
                                                    No Trading Data for Congress.
                                                </div>
                                            </div>
                                        }
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    {dashboardTradingActivity["congress"]["dataLoading"] ?
                        null : 
                        <>
                            {dashboardTradingActivity["congress"]["data"].length > 0 
                                && dashboardTradingActivity["congress"]["dataCount"] > 5 ?
                                <div className="finulab-tradingActivityLatestTxRecordsContainer" style={{"marginTop": "5px"}}>
                                    {dashboardTradingActivity["congress"]["index"] + 1} | {Math.ceil(dashboardTradingActivity["congress"]["dataCount"] / 5)}
                                    <div className="large-stocksNewsViewToggleInnerContainer"
                                            style={{}}
                                        >
                                        <button className="asset-congressTxsViewMoreToggleBtn" 
                                                disabled={disableCongressNav}
                                                onClick={() => navigateThroughCongressTxs("back")}
                                                style={dashboardTradingActivity["congress"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
                                            >
                                            <ChevronLeft className="large-stocksNewsViewToggleOutlineIcon"/>
                                        </button>
                                        <div className="large-stocksNewsViewToggleOutlineDivider" 
                                            style={{
                                                "marginLeft": "10px", "marginRight": "10px",
                                                "height": "10px", "minHeight": "10px", "maxHeight": "10px"
                                            }}
                                        />
                                        <button className="asset-congressTxsViewMoreToggleBtn" 
                                                disabled={disableCongressNav}
                                                onClick={() => navigateThroughCongressTxs("forward")}
                                                style={dashboardTradingActivity["congress"]["index"] + 1 === Math.ceil(dashboardTradingActivity["congress"]["dataCount"] / 5) ? {"display": "none"} : {"display": "flex"}}
                                            >
                                            <ChevronRight className="large-stocksNewsViewToggleOutlineIcon"/>
                                        </button>
                                    </div>
                                </div> : 
                                <div className="finulab-tradingActivityLatestTxRecordsContainer">1 | 1</div>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    )
}