import { deleteDoc, doc } from "@firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { dbService } from "../fbase";
import socketIOClient from "socket.io-client";
//const ENDPOINT = "http://127.0.0.1:4000";
const ENDPOINT = "http://192.168.0.2:4000";

const MeetingRoom = () => {
  const loginedUser = useSelector((store) => store.loginedUser);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const history = useHistory();

  const [deviceId, setDeviceId] = useState(sessionInfo.deviceId);
  const [nickName, setNickName] = useState(sessionInfo.nickName);
  const [entranceRoom, setEntranceRoom] = useState(sessionInfo.entranceRoom);

  const [response, setResponse] = useState("");

  const myVideo = useRef();
  let myStream;
  let myPeerConnection;
  let socket;

  const otherVideo = useRef();
  //let myStream;
  //let myPeerConnection;

  useEffect(async () => {
    await getMedia(deviceId);
    await makeConnection();

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
    <>
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
    </>
  );
};

export default MeetingRoom;
