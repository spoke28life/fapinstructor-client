import { configureStore, Action } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import rootReducer, { State } from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
});

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./rootReducer", () => {
    const newRootReducer = require("./rootReducer").default;
    store.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof store.dispatch;
export type AppThunk<T = void> = ThunkAction<T, State, unknown, Action<string>>;

export default store;
