//criação do servidor web node.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');

//config do ambiente do server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

const PORT = process.env.PORT || 8000;
let masterReady = false;
let masterSocketId = null;
let connectedStudents = new Set(); 

// Configurar CORS (belzebu)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Configurar o servidor para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('Servidor online');
});

// Lógica do Socket.IO e logs de conexões
io.on('connection', (socket) => {
  // Identificar o tipo de cliente (master ou student)
  socket.on('identify', (data) => {
    if (data.type === 'master') {
      if (!masterReady) {
        masterReady = true;
        masterSocketId = socket.id;
      }
      console.log('Master conectado:', socket.id);
      socket.emit('search-peers'); 
    } else if (data.type === 'student') {
      if (!connectedStudents.has(socket.id)) {
        console.log('Novo aluno conectado:', socket.id);
        connectedStudents.add(socket.id); // Adicionar aluno à lista
      }
    }
  });
  
  socket.on('studentMessage', (data) => {
    console.log(`Mensagem recebida do aluno ${socket.id}:`, data.message);
  });

  socket.on('disconnect', () => {
    if (socket.id === masterSocketId) {
      console.log('Master desconectado');
      masterReady = false;
      masterSocketId = null;
    } else if (connectedStudents.has(socket.id)) {
      console.log('Aluno desconectado:', socket.id);
      connectedStudents.delete(socket.id); // Remover aluno desconectado
    }
  });

  // Receber o compartilhamento de tela do aluno e transmitir ao master
  socket.on('shareScreen', (data) => {
    console.log('Compartilhamento de tela recebido:', data);
    if (masterSocketId) {
      io.to(masterSocketId).emit('shareScreen', data);
    }
  });

  //recebimento de uma oferta do aluno
  socket.on('offer', (data) => {
    console.log(`Oferta recebida do aluno ${socket.id}:`, data);
    socket.on('shareScreen', (data) => {
      console.log('Recebido no servidor:', data);
    });

        // config conexão peer-to-peer
        const peer = new SimplePeer({ 
          wrtc, 
          initiator: false, 
          trickle: false 
        });

        // Emitir resposta 'answer' após receber o sinal
        peer.on('signal', (signal) => {
          socket.emit('answer', { signal });
        });
       
        peer.on('connect', () => {
          console.log('Conexão peer-to-peer estabelecida com o aluno:', socket.id);
        });
    
        // Tratamento de erros na conexão peer-to-peer
        peer.on('error', (err) => {
          console.error('Erro na conexão com o aluno:', err);
        });
    
        // Lógica para lidar com os dados recebidos do aluno
        peer.on('data', (data) => {
          console.log(`Dados recebidos do aluno ${socket.id}:`, data);
        
          if (data instanceof ArrayBuffer) {
            const blob = new Blob([data], { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
                    const remoteVideo = document.createElement('video');
            remoteVideo.src = videoURL;
            remoteVideo.autoplay = true;
            remoteVideo.muted = true; 
            remoteVideo.setAttribute('playsinline', ''); 
            document.body.appendChild(remoteVideo);
            remoteVideo.addEventListener('ended', () => {
             URL.revokeObjectURL(videoURL);
            });
          }
        });        
        peer.signal(data.offer);
      });
    });