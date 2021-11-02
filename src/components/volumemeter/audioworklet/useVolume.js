import React from "react";

function useVolume(stream) {
  const [volume, setVolume] = React.useState(0);

  const ref = React.useRef({});

  const onmessage = React.useCallback((event) => {
    if (!ref.current.audioContext) {
      return;
    }
    if (event.data.volume) {
      setVolume(Math.round(event.data.volume * 200));
    }
  }, []);

  const disconnectAudioContext = React.useCallback(() => {
    if (ref.current.node) {
      try {
        ref.current.node.disconnect();
      } catch (errMsg) {}
    }
    if (ref.current.source) {
      try {
        ref.current.source.disconnect();
      } catch (errMsg) {}
    }
    ref.current.node = null;
    ref.current.source = null;
    ref.current.audioContext = null;
    setVolume(0);
  }, []);

  const connectAudioContext = React.useCallback(
    async (mediaStream) => {
      if (ref.current.audioContext) {
        disconnectAudioContext();
      }
      try {
        ref.current.audioContext = new AudioContext();
        await ref.current.audioContext.audioWorklet.addModule(
          "./worklet/vumeter.js"
        );
        if (!ref.current.audioContext) {
          return;
        }
        ref.current.source =
          ref.current.audioContext.createMediaStreamSource(mediaStream);
        ref.current.node = new AudioWorkletNode(
          ref.current.audioContext,
          "vumeter"
        );
        ref.current.node.port.onmessage = onmessage;
        ref.current.source
          .connect(ref.current.node)
          .connect(ref.current.audioContext.destination);
      } catch (errMsg) {
        disconnectAudioContext();
      }
    },
    [disconnectAudioContext, onmessage]
  );

  React.useEffect(() => {
    setVolume(0);
    if (!stream) {
      return () => {};
    }
    connectAudioContext(stream);
    return () => {
      disconnectAudioContext(stream);
    };
  }, [stream, connectAudioContext, disconnectAudioContext]);

  return volume;
}

export default useVolume;
