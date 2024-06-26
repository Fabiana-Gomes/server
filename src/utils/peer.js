import SimplePeer from 'simple-peer';

// Função para criar uma nova instância de conexão peer-to-peer
export const createPeerConnection = (initiator, stream = null) => {
  const peer = new SimplePeer({ initiator, stream });

  // Manipuladores de eventos para a conexão peer-to-peer
  peer.on('signal', (data) => {
    console.log('Sinal enviado:', data);
    // Aqui você pode emitir ou enviar o sinal para o outro peer
  });

  peer.on('connect', () => {
    console.log('Conexão estabelecida');
    // A conexão foi estabelecida
  });

  peer.on('data', (data) => {
    console.log('Dados recebidos:', data);
    // Manipular dados recebidos do outro peer
  });

  peer.on('stream', (stream) => {
    console.log('Stream recebido:', stream);
    // Manipular o stream recebido do outro peer (por exemplo, exibir em um elemento de vídeo)
  });

  peer.on('close', () => {
    console.log('Conexão fechada');
    // A conexão foi fechada
  });

  peer.on('error', (err) => {
    console.error('Erro na conexão:', err);
    // Lidar com erros na conexão peer-to-peer
  });

  return peer;
};

// Função para iniciar a captura de tela
export const startScreenSharing = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    return stream;
  } catch (error) {
    console.error('Error accessing screen:', error);
    throw error;
  }
};
