import React from "react";
import { deleteDoc, doc } from "@firebase/firestore";
import { useTranslation } from "react-i18next";
import { dbService } from "fbase";

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
    <div className="message-box">
      <span>Message: {messageObj.message}</span>
      <span>createAt: {messageObj.createdAt}</span>
      {isOwner ? <button onClick={onDeleteClick}>삭제</button> : ""}
    </div>
  );
};

export default MessageInfo;
