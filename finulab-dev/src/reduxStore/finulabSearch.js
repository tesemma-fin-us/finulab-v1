import {createSlice} from '@reduxjs/toolkit';

export const finulabSearchSlice = createSlice(
    {
        name: "finulabSearch",
        initialState: {
            finulabSearch: {
                "query": "",
                "queryDisplay": false,

                "u_results": [],
                "c_results": [],
                "st_results": [],
                "cr_results": [],

                "trending": {
                    "data": [],
                    "dataLoading": true
                },

                "top":  {
                    "query": "",
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                },
                "latest": {
                    "query": "",
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                },
                "s_markets": {
                    "query": "",
                    "data": [],
                    "markets": [],
                    "dataCount": 0,
                    "dataLoading": true
                }
            }
        },
        reducers: {
            setQuery: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "query": action.payload
                }
            },
            setQueryDisplay: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "queryDisplay": action.payload
                }
            },

            set_u_results: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "u_results": [...action.payload]
                }
            },
            set_c_results: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "c_results": [...action.payload]
                }
            },
            set_st_results: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "st_results": [...action.payload]
                }
            },
            set_cr_results: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "cr_results": [...action.payload]
                }
            },

            setTrending: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "trending": {...action.payload}
                }
            },

            setTop: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "top": {...action.payload}
                }
            },
            setLatest: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "latest": {...action.payload}
                }
            },
            set_s_markets: (state, action) => {
                state.finulabSearch = {
                    ...state.finulabSearch,
                    "s_markets": {...action.payload}
                }
            }
        }
    }
);

export const {
    setQuery,
    setQueryDisplay,

    set_u_results,
    set_c_results,
    set_st_results,
    set_cr_results,

    setTrending,

    setTop,
    setLatest,
    set_s_markets
} = finulabSearchSlice.actions;
export const selectFinulabSearch = (state) => state.finulabSearch.finulabSearch;
export default finulabSearchSlice.reducer;