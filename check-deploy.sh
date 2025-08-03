#!/bin/bash

echo "🔍 Verificando arquivos para deploy no Render..."
echo "================================================"

# Verificar arquivos essenciais
echo ""
echo "📋 Arquivos Essenciais:"

if [ -f "package.json" ]; then
    echo "✅ package.json"
else
    echo "❌ package.json - FALTANDO"
fi

if [ -f "server.js" ]; then
    echo "✅ server.js"
else
    echo "❌ server.js - FALTANDO"
fi

if [ -f "render.yaml" ]; then
    echo "✅ render.yaml"
else
    echo "❌ render.yaml - FALTANDO"
fi

if [ -f ".env.example" ]; then
    echo "✅ .env.example"
else
    echo "❌ .env.example - FALTANDO"
fi

if [ -f ".gitignore" ]; then
    echo "✅ .gitignore"
else
    echo "❌ .gitignore - FALTANDO"
fi

# Verificar pastas essenciais
echo ""
echo "📁 Pastas Essenciais:"

if [ -d "public" ]; then
    echo "✅ public/"
else
    echo "❌ public/ - FALTANDO"
fi

if [ -d "models" ]; then
    echo "✅ models/"
else
    echo "❌ models/ - FALTANDO"
fi

if [ -d "routes" ]; then
    echo "✅ routes/"
else
    echo "❌ routes/ - FALTANDO"
fi

if [ -d "middleware" ]; then
    echo "✅ middleware/"
else
    echo "❌ middleware/ - FALTANDO"
fi

# Verificar arquivos que NÃO devem ser enviados
echo ""
echo "🚨 Arquivos que NÃO devem ser enviados:"

if [ -f ".env" ]; then
    echo "⚠️  .env (contém senhas - NÃO enviar)"
else
    echo "✅ .env não encontrado (correto)"
fi

if [ -d "node_modules" ]; then
    echo "⚠️  node_modules/ (será instalado no Render - NÃO enviar)"
else
    echo "✅ node_modules/ não encontrado (correto)"
fi

if [ -d "uploads" ]; then
    echo "⚠️  uploads/ (será criado no Render - NÃO enviar)"
else
    echo "✅ uploads/ não encontrado (correto)"
fi

# Testar conexão MongoDB
echo ""
echo "🧪 Testando conexão MongoDB:"
node test-mongodb.js

echo ""
echo "📋 Próximos passos:"
echo "1. Criar repositório no GitHub"
echo "2. Fazer upload dos arquivos"
echo "3. Conectar ao Render"
echo "4. Configurar variáveis de ambiente"
echo "5. Testar o deploy" 