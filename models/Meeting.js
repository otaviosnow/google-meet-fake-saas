const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: [true, 'ID da reunião é obrigatório'],
    unique: true,
    default: () => {
      // Gerar ID no formato: abc-def-ghi
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let id = '';
      for (let i = 0; i < 3; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
      id += '-';
      for (let i = 0; i < 3; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
      id += '-';
      for (let i = 0; i < 3; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
      return id;
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Vídeo é obrigatório']
  },
  title: {
    type: String,
    required: [true, 'Título da reunião é obrigatório'],
    trim: true,
    maxlength: [100, 'Título não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 1,
    min: [1, 'Mínimo de 1 participante'],
    max: [100, 'Máximo de 100 participantes']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // Duração em segundos
    default: 0
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
meetingSchema.index({ meetingId: 1 });
meetingSchema.index({ user: 1, createdAt: -1 });
meetingSchema.index({ isActive: 1 });
meetingSchema.index({ isPublic: 1 });

// Método para iniciar a reunião
meetingSchema.methods.startMeeting = function() {
  this.startedAt = new Date();
  this.isActive = true;
  return this.save();
};

// Método para encerrar a reunião
meetingSchema.methods.endMeeting = function() {
  this.endedAt = new Date();
  this.isActive = false;
  if (this.startedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return this.save();
};

// Método para incrementar visualizações
meetingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método para incrementar participantes
meetingSchema.methods.incrementParticipants = function() {
  if (this.currentParticipants < this.maxParticipants) {
    this.currentParticipants += 1;
    return this.save();
  }
  return Promise.reject(new Error('Limite de participantes atingido'));
};

// Método para decrementar participantes
meetingSchema.methods.decrementParticipants = function() {
  if (this.currentParticipants > 0) {
    this.currentParticipants -= 1;
    return this.save();
  }
  return this.save();
};

// Método para retornar dados públicos da reunião
meetingSchema.methods.toPublicJSON = function() {
  const meetingObject = this.toObject();
  return meetingObject;
};

module.exports = mongoose.model('Meeting', meetingSchema); 