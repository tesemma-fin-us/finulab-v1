import {createSlice} from '@reduxjs/toolkit';

export const profileDataSlice = createSlice(
    {
        name: "profileData",
        initialState: {
            profileData: {
                "profileDesc": {
                    "data": {},
                    "dataLoading": true
                },
                "posts": {
                    "username": "",
                    "data": [],
                    "dataCount": 0,
                    "insightsExpand": [],
                    "dataLoading": true
                },
                "markets": {
                    "username": "",
                    "data": [],
                    "markets": [],
                    "dataCount": 0,
                    "insightsExpand": [],
                    "dataLoading": true
                },
                "engaged": {
                    "username": "",
                    "type": "posts",
                    "data": [],
                    "support": [],
                    "dataCount": 0,
                    "dataLoading": true
                },
                "notifications": {
                    "username": "",
                    "data": [],
                    "dataCount": 0,
                    "dataLoading": true
                },
                "watchlist": {
                    "username": "",
                    "notCovered": [],
                    "stocks": {
                        "data": [],
                        "support": []
                    },
                    "cryptos": {
                        "data": [],
                        "support": []
                    },
                    "dataLoading": true
                }
            }
        },
        reducers: {
            setProfileDesc: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "profileDesc": {...action.payload}
                }
            },
            setPosts: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "posts": {...action.payload}
                }
            },
            setMarkets: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "markets": {...action.payload}
                }
            },
            setEngaged: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "engaged": {...action.payload}
                }
            },
            setNotifications: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "notifications": {...action.payload}
                }
            },
            updateNotifications: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "notifications": {
                        ...state.profileData.notifications,
                        "data": [...state.profileData.notifications.data, ...action.payload]
                    }
                }
            },
            setProfileWatchlist: (state, action) => {
                state.profileData = {
                    ...state.profileData,
                    "watchlist": {...action.payload}
                }
            }
        }
    }
);

export const {
    setProfileDesc,
    setPosts,
    setMarkets,
    setEngaged,
    setNotifications,
    updateNotifications,
    setProfileWatchlist
} = profileDataSlice.actions;
export const selectProfileData = (state) => state.profileData.profileData;
export default profileDataSlice.reducer;