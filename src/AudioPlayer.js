import React, { useEffect, useRef } from 'react';

function AudioPlayer({ audioBuffer }) {
  const audioContextRef = useRef(null);

  useEffect(() => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    return () => {
      audioContext.close();
      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioBuffer || !audioContextRef.current) {
      return;
    }

    const audioContext = audioContextRef.current;
    const bufferSourceNode = audioContext.createBufferSource();
    bufferSourceNode.buffer = audioBuffer;
    bufferSourceNode.connect(audioContext.destination);
    bufferSourceNode.start();

    return () => {
      bufferSourceNode.stop();
      bufferSourceNode.disconnect();
    };
  }, [audioBuffer]);

  return <div>Você já esta ouvindo a sala</div>;
}

export default AudioPlayer;