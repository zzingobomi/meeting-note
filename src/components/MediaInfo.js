import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InputLabel, MenuItem, Select } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import VolumeMeter from "components/volumemeter";
import MicIcon from "@mui/icons-material/Mic";
import "./MediaInfo.scss";

const MediaInfo = ({ onCameraChange }) => {
  const { t } = useTranslation(["page"]);

  const videoPreview = useRef();

  const [error, setError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectCamera, setSelectCamera] = useState("");
  const [stream, setStream] = useState(null);

  useEffect(() => {
    getMedia();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [stream]);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const getMedia = async (deviceId) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      let myStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstrains : initialConstrains
      );
      videoPreview.current.srcObject = myStream;
      setStream(myStream);

      if (!deviceId) {
        await getCameras(myStream);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const getCameras = async (myStream) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCameras = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const cameraArr = videoCameras.map((videoCamera) => ({
        value: videoCamera.deviceId,
        text: videoCamera.label,
      }));
      setCameras(cameraArr);

      let tracks = myStream.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        let deviceId = tracks[i].getSettings().deviceId;
        videoCameras.forEach((videoCamera) => {
          if (deviceId === videoCamera.deviceId) {
            setSelectCamera(deviceId);
            onCameraChange(deviceId);
          }
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCameraChange = async (event) => {
    setSelectCamera(event.target.value);
    onCameraChange(event.target.value);
    await getMedia(event.target.value);
  };

  return (
    <div className="media-box">
      <video
        className="video-preview"
        ref={videoPreview}
        autoPlay
        playsInline
      />
      <div className="mic-wrapper">
        <MicIcon />
        <VolumeMeter className="volume-meter" stream={stream} max={40} />
      </div>
      <FormControl className="select-camera" variant="standard">
        <InputLabel id="select-camera-label">
          {t("page:media_info:select_camera_label")}
        </InputLabel>
        <Select
          labelId="select-camera-label"
          value={selectCamera}
          onChange={handleCameraChange}
          label="Camera"
        >
          {cameras.map((item) => {
            return (
              <MenuItem key={item.value} value={item.value}>
                {item.text}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <div className="error">{error}</div>
    </div>
  );
};

export default MediaInfo;
