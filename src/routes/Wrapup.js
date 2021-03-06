import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "@firebase/firestore";
import { useTranslation } from "react-i18next";
import { dbService } from "fbase";
import { useHistory } from "react-router";
import { Button, Container } from "@mui/material";
import { DateTime } from "luxon";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import CsvDownload from "react-json-to-csv";
import usePageTracking from "usePageTracking";
import { useRecoilValue } from "recoil";
import { enterTimeState } from "atoms";
import styles from "./Wrapup.module.scss";

const Wrapup = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const enterTime = useRecoilValue(enterTimeState);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationTime, setDurationTime] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    getRoom();
    getMessages();
  }, []);

  const getRoom = async () => {
    const diff = DateTime.now().diff(DateTime.fromMillis(Number(enterTime)));
    let durationTime = diff
      .toFormat("dd : hh : mm : ss")
      .replace(/^[0 : ]+(?=\d[\d : ]{3})/, "");
    setDurationTime(durationTime);
    setStartTime(
      DateTime.fromMillis(Number(enterTime)).toFormat("MM/dd HH:mm")
    );

    const docRef = doc(dbService, "rooms", sessionInfo.entranceRoom.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setRoomName(docSnap.data().name);
    } else {
      setError("No such rooms");
    }
  };

  const getMessages = async () => {
    const messagesQuery = query(
      collection(dbService, "rooms", sessionInfo.entranceRoom.id, "messages"),
      orderBy("createdAt", "asc")
    );
    const messageSnapshot = await getDocs(messagesQuery);
    let messageArr = [];
    messageSnapshot.forEach((doc) => {
      messageArr.push({
        nickName: doc.data().creatorNickName,
        message: doc.data().message,
        time: DateTime.fromMillis(Number(doc.data().createdAt)).toFormat(
          "MM/dd HH:mm"
        ),
      });
    });
    setMessages(messageArr);
  };

  const onGotoLobbyClick = () => {
    history.push("/lobby");
  };

  return (
    <Container className={styles.container} maxWidth="xs">
      <div className={styles.wrapup_box}>
        <DirectionsRunIcon className={styles.run_icon} />
        <div className={styles.timeline}>
          <div className={styles.line}></div>
        </div>
        <div className={styles.time_info}>
          <span>{startTime}</span>
          <span>{DateTime.now().toFormat("MM/dd HH:mm")}</span>
        </div>
        <span className={styles.duration}>{durationTime}</span>
        <CsvDownload
          className={styles.btn_export_csv}
          filename={roomName + ".csv"}
          data={messages}
        >
          {t("page:wrapup:download_messages")}
        </CsvDownload>
        <Button onClick={onGotoLobbyClick}>
          {t("page:wrapup:goto_lobby")}
        </Button>
      </div>
    </Container>
  );
};

export default Wrapup;
