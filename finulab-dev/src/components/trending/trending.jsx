import './trending.css';

import DOMPurify from 'dompurify';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import {setQueryRecentTxtSearch, selectFinulabSearchRecent} from '../../reduxStore/finulabSearchRecent';

export default function FinulabTrending(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchRecentData = useSelector(selectFinulabSearchRecent);

    const navigate_toTrending = (txt) => {
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
        
        navigate(`/search/${txt}`);
    }

    return(
        <button className="finulab-trendingBtn"
                onClick={() => navigate_toTrending(props.desc[0])}
            >
            <div className="finulab-trendingWrapper">
                <div className="finulab-trendingHeader">
                    {props.loading ? 
                        <span className="finulab-trendingHeaderNoLoading"/> :
                        <span className="finulab-trendingHeaderNo">{props.index + 1}</span>
                    }
                    {props.loading ?
                        <div className="finulab-trendingHeaderDescLoading"/> : 
                        <div className="finulab-trendingHeaderDesc">{props.desc[0]}</div>
                    }
                </div>
                <div className="finulab-trendingHeader">
                    {props.loading ?
                        <span className="finulab-trendingSecondaryDescLoading"/> : 
                        <span className="finulab-trendingSecondaryDesc">{props.desc[1]} Posts Today</span>
                    }
                </div>
                <div className="finulab-trendingDescBody">
                    {props.loading ? 
                        <div className="finulab-trendingDescInnerBodyLoading"/> :
                        <div className="finulab-trendingDescInnerBody">
                            <div 
                                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.desc[2])}}
                                className="finulab-trendingDescInnerBodyTxt"
                            />
                        </div>
                    }
                </div>
            </div>
        </button>
    )
}