import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import socketIOClient from "socket.io-client";
import { Container } from "@mui/material";
import MeetingRoomVideo from "components/MeetingRoomVideo";
import MeetingRoomMessage from "components/MeetingRoomMessage";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import NoMeetingRoomIcon from "@mui/icons-material/NoMeetingRoom";
import { useTranslation } from "react-i18next";
import usePageTracking from "usePageTracking";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { enterTimeState, fbUserState, roomUsersState } from "atoms";
import { DateTime } from "luxon";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styles from "./MeetingRoom.module.scss";

//const ENDPOINT = "http://localhost:4000";
//const ENDPOINT = "http://192.168.0.2:4000";
const ENDPOINT = "https://node.zzingobomi.synology.me";

const MeetingRoom = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);
  const loginedUser = useRecoilValue(fbUserState);
  const setEnterTime = useSetRecoilState(enterTimeState);
  const sessionInfo = JSON.parse(window.sessionStorage.getItem("sessionInfo"));

  const history = useHistory();

  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState(sessionInfo.deviceId);
  const [nickName, setNickName] = useState(sessionInfo.nickName);
  const [entranceRoom, setEntranceRoom] = useState(sessionInfo.entranceRoom);

  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState();

  const [roomUsers, setRoomUsers] = useRecoilState(roomUsersState);

  const [isMuted, setIsMuted] = useState(false);
  const [isMessagesSmallMode, setIsMessagesSmallMode] = useState(true);
  const videoWrapper = useRef();

  const { scrollY } = useScroll();

  let localStream;
  let newSocket;
  let pcs;

  useEffect(() => {
    setEnterTime(DateTime.now());
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
  }, [roomUsers]);

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
      setRoomUsers((allUsers) => {
        const userObj = {
          id: "mine",
          nickName: nickName,
          stream: localStream,
          isOwner: true,
        };
        return [...allUsers, userObj];
      });
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
      setRoomUsers((oldUsers) =>
        oldUsers.filter((user) => user.id !== data.id)
      );
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
      setRoomUsers((oldUsers) =>
        oldUsers.filter((user) => user.id !== socketID)
      );
      setRoomUsers((oldUsers) => [
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
    const grid = Array.from(videoWrapper.current?.children);
    const baseOffset = grid[0]?.offsetTop;
    const breakIndex = grid.findIndex((item) => item.offsetTop > baseOffset);
    return breakIndex === -1 ? grid.length : breakIndex;
  };

  const onDragEnd = (info) => {
    const { destination, source } = info;
    if (!destination) return;
    setRoomUsers((allUsers) => {
      const allUsersCopy = allUsers.slice();
      const userObj = allUsersCopy[source.index];
      allUsersCopy.splice(source.index, 1);
      allUsersCopy.splice(destination?.index, 0, userObj);
      return allUsersCopy;
    });
  };

  return (
    <Container className={styles.container} maxWidth="md">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="video-wrapper">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div ref={videoWrapper} className={styles.video_wrapper}>
                {roomUsers.map((user, index) => {
                  return (
                    <MeetingRoomVideo
                      key={index}
                      nickName={user.nickName}
                      stream={user.stream}
                      isOwner={user.isOwner}
                      index={index}
                    />
                  );
                })}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div
        className={
          `${styles.messages_wrapper} ` +
          (isMessagesSmallMode ? "small" : "large")
        }
      >
        <div>
          <MeetingRoomMessage
            roomId={entranceRoom.id}
            userId={loginedUser.uid}
            userNickName={nickName}
            userPhotoUrl={loginedUser.photoURL}
          />
        </div>
      </div>
      <div className={styles.button_wrapper}>
        <div className={styles.mute} onClick={toggleMuteMode}>
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </div>
        <div className={styles.exit} onClick={onFinishClick}>
          <NoMeetingRoomIcon />
        </div>
      </div>
      <div className={styles.error}>{error}</div>
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
