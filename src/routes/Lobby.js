import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import RoomInfo from "../components/RoomInfo";
import { authService, dbService } from "../fbase";

const Lobby = () => {
  const { t } = useTranslation(["page"]);
  const loginedUser = useSelector((store) => store.loginedUser);

  const [rooms, setRooms] = useState([]);

  const getRooms = () => {
    const q = query(
      collection(dbService, "rooms"),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      // TODO: 이 snapshot 은 lobby 컴포넌트가 없어도 작동하는가?
      // 방장이 나갔을때 다른 유저도 다같이 나가도록 해야 하는데..
      const roomArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomArr);
    });
  };

  useEffect(() => {
    getRooms();
  }, []);

  const onLogOutClick = () => {
    authService.signOut();
  };

  return (
    <>
      {loginedUser.isAnonymous
        ? t("page:lobby:anony_user")
        : loginedUser.displayName}
      <br />
      <button>
        <Link to="/createroom">{t("page:lobby:create_room")}</Link>
      </button>
      <br />
      {"----------------------- MyRooms 아직 구현 안됨 ------------------"}
      {rooms.map((room) => (
        <RoomInfo key={room.id} roomObj={room} />
      ))}
      <br />
      {"----------------------- OtherRooms ------------------"}
      <br />
      <button onClick={onLogOutClick}>{t("page:common:logout")}</button>
    </>
  );
};

export default Lobby;
