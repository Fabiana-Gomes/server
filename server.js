const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir todas as origens
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

const PORT = process.env.PORT || 8000;
let masterReady = false;
let searching = false;
let socket = null;

// Configurar cabeçalhos CORS para Express
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas as origens
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Configurar o servidor para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configurar o servidor para escutar em todas as interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('Master online');
});


// Lógica do Socket.IO
io.on('connection', (socket) => {
  socket.on('identify', (data) => {
    if (data.type === 'master') {
      if (!masterReady) {
        masterReady = true;
      }
      console.log('Master conectado:', socket.id);
      socket.emit('search-peers'); // Inicia a busca automaticamente quando o master se identifica
    } else if (data.type === 'student') {
      console.log('Aluno conectado:', socket.id);
    }
  });

  socket.on('shareScreen', (data) => {
    if (masterSocketId) {
      io.to(masterSocketId).emit('shareScreen', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  
  })
});
