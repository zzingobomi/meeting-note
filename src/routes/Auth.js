import React, { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInAnonymously,
} from "firebase/auth";
import { useTranslation } from "react-i18next";
import { authService } from "../fbase";
import AuthForm from "components/AuthForm";
import { Button, Container } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import usePageTracking from "usePageTracking";
import ReactGA from "react-ga";
import styles from "./Auth.module.scss";

const Auth = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);
  const [error, setError] = useState("");

  const onAnonymousClick = async (event) => {
    try {
      await signInAnonymously(authService);
    } catch (error) {
      setError(error.message);
    }
    ReactGA.event({
      category: "login",
      action: "click",
      label: "anonymous",
    });
  };

  const onSocialClick = async (event, type) => {
    let provider;
    if (type === "google") {
      provider = new GoogleAuthProvider();
    } else if (type === "facebook") {
      provider = new FacebookAuthProvider();
    } else {
      console.log("check social login type");
    }

    try {
      await signInWithPopup(authService, provider);
    } catch (error) {
      setError(error.message);
    }
    ReactGA.event({
      category: "login",
      action: "click",
      label: type,
    });
  };

  return (
    <Container
      className={`${styles.container} ${styles.login_container}`}
      maxWidth="xs"
    >
      <AuthForm></AuthForm>
      <div className={styles.social_container}>
        <Button
          className={styles.btn_anony}
          variant="contained"
          onClick={onAnonymousClick}
          startIcon={<AccountCircleIcon />}
        >
          {t("page:auth:login_with_anony")}
        </Button>
        <br />
        <Button
          className={styles.btn_google}
          variant="contained"
          onClick={(event) => onSocialClick(event, "google")}
          startIcon={<GoogleIcon style={{ fill: "#d50f25" }} />}
        >
          {t("page:auth:login_with_google")}
        </Button>
        <br />
        <Button
          className={styles.btn_facebook}
          variant="contained"
          onClick={(event) => onSocialClick(event, "facebook")}
          startIcon={<FacebookIcon />}
        >
          {t("page:auth:login_with_facebook")}
        </Button>
        <div className={styles.error}>{error}</div>
      </div>
    </Container>
  );
};

export default Auth;
