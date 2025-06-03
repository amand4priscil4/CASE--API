#!/bin/bash

echo "🐍 Instalando Python e dependências..."

# Instalar Python e pip
apt-get update
apt-get install -y python3 python3-pip

# Instalar dependências Python do ML
pip3 install pandas==2.0.3 scikit-learn==1.3.0 xgboost==1.7.6 pymongo==4.5.0 numpy==1.24.3

echo "📦 Instalando dependências Node.js..."
# Instalar dependências Node
yarn install

echo "✅ Build concluído!"