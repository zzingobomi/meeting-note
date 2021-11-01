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
import "./Auth.scss";

const Auth = () => {
  const { t } = useTranslation(["page"]);
  const [error, setError] = useState("");

  const onAnonymousClick = async (event) => {
    try {
      await signInAnonymously(authService);
    } catch (error) {
      setError(error.message);
    }
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
  };

  return (
    <>
      <Container className="login-container" maxWidth="xs">
        <AuthForm></AuthForm>
        <div className="social-container">
          <Button
            className="btn-anony"
            variant="contained"
            onClick={onAnonymousClick}
            startIcon={<AccountCircleIcon />}
          >
            {t("page:auth:login_with_anony")}
          </Button>
          <br />
          <Button
            className="btn-google"
            variant="contained"
            onClick={(event) => onSocialClick(event, "google")}
            startIcon={<GoogleIcon style={{ fill: "#d50f25" }} />}
          >
            {t("page:auth:login_with_google")}
          </Button>
          <br />
          <Button
            className="btn-facebook"
            variant="contained"
            onClick={(event) => onSocialClick(event, "facebook")}
            startIcon={<FacebookIcon />}
          >
            {t("page:auth:login_with_facebook")}
          </Button>
          <div className="error">{error}</div>
        </div>
      </Container>
    </>
  );
};

export default Auth;
