import React, { useEffect, useState } from "react";
import { authService } from "../fbase";
import AppRouter from "./Router";
import LoopIcon from "@mui/icons-material/Loop";
import styles from "./App.module.scss";
import { useSetRecoilState } from "recoil";
import { userState } from "atoms";

function App() {
  const [init, setInit] = useState(false);
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, email, isAnonymous, photoURL, uid } = user;
        const userObj = {
          displayName: displayName,
          email: email,
          isAnonymous: isAnonymous,
          photoURL: photoURL,
          uid: uid,
        };
        setUser(userObj);
        setInit(true);
      } else {
        setUser(null);
        setInit(true);
      }
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
