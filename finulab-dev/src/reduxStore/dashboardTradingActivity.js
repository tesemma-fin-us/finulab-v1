import {createSlice} from '@reduxjs/toolkit';

export const dashboardTradingActivitySlice = createSlice(
    {
        name: "dashboardTradingActivity",
        initialState: {
            dashboardTradingActivity: {
                "page": "",
                "congress": {
                    "index": 0,
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                }
            }
        },
        reducers: {
            setDashboardCongress: (state, action) => {
                state.dashboardTradingActivity = {
                    ...state.dashboardTradingActivity,
                    "congress": {...action.payload}
                }
            },
            setDashboardTradingActivity: (state, action) => {
                const {page, congress} = action.payload;

                state.dashboardTradingActivity = {
                    ...state.dashboardTradingActivity,
                    "page": page,
                    "congress": congress
                }
            },
            clearDashboardTradingActivity: (state, action) => {
                state.dashboardTradingActivity = {
                    ...state.dashboardTradingActivity,
                    "page": "",
                    "congress": {
                        "index": 0,
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
    setDashboardCongress,
    setDashboardTradingActivity,
    clearDashboardTradingActivity
} = dashboardTradingActivitySlice.actions;
export const selectDashboardTradingActivity = (state) => state.dashboardTradingActivity.dashboardTradingActivity;
export default dashboardTradingActivitySlice.reducer;