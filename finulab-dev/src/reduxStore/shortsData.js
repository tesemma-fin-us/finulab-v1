import {createSlice} from '@reduxjs/toolkit';

export const shortsDataSlice = createSlice(
    {
        name: "shortsData",
        initialState: {
            shortsData: {
                "start": {},

                "returnTo": "/",
                "returnToScrollTop": 0,
                "displayComments": false,

                "index": 0,
                "volume": 80,
                "volumePrev": 80,
                "volumeState": "up",

                "shorts": {
                    "data": [],
                    "dataLoading": true
                },
                "callSecondaryShorts": false,

                "navigateShortUp": false,
                "navigateShortDown": false
            }
        },
        reducers: {
            setShortStart: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "start": {...action.payload}
                }
            },
            setReturnTo: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "returnTo": action.payload
                }
            },
            setReturnToScrollTop: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "returnToScrollTop": action.payload
                }
            },
            setDisplayComments: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "displayComments": action.payload
                }
            },
            setShortIndex: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "index": action.payload
                }
            },
            setVolume: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "volume": action.payload
                }
            },
            setVolumePrev: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "volumePrev": action.payload
                }
            },
            setVolumeState: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "volumeState": action.payload
                }
            },
            setShortData: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "shorts": {...action.payload}
                }
            }, 
            setCallSecondaryShorts: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "callSecondaryShorts": action.payload
                }
            },
            setNavigateShortUp: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "navigateShortUp": action.payload
                }
            },
            setNavigateShortDown: (state, action) => {
                state.shortsData = {
                    ...state.shortsData,
                    "navigateShortDown": action.payload
                }
            },
            resetShortsData: (state, action) => {
                state.shortsData = {
                    "start": {},

                    "returnTo": "/",
                    "returnToScrollTop": 0,
                    "displayComments": false,

                    "index": 0,
                    "volume": 80,
                    "volumePrev": 80,
                    "volumeState": "up",

                    "shorts": {
                        "data": [],
                        "dataLoading": true
                    },
                    "callSecondaryShorts": false,

                    "navigateShortUp": false,
                    "navigateShortDown": false
                }
            }
        }
    }
);

export const {
    setShortStart,
    setReturnTo,
    setReturnToScrollTop,
    setDisplayComments,
    setShortIndex,
    setVolume,
    setVolumePrev,
    setVolumeState,
    setShortData,
    setCallSecondaryShorts,
    setNavigateShortUp,
    setNavigateShortDown,
    resetShortsData
} = shortsDataSlice.actions;
export const selectShortsData = (state) => state.shortsData.shortsData;
export default shortsDataSlice.reducer;