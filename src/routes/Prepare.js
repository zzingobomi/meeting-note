import React, { useEffect, useState } from "react";
import { doc, getDoc } from "@firebase/firestore";
import MediaInfo from "components/MediaInfo";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { dbService } from "../fbase";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, Container } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { DateTime } from "luxon";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import usePageTracking from "usePageTracking";
import ReactGA from "react-ga";
import { useRecoilValue } from "recoil";
import { fbUserState } from "atoms";
import styles from "./Prepare.module.scss";

const Prepare = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const { displayName } = useRecoilValue(fbUserState);

  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState({});
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const validationSchema = yup.object({
    nickname: yup
      .string(t("page:room_submit:validation:enter_nickname"))
      .max(20, t("page:room_submit:validation:valid_nickname"))
      .required(t("page:room_submit:validation:require_nickname")),
  });

  const formik = useFormik({
    initialValues: {
      nickname: displayName ? displayName : "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onEntranceRoomSubmit(values.nickname);
    },
  });

  useEffect(() => {
    getRoom();
  }, []);

  const getRoom = async () => {
    const sessionInfo = JSON.parse(
      window.sessionStorage.getItem("sessionInfo")
    );
    setRoomId(sessionInfo.entranceRoom.id);
    const docRef = doc(dbService, "rooms", sessionInfo.entranceRoom.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setRoom(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  const onEntranceRoomSubmit = async (nickname) => {
    const sessionInfo = {
      deviceId: deviceId,
      nickName: nickname,
      entranceRoom: { id: roomId, ...room },
    };
    window.sessionStorage.setItem("sessionInfo", JSON.stringify(sessionInfo));
    history.push("/meetingroom");
    ReactGA.event({
      category: "room",
      action: "entrance",
      label: "prepare",
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
          name="nickname"
          label={t("page:prepare_room:nickname_label")}
          variant="standard"
          required
          value={formik.values.nickname}
          onChange={formik.handleChange}
          error={formik.touched.nickname && Boolean(formik.errors.nickname)}
          helperText={formik.touched.nickname && formik.errors.nickname}
        />
        <br />
        <div className={styles.room_info}>
          <div className={`${styles.info_item} ${styles.room_name}`}>
            <span>{room.name}</span>
          </div>
          <div className={`${styles.info_item} ${styles.room_creator}`}>
            <span>{room.creatorNickName}</span>
            {room.creatorPhotoUrl ? (
              <img className={styles.creator_icon} src={room.creatorPhotoUrl} />
            ) : (
              <AccountCircleIcon
                className={`${styles.anony} ${styles.creator_icon}`}
              />
            )}
          </div>
          <div className={`${styles.info_item} ${styles.room_time}`}>
            {DateTime.fromMillis(Number(room.createdAt)).toFormat(
              "MM/dd HH:mm"
            )}
          </div>
        </div>
        <br />
        <Button type="submit" variant="contained">
          {t("page:prepare_room:entrance_room_label")}
        </Button>
      </Box>
      <div className={styles.error}>{error}</div>
    </Container>
  );
};

export default Prepare;
