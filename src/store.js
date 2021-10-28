import { createStore } from "redux";
export default createStore((state, action) => {
  if (state === undefined) {
    return { loginedUser: null };
  }
  if (action.type === "AUTH_STATE_CHANGED") {
    return { ...state, loginedUser: action.user };
  }
  return state;
}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
