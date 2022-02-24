import React from "react";
import { deleteDoc, doc } from "@firebase/firestore";
import { useTranslation } from "react-i18next";
import { dbService } from "fbase";
import { IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import styles from "./MessageInfo.module.scss";

const MessageInfo = ({ messageObj, isOwner, roomId }) => {
  const { t } = useTranslation(["page"]);

  const onDeleteClick = () => {
    const ok = window.confirm(
      t("page:meetingroom_message:message_delete_confirm")
    );
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
    <div className={styles.info_box}>
      {messageObj.creatorPhotoUrl ? (
        <img src={messageObj.creatorPhotoUrl} />
      ) : (
        <AccountCircleIcon className={styles.anony} />
      )}
      <span className={styles.nickname}>{messageObj.creatorNickName}</span>
      <span className={styles.message}>{messageObj.message}</span>
      {/* 
      <span className={styles.message_time}>
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
