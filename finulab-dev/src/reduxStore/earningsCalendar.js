import {add, format} from 'date-fns';
import {createSlice} from '@reduxjs/toolkit';

const today = new Date();
let selected = "", dt_optns = [];

for(let i = 0; i < 11; i++) {
    const index = i - 2;
    const dt_add = add(today, {"days": index});

    dt_optns.push(format(dt_add, "yyyy-MM-dd"));

    if(index >= 0
        && selected === ""
    ) {
        const day_fWeek = format(dt_add, "EEE").toUpperCase();
        if(!(day_fWeek === "SAT" || day_fWeek === "SUN")) {
            selected = format(dt_add, "yyyy-MM-dd");
        }
    }
}

export const earningsCalendarSlice = createSlice(
    {
        name: "earningsCalendar",
        initialState: {
            earningsCalendar: {
                "dt_optns": dt_optns,
                "available": {
                    "index": 0,
                    "data": [],
                    "selected": selected,
                    "dataLoading": true
                },
                "availableBank": []
            }
        },
        reducers: {
            set_dt_optns: (state, action) => {
                state.earningsCalendar = {
                    ...state.earningsCalendar,
                    "dt_optns": [...action.payload]
                }
            },
            setAvailable: (state, action) => {
                state.earningsCalendar = {
                    ...state.earningsCalendar,
                    "available": {...action.payload}
                }
            },
            setAvailableBank: (state, action) => {
                state.earningsCalendar = {
                    ...state.earningsCalendar,
                    "availableBank": [...action.payload]
                }
            }
        }
    }
);

export const {
    set_dt_optns,
    setAvailable,
    setAvailableBank
} = earningsCalendarSlice.actions;
export const selectEarningsCalendar = (state) => state.earningsCalendar.earningsCalendar;
export default earningsCalendarSlice.reducer;