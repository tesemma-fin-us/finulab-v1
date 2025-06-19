import {createSlice} from '@reduxjs/toolkit';

export const stockDashboardNewsSlice = createSlice(
    {
        name: "stockDashboardNews",
        initialState: {
            stockDashboardNews: {
                "type": "",
                "news": {
                    "data": [],
                    "dataLoading": true
                },
                "index": 0
            }
        },
        reducers: {
            clearStockDashboardNews: (state, action) => {
                state.stockDashboardNews = {
                    "type": "",
                    "news": {
                        "data": [],
                        "dataLoading": true
                    },
                    "index": 0
                }
            },
            setDashboardNews: (state, action) => {
                const {type, news, index} = action.payload
                state.stockDashboardNews = {
                    ...state.stockDashboardNews,
                    "type": type,
                    "news": {...news},
                    "index": index
                }
            },
            updateStockDashboardNews: (state, action) => {
                state.stockDashboardNews = {
                    ...state.stockDashboardNews,
                    "news": {...action.payload}
                }
            },
            updateStockDashboardNewsIndex: (state, action) => {
                state.stockDashboardNews = {
                    ...state.stockDashboardNews,
                    "index": action.payload
                }
            }
        }
    }
);

export const {
    clearStockDashboardNews,
    setDashboardNews,
    updateStockDashboardNews,
    updateStockDashboardNewsIndex
} = stockDashboardNewsSlice.actions;
export const selectStockDashboardNews = (state) => state.stockDashboardNews.stockDashboardNews;
export default stockDashboardNewsSlice.reducer;