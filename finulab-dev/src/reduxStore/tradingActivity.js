import {createSlice} from '@reduxjs/toolkit';

export const tradingActivitySlice = createSlice(
    {
        name: "tradingActivity",
        initialState: {
            tradingActivity: {
                "symbol": "",
                "congress": {
                    "index": 0,
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                },
                "institution": {
                    "index": 0,
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                },
                "insider": {
                    "index": 0,
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                }
            }
        },
        reducers: {
            setCongress: (state, action) => {
                state.tradingActivity = {
                    ...state.tradingActivity,
                    "congress": {...action.payload}
                }
            },
            setInstitution: (state, action) => {
                state.tradingActivity = {
                    ...state.tradingActivity,
                    "institution": {...action.payload}
                }
            },
            setInsider: (state, action) => {
                state.tradingActivity = {
                    ...state.tradingActivity,
                    "insider": {...action.payload}
                }
            },
            updateAll_forTradingActivity: (state, action) => {
                const {symbol, congress, institution, insider} = action.payload;
                state.tradingActivity = {
                    ...state.tradingActivity,
                    "symbol": symbol,
                    "congress": congress,
                    "institution": institution,
                    "insider": insider
                }
            },
            clearAll_forTradingActivity: (state, action) => {
                state.tradingActivity = {
                    "symbol": "",
                    "congress": {
                        "data": [],
                        "dataCount": 0,
                        "dataLoading": true
                    },
                    "institution": {
                        "data": [],
                        "dataCount": 0,
                        "dataLoading": true
                    },
                    "insider": {
                        "data": [],
                        "dataCount": 0,
                        "dataLoading": true
                    }
                }
            }
        }
    }
);

export const {
    setCongress,
    setInstitution,
    setInsider,
    updateAll_forTradingActivity,
    clearAll_forTradingActivity
} = tradingActivitySlice.actions;
export const selectTradingActivity = (state) => state.tradingActivity.tradingActivity;
export default tradingActivitySlice.reducer;