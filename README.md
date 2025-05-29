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
  "localDoCaso": "Local onde ocorreu o caso"
}
```

**Observações:**
- `tipo` deve ser um dos seguintes valores: "acidente", "identificação de vítima", "exame criminal", "exumação", "violência doméstica", "avaliação de idade", "avaliação de lesões", "avaliação de danos corporais"
- `status` deve ser um dos seguintes valores: "em andamento", "finalizado", "arquivado"
- `peritoResponsavel` deve ser o ID de um usuário com role "perito"

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
    "criadoPor": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
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
  "localDoCaso": "Novo local"
}
```

**Observações:**
- Todos os campos são opcionais

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
- O campo `arquivo` deve conter um arquivo de imagem ou documento
- O tipo de arquivo será determinado automaticamente com base no MIME type

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

### Listar Evidências por Caso
**Endpoint:** `GET /api/evidencias`

**Parâmetros de Query:**
- `casoId`: ID do caso para o qual se deseja listar as evidências

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

### Editar Evidência
**Endpoint:** `PUT /api/evidencias/:id`

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
    "arcadaInferior": []
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
- `genero` deve ser: "masculino", "feminino" ou "outro"
- `documento.tipo` deve ser: "rg", "cpf", "passaporte" ou "outro"
- `corEtnia` deve ser: "branca", "preta", "parda", "amarela" ou "indígena"

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
      "arcadaSuperior": [],
      "arcadaInferior": []
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
      "arcadaInferior": []
    },
    "regioesAnatomicas": [],
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": "60d21b4667d0d8992e610c85",
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
    "arcadaSuperior": [],
    "arcadaInferior": []
  },
  "regioesAnatomicas": [],
  "caso": "60d21b4667d0d8992e610c86",
  "criadoPor": "60d21b4667d0d8992e610c85",
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
    "corEtnia": "branca",
    "odontograma": {
      "arcadaSuperior": [],
      "arcadaInferior": []
    },
    "regioesAnatomicas": [],
    "caso": "60d21b4667d0d8992e610c86",
    "criadoPor": "60d21b4667d0d8992e610c85",
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

### Atualizar Odontograma
**Endpoint:** `PUT /api/vitimas/:id/odontograma`

**Restrição:** Apenas usuários com role "admin" ou "perito" podem atualizar odontogramas.

**Corpo da Requisição:**
```json
{
  "odontograma": {
    "arcadaSuperior": [
      {
        "dente": "18",
        "estado": "presente",
        "observacoes": "Cárie oclusal"
      },
      {
        "dente": "17",
        "estado": "ausente",
        "observacoes": "Extraído"
      }
    ],
    "arcadaInferior": [
      {
        "dente": "48",
        "estado": "presente",
        "observacoes": "Restauração amalgama"
      }
    ]
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
          "dente": "18",
          "estado": "presente",
          "observacoes": "Cárie oclusal"
        },
        {
          "dente": "17",
          "estado": "ausente",
          "observacoes": "Extraído"
        }
      ],
      "arcadaInferior": [
        {
          "dente": "48",
          "estado": "presente",
          "observacoes": "Restauração amalgama"
        }
      ]
    }
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
  criadoPor: ObjectId,   // Referência ao usuário que criou o caso (obrigatório)
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
  odontograma: {         // Informações odontológicas
    arcadaSuperior: Array, // Dentes da arcada superior
    arcadaInferior: Array  // Dentes da arcada inferior
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

5. **Histórico Automático**: Algumas ações (como criar um relatório final ou cadastrar uma vítima) geram entradas automáticas no histórico.

6. **Status do Caso**: Criar um relatório final altera automaticamente o status do caso para "Finalizado".

7. **NIC Único**: O NIC (Número de Identificação Cadavérica) deve ser único para cada vítima cadastrada no sistema.

8. **Odontograma**: As informações odontológicas são estruturadas em arcadas superior e inferior, permitindo registro detalhado do estado dos dentes.

9. **Regiões Anatômicas**: Permite o registro de exames e achados em diferentes regiões anatômicas da vítima.
