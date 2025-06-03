cat > build.sh << 'EOF'
#!/bin/bash

echo "🐍 Instalando Python e dependências..."

apt-get update
apt-get install -y python3 python3-pip

# Usar as MESMAS versões do Codespace
pip3 install scikit-learn==1.6.1 numpy==2.2.4 pandas xgboost pymongo

echo "📦 Instalando dependências Node.js..."
yarn install

echo "✅ Build concluído!"
EOF