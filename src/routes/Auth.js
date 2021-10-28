import React, { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { useTranslation } from "react-i18next";
import { authService } from "../fbase";
import { useHistory } from "react-router";

const Auth = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newAccount, setNewAccount] = useState(true);
  const [error, setError] = useState("");

  const onChange = (event) => {
    const {
      target: { name, value },
    } = event;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let data;
    try {
      if (newAccount) {
        data = await createUserWithEmailAndPassword(
          authService,
          email,
          password
        );
      } else {
        data = await signInWithEmailAndPassword(authService, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleAccount = () => setNewAccount((prev) => !prev);

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
      <form onSubmit={onSubmit}>
        <input
          name="email"
          type="text"
          placeholder="Email"
          required
          value={email}
          onChange={onChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={onChange}
        />
        <input
          type="submit"
          value={
            newAccount ? t("page:auth:create_account") : t("page:auth:sign_in")
          }
        />
        {error && <span>{error}</span>}
      </form>
      <span onClick={toggleAccount}>
        {newAccount ? t("page:auth:sign_in") : t("page:auth:create_account")}
      </span>
      <button onClick={onAnonymousClick}>
        {t("page:auth:login_with_anony")}
      </button>
      <button onClick={(event) => onSocialClick(event, "google")}>
        {t("page:auth:login_with_google")}
      </button>
      <button onClick={(event) => onSocialClick(event, "facebook")}>
        {t("page:auth:login_with_facebook")}
      </button>
    </>
  );
};

export default Auth;
