import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { addDoc, collection } from "@firebase/firestore";
import { dbService } from "../fbase";
import { useHistory } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, Container } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import MediaInfo from "components/MediaInfo";
import { DateTime } from "luxon";
import usePageTracking from "usePageTracking";
import ReactGA from "react-ga";
import { useRecoilValue } from "recoil";
import { userState } from "atoms";
import styles from "./CreateRoom.module.scss";

const CreateRoom = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const { uid, displayName, photoURL } = useRecoilValue(userState);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const validationSchema = yup.object({
    roomname: yup
      .string(t("page:room_submit:validation:enter_roomname"))
      .max(20, t("page:room_submit:validation:valid_roomname"))
      .required(t("page:room_submit:validation:require_roomname")),
    nickname: yup
      .string(t("page:room_submit:validation:enter_nickname"))
      .max(20, t("page:room_submit:validation:valid_nickname"))
      .required(t("page:room_submit:validation:require_nickname")),
  });

  const formik = useFormik({
    initialValues: {
      roomname: "",
      nickname: displayName,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onCreateRoomSubmit(values.roomname, values.nickname);
    },
  });

  const onCreateRoomSubmit = async (roomname, nickname) => {
    const newRoom = {
      name: roomname,
      creatorId: uid,
      creatorNickName: nickname,
      creatorPhotoUrl: photoURL,
      createdAt: DateTime.now().toMillis(),
    };

    try {
      const docRef = await addDoc(collection(dbService, "rooms"), newRoom);
      const sessionInfo = {
        deviceId: deviceId,
        nickName: nickname,
        entranceRoom: { id: docRef.id, ...newRoom },
      };
      window.sessionStorage.setItem("sessionInfo", JSON.stringify(sessionInfo));
      history.push("/meetingroom");
    } catch (error) {
      setError(error);
    }
    ReactGA.event({
      category: "room",
      action: "entrance",
      label: "create",
    });
  };

  const onCameraChange = (deviceId) => {
    setDeviceId(deviceId);
  };

  return (
    <Container className={styles.container} maxWidth="xs">
      <MediaInfo onCameraChange={onCameraChange}></MediaInfo>
      <Box
        className={styles.room_box}
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={formik.handleSubmit}
      >
        <TextField
          name="roomname"
          label={t("page:create_room:roomname_label")}
          variant="standard"
          required
          value={formik.values.roomname}
          onChange={formik.handleChange}
          error={formik.touched.roomname && Boolean(formik.errors.roomname)}
          helperText={formik.touched.roomname && formik.errors.roomname}
        />
        <br />
        <TextField
          name="nickname"
          label={t("page:create_room:nickname_label")}
          variant="standard"
          required
          value={formik.values.nickname}
          onChange={formik.handleChange}
          error={formik.touched.nickname && Boolean(formik.errors.nickname)}
          helperText={formik.touched.nickname && formik.errors.nickname}
        />
        <br />
        <Button type="submit" variant="contained">
          {t("page:create_room:create_room_label")}
        </Button>
      </Box>
      <div className={styles.error}>{error}</div>
    </Container>
  );
};

export default CreateRoom;
