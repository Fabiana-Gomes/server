import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const MasterApp = () => {
  const [peers, setPeers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    if (socket) {
      socket.on('shareScreen', (data) => {
        console.log('Compartilhamento de tela recebido do aluno:', data);

        if (data && data.base64data) {
          const base64String = data.base64data;
          const videoBlob = dataURItoBlob(base64String);
          const videoURL = URL.createObjectURL(videoBlob);

          const remoteVideo = document.createElement('video');
          remoteVideo.src = videoURL;
          remoteVideo.autoplay = true;
          remoteVideo.muted = true;
          document.body.appendChild(remoteVideo);
          remoteVideo.addEventListener('ended', () => {
            URL.revokeObjectURL(videoURL);
          });
        } else {
          console.error('Dados de compartilhamento de tela inválidos:', data);
        }
      });

      return () => {
        socket.disconnect();
        setPeers([]);
      };
    }
  }, [socket]);

  const dataURItoBlob = (dataURI) => {
    const splitIndex = dataURI.indexOf(',');
    const byteString = atob(dataURI.substring(splitIndex + 1));
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: mimeString });
  };

  const toggleSearch = () => {
    if (searching) {
      console.log('Interrompendo busca...');
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    } else {
      console.log('Iniciando busca de pares na rede...');
      const newSocket = io('http://192.168.1.46:8000');
      newSocket.emit('identify', { type: 'master' });
      newSocket.emit('search-peers');
      setSocket(newSocket);
    }
    setSearching((prevSearching) => !prevSearching);
  };

  return (
    <div>
      <h1>Master App - Buscar Compartilhamento</h1>
      <button onClick={toggleSearch}>
        {searching ? 'Interromper busca' : 'Procurar máquinas na rede'}
      </button>
      <div>
        {peers.map((peerObj, index) => (
          <div key={index}>
            <video
              autoPlay
              playsInline
              ref={(videoElement) => {
                if (videoElement && peerObj && peerObj.stream) {
                  videoElement.srcObject = peerObj.stream;
                } else {
                  console.warn('Elemento de vídeo ou stream não está disponível');
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasterApp;
