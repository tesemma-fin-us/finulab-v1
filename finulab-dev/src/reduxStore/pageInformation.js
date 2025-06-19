import {createSlice} from '@reduxjs/toolkit';

export const pageInformationSlice = createSlice(
    {
        name: "pageInformation",
        initialState: {
            pageInformation: {
                "home": {
                    "view": "unknown",
                    "scrollTop": 0,
                    "followingScrollTop": 0
                },
                "wallet": {
                    "view": "unknown",
                    "fixed": false,
                    "scrollTop": 0,
                    "closedScrollTop": 0,
                    "historyScrollTop": 0,
                    "txsScrollTop": 0,
                    "chainsScrollTop": 0
                },
                "market": {
                    "view": "unknown",
                    "scrollTop": {}
                },
                "search": {
                    "view": "unknown",
                    "scrollTop": 0,
                    "latestScrollTop": 0,
                    "marketScrollTop": 0
                },
                "profile": {
                    "view": "unknown",
                    "fixed": false,
                    "visible": true, 
                    "wallHeight": 0,
                    "scrollTop": 0,
                    "secondaryScrollTop": 0,
                    "tertiaryScrollTop": 0,
                    "quaterneryScrollTop": 0
                },
            }
        },
        reducers: {
            updateHomePageInformationState: (state, action) => {
                state.pageInformation = {
                    ...state.pageInformation,
                    "home": {...action.payload}
                };
            },
            updateWalletPageInformationState: (state, action) => {
                state.pageInformation = {
                    ...state.pageInformation,
                    "wallet": {...action.payload}
                }
            },
            updateMarketPageInformationState: (state, action) => {
                state.pageInformation = {
                    ...state.pageInformation,
                    "market": {...action.payload}
                }
            },
            updateProfilePageInformationState: (state, action) => {
                state.pageInformation = {
                    ...state.pageInformation,
                    "profile": {...action.payload}
                }
            },
            updateSearchPageInformationState: (state, action) => {
                state.pageInformation = {
                    ...state.pageInformation,
                    "search": {...action.payload}
                }
            }
        }
    }
);

export const {
    updateHomePageInformationState,
    updateWalletPageInformationState,
    updateMarketPageInformationState,
    updateProfilePageInformationState,
    updateSearchPageInformationState
} = pageInformationSlice.actions;
export const selectPageInformationState = (state) => state.pageInformation.pageInformation;
export default pageInformationSlice.reducer;