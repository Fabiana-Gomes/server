import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const MasterApp = () => {
  const [peers, setPeers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [socket, setSocket] = useState(null);
  const masterVideoRef = useRef(null); 

  useEffect(() => {
    if (socket) {
      socket.on('new-peer', () => {
        console.log('Novo peer encontrado');
        const peer = new SimplePeer({ initiator: true, trickle: false });

        peer.on('signal', (data) => {
          console.log('Sinal enviado para peer');
          socket.emit('offer', { signal: data });
        });

        peer.on('stream', (stream) => {
          console.log('Stream recebido de um novo peer:', stream);
          setPeers((prevPeers) => [...prevPeers, { peer, stream }]);
        });

        peer.on('error', (err) => {
          console.error('Erro na conexão com o peer:', err);
        });

        socket.on('answer', (data) => {
          peer.signal(data.signal);
        });
      });

      socket.on('shareScreen', (stream) => {
        console.log('Compartilhamento de tela recebido do aluno:', stream);
        setPeers((prevPeers) => [...prevPeers, { stream }]);
      });

      return () => {
        socket.disconnect();
        setPeers([]);
      };
    }
  }, [socket]);

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
        {/* Renderizar vídeo do master */}
        <video
          autoPlay
          playsInline
          ref={masterVideoRef}
        />
      </div>
      <div>
        {/* Renderizar vídeos dos alunos */}
        {peers.map((peerObj, index) => (
          <div key={index}>
            <video
              autoPlay
              playsInline
              ref={videoElement => {
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
