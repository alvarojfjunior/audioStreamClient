import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import AudioPlayer from "./AudioPlayer";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const Chat = () => {
  const [stream, setStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [socket, setSocket] = useState(null);

  //Transmitindo
  useEffect(() => {
    const socket = io(process.env.REACT_APP_STREAM_URL);
    setSocket(socket);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setStream(stream);
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioContext.destination);
        processor.onaudioprocess = (e) => {
          const buffer = e.inputBuffer.getChannelData(0);
          console.log("transmitindo");
          socket.emit("audio", buffer);
        };
        const mediaRecorder = new MediaRecorder(stream);
        setRecorder(mediaRecorder);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }, []);

  //Listening
  useEffect(() => {
    if (!socket) return;
    socket.on("audio", (audio) => {
      const audioData = new Float32Array(audio);
      const audioSource = audioContext.createBufferSource();
      const audioBuffer = audioContext.createBuffer(
        1,
        audioData.length,
        audioContext.sampleRate
      );

      audioBuffer.copyToChannel(audioData, 0);
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div>
      <AudioPlayer audioBuffer={audioBuffer} />
    </div>
  );
};

export default Chat;
