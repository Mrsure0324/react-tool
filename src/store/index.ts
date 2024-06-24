import { configureStore } from "@reduxjs/toolkit";
import sureSlice from "./slices/sureSlice";

export const store = configureStore({
    reducer: {
        // 添加你的reducer
        sure: sureSlice,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch