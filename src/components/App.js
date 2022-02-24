import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authService } from "../fbase";
import AppRouter from "./Router";
import LoopIcon from "@mui/icons-material/Loop";
import styles from "./App.module.scss";

function App() {
  const [init, setInit] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        dispatch({ type: "AUTH_STATE_CHANGED", user: user });
      } else {
        dispatch({ type: "AUTH_STATE_CHANGED", user: null });
      }
      setInit(true);
    });
  }, []);

  return (
    <>
      {init ? (
        <>
          <AppRouter></AppRouter>
        </>
      ) : (
        <div className={styles.loading}>
          <LoopIcon className={styles.icon} />
        </div>
      )}
    </>
  );
}

export default App;
