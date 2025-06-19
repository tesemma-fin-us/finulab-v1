import {createSlice} from '@reduxjs/toolkit';

export const finulabSearchRecentSlice = createSlice(
    {
        name: "finulabSearchRecent",
        initialState: {
            finulabSearchRecent: {
                "queryRecentAccounts": [],
                "queryRecentTxtSearch": []
            }
        },
        reducers: {
            setQueryRecentAccounts: (state, action) => {
                state.finulabSearchRecent = {
                    ...state.finulabSearchRecent, 
                    "queryRecentAccounts": [...action.payload]
                }
            },
            setQueryRecentTxtSearch: (state, action) => {
                state.finulabSearchRecent = {
                    ...state.finulabSearchRecent,
                    "queryRecentTxtSearch": [...action.payload]
                }
            }
        }
    }
);

export const {
    setQueryRecentAccounts,
    setQueryRecentTxtSearch
} = finulabSearchRecentSlice.actions;
export const selectFinulabSearchRecent = (state) => state.finulabSearchRecent.finulabSearchRecent;
export default finulabSearchRecentSlice.reducer;