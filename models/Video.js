const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  type: {
    type: String,
    enum: ['upload', 'drive', 'url'],
    required: [true, 'Tipo de vídeo é obrigatório']
  },
  url: {
    type: String,
    required: [true, 'URL do vídeo é obrigatória'],
    trim: true
  },
  filename: {
    type: String,
    trim: true
  },
  size: {
    type: Number, // Tamanho em bytes
    default: 0
  },
  duration: {
    type: Number, // Duração em segundos
    default: 0
  },
  thumbnail: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para melhor performance
videoSchema.index({ user: 1, createdAt: -1 });
videoSchema.index({ isActive: 1 });
videoSchema.index({ type: 1 });

// Método para incrementar visualizações
videoSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método para retornar dados públicos do vídeo
videoSchema.methods.toPublicJSON = function() {
  const videoObject = this.toObject();
  return videoObject;
};

module.exports = mongoose.model('Video', videoSchema); 