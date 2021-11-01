import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Card, CardContent } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { DateTime } from "luxon";
import "./RoomInfo.scss";

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

  return (
    <Card onClick={onEntranceClick}>
      <CardContent>
        <div className="room-creator-time">
          {DateTime.fromMillis(roomObj.createdAt).toFormat("MM/dd HH:mm")}
        </div>
        <div className="room-name">{roomObj.name}</div>
        <div className="room-creator-info">
          <span>{roomObj.creatorNickName}</span>
          {roomObj.creatorPhotoUrl ? (
            <img src={roomObj.creatorPhotoUrl} />
          ) : (
            <AccountCircleIcon className="anony" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomInfo;
