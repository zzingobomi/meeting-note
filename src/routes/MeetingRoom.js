import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "@firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { dbService } from "../fbase";
import socketIOClient from "socket.io-client";
import MessageInfo from "components/MessageInfo";
import { Container } from "@mui/material";
import "./MeetingRoom.scss";

//const ENDPOINT = "http://127.0.0.1:4000";
const ENDPOINT = "http://192.168.0.2:4000";

const MeetingRoom = () => {
  const loginedUser = useSelector((store) => store.loginedUser);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const history = useHistory();

  const [deviceId, setDeviceId] = useState(sessionInfo.deviceId);
  const [nickName, setNickName] = useState(sessionInfo.nickName);
  const [entranceRoom, setEntranceRoom] = useState(sessionInfo.entranceRoom);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [response, setResponse] = useState("");

  const myVideo = useRef();
  let myStream;
  let myPeerConnection;
  let socket;

  const otherVideo = useRef();

  useEffect(async () => {
    await getMedia(deviceId);
    await makeConnection();
    handleSocket();
    getMessages();

    return () => {
      if (socket) {
        // TODO: peerconnection 끊기
        socket.close();
      }
    };
  }, []);

  const getMedia = async (deviceId) => {
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      myStream = await navigator.mediaDevices.getUserMedia(cameraConstrains);
      myVideo.current.srcObject = myStream;
    } catch (e) {
      console.log(e);
    }
  };

  const makeConnection = async () => {
    myPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach((track) => {
      myPeerConnection.addTrack(track, myStream);
    });
  };

  const handleIce = (data) => {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, entranceRoom.id);
  };

  const handleAddStream = (data) => {
    console.log("got an stream from my peer");
    otherVideo.current.srcObject = data.stream;
  };

  const handleSocket = () => {
    socket = socketIOClient(ENDPOINT);
    socket.emit("join_room", entranceRoom.id);
    socket.on("sayhello", (data) => {
      setResponse(data);
    });
    socket.on("welcome", async () => {
      const offer = await myPeerConnection.createOffer();
      myPeerConnection.setLocalDescription(offer);
      console.log("sent the offer");
      socket.emit("offer", offer, entranceRoom.id);
    });

    socket.on("offer", async (offer) => {
      console.log("received the offer");
      myPeerConnection.setRemoteDescription(offer);
      const answer = await myPeerConnection.createAnswer();
      myPeerConnection.setLocalDescription(answer);
      socket.emit("answer", answer, entranceRoom.id);
      console.log("sent the answer");
    });

    socket.on("answer", (answer) => {
      console.log("received the offer");
      myPeerConnection.setRemoteDescription(answer);
    });

    socket.on("ice", (ice) => {
      console.log("received candidate");
      myPeerConnection.addIceCandidate(ice);
    });
  };

  const getMessages = () => {
    const q = query(
      collection(dbService, "rooms", entranceRoom.id, "messages"),
      orderBy("createdAt", "asc")
    );
    onSnapshot(q, (snapshot) => {
      const messageArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messageArr);
    });
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (message === "") {
      return;
    }

    try {
      const newMessage = {
        message: message,
        createdAt: Date.now(),
        creatorId: loginedUser.uid,
      };
      const docRef = await addDoc(
        collection(dbService, "rooms", entranceRoom.id, "messages"),
        newMessage
      );
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMyRoom = async () => {
    if (entranceRoom.creatorId === loginedUser.uid) {
      await deleteDoc(doc(dbService, `rooms/${entranceRoom.id}`));
    }
  };

  const onDeleteClick = () => {
    const ok = window.confirm("정말 회의실을 삭제하시겠습니까?");
    if (ok) {
      deleteMyRoom();
      history.push("/lobby");
    }
  };

  const onFinishClick = () => {
    const ok = window.confirm("정말 회의를 종료하시겠습니까?");
    if (ok) {
      history.push("/wrapup");
    }
  };

  return (
    <Container className="container meeting-room-container" maxWidth="lg">
      <p>socket response: {response}</p>
      <span>devideId: {deviceId}</span>
      <br />
      <span>nickName: {nickName}</span>
      <br />
      <span>entranceRoomId: {entranceRoom.id}</span>
      <br />
      <span>entranceRoomCreatorId: {entranceRoom.creatorId}</span>
      <br />
      <span>entranceRoomCreatedAt: {entranceRoom.createdAt}</span>
      <br />
      <span>entranceRoomName: {entranceRoom.name}</span>
      <br />
      <button onClick={onDeleteClick}>방삭제</button>
      <button onClick={onFinishClick}>회의종료</button>
      <br />
      <br />
      <div className="my-video">
        <video
          ref={myVideo}
          autoPlay
          playsInline
          width="320px"
          height="240px"
        />
      </div>
      <div className="other-video">
        <video
          ref={otherVideo}
          autoPlay
          playsInline
          width="320px"
          height="240px"
        />
      </div>
      <br />
      <div className="chat-list">
        {messages.map((messageObj) => (
          <MessageInfo
            key={messageObj.id}
            messageObj={messageObj}
            isOwner={messageObj.creatorId === loginedUser.uid}
            roomId={entranceRoom.id}
          />
        ))}
      </div>
      <div className="chat-form">
        <form onSubmit={onSubmit}>
          <input
            value={message}
            onChange={onChange}
            type="text"
            placeholder="What's on your mind?"
            maxLength={120}
          />
          <input type="submit" value="전송" />
        </form>
      </div>
    </Container>
  );
};

export default MeetingRoom;
