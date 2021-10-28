import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

const RoomInfo = ({ roomObj }) => {
  const { t } = useTranslation(["page"]);
  const history = useHistory();

  const onEntranceClick = () => {
    history.push("/prepare");
  };

  return (
    <div className="room-box">
      <span>{roomObj.name}</span>
      <button onClick={onEntranceClick}>{t("page:room_info:entrance")}</button>
    </div>
  );
};

export default RoomInfo;
