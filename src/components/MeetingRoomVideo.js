import React, { useEffect, useRef, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import styles from "./MeetingRoomVideo.module.scss";
import { Draggable } from "react-beautiful-dnd";

const MeetingRoomVideo = ({ nickName, stream, isOwner, index }) => {
  const ref = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  const toggleMuteMode = () => setIsMuted((prev) => !prev);

  return (
    <Draggable
      disableInteractiveElementBlocking={true}
      draggableId={index + ""}
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          className={styles.room_video}
        >
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
      )}
    </Draggable>
  );
};

export default React.memo(MeetingRoomVideo);
