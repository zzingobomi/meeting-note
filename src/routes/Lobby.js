import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "@firebase/firestore";
import { Container, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import RoomInfo from "../components/RoomInfo";
import { dbService } from "../fbase";
import { Card, CardContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./Lobby.scss";

const Lobby = () => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const loginedUser = useSelector((store) => store.loginedUser);

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    getRooms();
  }, []);

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

  const onCreateRoomClick = () => {
    history.push("/createroom");
  };

  return (
    <Container className="container lobby-container" maxWidth="lg">
      <div className="room-container-title">
        <span>{t("page:lobby:my_room_title")}</span>
      </div>
      <Grid
        container
        spacing={3}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card className="btn-create-card" onClick={onCreateRoomClick}>
            <CardContent className="btn-create-content">
              <AddIcon className="btn-create-icon" />
              <div className="btn-create-label">
                {t("page:lobby:create_room")}
              </div>
            </CardContent>
          </Card>
        </Grid>
        {rooms
          .filter((room) => room.creatorId === loginedUser.uid)
          .map((room) => (
            <Grid key={room.id} item xs={12} sm={6} md={4} lg={3}>
              <RoomInfo key={room.id} roomObj={room} isOwner={true} />
            </Grid>
          ))}
      </Grid>
      <div className="divider"></div>
      <div className="room-container-title">
        <span>{t("page:lobby:other_room_title")}</span>
      </div>
      <Grid container spacing={3}>
        {rooms
          .filter((room) => room.creatorId !== loginedUser.uid)
          .map((room) => (
            <Grid key={room.id} item xs={12} sm={6} md={4} lg={3}>
              <RoomInfo key={room.id} roomObj={room} isOwner={false} />
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export default Lobby;
