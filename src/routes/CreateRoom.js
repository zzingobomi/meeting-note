import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { addDoc, collection } from "@firebase/firestore";
import { v4 } from "uuid";
import { dbService } from "../fbase";
import { useHistory } from "react-router";

const CreateRoom = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const { uid, displayName } = useSelector((store) => store.loginedUser);
  const [roomName, setRoomName] = useState("");
  const [nickName, setNickName] = useState(displayName);

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
      createdAt: Date.now(),
    };

    try {
      const docRef = await addDoc(collection(dbService, "rooms"), newRoom);
      //console.log(docRef.id); document 의 ID
      history.push("/meetingroom");
    } catch (error) {
      console.log(error);
    }

    console.log("newRoom: ", newRoom);
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        name="roomname"
        onChange={onChange}
        value={roomName}
        maxLength={100}
      />
      <input
        type="text"
        name="nickname"
        onChange={onChange}
        value={nickName}
        maxLength={100}
      />
      <input type="submit" value="만들기" />
    </form>
  );
};

export default CreateRoom;
