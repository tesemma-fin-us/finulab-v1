import {createSlice} from '@reduxjs/toolkit';

export const marketLeadershipBoardSlice = createSlice(
    {
        name: "marketLeadershipBoard",
        initialState: {
            marketLeadershipBoard: {
                "byVolume": [],
                "byGains": [],
                "verification": [],
                "dataLoading": true
            }
        },
        reducers: {
            setMarketLeadershipBoard: (state, action) => {
                const {byVolume, byGains, verification, dataLoading} = action.payload
                state.marketLeadershipBoard = {
                    ...state.marketLeadershipBoard,
                    "byVolume": byVolume,
                    "byGains": byGains,
                    "verification": verification,
                    "dataLoading": dataLoading
                }
            }
        }
    }
);

export const {setMarketLeadershipBoard} = marketLeadershipBoardSlice.actions;
export const selectMarketLeadershipBoard = (state) => state.marketLeadershipBoard.marketLeadershipBoard;
export default marketLeadershipBoardSlice.reducer;