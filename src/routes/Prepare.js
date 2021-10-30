import { doc, getDoc } from "@firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { dbService } from "../fbase";

const Prepare = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const { uid, displayName } = useSelector((store) => store.loginedUser);
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState({});
  const [nickName, setNickName] = useState(displayName);
  const [cameras, setCameras] = useState([]);

  const videoPreview = useRef();
  const cameraSelect = useRef();

  let myStream;

  useEffect(async () => {
    await getMedia();
    await getRoom();
  }, []);

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
      myStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstrains : initialConstrains
      );
      videoPreview.current.srcObject = myStream;
      if (!deviceId) {
        await getCameras();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCameras = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const cameraArr = videoCameras.map((videoCamera) => ({
        value: videoCamera.deviceId,
        text: videoCamera.label,
      }));
      setCameras(cameraArr);
    } catch (e) {
      console.log(e);
    }
  };

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

  const handleCameraChange = async () => {
    await getMedia(cameraSelect.current.value);
  };

  const onChange = (event) => {
    const {
      target: { name, value },
    } = event;
    setNickName(value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (nickName.length <= 0) {
      // TODO: material validation form
      console.log("check nickName");
      return;
    }
    const sessionInfo = {
      deviceId: cameraSelect.current.value,
      nickName: nickName,
      entranceRoom: { id: roomId, ...room },
    };
    window.sessionStorage.setItem("sessionInfo", JSON.stringify(sessionInfo));
    history.push("/meetingroom");
  };

  return (
    <>
      <div className="media-container">
        <video
          ref={videoPreview}
          autoPlay
          playsInline
          width="640px"
          height="480px"
        />
        <br />
        <select ref={cameraSelect} onChange={handleCameraChange}>
          {cameras.map((item) => {
            return (
              <option key={item.value} value={item.value}>
                {item.text}
              </option>
            );
          })}
        </select>
      </div>
      <br />
      <form onSubmit={onSubmit}>
        닉네임:
        <input
          type="text"
          name="nickname"
          onChange={onChange}
          placeholder="닉네임을 입력하세요"
          value={nickName}
          maxLength={100}
        />
        <br />
        <input type="submit" value="입장하기" />
      </form>
      <br />
      <span>roomId: {roomId}</span>
      <br />
      <span>roomCreatorId: {room.creatorId}</span>
      <br />
      <span>roomCreatedAt: {room.createdAt}</span>
      <br />
      <span>roomName: {room.name}</span>
      <br />
    </>
  );
};

export default Prepare;
