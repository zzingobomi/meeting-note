import React, { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "@firebase/firestore";
import { authService, dbService } from "../fbase";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import { useFormik } from "formik";
import * as yup from "yup";
import { Box, IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageInfo from "./MessageInfo";
import styles from "./MeetingRoomMessage.module.scss";

const MeetingRoomMessage = ({ roomId, userId, userNickName, userPhotoUrl }) => {
  const { t } = useTranslation(["page"]);

  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const messagesList = useRef();

  const validationSchema = yup.object({
    message: yup
      .string(t("page:meetingroom_message:validation:enter_message"))
      .max(100, t("page:meetingroom_message:validation:valid_message"))
      .required(t("page:meetingroom_message:validation:require_message")),
  });

  const formik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onMessageSubmit(values.message);
    },
  });

  useEffect(() => {
    getMessages();
  }, []);

  const getMessages = () => {
    const q = query(
      collection(dbService, "rooms", roomId, "messages"),
      orderBy("createdAt", "desc")
      //limit(7)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messageArr);
      if (messagesList.current) {
        messagesList.current.scrollTop = messagesList.current.scrollHeight;
      }
    });

    authService.onAuthStateChanged((user) => {
      if (user === null) {
        unsubscribe();
      }
    });
  };

  const onMessageSubmit = async (message) => {
    try {
      const newMessage = {
        message: message,
        createdAt: DateTime.now().toMillis(),
        creatorId: userId,
        creatorNickName: userNickName,
        creatorPhotoUrl: userPhotoUrl,
      };
      const docRef = await addDoc(
        collection(dbService, "rooms", roomId, "messages"),
        newMessage
      );
      formik.handleReset();
    } catch (error) {
      setError(error);
    }
  };

  return (
    <>
      <div ref={messagesList} className={styles.messages_list}>
        {messages
          .slice(0)
          .reverse()
          .map((messageObj) => (
            <MessageInfo
              key={messageObj.id}
              messageObj={messageObj}
              isOwner={messageObj.creatorId === userId}
              roomId={roomId}
            />
          ))}
      </div>
      <Box
        className={styles.message_box}
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={formik.handleSubmit}
      >
        <TextField
          autoFocus
          fullWidth
          name="message"
          variant="standard"
          placeholder={t("page:meetingroom_message:message_placeholder")}
          required
          value={formik.values.message}
          onChange={formik.handleChange}
          error={formik.touched.message && Boolean(formik.errors.message)}
          helperText={formik.touched.message && formik.errors.message}
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                color="primary"
                aria-label={t("page:meetingroom_message:message_button")}
              >
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      <div className={styles.error}>{error}</div>
    </>
  );
};

export default MeetingRoomMessage;
