from pymongo import MongoClient

# Conectar MongoDB Atlas
MONGO_URI = "mongodb+srv://amandapriscilaa15:S99rV4gzO6u9MYaw@cluster0.sd5eblw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)

# Verificar banco "test"
db = client["test"]
print("Coleções no banco 'test':", db.list_collection_names())

if "cases" in db.list_collection_names():
    collection = db["cases"]
    print("Total de casos:", collection.count_documents({}))
    
    case = collection.find_one()
    print("Exemplo de caso:")
    print(case)
else:
    print("Coleção 'cases' não encontrada no banco 'test'")
    
    # Verificar todas as coleções de todos os bancos
    for db_name in client.list_database_names():
        if db_name not in ['admin', 'local', 'sample_mflix']:
            db_temp = client[db_name]
            collections = db_temp.list_collection_names()
            if collections:
                print(f"\nBanco '{db_name}' tem coleções:", collections)