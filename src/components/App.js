import React, { useEffect, useState } from "react";
import { authService } from "../fbase";
import AppRouter from "./Router";
import LoopIcon from "@mui/icons-material/Loop";
import styles from "./App.module.scss";
import { useSetRecoilState } from "recoil";
import { fbUserState } from "atoms";

function App() {
  const [init, setInit] = useState(false);
  const setFbUser = useSetRecoilState(fbUserState);

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
        setFbUser(userObj);
        setInit(true);
      } else {
        setFbUser(null);
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
