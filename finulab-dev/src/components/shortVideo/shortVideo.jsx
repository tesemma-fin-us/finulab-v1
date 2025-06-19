import DOMPurify from 'dompurify';
import {useNavigate} from 'react-router-dom';
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useInView} from 'react-intersection-observer';
import {BlurOn, ChatBubble, ChatBubbleOutline, KeyboardBackspace, Pause, PlayArrow, Reply, TrendingDown, TrendingUp, VolumeOff, VolumeUp} from "@mui/icons-material";

import generalOpx from '../../functions/generalFunctions';

import {setShortIndex, setVolume, setVolumePrev, setVolumeState, setDisplayComments, setCallSecondaryShorts, resetShortsData, selectShortsData} from '../../reduxStore/shortsData';

export default function ShortVideo(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const shortsData = useSelector(selectShortsData);

    const [repostCount, setRepostCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [engagementRatio, setEngagementRatio] = useState([0, 0]);
    useEffect(() => {
        if(!(props.selection === undefined || props.selection === null)) {
            setRepostCount(props.selection.reposts);
            setCommentCount(props.selection.comments);
            setEngagementRatio([props.selection.likes, props.selection.dislikes]);
        }
    }, [props]);

    const shortRef = useRef();
    const [shortPlayState, setShortPlayState] = useState("play");
    const playPauseShort = (type) => {
        if(type === "play") {
            shortRef.current.play();
            setShortPlayState("play");
        } else if(type === "pause") {
            shortRef.current.pause();
            setShortPlayState("pause");
        }
    }
    
    const {ref, inView, entry} = useInView({});
    useEffect(() => {
        try {
            const video = shortRef.current;
            if(video) {
                if(inView) {
                    if(shortsData["index"] !== props.index) {
                        dispatch(
                            setDisplayComments(false)
                        );

                        setTimeout(() => {
                            dispatch(
                                setShortIndex(props.index)
                            );

                            navigate(`/short/${props.selection._id}`)
                        }, 0);
                    }

                    shortRef.current.play().catch((error) => {
                        setShortPlayState("pause");
                    });
                    setShortPlayState("play");

                    if(video.volume !== shortsData["volume"]) {
                        if(volumeRangeRef.current) {
                            video.volume = shortsData["volume"] / 100;
                            volumeRangeRef.current.style.setProperty('--value', `${shortsData["volume"]}%`);
                        }
                    }
                } else {
                    video.pause();
                    setShortPlayState("pause");
                }
            }
        } catch(error) {}
    }, [inView]);

    const volumeRangeRef = useRef();
    const volumeRangeTargtToggle = (event) => {
        const {value} = event.target;
        if(!(isNaN(value) && !isFinite)) {
            const utilize_val = value / 100;

            dispatch(
                setVolume(value)
            );
            shortRef.current.volume = utilize_val;
            volumeRangeRef.current.style.setProperty('--value', `${value}%`);

            if(value <= 0) {
                dispatch(
                    setVolumeState("mute")
                );
            } else {
                if(shortRef.current.muted) {
                    shortRef.current.muted = false;
                }
                dispatch(
                    setVolumeState("up")
                );
            }
        }
    }

    const upMuteShort = (type) => {
        if(type === "up") {
            shortRef.current.muted = false;
            dispatch(
                setVolumeState("up")
            );

            if(shortsData["volumePrev"] > 0) {
                dispatch(
                    setVolume(shortsData["volumePrev"])
                );
                shortRef.current.volume = shortsData["volumePrev"] / 100;
                volumeRangeRef.current.style.setProperty('--value', `${shortsData["volumePrev"]}%`);
            } else {
                dispatch(
                    setVolume(50)
                );
                shortRef.current.volume = 50 / 100;
                volumeRangeRef.current.style.setProperty('--value', `${50}%`);
            }
        } else if(type === "mute") {
            shortRef.current.muted = true;
            dispatch(
                setVolumeState("mute")
            );
            dispatch(
                setVolumePrev(shortsData["volume"])
            );

            dispatch(
                setVolume(0)
            );
            shortRef.current.volume = 0;
            volumeRangeRef.current.style.setProperty('--value', `${0}%`);
        }
    }

    const shortTimelineRef = useRef();
    const onShortLoaded = () => {
        if(props.index === 0) {
            dispatch(
                setCallSecondaryShorts(true)
            );
        }

        let isMouseDown = false;
        if(shortRef.current && shortTimelineRef.current) {
            shortRef.current.volume = 0.8;

            const shortProgressTracker = () => {
                if(shortTimelineRef.current && (shortRef.current && shortRef.current.duration)) {
                    const played = (shortRef.current.currentTime / shortRef.current.duration) * 100;
                    shortTimelineRef.current.style.setProperty('--short-target', `${played}%`);
                }
            };
    
            shortRef.current.addEventListener('timeupdate', shortProgressTracker);

            const calculateTimelinePerc = (e) => {
                if(shortTimelineRef.current) {
                    const rect = shortTimelineRef.current.getBoundingClientRect();
                    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
                    return percent;
                } else {return 0;}
            }

            const shortTimelineUpdate = (e) => {
                if(shortTimelineRef.current) {
                    const percent = calculateTimelinePerc(e);
                    if(isMouseDown) {
                        shortRef.current.currentTime = percent * shortRef.current.duration;
                        shortTimelineRef.current.style.setProperty('--short-target', `${percent * 100}%`);
                        shortTimelineRef.current.style.setProperty('--short-perceived-target', `${percent * 100}%`);
                    } else {
                        shortTimelineRef.current.style.setProperty('--short-perceived-target', `${percent * 100}%`);
                    }
                }
            }

            const handleShortTimelineTrackMove = (e) => {
                if(shortTimelineRef.current && (shortRef.current && shortRef.current.duration)) {
                    isMouseDown = true;
                    shortRef.current.pause();
                    setShortPlayState("pause");

                    const percent = calculateTimelinePerc(e);
                    shortRef.current.currentTime = percent * shortRef.current.duration;
                    shortTimelineRef.current.style.setProperty('--short-target', `${percent * 100}%`);
                }
            }

            shortTimelineRef.current.addEventListener("mousemove", shortTimelineUpdate);
            shortTimelineRef.current.addEventListener("mousedown", handleShortTimelineTrackMove);
            shortTimelineRef.current.addEventListener("mouseup", () => 
                {
                    if(isMouseDown === true) {
                        isMouseDown = false; 
                        shortRef.current.play();
                        setShortPlayState("play");
                    }
                }
            );
            shortTimelineRef.current.addEventListener("mouseleave", () => 
                {
                    if(isMouseDown === true) {
                        isMouseDown = false; 
                        shortRef.current.play(); 
                        setShortPlayState("play");
                        shortTimelineRef.current.style.setProperty('--short-perceived-target', `0%`);
                    }
                }
            );
    
            return () => {
                if(shortRef.current && shortTimelineRef.current) {
                    shortRef.current.removeEventListener('timeupdate', shortProgressTracker);

                    shortTimelineRef.current.removeEventListener("mousemove", shortTimelineUpdate);
                    shortTimelineRef.current.removeEventListener("mousedown", handleShortTimelineTrackMove);
                    shortTimelineRef.current.removeEventListener("mouseup", () => 
                        {
                            if(isMouseDown === true) {
                                isMouseDown = false; 
                                shortRef.current.play();
                                setShortPlayState("play");
                            }
                        }
                    );
                    shortTimelineRef.current.removeEventListener("mouseleave", () => 
                        {
                            if(isMouseDown === true) {
                                isMouseDown = false; 
                                shortRef.current.play(); 
                                setShortPlayState("play");
                                shortTimelineRef.current.style.setProperty('--short-perceived-target', `0%`);
                            }
                        }
                    );
                }
            }
        }
    }

    const [largeViewBtnDisplay, setLargeViewBtnDisplay] = useState("none");
    const playPauseLargeViewShort = (type) => {
        if(type === "play") {
            shortRef.current.play();
            setShortPlayState("play");

            setLargeViewBtnDisplay("flex");
            setTimeout(() => {setLargeViewBtnDisplay("none");}, 500);
        } else if(type === "pause") {
            shortRef.current.pause();
            setShortPlayState("pause");

            setLargeViewBtnDisplay("flex");
            setTimeout(() => {setLargeViewBtnDisplay("none");}, 500);
        }
    }

    const displayComments = () => {
        if(shortsData["displayComments"]) {
            dispatch(
                setDisplayComments(false)
            );
        } else {
            dispatch(
                setDisplayComments(true)
            );
        }
    }

    const smallShortGoBack = () => {
        if(props.f_viewPort === "small") {
            document.documentElement.style.scrollSnapType = 'none';

            setTimeout(() => 
                {
                    if(shortsData["returnToScrollTop"] < 200) {
                        document.documentElement.scrollTop = shortsData["returnToScrollTop"];
                    } else {
                        document.documentElement.scrollTop = shortsData["returnToScrollTop"] - 200;
                        setTimeout(() => 
                            {
                                document.documentElement.scrollTop = shortsData["returnToScrollTop"];
                            }, 0
                        );
                    }
                }, 0
            );
        }

        navigate(shortsData["returnTo"]);
        dispatch(
            resetShortsData()
        );
    }

    const smallShortNavigate = (link) => {
        if(props.f_viewPort === "small") {
            document.documentElement.style.scrollSnapType = 'none';
        }

        setTimeout(() => 
            {
                navigate(link);
                dispatch(
                    resetShortsData()
                );
            }, 0
        );
    }
    const largeShortNavigate = (link) => {
        setTimeout(() => 
            {
                navigate(link);
                dispatch(
                    resetShortsData()
                );
            }, 0
        );
    }
    
    return(
        <div className={props.f_viewPort === "small" ? "finulab-smallShortContainer" : "finulab-shortContainer"}>
            {Math.abs(shortsData["index"] - props.index) <= 5 ? 
                <video className={props.f_viewPort === "small" ? "finulab-smallShortVideo" : "finulab-shortVideo"}
                        autoPlay={shortsData["index"] === props.index ? true : false} 
                        loop={shortsData["index"] === props.index ? true : false} 
                        playsInline={true} 
                        preload='metadata'
                        muted={shortsData["index"] === props.index ? false : true}
                        ref={shortRef}
                        onLoadedData={onShortLoaded}
                        style={props.f_viewPort === "small" ? 
                            {
                                "width": "100vw", "minWidth": "100vw", "maxWidth": "100vw"
                            } : {
                                "width": `${props.containerHeight * (440 / 809)}px`, "minWidth": `${props.containerHeight * (500 / 890)}px`, "maxWidth": `${props.containerHeight * (500 / 890)}px`
                            }
                        }
                    >
                    <source 
                        src={`${props.selection["videos"][0]}#t=0.5`}
                        type="video/mp4"
                    />
                </video> : 
                <div 
                    style={{"backgroundColor": "var(--secondary-bg-03)"}}
                    className={props.f_viewPort === "small" ? "finulab-smallShortVideo" : "finulab-shortVideo"}
                />
            }
            <div className="finulab-shortVideoInnerCustComponentsContainer"
                    style={props.f_viewPort === "small" ? 
                        {
                            "width": "100vw", "minWidth": "100vw", "maxWidth": "100vw"
                        } : 
                        {
                            "width": `${props.containerHeight * (440 / 809)}px`, "minWidth": `${props.containerHeight * (500 / 890)}px`, "maxWidth": `${props.containerHeight * (500 / 890)}px`
                        }
                    }
                >
                {props.f_viewPort === "small" ?
                    <div className="finulab-smallShortVideoLargeViewTopContainer">
                        <div className="finulab-smallShortBackBtnContainer">
                            <button className="app-largeViewMediaSideToggleBtn"
                                    onClick={() => smallShortGoBack()}
                                    style={{"marginLeft": "10px", "padding": "0", "overflow": "hidden"}}
                                >
                                <KeyboardBackspace 
                                    className="app-largeViewMediaSideToggleBtnIcon"
                                />
                            </button>
                        </div>
                        <div className="finulab-smallVideoControlsandEngagementContainer">
                            <div className="finulab-smallVidoControlsandDescContainer">
                                <button className="finulab-smallShortVideoPlayPauseLargeBtn"
                                        onClick={shortPlayState === "play" ? () => playPauseLargeViewShort("pause") : () => playPauseLargeViewShort("play")}
                                    >
                                    <div className="finulab-shortPlayPauseGeneralNoticeContainer"
                                            style={{"display": `${largeViewBtnDisplay}`, "marginLeft": "55px"}}
                                        >
                                        {shortPlayState === "play" ?
                                            <PlayArrow className="app-largeViewMediaSideToggleBtnIcon"/> :
                                            <Pause className="app-largeViewMediaSideToggleBtnIcon"/>
                                        }
                                    </div>
                                </button>
                                <div className="finulab-smallShortVideoDescriptionTxtContainer">
                                    <button className="finulab-smallShortVideoUsernameDescBtn"
                                            onClick={() => smallShortNavigate(`/profile/${props.selection.username}`)}
                                        >
                                        <div className="finulab-smallShortVideoUsernameDesc">{props.selection.username}</div>
                                    </button>
                                    <button className="finulab-smallShortVideoPostDescContainerBtn"
                                            onClick={() => smallShortNavigate(`/post/${props.selection._id}`)}
                                        >
                                        <div className="finulab-smallShortVideoPostDescContainer">
                                            <div className="finulab-smallShortVideoPostDesc">
                                                <div 
                                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.selection.post)}}
                                                    className="finulab-smallShortVideoPostMinimizedDesc"
                                                />
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div className="finulab-smallShortEnagementContainer">
                                <button className="app-largeViewMediaSideToggleBtn"
                                        style={{"margin": "0 auto", "padding": "0", "overflow": "hidden"}}
                                    >
                                    <TrendingUp 
                                        className="app-largeViewMediaSideToggleLikeBtnIcon"
                                        
                                    />
                                </button>
                                <div className="app-finulabShortsCounterDesc">
                                    {engagementRatio[0] === 0 ? `-` : generalOpx.formatLargeFigures(engagementRatio[0], 2)}
                                </div>
                                <button className="app-largeViewMediaSideToggleBtn"
                                       style={{"margin": "25px auto 0px auto", "padding": "0", "overflow": "hidden"}}
                                    >
                                    <TrendingDown className="app-largeViewMediaSideToggleDislikeBtnIcon" 
                                        
                                    />
                                </button>
                                <div className="app-finulabShortsCounterDesc" style={{"margin": "5px auto 25px auto"}}>
                                    {engagementRatio[1] === 0 ? `-` : generalOpx.formatLargeFigures(engagementRatio[1], 2)}
                                </div>
                                <button className="app-largeViewMediaSideToggleBtn"
                                        onClick={() => smallShortNavigate(`/post/${props.selection._id}`)}
                                        style={{"margin": "0px auto", "padding": "0", "overflow": "hidden"}}
                                    >
                                    <ChatBubble className="app-largeViewMediaSideToggleBtnIcon" style={{"transform": "scale(-1, 1)"}}/>
                                </button>
                                <div className="app-finulabShortsCounterDesc" style={{"margin": "5px auto 55px auto"}}>
                                    {commentCount === 0 ? `-` : generalOpx.formatLargeFigures(commentCount, 2)}
                                </div>
                                {/*
                                <button className="app-largeViewMediaSideToggleBtn"
                                        style={{"margin": "25px auto 55px auto", "padding": "0", "overflow": "hidden"}}
                                    >
                                    <Reply className="app-largeViewMediaSideToggleBtnIcon" style={{"marginTop": "-3px", "transform": "scale(-1.2, 1.2)"}}/>
                                </button>
                                */}
                                <button className="app-largeViewMediaSideToggleBtn"
                                        onClick={() => smallShortNavigate(`/profile/${props.selection.username}`)}
                                        style={{"margin": "0 auto", "padding": "0", "overflow": "hidden"}}
                                    >
                                    {props.selection.profileImage === "" ?
                                        <div className="app-largeViewMediaSideToggleProfileNoImage"
                                                style={{...generalOpx.profilePictureGradients[`${props.selection.username}`.length % 5]}}
                                            >
                                            <BlurOn style={{"transform": "scale(1.5)", "color": `var(--primary-bg-${`${props.selection.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                                        </div> : <img src={props.selection.profileImage} alt="" className="app-largeviewMeidaSideToggleProfileImage" />
                                    }
                                </button>
                            </div>
                        </div>
                    </div> : 
                    <div className="finulab-shortVideoLargeViewTopContainer">
                        <div className="finulab-shortVideoControlsContainer"
                                style={{
                                    "width": `${props.containerHeight * (440 / 809)}px`, "minWidth": `${props.containerHeight * (500 / 890)}px`, "maxWidth": `${props.containerHeight * (500 / 890)}px`
                                }}
                            >
                            <div className="finulab-shortVideoControlsInnerContainer">
                                <button className="finulab-shortControlsBtn"
                                        onClick={shortPlayState === "play" ? () => playPauseShort("pause") : () => playPauseShort("play")}
                                    >
                                    {shortPlayState === "play" ?
                                        <Pause className="app-largeViewMediaSideToggleBtnIcon"/> : 
                                        <PlayArrow className="app-largeViewMediaSideToggleBtnIcon"/>
                                    }
                                </button>
                                <div className="finulab-shortVolumeControlerContainer">
                                    <button className="finulab-shortControlsBtn"
                                            style={{"backgroundColor": "rgba(0, 0, 0, 0)"}}
                                            onClick={shortsData["volumeState"] === "up" ? () => upMuteShort("mute") : () => upMuteShort("up")}
                                        >
                                        {shortsData["volumeState"] === "up" ?
                                            <VolumeUp className="app-largeViewMediaSideToggleBtnIcon"/> : 
                                            <VolumeOff className="app-largeViewMediaSideToggleBtnIcon"/>
                                        }
                                    </button>
                                    <input type="range"
                                        ref={volumeRangeRef}
                                        value={shortsData["volume"]}
                                        onChange={volumeRangeTargtToggle}
                                        className="finulab-shortVolumeControllerInput" 
                                    />
                                </div>
                            </div>
                        </div>
                        <button className="finulab-shortVideoPlayPauseLargeBtn"
                                onClick={shortPlayState === "play" ? () => playPauseLargeViewShort("pause") : () => playPauseLargeViewShort("play")}
                            >
                            <div className="finulab-shortPlayPauseGeneralNoticeContainer"
                                    style={{"display": `${largeViewBtnDisplay}`}}
                                >
                                {shortPlayState === "play" ?
                                    <PlayArrow className="app-largeViewMediaSideToggleBtnIcon"/> :
                                    <Pause className="app-largeViewMediaSideToggleBtnIcon"/>
                                }
                            </div>
                        </button>
                        <div className="finulab-smallShortVideoDescriptionTxtContainer">
                            <button className="finulab-smallShortVideoUsernameDescBtn"
                                    onClick={() => largeShortNavigate(`/profile/${props.selection.username}`)}
                                >
                                <div className="finulab-smallShortVideoUsernameDesc">{props.selection.username}</div>
                            </button>
                            <button className="finulab-smallShortVideoPostDescContainerBtn"
                                    onClick={() => largeShortNavigate(`/post/${props.selection._id}`)}
                                >
                                <div className="finulab-smallShortVideoPostDescContainer">
                                    <div className="finulab-smallShortVideoPostDesc">
                                        <div 
                                            dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.selection.post)}}
                                            className="finulab-smallShortVideoPostMinimizedDesc"
                                        />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                }
                {props.f_viewPort === "small" ?
                    <div className="finulab-smallShortVideoControlsTimelineContainer"
                            ref={ref}
                            style={{
                                "width": `100vw`, "minWidth": `100vw`, "maxWidth": `100vw`
                            }}
                        >
                        <div className="finulab-shortVideoControlsTimelineInnerContainer"
                                ref={shortTimelineRef}
                            >
                            <div className="finulab-shortThumbInidicator"></div>
                        </div>
                    </div> : 
                    <div className="finulab-shortVideoControlsTimelineContainer"
                            ref={ref}
                            style={{
                                "width": `calc(${props.containerHeight * (440 / 809)}px + 17px)`, "minWidth": `calc(${props.containerHeight * (440 / 809)}px + 17px)`, "maxWidth": `calc(${props.containerHeight * (440 / 809)}px + 17px)`
                            }}
                        >
                        <div className="finulab-shortVideoControlsTimelineInnerContainer"
                                ref={shortTimelineRef}
                            >
                            <div className="finulab-shortThumbInidicator"></div>
                        </div>
                    </div>
                }
            </div>
            {props.f_viewPort === "small" ?
                null : 
                <div className="finulab-shortOptnsContainer"
                        style={{"marginLeft": `calc(${props.containerHeight * (440 / 809)}px + 75px)`}}
                    >
                    <button className="app-largeViewMediaSideToggleBtn"
                            style={{"margin": "0 auto", "padding": "0", "overflow": "hidden"}}
                        >
                        <TrendingUp 
                            className="app-largeViewMediaSideToggleLikeBtnIcon"
                        />
                    </button>
                    <div className="app-finulabShortsCounterDesc">
                        {engagementRatio[0] === 0 ? `-` : generalOpx.formatLargeFigures(engagementRatio[0], 2)}
                    </div>
                    <button className="app-largeViewMediaSideToggleBtn"
                            style={{"margin": "25px auto 0px auto", "padding": "0", "overflow": "hidden"}}
                        >
                        <TrendingDown className="app-largeViewMediaSideToggleDislikeBtnIcon" 
                            
                        />
                    </button>
                    <div className="app-finulabShortsCounterDesc" style={{"margin": "5px auto 25px auto"}}>
                        {engagementRatio[1] === 0 ? `-` : generalOpx.formatLargeFigures(engagementRatio[1], 2)}
                    </div>
                    <button className="app-largeViewMediaSideToggleBtn"
                            onClick={() => displayComments()}
                            style={{"margin": "0px auto", "padding": "0", "overflow": "hidden"}}
                        >
                        <ChatBubble className="app-largeViewMediaSideToggleBtnIcon" style={{"transform": "scale(-1, 1)"}}/>
                    </button>
                    <div className="app-finulabShortsCounterDesc" style={{"margin": "5px auto 55px auto"}}>
                        {commentCount === 0 ? `-` : generalOpx.formatLargeFigures(commentCount, 2)}
                    </div>
                    {/*
                    <button className="app-largeViewMediaSideToggleBtn"
                            style={{"margin": "25px auto 55px auto", "padding": "0", "overflow": "hidden"}}
                        >
                        <Reply className="app-largeViewMediaSideToggleBtnIcon" style={{"marginTop": "-3px", "transform": "scale(-1.2, 1.2)"}}/>
                    </button>
                    */}
                    <button className="app-largeViewMediaSideToggleBtn"
                            onClick={() => largeShortNavigate(`/profile/${props.selection.username}`)}
                            style={{"margin": "0 auto", "padding": "0", "overflow": "hidden"}}
                        >
                        {props.selection.profileImage === "" ?
                            <div className="app-largeViewMediaSideToggleProfileNoImage"
                                    style={{...generalOpx.profilePictureGradients[`${props.selection.username}`.length % 5]}}
                                >
                                <BlurOn style={{"transform": "scale(1.5)", "color": `var(--primary-bg-${`${props.selection.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                            </div> : <img src={props.selection.profileImage} alt="" className="app-largeviewMeidaSideToggleProfileImage" />
                        }
                    </button>
                </div>
            }
        </div>
    )
}