import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "@firebase/firestore";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { dbService } from "fbase";
import { useHistory } from "react-router";
import { Button, Container } from "@mui/material";
import { DateTime } from "luxon";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import CsvDownload from "react-json-to-csv";
import "./Wrapup.scss";

const Wrapup = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();

  const loginedUser = useSelector((store) => store.loginedUser);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationTime, setDurationTime] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);

  //let messages = [];
  //const downloadElem = useRef();

  useEffect(() => {
    getRoom();
    getMessages();
  }, []);

  const getRoom = async () => {
    const docRef = doc(dbService, "rooms", sessionInfo.entranceRoom.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const diff = DateTime.now().diff(
        DateTime.fromMillis(Number(docSnap.data().createdAt))
      );
      let durationTime = diff
        .toFormat("dd : hh : mm : ss")
        .replace(/^[0 : ]+(?=\d[\d : ]{3})/, "");
      setDurationTime(durationTime);
      setStartTime(
        DateTime.fromMillis(Number(docSnap.data().createdAt)).toFormat(
          "MM/dd HH:mm"
        )
      );
      setRoomName(docSnap.data().name);
    } else {
      setError("No such rooms");
    }
  };

  const getMessages = async () => {
    console.log("getMessages");
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

  /*
  const downloadMessages = () => {    
    //console.log(messages);
    // TODO: creatorId 대신 닉네임을..?
    let dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(messages));
    downloadElem.current.setAttribute("href", dataStr);
    downloadElem.current.setAttribute("download", "messages.json");
    downloadElem.current.click();    
  };
  */

  /*
  const onMessagesClick = async () => {
    await getMessages();
    downloadMessages();
  };
  */

  const onGotoLobbyClick = () => {
    history.push("/lobby");
  };

  return (
    <Container className="container wrapup-container" maxWidth="xs">
      <div className="wrapup-box">
        <DirectionsRunIcon className="run-icon" />
        <div className="timeline">
          <div className="line"></div>
        </div>
        <div className="time-info">
          <span className="start-time">{startTime}</span>
          <span className="end-time">
            {DateTime.now().toFormat("MM/dd HH:mm")}
          </span>
        </div>
        <span className="duration">{durationTime}</span>
        {loginedUser.isAnonymous ? (
          ""
        ) : (
          <>
            <CsvDownload
              className="btn_export_csv"
              filename={roomName + ".csv"}
              data={messages}
            >
              {t("page:wrapup:download_messages")}
            </CsvDownload>
          </>
        )}
        <Button onClick={onGotoLobbyClick}>
          {t("page:wrapup:goto_lobby")}
        </Button>
      </div>
    </Container>
  );
};

export default Wrapup;
