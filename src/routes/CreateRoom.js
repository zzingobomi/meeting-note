import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { addDoc, collection } from "@firebase/firestore";
import { v4 } from "uuid";
import { dbService } from "../fbase";
import { useHistory } from "react-router";

const CreateRoom = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const { uid, displayName, photoURL } = useSelector(
    (store) => store.loginedUser
  );
  const [roomName, setRoomName] = useState("");
  const [nickName, setNickName] = useState(displayName);
  const [cameras, setCameras] = useState([]);

  const videoPreview = useRef();
  const cameraSelect = useRef();

  let myStream;

  useEffect(() => {
    getMedia();
    // TODO: 나갈때 카메라 끄기
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

  const handleCameraChange = async () => {
    await getMedia(cameraSelect.current.value);
  };

  const onChange = (event) => {
    const {
      target: { name, value },
    } = event;
    if (name === "roomname") {
      setRoomName(value);
    } else if (name === "nickname") {
      setNickName(value);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (roomName.length <= 0 || nickName.length <= 0) {
      // TODO: material validation form
      console.log("check roomName or nickName");
      return;
    }
    const newRoom = {
      name: roomName,
      creatorId: uid,
      creatorNickName: nickName,
      creatorPhotoUrl: photoURL,
      createdAt: Date.now(),
    };

    try {
      const docRef = await addDoc(collection(dbService, "rooms"), newRoom);
      const sessionInfo = {
        deviceId: cameraSelect.current.value,
        nickName: nickName,
        entranceRoom: { id: docRef.id, ...newRoom },
      };
      window.sessionStorage.setItem("sessionInfo", JSON.stringify(sessionInfo));
      history.push("/meetingroom");
    } catch (error) {
      console.log(error);
    }
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
        방이름:
        <input
          type="text"
          name="roomname"
          onChange={onChange}
          placeholder="방 이름을 입력하세요"
          value={roomName}
          maxLength={100}
        />
        <br />
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
        <input type="submit" value="만들기" />
      </form>
    </>
  );
};

export default CreateRoom;
