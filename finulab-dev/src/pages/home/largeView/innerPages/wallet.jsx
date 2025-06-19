import {throttle} from 'lodash';
import {getUnixTime} from 'date-fns';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {useRef, useState, useLayoutEffect, useEffect, useCallback} from 'react';
import {AccountBalanceWallet, ArrowDropUp, ContentCopy, ExpandMoreSharp, ExploreSharp, PointOfSale, PriceCheckSharp, SendSharp, SouthSharp, Verified, WorkHistory} from '@mui/icons-material';

import generalOpx from '../../../../functions/generalFunctions';
import FinulabTxs from '../../../../components/miniaturized/activity/txs';
import BalanceChart from '../../../../components/balanceChart/balanceChart';
import FinulabChains from '../../../../components/miniaturized/activity/chains';
import MiniPortfolio from '../../../../components/miniaturized/portfolio/mini-portfolio';
import FinulabMarketActivity from '../../../../components/miniaturized/activity/activity';

import {selectUser} from '../../../../reduxStore/user';
import {selectWalletData} from '../../../../reduxStore/walletData';
import {selectMarketHoldings} from '../../../../reduxStore/marketHoldings';
import {setBalance, selectWalletDesc} from '../../../../reduxStore/walletDesc';
import {selectWalletRefreshCounter} from '../../../../reduxStore/walletRefreshCounter';
import {setClosed, setHistory, setTxs, selectWalletSupportData} from '../../../../reduxStore/walletSupportData';
import {updateWalletPageInformationState, selectPageInformationState} from '../../../../reduxStore/pageInformation';

export default function InnerWalletPage(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const appState = useSelector(selectPageInformationState);

    const ctx_height = 470;
    const now = new Date();
    const nowUnix = getUnixTime(now);

    const user = useSelector(selectUser);
    const walletDesc = useSelector(selectWalletDesc);
    const walletData = useSelector(selectWalletData);
    const u_marketHoldings = useSelector(selectMarketHoldings);
    const walletSupportData = useSelector(selectWalletSupportData);
    const walletRefreshCounter = useSelector(selectWalletRefreshCounter);

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
                const handleScrollWalletPage = (e) => {
                    let walletPageInformation = {...appState["wallet"]};

                    if(walletPageInformation["view"] === props.displayView) {
                        const c_scrollTopTest = document.documentElement.scrollTop >= ctx_height;
                        if(walletPageInformation["fixed"] !== c_scrollTopTest) {walletPageInformation["fixed"] = c_scrollTopTest;}
                        
                        if(props.displayView === "") {
                            walletPageInformation["scrollTop"] = document.documentElement.scrollTop;
                            
                            if(c_scrollTopTest) {
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["closedScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["historyScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["txsScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["chainsScrollTop"] = document.documentElement.scrollTop;
                            }
                        } else if(props.displayView === "closed") {
                            walletPageInformation["closedScrollTop"] = document.documentElement.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["historyScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["txsScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["chainsScrollTop"] = document.documentElement.scrollTop;
                            }
                        } else if(props.displayView === "history") {
                            walletPageInformation["historyScrollTop"] = document.documentElement.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["closedScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["txsScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["chainsScrollTop"] = document.documentElement.scrollTop;
                            }
                        } else if(props.displayView === "txs") {
                            walletPageInformation["txsScrollTop"] = document.documentElement.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["closedScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["historyScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["chainsScrollTop"] = document.documentElement.scrollTop;
                            }
                        } else if(props.displayView === "chains") {
                            walletPageInformation["chainsScrollTop"] = document.documentElement.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["closedScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["historyScrollTop"] = document.documentElement.scrollTop;
                                walletPageInformation["txsScrollTop"] = document.documentElement.scrollTop;
                            }
                        }
    
                        dispatch(
                            updateWalletPageInformationState(walletPageInformation)
                        );
                    } else {
                        walletPageInformation["view"] = props.displayView;
                        dispatch(
                            updateWalletPageInformationState(walletPageInformation)
                        );
                    }
                }
                
                const throttledHandleScrollWalletPage = throttle(handleScrollWalletPage, 50);
                document.addEventListener('scroll', throttledHandleScrollWalletPage, { passive: true });
                document.addEventListener('touchmove', handleScrollWalletPage, { passive: true });

                return () => {
                    document.removeEventListener('scroll', throttledHandleScrollWalletPage);
                    document.removeEventListener('touchmove', handleScrollWalletPage);
                };
            }
        }
    }, [contentBodyWidth, props.displayView, appState["wallet"]["view"], appState["wallet"]["fixed"]]);

    useEffect(() => {
        if(!(props.f_viewPort === "small")) {
            if(contentBodyWidth[1]) {
                const handleScrollWalletPage = (e) => {
                    let walletPageInformation = {...appState["wallet"]};

                    if(walletPageInformation["view"] === props.displayView) {
                        const c_scrollTopTest = scrollController.current.scrollTop >= ctx_height;
                        if(walletPageInformation["fixed"] !== c_scrollTopTest) {walletPageInformation["fixed"] = c_scrollTopTest;}
                        
                        if(props.displayView === "") {
                            walletPageInformation["scrollTop"] = scrollController.current.scrollTop;
                            
                            if(c_scrollTopTest) {
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["closedScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["historyScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["txsScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["chainsScrollTop"] = scrollController.current.scrollTop;
                            }
                        } else if(props.displayView === "closed") {
                            walletPageInformation["closedScrollTop"] = scrollController.current.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["historyScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["txsScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["chainsScrollTop"] = scrollController.current.scrollTop;
                            }
                        } else if(props.displayView === "history") {
                            walletPageInformation["historyScrollTop"] = scrollController.current.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["closedScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["txsScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["chainsScrollTop"] = scrollController.current.scrollTop;
                            }
                        } else if(props.displayView === "txs") {
                            walletPageInformation["txsScrollTop"] = scrollController.current.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["chainsScrollTop"] < ctx_height) {walletPageInformation["chainsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["closedScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["historyScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["chainsScrollTop"] = scrollController.current.scrollTop;
                            }
                        } else if(props.displayView === "chains") {
                            walletPageInformation["chainsScrollTop"] = scrollController.current.scrollTop;
    
                            if(c_scrollTopTest) {
                                if(walletPageInformation["scrollTop"] < ctx_height) {walletPageInformation["scrollTop"] = ctx_height;}
                                if(walletPageInformation["closedScrollTop"] < ctx_height) {walletPageInformation["closedScrollTop"] = ctx_height;}
                                if(walletPageInformation["historyScrollTop"] < ctx_height) {walletPageInformation["historyScrollTop"] = ctx_height;}
                                if(walletPageInformation["txsScrollTop"] < ctx_height) {walletPageInformation["txsScrollTop"] = ctx_height;}
                            } else {
                                walletPageInformation["scrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["closedScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["historyScrollTop"] = scrollController.current.scrollTop;
                                walletPageInformation["txsScrollTop"] = scrollController.current.scrollTop;
                            }
                        }
    
                        dispatch(
                            updateWalletPageInformationState(walletPageInformation)
                        );
                    } else {
                        walletPageInformation["view"] = props.displayView;
                        dispatch(
                            updateWalletPageInformationState(walletPageInformation)
                        );
                    }
                }
                
                const scrollElement = scrollController.current;
                scrollElement.addEventListener('scroll', handleScrollWalletPage, {passive: true});
        
                return () => {
                    if(scrollElement) {
                        scrollElement.removeEventListener('scroll', handleScrollWalletPage);
                    }
                };
            }
        }
    }, [contentBodyWidth, props.displayView, appState["wallet"]["view"]]);

    const pullClosedPositions = async () => {
        const closedPositions = await generalOpx.axiosInstance.put(`/market/closed-holdings`, {});
        if(closedPositions.data["status"] === "success") {
            dispatch(
                setClosed(
                    {
                        "data": closedPositions.data["data"],
                        "dataLoading": false
                    }
                )
            );
        }
    }

    const [historyBeingUpdated, setHistoryBeingUpdated] = useState(true);
    const pullHistory = async (type, ids_ninclude) => {
        await generalOpx.axiosInstance.put(`/market/pull-history`,
            {
                "type": type,
                "ids_ninclude": ids_ninclude
            }
        ).then(
            (response) => {
                if(response.data["status"] === "success") {
                    let history_desc = {...walletSupportData["history"]};

                    if(type === "primary") {
                        history_desc["data"] = response.data["data"];
                        history_desc["dataCount"] = response.data["dataCount"];
                        history_desc["dataLoading"] = false;

                        dispatch(
                            setHistory(history_desc)
                        );
                    } else {
                        history_desc["data"] = [...history_desc["data"]].concat(response.data["data"]);

                        dispatch(
                            setHistory(history_desc)
                        );
                    }
                }
            }
        );

        setHistoryBeingUpdated(false);
    }

    const historyObserverRef = useRef();
    const lastPostElementRef = useCallback(node => 
        {
            if(walletSupportData["history"]["dataLoading"]) return;
            if(historyBeingUpdated) return;
            if(historyObserverRef.current) historyObserverRef.current.disconnect();
            historyObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting) {
                        setHistoryBeingUpdated(true);

                        let p_ninclude = [];
                        for(let i = 0; i < walletSupportData["history"]["data"].length; i++) {
                            p_ninclude.push(walletSupportData["history"]["data"][i]["_id"]);
                        }
                        pullHistory("secondary", p_ninclude);
                    }
                }
            );
            if(node) historyObserverRef.current.observe(node);
        }, [props.displayView, historyBeingUpdated]
    );

    const [txsBeingUpdated, setTxsBeingUpdated] = useState(true);
    const pullTxs = async (type) => {
        if(type === "primary") {
            const txHistory = await generalOpx.axiosInstance.put(`/wallet/tx-history`, {"accountId": user.walletAddress});

            if(txHistory.data["status"] === "success") {
                dispatch(
                    setTxs(
                        {
                            "data": txHistory.data["data"],
                            "next": txHistory.data["next"],
                            "dataLoading": false
                        }
                    )
                );
            }
        } else if(type === "secondary") {
            let txsFunction = {...walletSupportData["txs"]};
            const txHistoryUpdate = await generalOpx.axiosInstance.put(`/wallet/tx-history-expand`, {"accountId": user.walletAddress, "next": walletSupportData["txs"]["next"]});
            
            if(txHistoryUpdate.data["status"] === "success") {
                txsFunction["next"] = txHistoryUpdate.data["next"];
                txsFunction["data"] = [...txsFunction["data"]].concat(txHistoryUpdate.data["data"]);
                dispatch(
                    setTxs(txsFunction)
                );
            }
        }

        setTxsBeingUpdated(false);
    }

    const txObserverRef = useRef();
    const lastTxElementRef = useCallback(node => 
        {
            if(walletSupportData["txs"]["dataLoading"]) return;
            if(walletSupportData["txs"]["next"] === "") return;
            if(txsBeingUpdated) return;
            if(txObserverRef.current) txObserverRef.current.disconnect();
            txObserverRef.current = new IntersectionObserver(entries => 
                {
                    if(entries[0].isIntersecting) {
                        setTxsBeingUpdated(true);
                        pullTxs("secondary");
                    }
                }
            );
            if(node) txObserverRef.current.observe(node);
        }, [props.displayView, txsBeingUpdated]
    );

    const pullBalance = async () => {
        const balanceDesc = await generalOpx.axiosInstance.put(`/wallet/chain-balance`, {"accountId": user.walletAddress});
        if(balanceDesc.data["status"] === "success") {
            let bal_data = [];
            const balanceDescKeys = Object.keys(balanceDesc.data["data"]);
            if(balanceDescKeys.length > 0) {
                for(let i = 0; i < balanceDescKeys.length; i++) {
                    if(balanceDescKeys[i]=== "initialized") continue;
                    if(balanceDescKeys[i]=== "lastTxTimestamp") continue;
                    
                    const bal = Number(balanceDesc.data["data"][balanceDescKeys[i]]);
                    if(isNaN(bal)) continue;

                    bal_data.push([balanceDescKeys[i], bal])
                }
            }

            dispatch(
                setBalance(
                    {
                        "data": bal_data,
                        "dataLoading": false
                    } 
                )
            );
        }
    }

    useEffect(() => {
        if(props.displayView === "closed") {
            if(walletSupportData["closed"]["dataLoading"]) {
                pullClosedPositions();
            }
        }

        if(props.displayView === "history") {
            if(walletSupportData["history"]["dataLoading"]) {
                pullHistory("primary", []);
            }
        }

        if(props.displayView === "txs") {
            if(walletSupportData["txs"]["dataLoading"]) {
                pullTxs("primary");
            }
        }

        if(props.displayView === "chains") {
            if(walletDesc["balance"]["dataLoading"]) {
                pullBalance();
            }
        }

        if(walletData["balancePlot"]["dataLoading"]) {
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
                let targetScrollTop = 0;
                if(props.displayView === "") {
                    targetScrollTop = appState["wallet"]["scrollTop"];
                } else if(props.displayView === "closed") {
                    targetScrollTop = appState["wallet"]["closedScrollTop"];
                } else if(props.displayView === "history") {
                    targetScrollTop = appState["wallet"]["historyScrollTop"];
                } else if(props.displayView === "txs") {
                    targetScrollTop = appState["wallet"]["txsScrollTop"];
                } else if(props.displayView === "chains") {
                    targetScrollTop = appState["wallet"]["chainsScrollTop"];
                }

                if(scrollController.current) {
                    if(props.f_viewPort === "small") {
                        document.documentElement.scrollTop = targetScrollTop;
                    } else {
                        scrollController.current.scrollTop = targetScrollTop;
                    }
                }
            }, 0);
        }
    }, [props.displayView]);

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
                <div className="large-walletAccountnBalanceWrapper">
                    {user ?
                        <BalanceChart 
                            user={user.user} 
                            userVerification={user.verified}
                            accountId={user.walletAddress} 
                            profilePicture={user.profilePicture} 
                            navigateToSend={navigate}
                            refreshStat={walletRefreshCounter["state"]}
                        /> : null
                    }
                </div>
                {contentBodyWidth[1] === true ?
                    <>
                        <div className="large-homePageInnerTopOptionsContainer"
                                style={{
                                        ...{"width": `${contentBodyWidth[0]}px`, "minWidth": `${contentBodyWidth[0]}px`, "maxWidth": `${contentBodyWidth[0]}px`},
                                        ...(appState["wallet"]["fixed"] ? {"position": "fixed", "top": "51px"} : {})
                                    }
                                }
                            >
                            <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                    onClick={() => navigate(`/wallet`)}
                                    style={{"width": "calc((100% / 5) - 20px)", "minWidth": "calc((100% / 5) - 20px)", "maxWidth": "calc((100% / 5) - 20px)"}}
                                >
                                <span className="large-homePageInnerTopOptionsBtnDesc" 
                                        style={props.displayView === "" ?
                                            {"color": "var(--primary-bg-01)"} : {}
                                        }
                                    >
                                    Live
                                    {props.displayView === "" ?
                                        <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                    }
                                </span>
                            </button>
                            <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                    onClick={() => navigate(`/wallet/closed`)}
                                    style={{"width": "calc((100% / 5) - 20px)", "minWidth": "calc((100% / 5) - 20px)", "maxWidth": "calc((100% / 5) - 20px)"}}
                                >
                                <span className="large-homePageInnerTopOptionsBtnDesc"
                                        style={props.displayView === "closed" ?
                                            {"color": "var(--primary-bg-01)"} : {}
                                        }
                                    >
                                    Closed
                                    {props.displayView === "closed" ?
                                        <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                    }
                                </span>
                            </button>
                            <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                    onClick={() => navigate(`/wallet/history`)}
                                    style={{"width": "calc((100% / 5) - 20px)", "minWidth": "calc((100% / 5) - 20px)", "maxWidth": "calc((100% / 5) - 20px)"}}
                                >
                                <span className="large-homePageInnerTopOptionsBtnDesc"
                                        style={props.displayView === "history" ?
                                            {"color": "var(--primary-bg-01)"} : {}
                                        }
                                    >
                                    History
                                    {props.displayView === "history" ?
                                        <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                    }
                                </span>
                            </button>
                            <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                    onClick={() => navigate(`/wallet/txs`)}
                                    style={{"width": "calc((100% / 5) - 20px)", "minWidth": "calc((100% / 5) - 20px)", "maxWidth": "calc((100% / 5) - 20px)"}}
                                >
                                <span className="large-homePageInnerTopOptionsBtnDesc"
                                        style={props.displayView === "txs" ?
                                            {"color": "var(--primary-bg-01)"} : {}
                                        }
                                    >
                                    Txs
                                    {props.displayView === "txs" ?
                                        <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                    }
                                </span>
                            </button>
                            <button className={props.f_viewPort === "small" ? "large-homePageInnerTopOptionsSmallBtn" : "large-homePageInnerTopOptionsBtn"}
                                    onClick={() => navigate(`/wallet/chains`)}
                                    style={{"width": "calc((100% / 5) - 20px)", "minWidth": "calc((100% / 5) - 20px)", "maxWidth": "calc((100% / 5) - 20px)"}}
                                >
                                <span className="large-homePageInnerTopOptionsBtnDesc"
                                        style={props.displayView === "chains" ?
                                            {"color": "var(--primary-bg-01)"} : {}
                                        }
                                    >
                                    Chains
                                    {props.displayView === "chains" ?
                                        <div className="large-homePageInnerTopOptionsBtnOutline"/> : null
                                    }
                                </span>
                            </button>
                        </div>
                        {appState["wallet"]["fixed"] ?
                            <div className="large-homePageInnerTopOptionsContainerMargin"/> : null
                        }
                    </> : null
                }
                <div className="large-homePageContentBodyOutline">
                    {props.displayView === "" ?
                        <>
                            {u_marketHoldings.filter(u_hlds => u_hlds["_id"] !== "finulab_alreadySet").length === 0 ? 
                                <div className="large-homePageProfileNoDataContainer"
                                        style={{
                                            "minHeight": appState["wallet"]["fixed"] ? 
                                                `calc(100vh - 51px - 36px)` : 
                                                `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["scrollTop"]}px)`
                                        }}
                                    >
                                    <div className="large-marketPageNoDataONotice">
                                        <div className="prediction-noTradingStatusInfoContainer">
                                            <div className="prediction-noTradingStatusInfoGraphicContainer">
                                                <AccountBalanceWallet className="prediction-noTradingStatusInfoGraphicIcon"/>
                                            </div>
                                            <div className="prediction-noTradingStatusInfoTopLine">No live holdings.</div>
                                            <div className="prediction-noTradingStatusInfoSecondLine">Start trading to build up your portfolio.</div>
                                        </div>
                                    </div>
                                </div> : 
                                <>
                                    {u_marketHoldings.filter(u_hlds => u_hlds["_id"] !== "finulab_alreadySet").map((hld_desc, index) => {
                                            const elements = [];

                                            if(hld_desc["predictionEndTimestamp"] > nowUnix) {
                                                if(hld_desc["yesQuantity"] > 0) {
                                                    elements.push(
                                                        <div className="large-homePagePostContainer" key={`${hld_desc["marketId"]}-yes`}
                                                                style={index === u_marketHoldings.filter(u_hlds => u_hlds["_id"] !== "finulab_alreadySet").length - 1 ? 
                                                                    {"borderBottom": "none"} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                                }
                                                            >
                                                            <MiniPortfolio 
                                                                type={"yes"}
                                                                loading={false}
                                                                holding={hld_desc}
                                                                status={"open"}
                                                                f_viewPort={props.f_viewPort}
                                                                priceHistory={walletData["portfolioPlots"]["dataLoading"] ? 
                                                                    null :
                                                                    walletData["portfolioPlots"]["data"].filter(port_plot => port_plot["marketId"] === hld_desc["marketId"] && port_plot["selection"] === "priceYes")
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                }

                                                if(hld_desc["noQuantity"] > 0) {
                                                    elements.push(
                                                        <div className="large-homePagePostContainer" key={`${hld_desc["marketId"]}-no`}
                                                                style={index === u_marketHoldings.filter(u_hlds => u_hlds["_id"] !== "finulab_alreadySet").length - 1 ? 
                                                                    {"borderBottom": "none"} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                                }
                                                            >
                                                            <MiniPortfolio 
                                                                type={"no"}
                                                                loading={false}
                                                                holding={hld_desc} 
                                                                status={"open"}
                                                                f_viewPort={props.f_viewPort}
                                                                priceHistory={walletData["portfolioPlots"]["dataLoading"] ? 
                                                                    null :
                                                                    walletData["portfolioPlots"]["data"].filter(port_plot => port_plot["marketId"] === hld_desc["marketId"] && port_plot["selection"] === "priceNo")
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                }
                                            }

                                            return elements;
                                        })
                                    }
                                    <div className="large-homePageProfileNoDataContainer"
                                        style={{
                                            "minHeight": appState["wallet"]["fixed"] ? 
                                                `calc(100vh - 51px - 36px)` : 
                                                `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["scrollTop"]}px)`
                                        }}
                                    />
                                </>
                            }
                        </> :
                        <>
                            {props.displayView === "closed" ?
                                <>
                                    {u_marketHoldings.filter(u_hlds => u_hlds["_id"] !== "finulab_alreadySet").map((hld_desc, index) => {
                                            const elements = [];

                                            if(hld_desc["predictionEndTimestamp"] <= nowUnix) {
                                                if(hld_desc["yesQuantity"] > 0) {
                                                    elements.push(
                                                        <div className="large-homePagePostContainer" key={`${hld_desc["marketId"]}-yes`}
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <MiniPortfolio 
                                                                type={"yes"}
                                                                loading={false}
                                                                holding={hld_desc}
                                                                status={"open"}
                                                                f_viewPort={props.f_viewPort}
                                                                priceHistory={walletData["portfolioPlots"]["dataLoading"] ? 
                                                                    null :
                                                                    walletData["portfolioPlots"]["data"].filter(port_plot => port_plot["marketId"] === hld_desc["marketId"] && port_plot["selection"] === "priceYes")
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                }

                                                if(hld_desc["noQuantity"] > 0) {
                                                    elements.push(
                                                        <div className="large-homePagePostContainer" key={`${hld_desc["marketId"]}-no`}
                                                                style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                            >
                                                            <MiniPortfolio 
                                                                type={"no"}
                                                                loading={false}
                                                                holding={hld_desc} 
                                                                status={"open"}
                                                                f_viewPort={props.f_viewPort}
                                                                priceHistory={walletData["portfolioPlots"]["dataLoading"] ? 
                                                                    null :
                                                                    walletData["portfolioPlots"]["data"].filter(port_plot => port_plot["marketId"] === hld_desc["marketId"] && port_plot["selection"] === "priceNo")
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                }
                                            }

                                            return elements;
                                        })
                                    }
                                    {walletSupportData["closed"]["dataLoading"] ?
                                        <>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                            <div className="large-homePagePostContainer"
                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                >
                                                <MiniPortfolio 
                                                    loading={true}
                                                />
                                            </div>
                                        </> :
                                        <>
                                            {walletSupportData["closed"]["data"].map((hld_desc, index) => {
                                                    const elements = [];
                                                    if(hld_desc["yesQuantity"] > 0) {
                                                        elements.push(
                                                            <div className="large-homePagePostContainer" key={`${hld_desc["marketId"]}-yes`}
                                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                >
                                                                <MiniPortfolio 
                                                                    type={"yes"}
                                                                    loading={false}
                                                                    holding={hld_desc}
                                                                    status={"closed"}
                                                                    f_viewPort={props.f_viewPort}
                                                                    priceHistory={[]}
                                                                />
                                                            </div>
                                                        )
                                                    }
    
                                                    if(hld_desc["noQuantity"] > 0) {
                                                        elements.push(
                                                            <div className="large-homePagePostContainer" key={`${hld_desc["marketId"]}-no`}
                                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                >
                                                                <MiniPortfolio 
                                                                    type={"no"}
                                                                    loading={false}
                                                                    holding={hld_desc} 
                                                                    status={"closed"}
                                                                    f_viewPort={props.f_viewPort}
                                                                    priceHistory={[]}
                                                                />
                                                            </div>
                                                        )
                                                    }
        
                                                    return elements;
                                                })
                                            }
                                        </>
                                    }
                                    {walletSupportData["closed"]["data"].length === 0 &&
                                        u_marketHoldings.filter(u_hlds => u_hlds["predictionEndTimestamp"] <= nowUnix).length === 0 ?
                                        <div className="large-homePageProfileNoDataContainer"
                                                style={{
                                                    "minHeight": appState["wallet"]["fixed"] ? 
                                                        `calc(100vh - 51px - 36px)` : 
                                                        `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["closedScrollTop"]}px)`
                                                }}
                                            >
                                            <div className="large-marketPageNoDataONotice">
                                                <div className="prediction-noTradingStatusInfoContainer">
                                                    <div className="prediction-noTradingStatusInfoGraphicContainer">
                                                        <WorkHistory className="prediction-noTradingStatusInfoGraphicIcon"/>
                                                    </div>
                                                    <div className="prediction-noTradingStatusInfoTopLine">No closed positions.</div>
                                                    <div className="prediction-noTradingStatusInfoSecondLine">Start trading to build up your portfolio.</div>
                                                </div>
                                            </div>
                                        </div> : 
                                        <div className="large-homePageProfileNoDataContainer"
                                            style={{
                                                "minHeight": appState["wallet"]["fixed"] ? 
                                                    `calc(100vh - 51px - 36px)` : 
                                                    `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["closedScrollTop"]}px)`
                                            }}
                                        />
                                    }
                                </> :
                                <>
                                    {props.displayView === "history" ?
                                        <>
                                            {walletSupportData["history"]["data"].map((hist_desc, index) => (
                                                    <div className="large-homePagePostContainer" key={`${hist_desc["_id"]}`}
                                                            ref={walletSupportData["history"]["data"].length === walletSupportData["history"]["dataCount"] ? null :
                                                                walletSupportData["history"]["data"].length - 1 === index ? lastPostElementRef : null}
                                                            style={index === walletSupportData["history"]["data"].length - 1 ?
                                                                {"borderBottom": "none"} : {"borderBottom": "solid 1px var(--primary-bg-08)"}
                                                            }
                                                        >
                                                        <FinulabMarketActivity 
                                                            hist_desc={hist_desc}
                                                            f_viewPort={props.f_viewPort}
                                                        />
                                                    </div>
                                                ))
                                            }
                                            {walletSupportData["history"]["data"].length === 0 ?
                                                <div className="large-homePageProfileNoDataContainer"
                                                        style={{
                                                            "minHeight": appState["wallet"]["fixed"] ? 
                                                                `calc(100vh - 51px - 36px)` : 
                                                                `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["historyScrollTop"]}px)`
                                                        }}
                                                    >
                                                    <div className="large-marketPageNoDataONotice">
                                                        <div className="prediction-noTradingStatusInfoContainer">
                                                            <div className="prediction-noTradingStatusInfoGraphicContainer">
                                                                <WorkHistory className="prediction-noTradingStatusInfoGraphicIcon"/>
                                                            </div>
                                                            <div className="prediction-noTradingStatusInfoTopLine">No trading history.</div>
                                                            <div className="prediction-noTradingStatusInfoSecondLine">Start trading to build up your portfolio.</div>
                                                        </div>
                                                    </div>
                                                </div> : 
                                                <div className="large-homePageProfileNoDataContainer"
                                                    style={{
                                                        "minHeight": appState["wallet"]["fixed"] ? 
                                                            `calc(100vh - 51px - 36px)` : 
                                                            `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["historyScrollTop"]}px)`
                                                    }}
                                                />
                                            }
                                        </> : 
                                        <>
                                            {props.displayView === "txs" ?
                                                <>
                                                    {walletSupportData["txs"]["data"].map((tx_desc, index) => (
                                                            <div className="large-homePagePostContainer" key={`tx-desc-${index}`}
                                                                    ref={walletSupportData["txs"]["next"] === "" ? null :
                                                                        walletSupportData["txs"]["data"].length - 1 === index ? lastTxElementRef : null}
                                                                    style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                >
                                                                <FinulabTxs 
                                                                    tx_desc={tx_desc}
                                                                />
                                                            </div>
                                                        ))
                                                    }
                                                    {walletSupportData["txs"]["data"].length === 0 ?
                                                        <div className="large-homePageProfileNoDataContainer"
                                                                style={{
                                                                    "minHeight": appState["wallet"]["fixed"] ? 
                                                                        `calc(100vh - 51px - 36px)` : 
                                                                        `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["txsScrollTop"]}px)`
                                                                }}
                                                            >
                                                            <div className="large-marketPageNoDataONotice">
                                                                <div className="prediction-noTradingStatusInfoContainer">
                                                                    <div className="prediction-noTradingStatusInfoGraphicContainer">
                                                                        <PointOfSale className="prediction-noTradingStatusInfoGraphicIcon"/>
                                                                    </div>
                                                                    <div className="prediction-noTradingStatusInfoTopLine">No transaction history.</div>
                                                                    <div className="prediction-noTradingStatusInfoSecondLine">Start trading to build up your portfolio.</div>
                                                                </div>
                                                            </div>
                                                        </div> : 
                                                        <div className="large-homePageProfileNoDataContainer"
                                                            style={{
                                                                "minHeight": appState["wallet"]["fixed"] ? 
                                                                    `calc(100vh - 51px - 36px)` : 
                                                                    `calc(100vh - (${ctx_height}px + 36px) + ${appState["wallet"]["txsScrollTop"]}px)`
                                                            }}
                                                        />
                                                    }
                                                </> : 
                                                <>
                                                    {props.displayView === "chains" ?
                                                        <>
                                                            {Array(20).fill(null).map((val, index) => (
                                                                    <div className="large-homePagePostContainer" key={`tx-desc-${index}`}
                                                                            ref={walletSupportData["txs"]["next"] === "" ? null :
                                                                                walletSupportData["txs"]["data"].length - 1 === index ? lastTxElementRef : null}
                                                                            style={{"borderBottom": "solid 1px var(--primary-bg-08)"}}
                                                                        >
                                                                        <FinulabChains 
                                                                            chainId={index}
                                                                        />
                                                                    </div>
                                                                ))
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
                </div>
            </div>
        </div>
    )
}