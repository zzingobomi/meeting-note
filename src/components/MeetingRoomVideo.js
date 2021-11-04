import React, { useEffect, useRef, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import "./MeetingRoomVideo.scss";

const MeetingRoomVideo = ({ nickName, stream, isOwner }) => {
  const ref = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  const toggleMuteMode = () => setIsMuted((prev) => !prev);

  return (
    <div className="meeting-room-video">
      <video ref={ref} muted={isMuted} autoPlay playsInline />
      <span className="meeting-room-nickname">
        {nickName ? nickName : "익명사용자"}
      </span>
      {isOwner ? (
        ""
      ) : (
        <div className="mic-icon-wrapper" onClick={toggleMuteMode}>
          {isMuted ? (
            <MicOffIcon className="mic-iocn" />
          ) : (
            <MicIcon className="mic-iocn" />
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingRoomVideo;
