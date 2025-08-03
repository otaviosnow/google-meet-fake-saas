#!/bin/bash

echo "🔧 Configuração do MongoDB Atlas"
echo "================================"

echo ""
echo "📝 Sua string de conexão atual:"
echo "mongodb+srv://tavinmktdigital:<db_password>@cluster0.r3u2z3r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
echo ""

echo "🔑 Digite a senha real do MongoDB Atlas:"
read -s MONGODB_PASSWORD

if [ ! -z "$MONGODB_PASSWORD" ]; then
    echo ""
    echo "✅ Configurando arquivo .env..."
    
    # Criar string de conexão completa
    MONGODB_URI="mongodb+srv://tavinmktdigital:${MONGODB_PASSWORD}@cluster0.r3u2z3r.mongodb.net/google-meet-fake?retryWrites=true&w=majority&appName=Cluster0"
    
    # Atualizar arquivo .env
    cat > .env << EOF
# Configurações do Servidor
PORT=10000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=${MONGODB_URI}

# JWT Secret
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100000000

# CORS
CORS_ORIGIN=https://seu-app.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    
    echo "✅ Arquivo .env configurado com sucesso!"
    echo ""
    echo "🧪 Testando conexão..."
    echo "npm run dev"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Execute: npm run dev"
    echo "2. Se funcionar, faça o deploy no Render"
    echo "3. Configure as variáveis no Render Dashboard"
else
    echo "❌ Senha não fornecida"
    echo "💡 Execute novamente e digite a senha"
fi 