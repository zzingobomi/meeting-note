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
import { Link } from "react-router-dom";
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
      {rooms.map((room) => (
        <RoomInfo key={room.id} roomObj={room} />
      ))}
      <br />
      <button onClick={onLogOutClick}>{t("page:common:logout")}</button>
    </>
  );
};

export default Lobby;
