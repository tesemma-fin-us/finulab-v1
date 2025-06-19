import {useState} from "react";
import {useNavigate} from 'react-router-dom';

import generalOpx from "../../functions/generalFunctions";
import { BlurOn, Tsunami } from "@mui/icons-material";

export default function FinulabNetworkDesc(props) {
    const navigate = useNavigate();

    return(
        <>
            {props.loading ?
                <div className="finulab-profileWatchlistWrapper">
                    <div className="finulab-profileWatchlistHeader">
                        <div className="profile-NotificationRightImgLoading"/>
                        <div className="profile-networkDescUsernameDescLoding"/>
                        {/*<div className="finulab-networkDescFollowBtnLoading" style={{"marginLeft": "auto"}}/>*/}
                    </div>
                    <div className="finulab-profileWatchlistNameBodyContainer">
                        <button className="profile-NotificationNavigateToBtn">
                            <div className="profile-NotificationLongMsgContainerLoading">
                                <div className="profile-NotificationLongMsgDescLoading"/>
                                <div className="profile-NotificationLongMsgDescLoading" style={{"marginTop": "3px"}}/>
                                <div className="profile-NotificationLongMsgDescLoading" style={{"marginTop": "3px"}}/>
                            </div>
                        </button>
                    </div>
                </div> :
                <>
                    {props.network_type === null || props.network_type === undefined || props.network_element === null || props.network_element === undefined ?
                        null :
                        <div className="finulab-profileWatchlistWrapper">
                            <div className="finulab-profileWatchlistHeader">
                                <button className='profile-NotificationRightImgBtn' 
                                        onClick={props.network_type === "C" ? 
                                            () => navigate(`/profile/${props.network_element["communityName"]}`) : () => navigate(`/profile/${props.network_element["username"]}`)
                                        }
                                    >
                                        {props.network_element["profilePicture"] === "" ?
                                            <div className="post-headerProfileImageNone"
                                                    style={
                                                        generalOpx.profilePictureGradients[`${props.network_type === "C" ?
                                                            props.network_element["communityName"] : props.network_element["username"]
                                                        }`.length % 5]
                                                    }
                                                >
                                                <BlurOn 
                                                    style={{
                                                        "transform": "scale(1.5)", 
                                                        "color": `var(--primary-bg-${`${props.network_type === "C" ?
                                                            props.network_element["communityName"] : props.network_element["username"]
                                                        }`.length % 5 === 0 ? `01` : `10`})`
                                                    }}
                                                />
                                            </div> : <img src={props.network_element["profilePicture"]} alt="" className="profile-NotificationRightImg" />
                                        }
                                </button>
                                <button className="profile-networkDescUsernameDescBtn"
                                        onClick={props.network_type === "C" ? 
                                            () => navigate(`/profile/${props.network_element["communityName"]}`) : () => navigate(`/profile/${props.network_element["username"]}`)
                                        }
                                    >
                                    <div className="profile-networkDescUsernameDesc">
                                        {props.network_type === "C" ?
                                            `${props.network_element["communityName"]}` : `${props.network_element["username"]}`
                                        }
                                    </div>
                                </button>
                            </div>
                            <div className="finulab-profileWatchlistNameBodyContainer">
                                <button className="profile-NotificationNavigateToBtn"
                                        onClick={props.network_type === "C" ? 
                                            () => navigate(`/profile/${props.network_element["communityName"]}`) : () => navigate(`/profile/${props.network_element["username"]}`)
                                        }
                                    >
                                    <div className="profile-NotificationLongMsgContainer">
                                        <div className="profile-NotificationLongMsgDesc">
                                            {props.network_element["bio"]}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    }
                </>
            }
        </>
    )
}