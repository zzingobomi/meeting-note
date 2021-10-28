import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authService } from "../fbase";
import AppRouter from "./Router";

function App() {
  const [init, setInit] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      console.log("onAuthStateChanged");
      if (user) {
        dispatch({ type: "AUTH_STATE_CHANGED", user: user });
      } else {
        dispatch({ type: "AUTH_STATE_CHANGED", user: null });
      }
      setInit(true);
    });
  }, []);

  return <AppRouter></AppRouter>;
}

export default App;
