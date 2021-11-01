import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { authService } from "fbase";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import "./AuthForm.scss";

const AuthForm = () => {
  const { t } = useTranslation(["page"]);
  const [createMode, setCreateMode] = useState(false);
  const [error, setError] = useState("");

  const validationSchema = yup.object({
    email: yup
      .string(t("page:auth_form:validation:enter_email"))
      .email(t("page:auth_form:validation:valid_email"))
      .required(t("page:auth_form:validation:require_email")),
    password: yup
      .string(t("page:auth_form:validation:enter_password"))
      .min(6, t("page:auth_form:validation:valid_password"))
      .required(t("page:auth_form:validation:require_password")),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onEmailSubmit(values.email, values.password);
    },
  });

  const onEmailSubmit = async (email, password) => {
    let data;
    try {
      if (createMode) {
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

  const toggleCreateMode = () => setCreateMode((prev) => !prev);

  return (
    <>
      <Box
        className="login-box"
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={formik.handleSubmit}
      >
        <TextField
          name="email"
          type="email"
          label={t("page:auth_form:label_email")}
          variant="standard"
          required
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <br />
        <TextField
          name="password"
          type="password"
          label={t("page:auth_form:label_password")}
          variant="standard"
          required
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <br />
        <Button type="submit" variant="contained">
          {createMode
            ? t("page:auth_form:sign_up")
            : t("page:auth_form:sign_in")}
        </Button>
      </Box>
      <Button className="toggle-mode" onClick={toggleCreateMode}>
        {createMode ? t("page:auth_form:sign_in") : t("page:auth_form:sign_up")}
      </Button>
      <div className="error">{error}</div>
    </>
  );
};

export default AuthForm;
