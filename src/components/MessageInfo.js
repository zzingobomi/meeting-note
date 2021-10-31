import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const MessageInfo = ({ messageObj }) => {
  const { t } = useTranslation(["page"]);

  return (
    <div className="message-box">
      <span>Message: {messageObj.message}</span>
      <span>createAt: {messageObj.createdAt}</span>
    </div>
  );
};

export default MessageInfo;
