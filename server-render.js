const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB (opcional para teste)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    console.log('⚠️  Continuando sem MongoDB...');
  });
}

// Rota principal
app.get('/', (req, res) => {
  console.log('📱 Acessando página principal');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para chamadas
app.get('/meet/:meetingId', (req, res) => {
  console.log('🔗 Acessando chamada:', req.params.meetingId);
  res.sendFile(path.join(__dirname, 'public', 'meet.html'));
});

// API de teste
app.get('/api/test', (req, res) => {
  console.log('📋 API de teste acessada');
  res.json({
    status: 'success',
    message: 'API funcionando no Render!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API de autenticação mock
app.post('/api/auth/register', (req, res) => {
  res.json({
    status: 'success',
    message: 'Usuário registrado (demo)',
    token: 'demo_token_123'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    status: 'success',
    message: 'Login realizado (demo)',
    token: 'demo_token_123'
  });
});

// API de vídeos mock
app.get('/api/videos', (req, res) => {
  res.json({
    status: 'success',
    videos: [
      {
        id: 'demo1',
        title: 'Vídeo Demo 1',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'url'
      }
    ]
  });
});

// API de reuniões mock
app.get('/api/meetings', (req, res) => {
  res.json({
    status: 'success',
    meetings: [
      {
        id: 'demo',
        meetingId: 'demo',
        title: 'Reunião Demo',
        video: {
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
        }
      }
    ]
  });
});

// Rota 404 personalizada
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableRoutes: ['/', '/meet/:meetingId', '/api/test', '/api/auth/login', '/api/auth/register']
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Render rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/test`);
  console.log(`🎯 Demo: http://localhost:${PORT}/meet/demo`);
});

module.exports = app; 