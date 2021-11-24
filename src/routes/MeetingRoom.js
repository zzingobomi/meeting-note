import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import socketIOClient from "socket.io-client";
import { Container } from "@mui/material";
import MeetingRoomVideo from "components/MeetingRoomVideo";
import MeetingRoomMessage from "components/MeetingRoomMessage";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import NoMeetingRoomIcon from "@mui/icons-material/NoMeetingRoom";
import "./MeetingRoom.scss";
import { useTranslation } from "react-i18next";

//const ENDPOINT = "http://localhost:4000";
//const ENDPOINT = "http://192.168.0.2:4000";
const ENDPOINT = "https://node.zzingobomi.synology.me";

const MeetingRoom = () => {
  const { t } = useTranslation(["page"]);
  const loginedUser = useSelector((store) => store.loginedUser);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const history = useHistory();

  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState(sessionInfo.deviceId);
  const [nickName, setNickName] = useState(sessionInfo.nickName);
  const [entranceRoom, setEntranceRoom] = useState(sessionInfo.entranceRoom);

  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState();
  const [users, setUsers] = useState([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isMessagesSmallMode, setIsMessagesSmallMode] = useState(true);
  const videoWrapper = useRef();

  const { scrollY } = useScroll();

  let localStream;
  let newSocket;
  let pcs;

  useEffect(() => {
    window.addEventListener("resize", computeMessagesMode);
    computeMessagesMode();
    initWebRTC();
    return () => {
      window.removeEventListener("resize", computeMessagesMode);
      cleanupSocket();
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [stream]);

  useEffect(() => {
    computeMessagesMode();
  }, [users]);

  const initWebRTC = async () => {
    await getMedia(deviceId);
    handleSocket();
  };

  const cleanupSocket = () => {
    if (newSocket) {
      newSocket.disconnect();
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
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstrains : initialConstrains
      );
      setStream(localStream);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSocket = () => {
    console.log("handleSocket");
    newSocket = socketIOClient(ENDPOINT);
    newSocket.on("sayhello", (data) => {
      console.log("socket connected");
    });

    newSocket.emit("join_room", { room: entranceRoom.id, nickName: nickName });

    newSocket.on("all_users", (allUsers) => {
      let len = allUsers.length;
      console.log("allUsers count: ", allUsers.length);

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

  const onFinishClick = () => {
    const ok = window.confirm(t("page:meeting_room:exit_confirm"));
    if (ok) {
      history.push("/wrapup");
    }
  };

  const toggleMuteMode = () => {
    stream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => !prev);
  };

  const computeMessagesMode = () => {
    if (getVideoCountPerRow() > 1) {
      setIsMessagesSmallMode(false);
    } else {
      setIsMessagesSmallMode(true);
    }
  };

  const getVideoCountPerRow = () => {
    const grid = Array.from(videoWrapper.current.children);
    const baseOffset = grid[0].offsetTop;
    const breakIndex = grid.findIndex((item) => item.offsetTop > baseOffset);
    return breakIndex === -1 ? grid.length : breakIndex;
  };

  return (
    <Container className="container meeting-room-container" maxWidth="md">
      <div ref={videoWrapper} className="video-wrapper">
        <MeetingRoomVideo nickName={nickName} stream={stream} isOwner="true" />
        {users.map((user, index) => {
          return (
            <MeetingRoomVideo
              key={index}
              nickName={user.nickName}
              stream={user.stream}
            />
          );
        })}
      </div>
      <div
        className={
          "messages-wrapper " + (isMessagesSmallMode ? "small" : "large")
        }
      >
        <div className="messages-box">
          <MeetingRoomMessage
            roomId={entranceRoom.id}
            userId={loginedUser.uid}
            userNickName={nickName}
            userPhotoUrl={loginedUser.photoURL}
          />
        </div>
      </div>
      <div className="button-wrapper">
        <div className="mute" onClick={toggleMuteMode}>
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </div>
        <div className="exit" onClick={onFinishClick}>
          <NoMeetingRoomIcon />
        </div>
      </div>
      <div className="error">{error}</div>
    </Container>
  );
};

const useScroll = () => {
  const [scrollY, setScrollY] = useState(0);

  const listener = () => {
    setScrollY(window.pageYOffset);
  };

  const delay = 15;

  useEffect(() => {
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  });

  return {
    scrollY,
  };
};

export default MeetingRoom;