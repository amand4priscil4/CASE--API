import pickle
import pandas as pd
import sys
import json
import os

# Obter o diretório do script atual
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'model.pkl')

# Carregar modelo
try:
    with open(model_path, 'rb') as f:
        pipeline = pickle.load(f)
except FileNotFoundError:
    print(json.dumps({"error": f"Modelo não encontrado em: {model_path}"}))
    sys.exit(1)

def predict_case(tipo, localDoCaso):
    # Criar DataFrame para predição
    data = pd.DataFrame({
        'tipo': [tipo],
        'localDoCaso': [localDoCaso]
    })
    
    # Fazer predição
    prediction = pipeline.predict(data)[0]
    probabilities = pipeline.predict_proba(data)[0]
    
    # Obter classes
    classes = pipeline.classes_
    
    # Criar resultado
    result = {
        'predicted_status': prediction,
        'probabilities': {
            classes[i]: float(probabilities[i]) 
            for i in range(len(classes))
        }
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Uso: python predict.py <tipo> <localDoCaso>"}))
        sys.exit(1)
        
    # Receber argumentos da linha de comando
    tipo = sys.argv[1]
    local = sys.argv[2]
    
    try:
        result = predict_case(tipo, local)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)