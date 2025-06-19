import {createSlice} from '@reduxjs/toolkit';

export const marketOverviewSlice = createSlice(
    {
        name: "marketOverview",
        initialState: {
            marketOverview: {
                "page": "",
                "overview": {
                    "data": {},
                    "dataLoading": true
                },
                "topFiftyMC": {
                    "index": 0,
                    "data": [],
                    "dataLoading": true
                },
                "topFiftyVol": {
                    "index": 0,
                    "data": [],
                    "dataLoading": true
                },
                "topFiftyGL": {
                    "index": 0,
                    "data": [],
                    "dataLoading": true
                }
            }
        },
        reducers: {
            setTopFiftyMC: (state, action) => {
                state.marketOverview = {
                    ...state.marketOverview,
                    "topFiftyMC": {...action.payload}
                }
            },
            setTopFiftyVol: (state, action) => {
                state.marketOverview = {
                    ...state.marketOverview,
                    "topFiftyVol": {...action.payload}
                }
            },
            setTopFiftyGL: (state, action) => {
                state.marketOverview = {
                    ...state.marketOverview,
                    "topFiftyGL": {...action.payload}
                }
            },
            setMarketOverview: (state, action) => {
                const {page, overview, topFiftyMC, topFiftyVol, topFiftyGL} = action.payload
                state.marketOverview = {
                    ...state.marketOverview,
                    "page": page,
                    "overview": overview,
                    "topFiftyMC": topFiftyMC,
                    "topFiftyVol": topFiftyVol,
                    "topFiftyGL": topFiftyGL
                }
            },
            clearMarketOverview: (state, action) => {
                state.marketOverview = {
                    ...state.marketOverview,
                    "page": "",
                    "overview": {
                        "data": {},
                        "dataLoading": true
                    },
                    "topFiftyMC": {
                        "index": 0,
                        "data": [],
                        "dataLoading": true
                    },
                    "topFiftyVol": {
                        "index": 0,
                        "data": [],
                        "dataLoading": true
                    },
                    "topFiftyGL": {
                        "index": 0,
                        "data": [],
                        "dataLoading": true
                    }
                }
            }
        }
    }
);

export const {
    setTopFiftyMC,
    setTopFiftyVol,
    setTopFiftyGL,
    setMarketOverview,
    clearMarketOverview
} = marketOverviewSlice.actions;
export const selectMarketOverview = (state) => state.marketOverview.marketOverview;
export default marketOverviewSlice.reducer;