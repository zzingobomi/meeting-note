import { collection, onSnapshot, orderBy, query } from "@firebase/firestore";
import { Container, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import RoomInfo from "../components/RoomInfo";
import { authService, dbService } from "../fbase";
import { Card, CardContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import usePageTracking from "usePageTracking";
import { useRecoilValue } from "recoil";
import { userState } from "atoms";
import styles from "./Lobby.module.scss";

const Lobby = () => {
  usePageTracking();
  const { t } = useTranslation(["page"]);
  const history = useHistory();
  const loginedUser = useRecoilValue(userState);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    getRooms();
  }, []);

  const getRooms = () => {
    const q = query(
      collection(dbService, "rooms"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomArr);
    });

    authService.onAuthStateChanged((user) => {
      if (user === null) {
        unsubscribe();
      }
    });
  };

  const onCreateRoomClick = () => {
    history.push("/createroom");
  };

  return (
    <Container className={styles.container} maxWidth="lg">
      <div className={styles.title}>
        <span>{t("page:lobby:my_room_title")}</span>
      </div>
      <Grid
        container
        spacing={3}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card className={styles.card} onClick={onCreateRoomClick}>
            <CardContent className={styles.content}>
              <AddIcon className={styles.icon} />
              <div>{t("page:lobby:create_room")}</div>
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
      <div className={styles.divider}></div>
      <div className={styles.title}>
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
