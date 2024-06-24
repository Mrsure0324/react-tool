import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import reduxAPI from "@/services/reduxDemo";
export interface CounterState {
    value: number
}

const initialState: CounterState = {
    value: 0,
}

export const getReduxValue = createAsyncThunk(
    'users/getReduxValue',
    async () => {
        const response = await reduxAPI.getReduxValue()
        return response.data
    },
)

export const sureSlice = createSlice({
    name: 'sure',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1
        },
        decrement: (state) => {
            state.value -= 1
        },
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getReduxValue.fulfilled, (state, action) => {
            state.value = action.payload
        })
    }
})

export const { increment, decrement, incrementByAmount } = sureSlice.actions;

export default sureSlice.reducer