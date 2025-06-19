import { ChevronLeft, ChevronRight, DataObject, DisplaySettings } from '@mui/icons-material';
import './tradingActivity.css';

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import TradingActivityGraph from './tradingActivityChart';
import generalOpx from '../../functions/generalFunctions';
import {updateAll_forTradingActivity, setCongress, setInsider, setInstitution, selectTradingActivity} from '../../reduxStore/tradingActivity';

export default function AssetTradingActivity(props) {
    const dispatch = useDispatch();
    const tradingActivityState = useSelector(selectTradingActivity);

    const [selectedView, setSelectedView] = useState("");
    const [selectedViewSliderLeft, setSelectedViewSliderLeft] = useState("0px");

    const [updateWidth, setUpdateWidth] = useState("116px");
    const [secondaryTranslate, setSecondaryTranslate] = useState("0px");
    const [updateInnerTranslate, setUpdateInnerTranslate] = useState("0px");

    const updateTradingActivitySlider = (type) => {
        updateWidth === "325px" ? setUpdateWidth("116px") : setUpdateWidth("325px");
        if(updateWidth === "325px") {
            type === "congress" ? setUpdateInnerTranslate("0px") : type === "institution" ? setUpdateInnerTranslate("calc(-80px - 23.25px)") : setUpdateInnerTranslate("calc(-2 * (80px + 23.25px))");
        } else {setUpdateInnerTranslate("0px");}
    }

    const submitSelectedViewToSlider = (from, to) => {
        if(from === to) {
            updateTradingActivitySlider(from);
        } else {
            updateTradingActivitySlider(to);

            setSelectedView(to);
            if(to === "congress") {
                setSelectedViewSliderLeft("0px");
            } else if(to === "institution") {
                setSelectedViewSliderLeft("calc(-100% - 10px)");
            } else {
                setSelectedViewSliderLeft("calc(-200% - 20px)");
            }
        }
    }

    const sort_qoq_desc = (input) => {
        const sortedObject = Object.keys(input).sort(
            (a, b) => {
                const [quarterA, yearA] = a.split('-');
                const [quarterB, yearB] = b.split('-');

                const yearANum = parseInt(yearA);
                const yearBNum = parseInt(yearB);

                const quarterANum = parseInt(quarterA.replace('Q', ''));
                const quarterBNum = parseInt(quarterB.replace('Q', ''));

                if(yearANum !== yearBNum) {
                    return yearANum - yearBNum;
                }

                return quarterANum - quarterBNum;
            }
        ).reduce(
            (obj, key) => {
                obj[key] = input[key];
                return obj;
            }, {}
        );

        return sortedObject;
    }

    const [insiderData, setInsiderData] = useState([]);
    const [congressData, setCongressData] = useState([]);
    const [institutionData, setInstitutionData] = useState([]);
    useEffect(() => {
        if(!(props.asset === null || props.asset === undefined ||
                props.qoq_desc === null || props.qoq_desc === undefined
            )
        ) {
            const sortedData = sort_qoq_desc(props.qoq_desc);
            const qoq_outline = Object.keys(sortedData);

            let sum_congress = 0;
            let insiderDataFunction_buys = [], congressDataFunction_buys = [], institutionDataFunction_buys = [];
            let insiderDataFunction_sells = [], congressDataFunction_sells = [], institutionDataFunction_sells = [];
            let insiderDataFunction_labels = [], congressDataFunction_labels = [], institutionDataFunction_labels = [];

            for(let i = 0; i < qoq_outline.length; i++) {
                sum_congress = props.qoq_desc[qoq_outline[i]]["capitol"]["buys"] + props.qoq_desc[qoq_outline[i]]["capitol"]["sells"];

                insiderDataFunction_labels.push(qoq_outline[i]);
                congressDataFunction_labels.push(qoq_outline[i]);

                insiderDataFunction_buys.push(props.qoq_desc[qoq_outline[i]]["insiders"]["buys"]);
                congressDataFunction_buys.push(props.qoq_desc[qoq_outline[i]]["capitol"]["buys"]);

                insiderDataFunction_sells.push(props.qoq_desc[qoq_outline[i]]["insiders"]["sells"]);
                congressDataFunction_sells.push(props.qoq_desc[qoq_outline[i]]["capitol"]["sells"]);

                if(props.qoq_desc[qoq_outline[i]]["institutional"]["buys"] + props.qoq_desc[qoq_outline[i]]["institutional"]["sells"] > 0) {
                    institutionDataFunction_labels.push(qoq_outline[i]);

                    institutionDataFunction_buys.push(props.qoq_desc[qoq_outline[i]]["institutional"]["buys"]);
                    institutionDataFunction_sells.push(props.qoq_desc[qoq_outline[i]]["institutional"]["sells"]);
                }
            }

            setInsiderData([insiderDataFunction_labels, insiderDataFunction_buys, insiderDataFunction_sells]);
            setCongressData([congressDataFunction_labels, congressDataFunction_buys, congressDataFunction_sells]);
            setInstitutionData([institutionDataFunction_labels, institutionDataFunction_buys, institutionDataFunction_sells]);

            const setUpTradingActivityView = async () => {
                await generalOpx.axiosInstance.put(`/stock-market-data/latest-trading-activity`, 
                    {
                        "type": "individual",
                        "goal": "primary",
                        "market": `${props.asset}`.slice(0, 1) === "S" ? "stock" : "crypto",
                        "symbol": `${props.asset}`.slice(3, `${props.asset}`.length),
                        "ninclude": []
                    }
                ).then(
                    async (response) => {
                        if(response.data["status"] === "success") {
                            dispatch(
                                updateAll_forTradingActivity(
                                    {
                                        "symbol": props.asset,
                                        "congress": {
                                            "index": 0,
                                            "data": response.data["congress"]["data"],
                                            "dataCount": response.data["congress"]["dataCount"],
                                            "dataLoading": false
                                        },
                                        "institution": {
                                            "index": 0,
                                            "data": response.data["institution"]["data"],
                                            "dataCount": response.data["institution"]["dataCount"],
                                            "dataLoading": false
                                        },
                                        "insider": {
                                            "index": 0,
                                            "data": response.data["insider"]["data"],
                                            "dataCount": response.data["insider"]["dataCount"],
                                            "dataLoading": false
                                        }
                                    }
                                )
                            );
                        } else {
                            dispatch(
                                updateAll_forTradingActivity(
                                    {
                                        "symbol": props.asset,
                                        "congress": {
                                            "index": 0,
                                            "data": [],
                                            "dataCount": 0,
                                            "dataLoading": false
                                        },
                                        "institution": {
                                            "index": 0,
                                            "data": [],
                                            "dataCount": 0,
                                            "dataLoading": false
                                        },
                                        "insider": {
                                            "index": 0,
                                            "data": [],
                                            "dataCount": 0,
                                            "dataLoading": false
                                        }
                                    }
                                )
                            );
                        }
                    }
                ).catch(
                    () => {
                        dispatch(
                            updateAll_forTradingActivity(
                                {
                                    "symbol": props.asset,
                                    "congress": {
                                        "index": 0,
                                        "data": [],
                                        "dataCount": 0,
                                        "dataLoading": false
                                    },
                                    "institution": {
                                        "index": 0,
                                        "data": [],
                                        "dataCount": 0,
                                        "dataLoading": false
                                    },
                                    "insider": {
                                        "index": 0,
                                        "data": [],
                                        "dataCount": 0,
                                        "dataLoading": false
                                    }
                                }
                            )
                        );
                    }
                )
            }

            if(tradingActivityState["symbol"] !== props.asset ||
                tradingActivityState["congress"]["dataLoading"]
            ) {
                setUpTradingActivityView();
            }
            
            if(sum_congress > 0) {
                setSelectedView("congress");
                setUpdateInnerTranslate("0px");

                setSelectedViewSliderLeft("0px");
            } else {
                setSelectedView("institution"); 
                setUpdateInnerTranslate("calc(-80px - 23.25px)");

                setSelectedViewSliderLeft("calc(-100% - 10px)");
            }
        }
    }, [props.asset]);

    const [disableCongressNav, setDisableCongressNav] = useState(false);
    const navigateThroughCongressTxs = async (type) => {
        setDisableCongressNav(true);
        const currentIndex = tradingActivityState["congress"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setCongress(
                        {
                            "index": currentIndex - 1,
                            "data": tradingActivityState["congress"]["data"],
                            "dataCount": tradingActivityState["congress"]["dataCount"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(tradingActivityState["congress"]["dataCount"] / 5);

            if(currentIndex < limit) {
                const availableNowLimit = Math.ceil(tradingActivityState["congress"]["data"].length / 5);
                if(availableNowLimit - (currentIndex + 1) < 2) {
                    let ninclude_funct = [];
                    for(let i = 0; i < tradingActivityState["congress"]["data"].length; i++) {
                        ninclude_funct.push(tradingActivityState["congress"]["data"][i]["_id"]);
                    }

                    await generalOpx.axiosInstance.put(`/stock-market-data/congress-txs`, 
                        {
                            "market": `${props.asset}`.slice(0, 1) === "S" ? "stock" : "crypto",
                            "symbol": `${props.asset}`.slice(3, `${props.asset}`.length),
                            "ninclude": ninclude_funct
                        }
                    ).then(
                        async (response) => {
                            if(response.data["status"] === "success") {
                                dispatch(
                                    setCongress(
                                        {
                                            "index": currentIndex + 1,
                                            "data": [...tradingActivityState["congress"]["data"], ...response.data["data"]],
                                            "dataCount": tradingActivityState["congress"]["dataCount"],
                                            "dataLoading": false
                                        }
                                    )
                                );
                            }
                        }
                    );
                } else {
                    dispatch(
                        setCongress(
                            {
                                "index": currentIndex + 1,
                                "data": tradingActivityState["congress"]["data"],
                                "dataCount": tradingActivityState["congress"]["dataCount"],
                                "dataLoading": false
                            }
                        )
                    );
                }
            }
        }

        setDisableCongressNav(false);
    }

    const [disableInstitutionNav, setDisableInstitutionNav] = useState(false);
    const navigateThroughInstitutionTxs = async (type) => {
        setDisableInstitutionNav(true);
        const currentIndex = tradingActivityState["institution"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setInstitution(
                        {
                            "index": currentIndex - 1,
                            "data": tradingActivityState["institution"]["data"],
                            "dataCount": tradingActivityState["institution"]["dataCount"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(tradingActivityState["institution"]["dataCount"] / 5);

            if(currentIndex < limit) {
                const availableNowLimit = Math.ceil(tradingActivityState["institution"]["data"].length / 5);
                if(availableNowLimit - (currentIndex + 1) < 2) {
                    let ninclude_funct = [];
                    for(let i = 0; i < tradingActivityState["institution"]["data"].length; i++) {
                        ninclude_funct.push(tradingActivityState["institution"]["data"][i]["_id"]);
                    }

                    await generalOpx.axiosInstance.put(`/stock-market-data/institutions-txs`, 
                        {
                            "symbol": `${props.asset}`.slice(3, `${props.asset}`.length),
                            "ninclude": ninclude_funct
                        }
                    ).then(
                        async (response) => {
                            if(response.data["status"] === "success") {
                                dispatch(
                                    setInstitution(
                                        {
                                            "index": currentIndex + 1,
                                            "data": [...tradingActivityState["institution"]["data"], ...response.data["data"]],
                                            "dataCount": tradingActivityState["institution"]["dataCount"],
                                            "dataLoading": false
                                        }
                                    )
                                );
                            }
                        }
                    );
                } else {
                    dispatch(
                        setInstitution(
                            {
                                "index": currentIndex + 1,
                                "data": tradingActivityState["institution"]["data"],
                                "dataCount": tradingActivityState["institution"]["dataCount"],
                                "dataLoading": false
                            }
                        )
                    );
                }
            }
        }

        setDisableInstitutionNav(false);
    }

    const [disableInsiderNav, setDisableInsiderNav] = useState(false);
    const navigateThroughInsiderTxs = async (type) => {
        setDisableInsiderNav(true);
        const currentIndex = tradingActivityState["insider"]["index"];

        if(type === "back") {
            if(currentIndex > 0) {
                dispatch(
                    setInsider(
                        {
                            "index": currentIndex - 1,
                            "data": tradingActivityState["insider"]["data"],
                            "dataCount": tradingActivityState["insider"]["dataCount"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "forward") {
            const limit = Math.ceil(tradingActivityState["insider"]["dataCount"] / 5);

            if(currentIndex < limit) {
                const availableNowLimit = Math.ceil(tradingActivityState["insider"]["data"].length / 5);
                if(availableNowLimit - (currentIndex + 1) < 2) {
                    let ninclude_funct = [];
                    for(let i = 0; i < tradingActivityState["insider"]["data"].length; i++) {
                        ninclude_funct.push(tradingActivityState["insider"]["data"][i]["_id"]);
                    }

                    await generalOpx.axiosInstance.put(`/stock-market-data/insider-txs`, 
                        {
                            "symbol": `${props.asset}`.slice(3, `${props.asset}`.length),
                            "ninclude": ninclude_funct
                        }
                    ).then(
                        async (response) => {
                            if(response.data["status"] === "success") {
                                dispatch(
                                    setInsider(
                                        {
                                            "index": currentIndex + 1,
                                            "data": [...tradingActivityState["insider"]["data"], ...response.data["data"]],
                                            "dataCount": tradingActivityState["insider"]["dataCount"],
                                            "dataLoading": false
                                        }
                                    )
                                );
                            }
                        }
                    );
                } else {
                    dispatch(
                        setInsider(
                            {
                                "index": currentIndex + 1,
                                "data": tradingActivityState["insider"]["data"],
                                "dataCount": tradingActivityState["insider"]["dataCount"],
                                "dataLoading": false
                            }
                        )
                    );
                }
            }
        }

        setDisableInsiderNav(false);
    }

    return(
        <div className="finulab-tradingActivityWrapper">
            <div className="large-stocksPageMoreDataAboutTitle">
                {`${props.asset}`.slice(0, 1) === "C" ? `Congress` : `Trading Activity`}
            </div>
            {`${props.asset}`.slice(0, 1) === "C" ?
                null : 
                <>
                    {selectedView === "" ?
                        <div className="recommendation-GraphUpdateOptnsContainerLoading" style={{"marginTop": "10px", "marginBottom": "21px"}} /> : 
                        <div className="recommendation-GraphUpdateOptnsContainer"
                                style={{"marginTop": "10px", "marginBottom": "21px", "transform": `translateX(${secondaryTranslate})`}}
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
                                                onClick={() => submitSelectedViewToSlider(selectedView, "congress")}
                                            >
                                            Congress
                                        </button>
                                        <button className="asset-tradingActivityViewSliderBtn"
                                                style={{"marginRight": "23.25px"}}
                                                onClick={() => submitSelectedViewToSlider(selectedView, "institution")}
                                            >
                                            Institutions
                                        </button>
                                        <button className="asset-tradingActivityViewSliderBtn"
                                                onClick={() => submitSelectedViewToSlider(selectedView, "insider")}
                                            >
                                            Insiders
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </>
            }
            <div className="finulab-tradingActivityChartandTableWrapper">
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
                                    <TradingActivityGraph 
                                        asset={""}
                                        plotLabels={congressData[0]}
                                        plotBuysData={congressData[1]}
                                        plotSellsData={congressData[2]}
                                    />
                                </div>
                                <div className="finulab-tradingActivityChartTableContainer">
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
                                            {tradingActivityState["congress"]["dataLoading"] ?
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
                                                    {tradingActivityState["congress"]["data"].length > 0 ?
                                                        <>
                                                            {tradingActivityState["congress"]["data"].slice(5 * tradingActivityState["congress"]["index"], 5 * (tradingActivityState["congress"]["index"] + 1)).map((txData, index) => (
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
                                {tradingActivityState["congress"]["dataLoading"] ?
                                    null : 
                                    <>
                                        {tradingActivityState["congress"]["data"].length > 0 
                                            && tradingActivityState["congress"]["dataCount"] > 5 ?
                                            <div className="finulab-tradingActivityLatestTxRecordsContainer">
                                                {tradingActivityState["congress"]["index"] + 1} | {Math.ceil(tradingActivityState["congress"]["dataCount"] / 5)}
                                                <div className="large-stocksNewsViewToggleInnerContainer"
                                                        style={{}}
                                                    >
                                                    <button className="asset-congressTxsViewMoreToggleBtn" 
                                                            disabled={disableCongressNav}
                                                            onClick={() => navigateThroughCongressTxs("back")}
                                                            style={tradingActivityState["congress"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
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
                                                            style={tradingActivityState["congress"]["index"] + 1 === Math.ceil(tradingActivityState["congress"]["dataCount"] / 5) ? {"display": "none"} : {"display": "flex"}}
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
                            
                            {`${props.asset}`.slice(0, 1) === "C" ?
                                null : 
                                <>
                                    <div className="finulab-tradingActivityChartandTableInsideContainer">
                                        <div className="finulab-tradingActivityChartWrapper">
                                            <TradingActivityGraph 
                                                asset={""}
                                                plotLabels={institutionData[0]}
                                                plotBuysData={institutionData[1]}
                                                plotSellsData={institutionData[2]}
                                            />
                                        </div>
                                        <div className="finulab-tradingActivityChartTableContainer">
                                            <div className="asset-congressTxsTableContainer">
                                                <div className="asset-congressTxsTableSupport"
                                                        style={{"minWidth": "715px"}}
                                                    >
                                                    <div className="asset-congressTxsTableHeaderContainer">
                                                        <div className="asset-congressTxsTableHeaderName">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Owner</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderStock">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Date</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Shares Held</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv2">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Type</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Share Change</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Value</p>
                                                        </div>
                                                    </div>
                                                    {tradingActivityState["institution"]["dataLoading"] ?
                                                        <>
                                                            {Array(5).fill("").map((a, b) => (
                                                                    <div className="asset-congressTxsTableHeaderContainer"
                                                                            style={b === 4 ? {"borderBottom": "none"} : {}}
                                                                        >
                                                                        <div className="asset-congressTxsTableHeaderName"
                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                            >
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderStock"
                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                            >
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv2">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </> : 
                                                        <>
                                                            {tradingActivityState["institution"]["data"].length > 0 ?
                                                                <>
                                                                    {tradingActivityState["institution"]["data"].slice(5 * tradingActivityState["institution"]["index"], 5 * (tradingActivityState["institution"]["index"] + 1)).map((txData, index) => (
                                                                            <div className="asset-congressTxsTableHeaderContainer"
                                                                                    style={index === 4 ? {"borderBottom": "none"} : {}}
                                                                                >
                                                                                <div className="asset-congressTxsTableHeaderName"
                                                                                        style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                    >
                                                                                    <p className="asset-congressTxsTableBodyTopDesc">{txData.ownerName}</p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderStock"
                                                                                        style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                    >
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>{txData.txDate}</p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>
                                                                                        {generalOpx.formatLargeFigures(txData.sharesHeld, 3)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv2">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                            style={{"textAlign": "right", "color": txData.sharesChange >= 0 ? "var(--primary-green-09)" :"var(--primary-red-09)"}}
                                                                                        >
                                                                                        {txData.sharesChange >= 0 ? "Buy" : "Sell"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc"
                                                                                            style={{"textAlign": "right", "color": txData.sharesChange >= 0 ? "var(--primary-green-09)" :"var(--primary-red-09)"}}
                                                                                        >
                                                                                        {generalOpx.formatLargeFigures(Math.abs(txData.sharesChange), 3)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv1">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>
                                                                                        ${generalOpx.formatLargeFigures(txData.marketValue)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
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
                                                                        No Trading Data for Institutions.
                                                                    </div>
                                                                </div>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {tradingActivityState["institution"]["dataLoading"] ? 
                                            null :
                                            <>
                                                {tradingActivityState["institution"]["data"].length > 0
                                                    && tradingActivityState["institution"]["dataCount"] > 5 ?
                                                    <div className="finulab-tradingActivityLatestTxRecordsContainer">
                                                        {tradingActivityState["institution"]["index"] + 1} | {Math.ceil(tradingActivityState["institution"]["dataCount"] / 5)}
                                                        <div className="large-stocksNewsViewToggleInnerContainer"
                                                                style={{}}
                                                            >
                                                            <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                    disabled={disableInstitutionNav}
                                                                    onClick={() => navigateThroughInstitutionTxs("back")}
                                                                    style={tradingActivityState["institution"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
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
                                                                    disabled={disableInstitutionNav}
                                                                    onClick={() => navigateThroughInstitutionTxs("forward")}
                                                                    style={tradingActivityState["institution"]["index"] + 1 === Math.ceil(tradingActivityState["institution"]["dataCount"] / 5) ? {"display": "none"} : {"display": "flex"}}
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
                                    <div className="finulab-tradingActivityChartandTableInsideContainer">
                                        <div className="finulab-tradingActivityChartWrapper">
                                            <TradingActivityGraph 
                                                asset={""}
                                                plotLabels={insiderData[0]}
                                                plotBuysData={insiderData[1]}
                                                plotSellsData={insiderData[2]}
                                            />
                                        </div>
                                        <div className="finulab-tradingActivityChartTableContainer">
                                            <div className="asset-congressTxsTableContainer">
                                                <div className="asset-congressTxsTableSupport"
                                                        style={{"minWidth": "850px"}}
                                                    >
                                                    <div className="asset-congressTxsTableHeaderContainer">
                                                        <div className="asset-congressTxsTableHeaderNamev2">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Insider</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderStock">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Date</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeDate">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Role</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Shares Held</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv4">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Type</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Shares Traded</p>
                                                        </div>
                                                        <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                            <p className="asset-TopHoldersTableHeaderDesc">Market Value</p>
                                                        </div>
                                                    </div>
                                                    {tradingActivityState["insider"]["dataLoading"] ?
                                                        <>
                                                            {Array(5).fill("").map((a, b) => (
                                                                    <div className="asset-congressTxsTableHeaderContainer"
                                                                            style={b === 4 ? {"borderBottom": "none"} : {}}
                                                                        >
                                                                        <div className="asset-congressTxsTableHeaderNamev2"
                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                            >
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderStock"
                                                                                style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                            >
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeDate">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv4">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                        <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                                            <span className="asset-TopHoldersTableHeaderDescLoading"/>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </> : 
                                                        <>
                                                            {tradingActivityState["insider"]["data"].length > 0 ?
                                                                <>
                                                                    {tradingActivityState["insider"]["data"].slice(5 * tradingActivityState["insider"]["index"], 5 * (tradingActivityState["insider"]["index"] + 1)).map((txData, index) => (
                                                                            <div className="asset-congressTxsTableHeaderContainer"
                                                                                    style={index === 4 ? {"borderBottom": "none"} : {}}
                                                                                >
                                                                                <div className="asset-congressTxsTableHeaderNamev2"
                                                                                        style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                    >
                                                                                    <p className="asset-congressTxsTableBodyTopDesc">{txData.insider}</p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderStock"
                                                                                        style={{"height": "56px", "minHeight": "56px", "maxHeight": "56px"}}
                                                                                    >
                                                                                    <div className="asset-congressTxsTableBodyDescColumnContainerV1">
                                                                                        <p className="asset-congressTxsTableBodyTopDesc">{txData.txDate}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeDate">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc">{txData.relation}</p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>
                                                                                        {generalOpx.formatLargeFigures(txData.sharesHeld, 3)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv4">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" 
                                                                                            style={{"textAlign": "center", "color": txData.transactionType === "Buy" ? "var(--primary-green-09)" : txData.transactionType === "Sell" ? "var(--primary-red-09)" : "var(--primary-bg-01)"}}
                                                                                        >
                                                                                        {txData.transactionType}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc"
                                                                                            style={{"textAlign": "right", "color": txData.transactionType === "Buy" ? "var(--primary-green-09)" : txData.transactionType === "Sell" ? "var(--primary-red-09)" : "var(--primary-bg-01)"}}
                                                                                        >
                                                                                        {generalOpx.formatLargeFigures(txData.sharesTraded)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="asset-congressTxsTableHeaderTradeRestv3">
                                                                                    <p className="asset-congressTxsTableBodyTopDesc" style={{"textAlign": "right"}}>
                                                                                        ${generalOpx.formatLargeFigures(txData.sharesHeld * txData.lastPrice)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
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
                                                                        No Trading Data for Insiders.
                                                                    </div>
                                                                </div>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {tradingActivityState["insider"]["dataLoading"] ? 
                                            null : 
                                            <>
                                                {tradingActivityState["insider"]["data"].length > 0
                                                    && tradingActivityState["insider"]["dataCount"] > 5 ?
                                                    <div className="finulab-tradingActivityLatestTxRecordsContainer">
                                                        {tradingActivityState["insider"]["index"] + 1} | {Math.ceil(tradingActivityState["insider"]["dataCount"] / 5)}
                                                        <div className="large-stocksNewsViewToggleInnerContainer"
                                                                style={{}}
                                                            >
                                                            <button className="asset-congressTxsViewMoreToggleBtn" 
                                                                    disabled={disableInsiderNav}
                                                                    onClick={() => navigateThroughInsiderTxs("back")}
                                                                    style={tradingActivityState["insider"]["index"] === 0 ? {"display": "none"} : {"display": "flex"}}
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
                                                                    disabled={disableInsiderNav}
                                                                    onClick={() => navigateThroughInsiderTxs("forward")}
                                                                    style={tradingActivityState["insider"]["index"] + 1 === Math.ceil(tradingActivityState["insider"]["dataCount"] / 5) ? {"display": "none"} : {"display": "flex"}}
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
                                </>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    )
}