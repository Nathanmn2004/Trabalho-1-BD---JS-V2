# Sistema de Gestão CRUD

Sistema de gerenciamento para uma distribuidora, permitindo o controle completo de produtos, clientes, vendedores e realização de vendas integradas com banco de dados PostgreSQL.

## 🚀 Funcionalidades

O sistema implementa um CRUD completo para as entidades principais, seguindo os requisitos de:
1.  **Inserir**: Cadastro de novos registros.
2.  **Alterar**: Edição de informações existentes.
3.  **Pesquisar por nome**: Localização rápida de registros.
4.  **Remover**: Exclusão de registros.
5.  **Listar todos**: Visualização geral em formato de tabela.
6.  **Exibir um**: Detalhamento de um registro específico por ID.

### Módulos Adicionais
- **PDV (Ponto de Venda)**: Realização de vendas com cálculo automático de descontos (ex: clientes que torcem para o Flamengo ou assistem One Piece ganham 10%).
- **Relatório Geral**: Resumo estatístico com quantidade de elementos, faturamento total, etc.

## 🛠️ Estrutura

O projeto foi refatorado seguindo princípios de modularidade e padrões de projeto:

- `main.js`: Ponto de entrada e interface de linha de comando (CLI).
- `gerenciador.js`: Fachada que centraliza o acesso aos serviços.
- `models.js`: Classes de representação de dados.
- `db.js`: Configuração e pool de conexão com PostgreSQL.
- `services/`: Camada de lógica de negócio dividida por domínio:
    - `ProdutoService.js`
    - `ClienteService.js`
    - `VendedorService.js`
    - `VendaService.js`

## 📋 Pré-requisitos

- **Node.js**: Instalado na máquina.
- **PostgreSQL**: Instância ativa do banco de dados.
- **Arquivo .env**: Configurado na raiz do projeto com as seguintes variáveis:
  ```env
  DB_USER=seu_usuario
  DB_HOST=seu_host
  DB_NAME=seu_banco
  DB_PASSWORD=sua_senha
  DB_PORT=5432
  DB_SCHEMA=seu_schema
  ```

## 🔧 Instalação e Uso

1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Crie a estrutura do banco de dados utilizando o script `schema.sql`.
3.  Inicie o sistema:
    ```bash
    node main.js
    ```

## 📊 Modelagem

A modelagem das classes e suas relações pode ser visualizada no diagrama UML:

https://www.figma.com/board/kELjiHNR9EdHJjargcIhhg/Untitled?node-id=0-1&t=WksoMmsauiYjQLr6-1

---
*Projeto desenvolvido para a disciplina de Banco de Dados.*
