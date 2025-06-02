# Documentação da API do Sistema de Gerenciamento de Perícias Odontológicas

## URL Base
```
https://case-api-icfc.onrender.com
```

## Autenticação

Todas as rotas (exceto login) requerem autenticação via token JWT. O token deve ser enviado no header de cada requisição:

```
Authorization: Bearer <token>
```

### Login
**Endpoint:** `POST /api/login`

**Descrição:** Autentica um usuário e retorna um token JWT.

**Corpo da Requisição:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "usuario@exemplo.com",
    "role": "admin"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "message": "Credenciais inválidas"
}
```

## Usuários

### Cadastrar Novo Usuário
**Endpoint:** `POST /api/users`

**Restrição:** Apenas administradores podem criar novos usuários.

**Corpo da Requisição:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "matricula": "12345",
  "role": "perito"
}
```

**Observações:**
- `role` deve ser um dos seguintes valores: "admin", "perito" ou "assistente"

**Resposta de Sucesso (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "matricula": "12345",
    "role": "perito"
  }
}
```

### Listar Todos os Usuários
**Endpoint:** `GET /api/users`

**Restrição:** Apenas administradores podem listar todos os usuários.

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "matricula": "12345",
    "role": "perito",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Obter Usuário Específico
**Endpoint:** `GET /api/users/:id`

**Restrição:** Usuários só podem acessar seus próprios dados, a menos que sejam administradores.

**Resposta de Sucesso (200):**
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "matricula": "12345",
  "role": "perito",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Atualizar Usuário
**Endpoint:** `PUT /api/users/:id`

**Restrição:** Usuários só podem atualizar seus próprios dados, a menos que sejam administradores. Apenas administradores podem alterar roles.

**Corpo da Requisição:**
```json
{
  "name": "Novo Nome",
  "email": "novo.email@exemplo.com",
  "password": "novaSenha123",
  "matricula": "54321",
  "role": "assistente"
}
```

**Observações:**
- Todos os campos são opcionais
- Se `password` for fornecido, será criptografado antes de salvar

**Resposta de Sucesso (200):**
```json
{
  "message": "Usuário atualizado com sucesso",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Novo Nome",
    "email": "novo.email@exemplo.com",
    "matricula": "54321",
    "role": "assistente",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Deletar Usuário
**Endpoint:** `DELETE /api/users/:id`

**Restrição:** Apenas administradores podem deletar usuários. Um administrador não pode deletar seu próprio usuário.

**Resposta de Sucesso (200):**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

## Casos

### Criar Novo Caso
**Endpoint:** `POST /api/casos`

**Corpo da Requisição:**
```json
{
  "titulo": "Título do Caso",
  "tipo": "acidente",
  "descricao": "Descrição detalhada do caso",
  "data": "2023-01-01T00:00:00.000Z",
  "status": "em andamento",
  "peritoResponsavel": "60d21b4667d0d8992e610c85",
  "localDoCaso": "Local onde ocorreu o caso",
  "localizacao": {
    "coordenadas": [-46.6333, -23.5505],
    "endereco": "Rua das Flores, 123, São Paulo, SP",
    "complemento": "Próximo ao hospital",
    "referencia": "Em frente à praça central"
  }
}
```

**Observações:**
- `tipo` deve ser um dos seguintes valores: "acidente", "identificação de vítima", "exame criminal", "exumação", "violência doméstica", "avaliação de idade", "avaliação de lesões", "avaliação de danos corporais"
- `status` deve ser um dos seguintes valores: "em andamento", "finalizado", "arquivado"
- `peritoResponsavel` deve ser o ID de um usuário com role "perito"
- `localizacao` é opcional e contém informações geográficas do caso
- `coordenadas` devem estar no formato [longitude, latitude] com valores válidos

**Resposta de Sucesso (201):**
```json
{
  "message": "Caso criado com sucesso.",
  "caso": {
    "_id": "60d21b4667d0d8992e610c86",
    "titulo": "Título do Caso",
    "tipo": "acidente",
    "descricao": "Descrição detalhada do caso",
    "data": "2023-01-01T00:00:00.000Z",
    "status": "em andamento",
    "peritoResponsavel": "60d21b4667d0d8992e610c85",
    "localDoCaso": "Local onde ocorreu o caso",
    "localizacao": {
      "tipo": "Point",
      "coordenadas": [-46.6333, -23.5505],
      "endereco": "Rua das Flores, 123, São Paulo, SP",
      "complemento": "Próximo ao hospital",
      "referencia": "Em frente à praça central"
    },
    "criadoPor": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Listar Todos os Casos
**Endpoint:** `GET /api/casos`

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c86",
    "titulo": "Título do Caso",
    "tipo": "acidente",
    "descricao": "Descrição detalhada do caso",
    "data": "2023-01-01T00:00:00.000Z",
    "status": "em andamento",
    "peritoResponsavel": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Perito",
      "email": "perito@exemplo.com"
    },
    "localDoCaso": "Local onde ocorreu o caso",
    "localizacao": {
      "tipo": "Point",
      "coordenadas": [-46.6333, -23.5505],
      "endereco": "Rua das Flores, 123, São Paulo, SP",
      "complemento": "Próximo ao hospital",
      "referencia": "Em frente à praça central"
    },
    "criadoPor": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Buscar Casos por Proximidade Geográfica
**Endpoint:** `GET /api/casos/nearby`

**Parâmetros de Query:**
- `longitude`: Longitude da posição de referência (obrigatório)
- `latitude`: Latitude da posição de referência (obrigatório)
- `distanceKm`: Distância máxima em quilômetros (opcional, padrão: 10)

**Exemplo:** `GET /api/casos/nearby?longitude=-46.6333&latitude=-23.5505&distanceKm=5`

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c86",
    "titulo": "Caso Próximo",
    "tipo": "acidente",
    "descricao": "Caso localizado próximo às coordenadas informadas",
    "peritoResponsavel": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Perito",
      "email": "perito@exemplo.com"
    },
    "localizacao": {
      "tipo": "Point",
      "coordenadas": [-46.6340, -23.5510],
      "endereco": "Rua Próxima, 456",
      "referencia": "Próximo ao local de referência"
    }
  }
]
```

**Resposta de Erro (400):**
```json
{
  "message": "Longitude e latitude são obrigatórios para busca por localização."
}
```

### Buscar Caso por ID
**Endpoint:** `GET /api/casos/:id`

**Resposta de Sucesso (200):**
```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "titulo": "Título do Caso",
  "tipo": "acidente",
  "descricao": "Descrição detalhada do caso",
  "data": "2023-01-01T00:00:00.000Z",
  "status": "em andamento",
  "peritoResponsavel": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Nome do Perito",
    "email": "perito@exemplo.com"
  },
  "localDoCaso": "Local onde ocorreu o caso",
  "localizacao": {
    "tipo": "Point",
    "coordenadas": [-46.6333, -23.5505],
    "endereco": "Rua das Flores, 123, São Paulo, SP",
    "complemento": "Próximo ao hospital",
    "referencia": "Em frente à praça central"
  },
  "criadoPor": "60d21b4667d0d8992e610c85",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Editar Caso
**Endpoint:** `PUT /api/casos/:id`

**Corpo da Requisição:**
```json
{
  "titulo": "Novo Título",
  "tipo": "exame criminal",
  "descricao": "Nova descrição",
  "data": "2023-02-01T00:00:00.000Z",
  "status": "finalizado",
  "peritoResponsavel": "60d21b4667d0d8992e610c87",
  "localDoCaso": "Novo local",
  "localizacao": {
    "coordenadas": [-46.6500, -23.5600],
    "endereco": "Nova Rua, 789",
    "complemento": "Novo complemento",
    "referencia": "Nova referência"
  }
}
```

**Observações:**
- Todos os campos são opcionais
- Coordenadas devem ser válidas: longitude entre -180 e 180, latitude entre -90 e 90

**Resposta de Sucesso (200):**
```json
{
  "message": "Caso atualizado com sucesso.",
  "caso": {
    "_id": "60d21b4667d0d8992e610c86",
    "titulo": "Novo Título",
    "tipo": "exame criminal",
    "descricao": "Nova descrição",
    "data": "2023-02-01T00:00:00.000Z",
    "status": "finalizado",
    "peritoResponsavel": {
      "_id": "60d21b4667d0d8992e610c87",
      "name": "Outro Perito",
      "email": "outro.perito@exemplo.com"
    },
    "localDoCaso": "Novo local",
    "localizacao": {
      "tipo": "Point",
      "coordenadas": [-46.6500, -23.5600],
      "endereco": "Nova Rua, 789",
      "complemento": "Novo complemento",
      "referencia": "Nova referência"
    },
    "criadoPor": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-02-01T00:00:00.000Z"
  }
}
```

### Deletar Caso
**Endpoint:** `DELETE /api/casos/:id`

**Resposta de Sucesso (200):**
```json
{
  "message": "Caso deletado com sucesso."
}
```

## Evidências

### Criar Evidência
**Endpoint:** `POST /api/evidencias`

**Restrição:** Usuários autenticados podem criar evidências.

**Corpo da Requisição:**
Deve ser enviado como `multipart/form-data` para permitir o upload de arquivo.

```
titulo: "Título da Evidência"
descricao: "Descrição detalhada da evidência"
localColeta: "Local onde a evidência foi coletada"
dataColeta: "2023-01-01T00:00:00.000Z"
caso: "60d21b4667d0d8992e610c86"
arquivo: [ARQUIVO BINÁRIO]
```

**Observações:**
- O campo `arquivo` deve conter um arquivo de imagem ou documento (obrigatório)
- O campo `dataColeta` é obrigatório
- O tipo de arquivo será determinado automaticamente com base no MIME type
- O perfil do usuário será formatado automaticamente para match do enum

**Resposta de Sucesso (201):**
```json
{
  "message": "Evidência cadastrada com sucesso.",
  "evidencia": {
    "_id": "60d21b4667d0d8992e610c88",
    "titulo": "Título da Evidência",
    "descricao": "Descrição detalhada da evidência",
    "localColeta": "Local onde a evidência foi coletada",
    "dataColeta": "2023-01-01T00:00:00.000Z",
    "criadoEm": "2023-01-01T00:00:00.000Z",
    "tipoArquivo": "imagem",
    "arquivo": "nome_do_arquivo.jpg",
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Usuário",
      "perfil": "Perito"
    }
  }
}
```

**Resposta de Erro (400):**
```json
{
  "message": "Arquivo da evidência é obrigatório."
}
```

### Listar Evidências por Caso
**Endpoint:** `GET /api/evidencias`

**Restrição:** Apenas usuários com role "admin", "perito" ou "assistente" podem listar evidências.

**Parâmetros de Query:**
- `casoId`: ID do caso para o qual se deseja listar as evidências (obrigatório)

**Exemplo:** `GET /api/evidencias?casoId=60d21b4667d0d8992e610c86`

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c88",
    "titulo": "Título da Evidência",
    "descricao": "Descrição detalhada da evidência",
    "localColeta": "Local onde a evidência foi coletada",
    "dataColeta": "2023-01-01T00:00:00.000Z",
    "criadoEm": "2023-01-01T00:00:00.000Z",
    "tipoArquivo": "imagem",
    "arquivo": "nome_do_arquivo.jpg",
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Usuário",
      "perfil": "Perito"
    }
  }
]
```

**Resposta de Erro (400):**
```json
{
  "message": "ID do caso não informado."
}
```

### Editar Evidência
**Endpoint:** `PUT /api/evidencias/:id`

**Restrição:** Apenas usuários com role "admin", "perito" ou "assistente" podem editar evidências.

**Corpo da Requisição:**
```json
{
  "titulo": "Novo Título",
  "descricao": "Nova descrição",
  "localColeta": "Novo local de coleta",
  "dataColeta": "2023-02-01T00:00:00.000Z"
}
```

**Observações:**
- Todos os campos são opcionais
- Não é possível alterar o arquivo ou o caso associado através desta rota

**Resposta de Sucesso (200):**
```json
{
  "message": "Evidência atualizada com sucesso.",
  "evidencia": {
    "_id": "60d21b4667d0d8992e610c88",
    "titulo": "Novo Título",
    "descricao": "Nova descrição",
    "localColeta": "Novo local de coleta",
    "dataColeta": "2023-02-01T00:00:00.000Z",
    "criadoEm": "2023-01-01T00:00:00.000Z",
    "tipoArquivo": "imagem",
    "arquivo": "nome_do_arquivo.jpg",
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Usuário",
      "perfil": "Perito"
    }
  }
}
```

**Resposta de Erro (404):**
```json
{
  "message": "Evidência não encontrada."
}
```

## Laudos

### Criar Laudo
**Endpoint:** `POST /api/laudos`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem criar laudos.

**Corpo da Requisição:**
```json
{
  "caso": "60d21b4667d0d8992e610c86",
  "evidencias": ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c8a"],
  "texto": "Texto detalhado do laudo técnico"
}
```

**Observações:**
- `caso` e `texto` são obrigatórios
- `evidencias` é opcional e deve conter um array de IDs de evidências

**Resposta de Sucesso (201):**
```json
{
  "message": "Laudo criado com sucesso.",
  "laudo": {
    "_id": "60d21b4667d0d8992e610c8b",
    "caso": "60d21b4667d0d8992e610c86",
    "evidencias": ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c8a"],
    "texto": "Texto detalhado do laudo técnico",
    "autor": "60d21b4667d0d8992e610c85",
    "criadoEm": "2023-01-01T00:00:00.000Z"
  }
}
```

## Vítimas

### Criar Nova Vítima
**Endpoint:** `POST /api/vitimas`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem criar vítimas.

**Corpo da Requisição:**
```json
{
  "nic": "NIC123456",
  "nome": "João Silva",
  "genero": "masculino",
  "idade": 35,
  "documento": {
    "tipo": "cpf",
    "numero": "123.456.789-00"
  },
  "endereco": {
    "logradouro": "Rua das Flores, 123",
    "numero": "123",
    "complemento": "Apt 45",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "corEtnia": "branca",
  "odontograma": {
    "arcadaSuperior": [],
    "arcadaInferior": [],
    "observacoesGerais": "Observações gerais do exame",
    "metodologia": "Metodologia utilizada no exame"
  },
  "regioesAnatomicas": [
    {
      "regiao": {
        "codigo": "R001",
        "nome": "Crânio"
      },
      "tipo": "fraturas",
      "descricao": "Fratura parietal esquerda"
    }
  ],
  "caso": "60d21b4667d0d8992e610c86"
}
```

**Observações:**
- `nic`, `nome`, `genero`, `idade`, `documento` e `caso` são obrigatórios
- `nic` deve ser único no sistema
- `genero` deve ser: "masculino", "feminino" ou "outro"
- `documento.tipo` deve ser: "rg", "cpf", "passaporte" ou "outro"
- `corEtnia` deve ser: "branca", "preta", "parda", "amarela" ou "indígena"
- Se `odontograma` não for fornecido, será inicializado automaticamente com todos os dentes

**Resposta de Sucesso (201):**
```json
{
  "message": "Vítima cadastrada com sucesso.",
  "vitima": {
    "_id": "60d21b4667d0d8992e610c90",
    "nic": "NIC123456",
    "nome": "João Silva",
    "genero": "masculino",
    "idade": 35,
    "documento": {
      "tipo": "cpf",
      "numero": "123.456.789-00"
    },
    "endereco": {
      "logradouro": "Rua das Flores, 123",
      "numero": "123",
      "complemento": "Apt 45",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    },
    "corEtnia": "branca",
    "odontograma": {
      "arcadaSuperior": [
        {
          "numero": "18",
          "presente": true,
          "condicoes": [],
          "observacoes": ""
        }
      ],
      "arcadaInferior": [
        {
          "numero": "48",
          "presente": true,
          "condicoes": [],
          "observacoes": ""
        }
      ],
      "observacoesGerais": "",
      "metodologia": "",
      "dataExame": "2023-01-01T00:00:00.000Z"
    },
    "regioesAnatomicas": [
      {
        "regiao": {
          "codigo": "R001",
          "nome": "Crânio"
        },
        "tipo": "fraturas",
        "descricao": "Fratura parietal esquerda",
        "dataRegistro": "2023-01-01T00:00:00.000Z"
      }
    ],
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "message": "NIC já existe no sistema."
}
```

### Listar Vítimas por Caso
**Endpoint:** `GET /api/vitimas/caso/:casoId`

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c90",
    "nic": "NIC123456",
    "nome": "João Silva",
    "genero": "masculino",
    "idade": 35,
    "caso": {
      "_id": "60d21b4667d0d8992e610c86",
      "titulo": "Título do Caso",
      "status": "em andamento"
    },
    "criadoPor": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Usuário"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Buscar Vítima por ID
**Endpoint:** `GET /api/vitimas/:id`

**Resposta de Sucesso (200):**
```json
{
  "_id": "60d21b4667d0d8992e610c90",
  "nic": "NIC123456",
  "nome": "João Silva",
  "genero": "masculino",
  "idade": 35,
  "documento": {
    "tipo": "cpf",
    "numero": "123.456.789-00"
  },
  "endereco": {
    "logradouro": "Rua das Flores, 123",
    "numero": "123",
    "complemento": "Apt 45",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "corEtnia": "branca",
  "odontograma": {
    "arcadaSuperior": [
      {
        "numero": "18",
        "presente": true,
        "condicoes": [
          {
            "tipo": "cariado",
            "faces": ["oclusal"],
            "descricao": "Cárie pequena",
            "dataRegistro": "2023-01-01T00:00:00.000Z",
            "registradoPor": "60d21b4667d0d8992e610c85"
          }
        ],
        "observacoes": "Dente com cárie oclusal",
        "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
      }
    ],
    "arcadaInferior": [],
    "observacoesGerais": "Exame realizado com boa visibilidade",
    "metodologia": "Exame visual e radiográfico",
    "dataExame": "2023-01-01T00:00:00.000Z"
  },
  "regioesAnatomicas": [],
  "caso": {
    "_id": "60d21b4667d0d8992e610c86",
    "titulo": "Título do Caso",
    "status": "em andamento"
  },
  "criadoPor": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Nome do Usuário"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Atualizar Vítima
**Endpoint:** `PUT /api/vitimas/:id`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem atualizar vítimas.

**Corpo da Requisição:**
```json
{
  "nome": "João Silva Santos",
  "idade": 36,
  "endereco": {
    "logradouro": "Rua das Rosas, 456",
    "numero": "456",
    "bairro": "Jardim",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-890"
  }
}
```

**Observações:**
- Todos os campos são opcionais
- Apenas os campos enviados serão atualizados
- Se o NIC for alterado, será verificado se já existe no sistema

**Resposta de Sucesso (200):**
```json
{
  "message": "Vítima atualizada com sucesso.",
  "vitima": {
    "_id": "60d21b4667d0d8992e610c90",
    "nic": "NIC123456",
    "nome": "João Silva Santos",
    "genero": "masculino",
    "idade": 36,
    "documento": {
      "tipo": "cpf",
      "numero": "123.456.789-00"
    },
    "endereco": {
      "logradouro": "Rua das Rosas, 456",
      "numero": "456",
      "bairro": "Jardim",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-890"
    },
    "caso": {
      "_id": "60d21b4667d0d8992e610c86",
      "titulo": "Título do Caso"
    },
    "criadoPor": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Nome do Usuário"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Deletar Vítima
**Endpoint:** `DELETE /api/vitimas/:id`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem deletar vítimas.

**Resposta de Sucesso (200):**
```json
{
  "message": "Vítima removida com sucesso."
}
```

## Odontograma

### Obter Odontograma Completo
**Endpoint:** `GET /api/vitimas/:id/odontograma`

**Resposta de Sucesso (200):**
```json
{
  "arcadaSuperior": [
    {
      "numero": "18",
      "presente": true,
      "condicoes": [
        {
          "_id": "60d21b4667d0d8992e610c91",
          "tipo": "cariado",
          "faces": ["oclusal"],
          "descricao": "Cárie pequena",
          "dataRegistro": "2023-01-01T00:00:00.000Z",
          "registradoPor": "60d21b4667d0d8992e610c85"
        }
      ],
      "observacoes": "Dente com cárie oclusal",
      "coordenadas": {
        "x": 100,
        "y": 150
      },
      "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
    }
  ],
  "arcadaInferior": [],
  "observacoesGerais": "Exame realizado com boa visibilidade",
  "metodologia": "Exame visual e radiográfico",
  "dataExame": "2023-01-01T00:00:00.000Z"
}
```

### Atualizar Odontograma Completo
**Endpoint:** `PUT /api/vitimas/:id/odontograma`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem atualizar odontogramas.

**Corpo da Requisição:**
```json
{
  "odontograma": {
    "arcadaSuperior": [
      {
        "numero": "18",
        "presente": true,
        "condicoes": [
          {
            "tipo": "restaurado",
            "faces": ["oclusal"],
            "descricao": "Restauração em resina"
          }
        ],
        "observacoes": "Dente restaurado"
      }
    ],
    "arcadaInferior": [],
    "observacoesGerais": "Exame completo realizado",
    "metodologia": "Exame visual, tátil e radiográfico"
  }
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Odontograma atualizado com sucesso",
  "vitima": {
    "_id": "60d21b4667d0d8992e610c90",
    "nic": "NIC123456",
    "nome": "João Silva",
    "odontograma": {
      "arcadaSuperior": [
        {
          "numero": "18",
          "presente": true,
          "condicoes": [
            {
              "_id": "60d21b4667d0d8992e610c92",
              "tipo": "restaurado",
              "faces": ["oclusal"],
              "descricao": "Restauração em resina",
              "dataRegistro": "2023-01-01T00:00:00.000Z",
              "registradoPor": "60d21b4667d0d8992e610c85"
            }
          ],
          "observacoes": "Dente restaurado",
          "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
        }
      ],
      "arcadaInferior": [],
      "observacoesGerais": "Exame completo realizado",
      "metodologia": "Exame visual, tátil e radiográfico",
      "dataExame": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Atualizar Dente Específico
**Endpoint:** `PUT /api/vitimas/:id/odontograma/dente/:numeroDente`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem atualizar dentes.

**Corpo da Requisição:**
```json
{
  "condicao": {
    "tipo": "fraturado",
    "faces": ["incisal"],
    "descricao": "Fratura da borda incisal"
  },
  "observacoes": "Fratura recente",
  "presente": true
}
```

**Observações:**
- `numeroDente` deve ser um número de dente válido (ex: "11", "21", "31", "41")
- Tipos de condição válidos: "hígido", "cariado", "restaurado", "fraturado", "ausente", "implante", "protese", "canal", "coroa", "ponte", "aparelho", "outro"
- Faces válidas: "mesial", "distal", "oclusal", "vestibular", "lingual", "incisal", "cervical"

**Resposta de Sucesso (200):**
```json
{
  "message": "Dente atualizado com sucesso",
  "dente": {
    "numero": "11",
    "presente": true,
    "condicoes": [
      {
        "_id": "60d21b4667d0d8992e610c93",
        "tipo": "fraturado",
        "faces": ["incisal"],
        "descricao": "Fratura da borda incisal",
        "dataRegistro": "2023-01-01T00:00:00.000Z",
        "registradoPor": "60d21b4667d0d8992e610c85"
      }
    ],
    "observacoes": "Fratura recente",
    "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
  }
}
```

### Adicionar Condição a um Dente
**Endpoint:** `POST /api/vitimas/:id/odontograma/dente/:numeroDente/condicao`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem adicionar condições.

**Corpo da Requisição:**
```json
{
  "tipo": "cariado",
  "faces": ["oclusal", "mesial"],
  "descricao": "Cárie extensa envolvendo duas faces"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Condição adicionada com sucesso",
  "dente": {
    "numero": "16",
    "presente": true,
    "condicoes": [
      {
        "_id": "60d21b4667d0d8992e610c94",
        "tipo": "cariado",
        "faces": ["oclusal", "mesial"],
        "descricao": "Cárie extensa envolvendo duas faces",
        "dataRegistro": "2023-01-01T00:00:00.000Z",
        "registradoPor": "60d21b4667d0d8992e610c85"
      }
    ],
    "observacoes": "",
    "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
  }
}
```

### Remover Condição de um Dente
**Endpoint:** `DELETE /api/vitimas/:id/odontograma/dente/:numeroDente/condicao/:condicaoId`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem remover condições.

**Resposta de Sucesso (200):**
```json
{
  "message": "Condição removida com sucesso",
  "dente": {
    "numero": "16",
    "presente": true,
    "condicoes": [],
    "observacoes": "",
    "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
  }
}
```

### Atualizar Observações de um Dente
**Endpoint:** `PUT /api/vitimas/:id/odontograma/dente/:numeroDente/observacoes`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem atualizar observações.

**Corpo da Requisição:**
```json
{
  "observacoes": "Dente com mobilidade grau II"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Observações atualizadas com sucesso",
  "dente": {
    "numero": "21",
    "presente": true,
    "condicoes": [],
    "observacoes": "Dente com mobilidade grau II",
    "ultimaAtualizacao": "2023-01-01T00:00:00.000Z"
  }
}
```

### Atualizar Regiões Anatômicas
**Endpoint:** `PUT /api/vitimas/:id/regioes-anatomicas`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem atualizar regiões anatômicas.

**Corpo da Requisição:**
```json
{
  "regioesAnatomicas": [
    {
      "regiao": {
        "codigo": "R001",
        "nome": "Crânio"
      },
      "tipo": "fraturas",
      "descricao": "Fratura parietal esquerda com deslocamento"
    },
    {
      "regiao": {
        "codigo": "R002",
        "nome": "Mandíbula"
      },
      "tipo": "lesões",
      "descricao": "Fratura bilateral do corpo mandibular"
    }
  ]
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Regiões anatômicas atualizadas com sucesso",
  "vitima": {
    "_id": "60d21b4667d0d8992e610c90",
    "nic": "NIC123456",
    "nome": "João Silva",
    "regioesAnatomicas": [
      {
        "regiao": {
          "codigo": "R001",
          "nome": "Crânio"
        },
        "tipo": "fraturas",
        "descricao": "Fratura parietal esquerda com deslocamento",
        "dataRegistro": "2023-01-01T00:00:00.000Z"
      },
      {
        "regiao": {
          "codigo": "R002",
          "nome": "Mandíbula"
        },
        "tipo": "lesões",
        "descricao": "Fratura bilateral do corpo mandibular",
        "dataRegistro": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Histórico

### Listar Histórico por Caso
**Endpoint:** `GET /api/historico/caso/:caseId`

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c89",
    "acao": "Relatório final criado",
    "usuario": {
      "_id": "60d21b4667d0d8992e610c85",
      "nome": "Nome do Usuário"
    },
    "caso": "60d21b4667d0d8992e610c86",
    "data": "2023-01-01T00:00:00.000Z",
    "detalhes": "O usuário criou o relatório final com o título \"Título do Relatório\"."
  }
]
```

### Listar Histórico Geral
**Endpoint:** `GET /api/historico/todos`

**Resposta de Sucesso (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c89",
    "acao": "Relatório final criado",
    "usuario": {
      "_id": "60d21b4667d0d8992e610c85",
      "nome": "Nome do Usuário"
    },
    "caso": {
      "_id": "60d21b4667d0d8992e610c86",
      "titulo": "Título do Caso"
    },
    "data": "2023-01-01T00:00:00.000Z",
    "detalhes": "O usuário criou o relatório final com o título \"Título do Relatório\"."
  }
]
```

## Relatórios

### Criar Relatório Final
**Endpoint:** `POST /api/relatorios/:caseId`

**Corpo da Requisição:**
```json
{
  "titulo": "Título do Relatório",
  "texto": "Conteúdo detalhado do relatório final"
}
```

**Observações:**
- Ao criar um relatório final, o status do caso é automaticamente alterado para "Finalizado"
- Um cabeçalho é gerado automaticamente com informações do caso

**Resposta de Sucesso (201):**
```json
{
  "message": "Relatório final criado com sucesso e caso fechado.",
  "relatorio": {
    "_id": "60d21b4667d0d8992e610c8c",
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": "60d21b4667d0d8992e610c85",
    "titulo": "Título do Relatório",
    "texto": "Relatório Final\n\nCaso: Título do Caso\nNúmero do Caso: 60d21b4667d0d8992e610c86\nResponsável: Nome do Perito\nData de Abertura: 01/01/2023\nStatus: Finalizado\n\n-----------------------------\n\nConteúdo detalhado do relatório final",
    "criadoEm": "2023-01-01T00:00:00.000Z"
  }
}
```

### Buscar Relatório Final de um Caso
**Endpoint:** `GET /api/relatorios/:caseId`

**Resposta de Sucesso (200):**
```json
{
  "_id": "60d21b4667d0d8992e610c8c",
  "caso": "60d21b4667d0d8992e610c86",
  "criadoPor": {
    "_id": "60d21b4667d0d8992e610c85",
    "nome": "Nome do Usuário"
  },
  "titulo": "Título do Relatório",
  "texto": "Relatório Final\n\nCaso: Título do Caso\nNúmero do Caso: 60d21b4667d0d8992e610c86\nResponsável: Nome do Perito\nData de Abertura: 01/01/2023\nStatus: Finalizado\n\n-----------------------------\n\nConteúdo detalhado do relatório final",
  "criadoEm": "2023-01-01T00:00:00.000Z"
}
```

### Exportar Relatório em PDF
**Endpoint:** `GET /api/relatorios/:caseId/pdf`

**Resposta de Sucesso:**
Um arquivo PDF contendo o relatório formatado.

**Headers da Resposta:**
```
Content-Disposition: attachment; filename="relatorio_caso_60d21b4667d0d8992e610c86.pdf"
Content-Type: application/pdf
```

## Rota Protegida (Teste de Autenticação)

### Verificar Autenticação
**Endpoint:** `GET /api/protegido`

**Resposta de Sucesso (200):**
```json
{
  "message": "Parabéns! Você está autenticado.",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "usuario@exemplo.com",
    "role": "admin"
  }
}
```

## Modelos de Dados

### User
```javascript
{
  name: String,          // Nome do usuário (obrigatório)
  email: String,         // Email do usuário (obrigatório, único)
  password: String,      // Senha criptografada (obrigatório)
  role: String,          // Papel do usuário: 'admin', 'perito' ou 'assistente' (padrão: 'perito')
  createdAt: Date,       // Data de criação (automático)
  updatedAt: Date        // Data de atualização (automático)
}
```

### Case
```javascript
{
  titulo: String,        // Título do caso (obrigatório)
  tipo: String,          // Tipo do caso: 'acidente', 'identificação de vítima', etc. (obrigatório)
  descricao: String,     // Descrição detalhada do caso (obrigatório)
  data: Date,            // Data do caso (padrão: data atual)
  status: String,        // Status do caso: 'em andamento', 'finalizado', 'arquivado' (padrão: 'em andamento')
  peritoResponsavel: ObjectId, // Referência ao usuário responsável (obrigatório)
  localDoCaso: String,   // Local onde ocorreu o caso (obrigatório)
  localizacao: {         // Localização geográfica do caso (opcional)
    tipo: String,        // Tipo GeoJSON: 'Point' (padrão)
    coordenadas: [Number], // [longitude, latitude] (obrigatório se localizacao fornecida)
    endereco: String,    // Endereço textual (opcional)
    complemento: String, // Complemento do endereço (opcional)
    referencia: String   // Referência para localização (opcional)
  },
  criadoPor: ObjectId,   // Referência ao usuário que criou o caso (obrigatório)
  ultimaAtualizacao: Date, // Data da última atualização (automático)
  atualizadoPor: ObjectId, // Referência ao usuário que fez a última atualização (opcional)
  createdAt: Date,       // Data de criação (automático)
  updatedAt: Date        // Data de atualização (automático)
}
```

### Evidence
```javascript
{
  titulo: String,        // Título da evidência (obrigatório)
  descricao: String,     // Descrição detalhada da evidência (obrigatório)
  localColeta: String,   // Local onde a evidência foi coletada (obrigatório)
  dataColeta: Date,      // Data de coleta da evidência (obrigatório)
  criadoEm: Date,        // Data de criação (padrão: data atual)
  tipoArquivo: String,   // Tipo do arquivo: 'imagem' ou 'documento' (obrigatório)
  arquivo: String,       // Caminho ou URL do arquivo (obrigatório)
  caso: ObjectId,        // Referência ao caso associado (obrigatório)
  criadoPor: {           // Informações do criador (obrigatório)
    id: ObjectId,        // ID do usuário
    name: String,        // Nome do usuário
    perfil: String       // Perfil do usuário: 'Admin', 'Perito' ou 'Assistente'
  }
}
```

### Vitima
```javascript
{
  nic: String,           // Número de Identificação Cadavérica (obrigatório, único)
  nome: String,          // Nome da vítima (obrigatório)
  genero: String,        // Gênero: 'masculino', 'feminino', 'outro' (obrigatório)
  idade: Number,         // Idade da vítima (obrigatório)
  documento: {           // Documento de identificação (obrigatório)
    tipo: String,        // Tipo: 'rg', 'cpf', 'passaporte', 'outro' (obrigatório)
    numero: String       // Número do documento (obrigatório)
  },
  endereco: {            // Endereço da vítima
    logradouro: String,  // Logradouro
    numero: String,      // Número
    complemento: String, // Complemento
    bairro: String,      // Bairro
    cidade: String,      // Cidade
    estado: String,      // Estado
    cep: String          // CEP
  },
  corEtnia: String,      // Cor/Etnia: 'branca', 'preta', 'parda', 'amarela', 'indígena'
  odontograma: {         // Informações odontológicas detalhadas
    arcadaSuperior: [{   // Dentes da arcada superior
      numero: String,    // Número do dente (ex: "18", "17", "16")
      presente: Boolean, // Se o dente está presente (padrão: true)
      condicoes: [{      // Condições dentárias
        tipo: String,    // Tipo: 'hígido', 'cariado', 'restaurado', 'fraturado', 'ausente', 'implante', 'protese', 'canal', 'coroa', 'ponte', 'aparelho', 'outro'
        faces: [String], // Faces envolvidas: 'mesial', 'distal', 'oclusal', 'vestibular', 'lingual', 'incisal', 'cervical'
        descricao: String, // Descrição da condição
        dataRegistro: Date, // Data do registro (automático)
        registradoPor: ObjectId // Usuário que registrou
      }],
      observacoes: String, // Observações específicas do dente
      coordenadas: {     // Coordenadas para posicionamento visual
        x: Number,
        y: Number
      },
      ultimaAtualizacao: Date // Data da última atualização
    }],
    arcadaInferior: [{   // Dentes da arcada inferior (mesma estrutura)
      numero: String,
      presente: Boolean,
      condicoes: Array,
      observacoes: String,
      coordenadas: Object,
      ultimaAtualizacao: Date
    }],
    observacoesGerais: String, // Observações gerais do exame
    metodologia: String,       // Metodologia utilizada no exame
    dataExame: Date           // Data do exame (padrão: data atual)
  },
  regioesAnatomicas: [{  // Regiões anatômicas examinadas
    regiao: {
      codigo: String,    // Código da região
      nome: String       // Nome da região
    },
    tipo: String,        // Tipo de exame/lesão
    descricao: String,   // Descrição detalhada
    dataRegistro: Date   // Data do registro (padrão: data atual)
  }],
  caso: ObjectId,        // Referência ao caso associado (obrigatório)
  criadoPor: ObjectId,   // Referência ao usuário que criou (obrigatório)
  createdAt: Date,       // Data de criação (automático)
  updatedAt: Date        // Data de atualização (automático)
}
```

### Historico
```javascript
{
  acao: String,          // Descrição da ação realizada (obrigatório)
  usuario: ObjectId,     // Referência ao usuário que realizou a ação
  caso: ObjectId,        // Referência ao caso associado
  data: Date,            // Data da ação (padrão: data atual)
  detalhes: String       // Detalhes adicionais sobre a ação
}
```

### Laudo
```javascript
{
  caso: ObjectId,        // Referência ao caso associado (obrigatório)
  evidencias: [ObjectId], // Lista de referências às evidências associadas
  texto: String,         // Conteúdo técnico do laudo (obrigatório)
  autor: ObjectId,       // Referência ao usuário autor do laudo (obrigatório)
  criadoEm: Date         // Data de criação (padrão: data atual)
}
```

### RelatorioFinal
```javascript
{
  caso: ObjectId,        // Referência ao caso associado (obrigatório)
  criadoPor: ObjectId,   // Referência ao usuário que criou o relatório (obrigatório)
  titulo: String,        // Título do relatório (obrigatório)
  texto: String,         // Conteúdo do relatório (obrigatório)
  criadoEm: Date         // Data de criação (padrão: data atual)
}
```

### Counter
```javascript
{
  _id: String,           // Identificador do contador (obrigatório)
  sequence: Number       // Valor da sequência (padrão: 0)
}
```

## Observações Importantes

1. **Autenticação**: Todas as rotas (exceto login) requerem autenticação via token JWT.

2. **Controle de Acesso**: Várias rotas têm restrições baseadas no papel (role) do usuário:
   - Administradores têm acesso completo
   - Peritos podem criar laudos, vítimas e têm acesso limitado a certas operações
   - Assistentes têm acesso ainda mais restrito

3. **Upload de Arquivos**: A rota de criação de evidências requer envio de arquivo via `multipart/form-data`.

4. **Relatórios em PDF**: A exportação de relatórios em PDF retorna um arquivo binário, não um JSON.

5. **Histórico Automático**: Algumas ações (como criar um relatório final, cadastrar uma vítima, ou atualizar odontograma) geram entradas automáticas no histórico.

6. **Status do Caso**: Criar um relatório final altera automaticamente o status do caso para "Finalizado".

7. **NIC Único**: O NIC (Número de Identificação Cadavérica) deve ser único para cada vítima cadastrada no sistema.

8. **Odontograma Avançado**: 
   - As informações odontológicas são estruturadas em arcadas superior e inferior
   - Cada dente possui número, estado de presença, condições específicas e observações
   - Suporte a múltiplas condições por dente (cárie, restauração, fratura, etc.)
   - Cada condição pode afetar faces específicas do dente
   - Controle de versioning com data de última atualização por dente

9. **Condições Dentárias**: Tipos disponíveis são "hígido", "cariado", "restaurado", "fraturado", "ausente", "implante", "protese", "canal", "coroa", "ponte", "aparelho", "outro".

10. **Faces Dentárias**: Faces disponíveis são "mesial", "distal", "oclusal", "vestibular", "lingual", "incisal", "cervical".

11. **Regiões Anatômicas**: Permite o registro de exames e achados em diferentes regiões anatômicas da vítima.

12. **Geolocalização**: Os casos podem incluir informações geográficas precisas usando coordenadas GeoJSON, permitindo busca por proximidade e mapeamento de casos.

13. **Busca por Proximidade**: A rota `/nearby` permite encontrar casos próximos a uma localização específica, útil para análise de padrões geográficos e logística de equipes.

14. **Validação de Coordenadas**: As coordenadas são validadas automaticamente: longitude entre -180 e 180, latitude entre -90 a 90.

15. **Inicialização Automática**: Se o odontograma não for fornecido ao criar uma vítima, o sistema inicializa automaticamente com todos os dentes padrão.

16. **Controle de Permissões por Caso**: O acesso às vítimas é controlado através das permissões do caso associado, garantindo segurança dos dados.

17. **Rastreabilidade**: Todas as operações em dentes individuais são registradas com usuário responsável e data/hora.
