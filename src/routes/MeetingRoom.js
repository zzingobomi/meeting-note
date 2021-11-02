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
import Video from "components/Video";

const ENDPOINT = "http://127.0.0.1:4000";
//const ENDPOINT = "http://192.168.0.2:4000";

const MeetingRoom = () => {
  const loginedUser = useSelector((store) => store.loginedUser);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const history = useHistory();

  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState(sessionInfo.deviceId);
  const [nickName, setNickName] = useState(sessionInfo.nickName);
  const [entranceRoom, setEntranceRoom] = useState(sessionInfo.entranceRoom);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [response, setResponse] = useState("");

  const localVideo = useRef();

  const [stream, setStream] = useState(null); // localStream

  const [socket, setSocket] = useState();
  const [users, setUsers] = useState([]);

  let localStream;
  let newSocket;
  let pcs;

  useEffect(() => {
    initWebRTC();
    // TODO: message 처리
    //getMessages();

    return () => {
      cleanupSocket();
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [stream]);

  const initWebRTC = async () => {
    await getMedia(deviceId);
    //await makeConnection(localStream);
    handleSocket();
  };

  const cleanupSocket = () => {
    if (socket) {
      socket.close();
    }
  };

  const cleanupStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const getMedia = async (deviceId) => {
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia(cameraConstrains);
      localVideo.current.srcObject = localStream;
      setStream(localStream);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSocket = () => {
    console.log("handleSocket");
    newSocket = socketIOClient(ENDPOINT);
    newSocket.on("sayhello", (data) => {
      setResponse(data);
    });

    newSocket.emit("join_room", { room: entranceRoom.id, nickName: nickName });

    newSocket.on("all_users", (allUsers) => {
      console.log("allUsers");

      let len = allUsers.length;

      for (let i = 0; i < len; i++) {
        createPeerConnection(
          allUsers[i].id,
          allUsers[i].email,
          newSocket,
          localStream
        );
        let pc = pcs[allUsers[i].id];
        if (pc) {
          pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
            .then((sdp) => {
              console.log("create offer success");
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              newSocket.emit("offer", {
                sdp: sdp,
                offerSendID: newSocket.id,
                offerSendNickName: nickName,
                offerReceiveID: allUsers[i].id,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    });

    newSocket.on("getOffer", (data) => {
      console.log("getOffer");
      createPeerConnection(
        data.offerSendID,
        data.offerSendNickName,
        newSocket,
        localStream
      );
      let pc = pcs[data.offerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          .then(() => {
            console.log("answer set remote description success");
            pc.createAnswer({
              offerToReceiveVideo: true,
              offerToReceiveAudio: true,
            })
              .then((sdp) => {
                console.log("create answer success");
                pc.setLocalDescription(new RTCSessionDescription(sdp));
                newSocket.emit("answer", {
                  sdp: sdp,
                  answerSendID: newSocket.id,
                  answerReceiveID: data.offerSendID,
                });
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });

    newSocket.on("getAnswer", (data) => {
      console.log("getAnswer");
      let pc = pcs[data.answerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });

    newSocket.on("getCandidate", (data) => {
      console.log("getCandidate");
      let pc = pcs[data.candidateSendID];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).then(() => {
          console.log("candidate add success");
        });
      }
    });

    newSocket.on("user_exit", (data) => {
      console.log("user_exit");
      pcs[data.id].close();
      delete pcs[data.id];
      setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));
    });

    setSocket(newSocket);
  };

  const createPeerConnection = (socketID, nickName, newSocket, localStream) => {
    let pc = new RTCPeerConnection({
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

    pcs = { ...pcs, [socketID]: pc };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("onicecandidate");
        newSocket.emit("candidate", {
          candidate: e.candidate,
          candidateSendID: newSocket.id,
          candidateReceiveID: socketID,
        });
      }
    };

    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    pc.ontrack = (e) => {
      console.log("ontrack success");
      setUsers((oldUsers) => oldUsers.filter((user) => user.id !== socketID));
      setUsers((oldUsers) => [
        ...oldUsers,
        {
          id: socketID,
          nickName: nickName,
          stream: e.streams[0],
        },
      ]);
    };

    if (localStream) {
      console.log("localStream add");
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    } else {
      console.log("no local stream");
    }

    return pc;
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

  const onMuteClick = () => {
    stream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  };

  return (
    <Container className="container meeting-room-container" maxWidth="lg">
      <p>socket response: {response}</p>

      <video ref={localVideo} autoPlay playsInline />

      {users.map((user, index) => {
        return (
          <Video key={index} nickName={user.nickName} stream={user.stream} />
        );
      })}

      <br />
      <br />
      <button onClick={onMuteClick}>음소거</button>
      <button onClick={onDeleteClick}>방삭제</button>
      <button onClick={onFinishClick}>회의종료</button>
    </Container>
  );
};

export default MeetingRoom;
