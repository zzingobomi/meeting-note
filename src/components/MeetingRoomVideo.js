import React, { useEffect, useRef, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import styles from "./MeetingRoomVideo.module.scss";

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
    <div className={styles.room_video}>
      <video ref={ref} muted={isMuted} autoPlay playsInline />
      <span className={styles.room_nickname}>
        {nickName ? nickName : "익명사용자"}
      </span>
      {isOwner ? (
        ""
      ) : (
        <div className={styles.icon_wrapper} onClick={toggleMuteMode}>
          {isMuted ? (
            <MicOffIcon className={styles.mic_iocn} />
          ) : (
            <MicIcon className={styles.mic_iocn} />
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingRoomVideo;
