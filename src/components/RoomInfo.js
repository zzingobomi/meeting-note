import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Card, CardContent, IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { DateTime } from "luxon";
import { deleteDoc, doc } from "@firebase/firestore";
import { dbService } from "fbase";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import styles from "./RoomInfo.module.scss";

const RoomInfo = ({ roomObj, isOwner }) => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();

  const onEntranceClick = () => {
    const sessionInfo = {
      entranceRoom: { id: roomObj.id },
    };
    window.sessionStorage.setItem("sessionInfo", JSON.stringify(sessionInfo));
    history.push("/prepare");
  };

  const deleteMyRoom = async () => {
    await deleteDoc(doc(dbService, `rooms/${roomObj.id}`));
  };

  const onDeleteClick = (event) => {
    event.stopPropagation();
    const ok = window.confirm(t("page:room_info:delete_confirm"));
    if (ok) {
      deleteMyRoom();
    }
  };

  return (
    <Card className={styles.card} onClick={onEntranceClick}>
      <CardContent>
        <div className={styles.create_time}>
          {DateTime.fromMillis(roomObj.createdAt).toFormat("MM/dd HH:mm")}
        </div>
        <div className={styles.room_name}>{roomObj.name}</div>
        <div className={styles.creator_info}>
          <span>{roomObj.creatorNickName}</span>
          {roomObj.creatorPhotoUrl ? (
            <img src={roomObj.creatorPhotoUrl} />
          ) : (
            <AccountCircleIcon className={styles.anony} />
          )}
          {isOwner ? (
            <IconButton
              className={styles.room_delete}
              onClick={onDeleteClick}
              aria-label={t("page:room_info:delete")}
            >
              <DeleteForeverIcon />
            </IconButton>
          ) : (
            ""
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomInfo;
