import './mini-post.css';
import '../../post/index.css';

import DOMPurify from 'dompurify';
import {format} from 'timeago.js';
import {Verified} from '@mui/icons-material';
import {useDispatch} from 'react-redux';
import {useNavigate, useLocation} from 'react-router-dom';
import {useRef, useState, useEffect, useLayoutEffect} from 'react';

import {setViewMedia} from '../../../reduxStore/viewMedia';
import {setShortStart, setReturnTo, setReturnToScrollTop, setShortData, selectShortsData} from '../../../reduxStore/shortsData';

export default function MiniPost(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const profileImage = "https://finulab-dev-profile-images.s3.us-east-1.amazonaws.com/1707258973-W%28LDgC%24%28C9W7goZ-KX%28bV%29zD%24R%217cQHTWtY%26%21TzQ%28I27%40UTj-1X5SJyhpJSAkm4%29Ws8eG9BaPdMWtAPCvCQr6X%2BUP%29UZK%2Btesemma.fin-usk9x2zsT%24umgCT%215Xlqt%5EJbYDFtA%21vyqcKuvcc7Ma%24u9rtsd7Taa%2BmUNPX%2Aa1j79iL%5ECR%24edmJRcZhHDWT5b%25N%24%2BCdCxm%29nQjm%23Hj0zx%26yB.jpeg";
    
    const oneImg = "https://finulab-dev-posts.s3.us-east-1.amazonaws.com/1729983171-%2187%29esd8%2BoM%2AGMM8%2AECMD8%24jWoip%23QA7%29z%2Adc2Nfd%247whZmWE%28t%24f8Rfo5%23RQ%26ztUpGm%28Y%21rve%24unPvCsYfPriK%5EttXl%40krhythmicReturns1729983171mJpmLll%26sxEvpLDNcOVW7-sJK%28%5E%2B%23cKvaB%5EH%24R1LJg-Ar%269%26%21s%215WEV%5Ej%21irnc8%25KmI6LV%2BIn3rlA%217%2Ba%24pn1QV%23ljUHRa%40s%256%296%24ZK%25Un.jpeg";
    const twoImg = "https://finulab-dev-posts.s3.us-east-1.amazonaws.com/1731337541-9Kl%2AKGU8Vl-%21eeD-SJI%2Bej%24DVk6BKOQki%2AMYjIH%5Ejx8qbJhkVjoc47%40%29YHfYvvuTKbY1PJDexS%5EaFSz%21S-OvACzm%23SFB%5Extesemma.fin-us1731337541p5ZHdi%2BvaTsMtMnD1mrg%29x7QD%2BsZ-JJwCtGbZKu-11n%2A%28y61Csu8%28tHcwQ%2BPEuaG-%21T0Pz%407qKun%2AgSC7f%28%21G%29hvAaB%5EU%2ACvnt%24F5xIxWa.jpeg";
    const threeImg = "https://finulab-dev-posts.s3.us-east-1.amazonaws.com/1727258650-NcFKw%24isc%2AMRwFiK4S%2ARHmlp%23JGjLNd%2Bkcd1ESZVQdWon4Eb2mela5K%24bPTuZAlO0MCGbOpyrUscr%2AXPkMS-hOXJOArt%5E-tesemma.fin-us1727258650%21%219WB158%2538l%5El%25%23R%2BPEPUTR-8mf%24RI%5EVKb6pWimGdp%29%40%21wZV-%23L%28kI0ShdYTa7PG8Xwzr4bzYDlKJI%212g%23Rlx5TZsfwaEF-SBVOO%26WUPH.jpeg";
    const fourImg = "https://finulab-dev-posts.s3.us-east-1.amazonaws.com/1728052658-%402a9Ns%250y%5ESxQ3%2B%29qWIthGZyjclwfiVZyrpw%291O9zb%25Cee46lXkv%40zuF2onNenL8a2R%24RPZJFcXf2RvT9dFdAmYNn54F%28FstellarInvestor1728052658%5EiqN%5EvzsI%26ncEnfQoch3zHP%23Zc25l%2Bv%23%29jNudq6v80KvSvZ7p%24sl6%40cKnTPr%28llqy%5Exvn%24XTgaU9ifLwhH%26E%28f7oL%25u%24Q%23G2SqxNSNdc38.jpeg";
    
    const postTextRef = useRef();
    const [postTextHidden, setPostTextHidden] = useState(false);
    const checkOverflow = (el) => {
        let curOverflow = el.style.overflow;
        if (!curOverflow || curOverflow === "visible") {el.overflow = "hidden";}

        let isOverflowing = el.scrollHeight > el.offsetHeight;
        el.style.overflow = curOverflow;

        return isOverflowing;
    }
    useEffect(() => {
        if(postTextRef.current) {
            const overflowResult = checkOverflow(postTextRef.current);
            setPostTextHidden(overflowResult);
        }
    }, []);

    const [postContentBodyHeight, setPostContentBodyHeight] = useState(0);
    useLayoutEffect(() => {
        const postTextBodyHeightFunction = () => {
            if(postTextRef.current) {
                const postBodyHeight = postTextRef.current.getBoundingClientRect().height;
                setPostContentBodyHeight(postBodyHeight);
            }
        }

        window.addEventListener('resize', postTextBodyHeightFunction);
        postTextBodyHeightFunction();
        return () => window.removeEventListener('resize', postTextBodyHeightFunction);
    }, [postTextRef.current]);

    const [postMedia, setPostMedia] = useState([]);
    useEffect(() => {
        if(!(props.details === undefined || props.details === null)) {
            let postMediaFunction = [];
            for(let i = 0; i < props.details.photos.length; i++) {
                postMediaFunction.push([props.details.photos[i], "photo"]);
            }
            for(let j = 0; j < props.details.videos.length; j++) {
                postMediaFunction.push([props.details.videos[j], "video"]);
            }
            setPostMedia(postMediaFunction);
        }
    }, [props]);

    const setupViewMedia = (index) => {
        dispatch(
            setViewMedia(
                {
                    "index": index,
                    "media": postMedia
                }
            )
        );
    }

    const v_page = useLocation();
    const navigateToShort = () => {
        const currentPosition = window.scrollY;

        dispatch(
            setShortStart(
                {...props.details}
            )
        );
        dispatch(
            setReturnTo(v_page.pathname)
        );
        dispatch(
            setReturnToScrollTop(currentPosition)
        );

        setTimeout(() => {navigate(`/short/${props.details._id}`);}, 0);
    }

    return(
        <div className="miniPost-Wrapper"
                style={{"marginTop": `calc(10px + ${(60.5 - postContentBodyHeight) / 2}px)`, "marginBottom": `calc(0px + ${(60.5 - postContentBodyHeight) / 2}px)`}}
            >
            <div className="post-miniturizedHeaderContainer">
                {props.details.profileImage === "" ? 
                    <button className="post-profileImageNavigateBtn"
                            onClick={() => navigate(`/profile/${props.details.username}`)}
                        >
                        <div className="post-headerProfileImageNone"
                                style={generalOpx.profilePictureGradients[`${props.details.username}`.length % 5]}
                            >
                            <BlurOn style={{"transform": "scale(1.5)", "color": `var(--primary-bg-${`${props.details.username}`.length % 5 === 0 ? `01` : `10`})`}}/>
                        </div>
                    </button> : 
                    <button className="post-profileImageNavigateBtn"
                            onClick={() => navigate(`/profile/${props.details.username}`)}
                        >
                        <img src={props.details.profileImage} alt="" className="post-headerProfileImage" />
                    </button>
                }
                <div className="post-headerNameFullContainer"
                        style={props.details.groupId === "" ? {"justifyContent": "center"} : {}}
                    >
                    {props.details.groupId === "" ? 
                        null : 
                        <div className="post-headerSecondaryName">
                            <button className="post-profileImageNavigateBtn" onClick={() => navigate(`/profile/${props.details.groupId}`)}>{props.details.groupId}</button>
                        </div>
                    }
                    <div className="post-headerName">
                        <button className="post-profileImageNavigateBtn" onClick={() => navigate(`/profile/${props.details.username}`)}>{props.details.username}</button>
                        {props.details.verified ?
                            <Verified className="post-headerVerifiedIcon"/> : null
                        }
                        <span className="post-headerTimeAgo">&nbsp;&nbsp;•&nbsp;&nbsp;{format(props.details.timeStamp * 1000)}</span>
                    </div>
                </div>
            </div>
            <button className="post-bodyTextDescBtn"
                    style={{"margin": "10px 0px 0px 10px", "width": "calc(100% - 10px)", "minWidth": "calc(100% - 10px)", "maxWidth": "calc(100% - 10px)"}}
                    onClick={() => navigate(`/post/${props.details._id}`)}
                >
                <div className="post-miniBodyTextDescContainer"
                        style={{"marginTop": "0px"}}
                    >
                    <div className="post-miniBodyTextDesc" ref={postTextRef}>
                        <div 
                            dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.details.post)}}
                            className="post-bodyTextDescUpgradedMinimized"
                        />
                    </div>
                </div>
            </button>
            <button className="post-bodyTextShowMoreBtn" 
                    style={{"marginLeft": "10px"}}
                    onClick={() => navigate(`/post/${props.details._id}`)}
                >
                Show More
            </button>
            {postMedia.length === 0 ?
                <div className="minimini-postPaddingForNoMedia"/> : 
                <div className="post-miniaturizedMediaContainer">
                    {postMedia.length === 1 ?
                        <>
                            {postMedia[0][1] === "photo" ?
                                <button className="post-mediaOneImgBtn"
                                        onClick={() => setupViewMedia(0)}
                                    >
                                    <img src={postMedia[0][0]} alt="" className="post-mediaOneImg" />
                                </button> : 
                                <div className="post-mediaVideoOneContainer">
                                    <button className="post-mediaShortBtn"
                                        onClick={() => navigateToShort()}
                                    ></button>
                                    <video className="post-video" muted controls>
                                        <source src={`${postMedia[0][0]}#t=1.5`} type="video/mp4"/>
                                    </video>
                                </div>
                            }
                        </> : 
                        <>
                            {postMedia.length === 2 ?
                                <>
                                    {postMedia[0][1] === "photo" ?
                                        <button className="post-mediaOneofTwoBtn"
                                                onClick={() => setupViewMedia(0)}
                                            >
                                            <img src={postMedia[0][0]} alt="" className="post-mediaOneofTwoImg" />
                                        </button> : 
                                        <div className="post-mediaVideoOneofTwoContainer">
                                            <video className="post-mediaOneofTwoImg" muted controls playsInline>
                                                <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                            </video>
                                            <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewMedia(0)}></button>
                                        </div>
                                    }
                                    {postMedia[1][1] === "photo" ?
                                        <button className="post-mediaTwoofTwoBtn"
                                                onClick={() => setupViewMedia(1)}
                                            >
                                            <img src={postMedia[1][0]} alt="" className="post-mediaTwoofTwoImg" />
                                        </button> : 
                                        <div className="post-mediaVideoTwoofTwoContainer">
                                            <video className="post-mediaTwoofTwoImg" muted controls playsInline>
                                                <source src={`${postMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                            </video>
                                            <button className="post-mediaTwoofTwoVideoBtn" onClick={() => setupViewMedia(1)}></button>
                                        </div>
                                    }
                                </> : 
                                <>
                                    {postMedia.length === 3 ?
                                        <>
                                            {postMedia[0][1] === "photo" ?
                                                <button className="post-mediaOneofTwoBtn"
                                                        onClick={() => setupViewMedia(0)}
                                                    >
                                                    <img src={postMedia[0][0]} alt="" className="post-mediaOneofTwoImg" />
                                                </button> : 
                                                <div className="post-mediaVideoOneofTwoContainer">
                                                    <video className="post-mediaOneofTwoImg" muted controls playsInline>
                                                        <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                    </video>
                                                    <button className="post-mediaOneofTwoVideoBtn" onClick={() => setupViewMedia(0)}></button>
                                                </div>
                                            }
                                            <div className="post-mediaThreeInnerContainer">
                                                {postMedia[1][1] === "photo" ?
                                                    <button className="post-mediaTwoofThreeBtn"
                                                            onClick={() => setupViewMedia(1)}
                                                        >
                                                        <img src={postMedia[1][0]} alt="" className="post-mediaTwoofThreeImg" />
                                                    </button> : 
                                                    <div className="post-mediaVideoTwoofThreeContainer">
                                                        <video className="post-mediaTwoofThreeImg" muted controls playsInline>
                                                            <source src={`${postMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                        </video>
                                                        <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewMedia(1)}></button>
                                                    </div>
                                                }
                                                {postMedia[2][1] === "photo" ?
                                                    <button className="post-mediaThreeofThreeBtn"
                                                            onClick={() => setupViewMedia(2)}
                                                        >
                                                        <img src={postMedia[2][0]} alt="" className="post-mediaThreeofThreeImg" />
                                                    </button> : 
                                                    <div className="post-mediaVideoThreeofThreeContainer">
                                                        <video className="post-mediaThreeofThreeImg" muted controls playsInline>
                                                            <source src={`${postMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                        </video>
                                                        <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewMedia(2)}></button>
                                                    </div>
                                                }
                                            </div>
                                        </> : 
                                        <>
                                            <div className="post-mediaThreeInnerContainer">
                                                {postMedia[0][1] === "photo" ?
                                                    <button className="post-mediaOneofFourBtn"
                                                            onClick={() => setupViewMedia(0)}
                                                        >
                                                        <img src={postMedia[0][0]} alt="" className="post-mediaOneofFourImg" />
                                                    </button> : 
                                                    <div className="post-mediaVideoOneofFourContainer">
                                                        <video className="post-mediaOneofFourImg" muted controls playsInline>
                                                            <source src={`${postMedia[0][0]}#t=0.5`} type="video/mp4"/>
                                                        </video>
                                                        <button className="post-mediaVideoOneofFourBtn" onClick={() => setupViewMedia(0)}></button>
                                                    </div>
                                                }
                                                {postMedia[1][1] === "photo" ?
                                                    <button className="post-mediaTwoofFourBtn"
                                                            onClick={() => setupViewMedia(1)}
                                                        >
                                                        <img src={postMedia[1][0]} alt="" className="post-mediaTwoofFourImg" />
                                                    </button> : 
                                                    <div className="post-mediaVideoTwoofFourContainer">
                                                        <video className="post-mediaTwoofFourImg" muted controls playsInline>
                                                            <source src={`${postMedia[1][0]}#t=0.5`} type="video/mp4"/>
                                                        </video>
                                                        <button className="post-mediaVideoTwoofFourBtn" onClick={() => setupViewMedia(1)}></button>
                                                    </div>
                                                }
                                            </div>
                                            <div className="post-mediaThreeInnerContainer">
                                                {postMedia[2][1] === "photo" ?
                                                    <button className="post-mediaTwoofThreeBtn"
                                                            onClick={() => setupViewMedia(2)}
                                                        >
                                                        <img src={postMedia[2][0]} alt="" className="post-mediaTwoofThreeImg" />
                                                    </button> : 
                                                    <div className="post-mediaVideoTwoofThreeContainer">
                                                        <video className="post-mediaTwoofThreeImg" muted controls playsInline>
                                                            <source src={`${postMedia[2][0]}#t=0.5`} type="video/mp4"/>
                                                        </video>
                                                        <button className="post-mediaVideoTwoofThreeBtn" onClick={() => setupViewMedia(2)}></button>
                                                    </div>
                                                }
                                                {postMedia[3][1] === "photo" ?
                                                    <button className="post-mediaThreeofThreeBtn"
                                                            onClick={() => setupViewMedia(3)}
                                                        >
                                                        <img src={postMedia[3][0]} alt="" className="post-mediaThreeofThreeImg" />
                                                    </button> : 
                                                    <div className="post-mediaVideoThreeofThreeContainer">
                                                        <video className="post-mediaThreeofThreeImg" muted controls playsInline>
                                                            <source src={`${postMedia[3][0]}#t=0.5`} type="video/mp4"/>
                                                        </video>
                                                        <button className="post-mediaVideoThreeofThreeBtn" onClick={() => setupViewMedia(3)}></button>
                                                    </div>
                                                }
                                            </div>
                                        </>
                                    }
                                </>
                            }
                        </>
                    }
                </div>
            }
        </div>
    )
}