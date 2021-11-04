import React from "react";
import { deleteDoc, doc } from "@firebase/firestore";
import { useTranslation } from "react-i18next";
import { dbService } from "fbase";
import { DateTime } from "luxon";
import { IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./MessageInfo.scss";

const MessageInfo = ({ messageObj, isOwner, roomId }) => {
  const { t } = useTranslation(["page"]);

  const onDeleteClick = () => {
    const ok = window.confirm("정말 메세지를 삭제하시겠습니까?");
    if (ok) {
      deleteMessage();
    }
  };

  const deleteMessage = async () => {
    await deleteDoc(
      doc(dbService, `rooms/${roomId}/messages/${messageObj.id}`)
    );
  };

  return (
    <div className="message-info-box">
      {messageObj.creatorPhotoUrl ? (
        <img src={messageObj.creatorPhotoUrl} />
      ) : (
        <AccountCircleIcon className="anony" />
      )}
      <span className="nickname">{messageObj.creatorNickName}</span>
      <span className="message">{messageObj.message}</span>
      {/* 
      <span className="message-time">
        {DateTime.fromMillis(messageObj.createdAt).toFormat("MM/dd HH:mm")}
      </span>*/}
      {isOwner ? (
        <IconButton
          onClick={onDeleteClick}
          aria-label={t("page:meetingroom_message:message_delete")}
        >
          <DeleteForeverIcon />
        </IconButton>
      ) : (
        ""
      )}
    </div>
  );
};

export default MessageInfo;
