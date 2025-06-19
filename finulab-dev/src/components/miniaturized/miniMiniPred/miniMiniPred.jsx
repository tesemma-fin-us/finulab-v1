import './miniMiniPred.css';
import '../news/mini-news.css';
import '../../../pages/stocks/largeView/innerPages/stocks.css';

import {getUnixTime} from 'date-fns';
import {useNavigate} from 'react-router-dom';

export default function MiniMiniPred(props) {
    const navigate = useNavigate();

    const now = new Date();
    const nowUnix = getUnixTime(now);
    
    return(
        <div className="miniaturizedNews-Wrapper"
                style={
                    {
                        padding: "10px 10px 10px 10px",
                        borderRadius: "10px",
                        border: "solid 1px var(--primary-bg-08)",
                        width: "calc(100% - 20px)", minWidth: "calc(100% - 20px)", maxWidth: "calc(100% - 20px)",
                        height: "calc(100% - 20px)", minHeight: "calc(100% - 20px)", maxHeight: "calc(100% - 20px)"
                    }
                }
            >
            <div className="large-stocksNewsInnerSegment"
                    style={
                        {
                            height: "100%", minHeight: "100%", maxHeight: "100%"
                        }
                    }
                >
                {props.loading ?
                    <div className="large-stocksNewsSegmentImgLoading"/> :
                    <button className="large-stocksNewsSegmentImgBtn"
                            onClick={() => navigate(`/market/prediction/${props.desc["_id"]}`)}
                        >
                        <img src={props.desc["predictiveImage"]} 
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
                <div className="large-stocksNewsInnerSegmentBody">
                    {props.loading ?
                        <div className="large-stocksNewsInnerSegmentBodyTitleLoading"/> :
                        <>
                            {props.desc.outcomeType === "categorical" ? 
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
                                        {props.desc["predictiveQuestion"]}
                                    </div>
                                </div> : 
                                <div className="large-stocksNewsInnerSegmentBodyNewTitle">
                                    <div className="large-stocksNewsInnerSegmentBodyNewTitleText" style={{"fontSize": "0.8rem"}}>{props.desc["predictiveQuestion"]}</div>
                                </div>
                            }
                        </>
                    }
                    {props.desc.outcomeType === "categorical" ?
                        <div className="miniminiPred-categoricalOutcomesContainer">
                            <div className="miniminiPred-categoricalOutcomesHeaderContainer">
                                <div className="miniminiPred-categoricalOutcomeContOutcome">
                                    <span className="miniminiPred-categoricalOutcomeContDesc">Outcome</span>
                                </div>
                                <div className="miniminiPred-categoricalOutcomeContTrade">
                                    <span className="miniminiPred-categoricalOutcomeContDesc">Trade</span>
                                </div>
                            </div>
                            <div className="miniminiPred-categoricalOutcomesContainerInnerBody">
                                {props.desc.outcomes.map((outcome_desc, index) => (
                                        <div className="miniminiPred-categoricalOutcomesBodyContainer">
                                            <div className="miniminiPred-categoricalOutcomeBodyImgDescContainer">
                                                <img src={outcome_desc[1]} alt="" className="miniminiPred-categoricalOutcomeBodyImg" />
                                                <div className="miniminiPred-categoricalOutcomeBodyDesc">{outcome_desc[0]}</div>
                                            </div>
                                            <div className="miniminiPredCategoricalOutcomeBodyTradeBtnsContainer">
                                                {props.desc.endDate > nowUnix ?
                                                    <>
                                                        <button className="miniminiPred-yesTradeBtn" onClick={() => navigate(`/market/outcome/${outcome_desc[2]}/yes`)}>Yes</button>
                                                        <button className="miniminiPred-noTradeBtn" onClick={() => navigate(`/market/outcome/${outcome_desc[2]}/no`)}>No</button>
                                                    </> : 
                                                    <button className="miniminiPred-viewResolutionBtn" onClick={() => navigate(`/market/prediction/${props.desc["_id"]}`)}>View Result</button>
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div> :
                        <div className="miniminiPred-yesonoTradeOutcomesOptionsContainer">
                            {props.desc.endDate > nowUnix ?
                                <>
                                    <button className="miniminiPred-yesTradeBtn" onClick={() => navigate(`/market/outcome/${props.desc["outcomes"][0]}/yes`)}>Trade Yes</button>
                                    <button className="miniminiPred-noTradeBtn" onClick={() => navigate(`/market/outcome/${props.desc["outcomes"][0]}/no`)}>Trade No</button>
                                </> :
                                <button className="miniminiPred-viewResolutionBtn" onClick={() => navigate(`/market/prediction/${props.desc["_id"]}`)}>View Resolution</button>
                            }
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}