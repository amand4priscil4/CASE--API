import pandas as pd
from pymongo import MongoClient
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle
import numpy as np

# Conectar MongoDB Atlas
MONGO_URI = "mongodb+srv://amandapriscilaa15:S99rV4gzO6u9MYaw@cluster0.sd5eblw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["test"]  # Banco correto
collection = db["cases"]

print("Conectando ao MongoDB...")

# Buscar dados dos casos
cases = list(collection.find({}, {"_id": 0}))

if not cases:
    print("Nenhum caso encontrado.")
    exit()

# Converter para DataFrame
df = pd.DataFrame(cases)
print(f"Casos encontrados: {len(df)}")
print("Colunas disponíveis:", df.columns.tolist())

# Preparar features e target baseado nos seus dados reais
features = ['tipo', 'localDoCaso']  
target = 'status'

print("Status únicos:", df[target].unique())

# Filtrar dados válidos
df_clean = df.dropna(subset=features + [target])

if len(df_clean) == 0:
    print("Não há dados suficientes para treinar.")
    exit()

X = df_clean[features]
y = df_clean[target]

print(f"Dados para treino: {len(df_clean)} casos")

# Pipeline de processamento
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), features)
    ]
)

# Modelo
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Treinar
pipeline.fit(X, y)

# Salvar modelo
with open('model.pkl', 'wb') as f:
    pickle.dump(pipeline, f)

print("Modelo treinado e salvo como model.pkl")