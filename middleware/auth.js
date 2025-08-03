const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar se o usuário está autenticado
const authenticateToken = async (req, res, next) => {
  try {
    // Pegar o token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário no banco
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Usuário desativado'
      });
    }

    // Adicionar o usuário ao request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional - não falha se não tiver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continua sem usuário
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }

    next();

  } catch (error) {
    // Se houver erro no token, continua sem usuário
    next();
  }
};

// Middleware para verificar se o usuário é dono do recurso
const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const resourceId = req.params.id;
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          error: 'Recurso não encontrado'
        });
      }

      // Verificar se o usuário é dono do recurso
      if (resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          error: 'Acesso negado'
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      console.error('Erro ao verificar propriedade:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  };
};

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  checkOwnership,
  generateToken
}; 