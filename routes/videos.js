const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const Video = require('../models/Video');

const router = express.Router();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Criar pasta se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Verificar se é um arquivo de vídeo
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use apenas arquivos de vídeo.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB
  }
});

// Validações para criação/edição de vídeo
const videoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres'),
  body('type')
    .isIn(['upload', 'drive', 'url'])
    .withMessage('Tipo deve ser upload, drive ou url'),
  body('url')
    .isURL()
    .withMessage('URL inválida')
];

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// GET /api/videos - Listar vídeos do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { user: req.user._id };
    
    // Adicionar busca se fornecida
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Video.countDocuments(query);

    res.json({
      videos: videos.map(video => video.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/videos - Criar novo vídeo (upload)
router.post('/', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    const { title, description, type, url } = req.body;

    let videoData = {
      user: req.user._id,
      title,
      description,
      type: type || 'upload'
    };

    if (type === 'upload' && req.file) {
      // Vídeo enviado via upload
      videoData.url = `/uploads/${req.file.filename}`;
      videoData.filename = req.file.filename;
      videoData.size = req.file.size;
    } else if (type === 'drive' || type === 'url') {
      // Vídeo do Google Drive ou URL externa
      videoData.url = url;
    } else {
      return res.status(400).json({
        error: 'Arquivo de vídeo é obrigatório para upload'
      });
    }

    const video = new Video(videoData);
    await video.save();

    res.status(201).json({
      message: 'Vídeo criado com sucesso',
      video: video.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    
    if (error.message.includes('Tipo de arquivo não suportado')) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/videos/:id - Obter vídeo específico
router.get('/:id', authenticateToken, checkOwnership('Video'), async (req, res) => {
  try {
    res.json({
      video: req.resource.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao obter vídeo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/videos/:id - Atualizar vídeo
router.put('/:id', authenticateToken, checkOwnership('Video'), videoValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description } = req.body;

    const video = req.resource;
    video.title = title;
    video.description = description;

    await video.save();

    res.json({
      message: 'Vídeo atualizado com sucesso',
      video: video.toPublicJSON()
    });

  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/videos/:id - Deletar vídeo
router.delete('/:id', authenticateToken, checkOwnership('Video'), async (req, res) => {
  try {
    const video = req.resource;

    // Se for upload, deletar arquivo físico
    if (video.type === 'upload' && video.filename) {
      const filePath = path.join(process.env.UPLOAD_PATH || './uploads', video.filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await video.remove();

    res.json({
      message: 'Vídeo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/videos/:id/increment-views - Incrementar visualizações
router.post('/:id/increment-views', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        error: 'Vídeo não encontrado'
      });
    }

    await video.incrementViews();

    res.json({
      message: 'Visualização registrada',
      views: video.views
    });

  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 