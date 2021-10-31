import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "@firebase/firestore";
import { useSelector } from "react-redux";
import { dbService } from "fbase";
import { useHistory } from "react-router";

const Wrapup = () => {
  const history = useHistory();

  const loginedUser = useSelector((store) => store.loginedUser);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));
  const [meetTime, setMeetTime] = useState("");

  let messages = [];
  const downloadElem = useRef();

  useEffect(async () => {
    await getRoom();
  }, []);

  const getRoom = async () => {
    const docRef = doc(dbService, "rooms", sessionInfo.entranceRoom.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let durationTime = timeDifference(Date.now() - docSnap.data().createdAt);
      setMeetTime(durationTime);
    } else {
      console.log("No such document!");
    }
  };

  const getMessages = async () => {
    console.log("getMessages");
    const messagesQuery = query(
      collection(dbService, "rooms", sessionInfo.entranceRoom.id, "messages"),
      orderBy("createdAt", "asc")
    );
    const messageSnapshot = await getDocs(messagesQuery);
    messageSnapshot.forEach((doc) => {
      messages.push(doc.data());
    });
  };

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

  const onMessagesClick = async () => {
    await getMessages();
    downloadMessages();
  };

  const timeDifference = (difference) => {
    let daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    difference -= daysDifference * 1000 * 60 * 60 * 24;
    let hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    difference -= hoursDifference * 1000 * 60 * 60;
    let minutesDifference = Math.floor(difference / 1000 / 60);
    difference -= minutesDifference * 1000 * 60;
    let secondsDifference = Math.floor(difference / 1000);

    // TODO: day 없을때..
    return `${daysDifference} : ${hoursDifference} : ${minutesDifference} : ${secondsDifference}`;
  };

  const onGotoLobbyClick = () => {
    history.push("/lobby");
  };

  return (
    <div>
      <div className="time-container">
        <span>Time: {meetTime}</span>
      </div>
      {loginedUser.isAnonymous ? (
        ""
      ) : (
        <>
          <a ref={downloadElem} style={{ display: "none" }}></a>
          <button onClick={onMessagesClick}>채팅 다운로드</button>
        </>
      )}
      <br />
      <button onClick={onGotoLobbyClick}>로비로가기</button>
    </div>
  );
};

export default Wrapup;
