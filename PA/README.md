
# Projeto Horizons Solar - Versão Corrigida com Backend

Este pacote contém o projeto frontend (React/Vite) e o novo backend (Node.js/Express/SQLite) corrigidos e integrados.

## Estrutura do Pacote

-   `/frontend`: Contém o código do projeto React.
-   `/backend`: Contém o código do servidor Node.js e o banco de dados SQLite.
-   `README.md`: Este arquivo com as instruções.

## Requisitos

-   Node.js (versão 18 ou superior recomendada)
-   npm (geralmente vem com o Node.js)

## Instruções de Configuração e Execução

Siga estes passos para rodar o projeto completo:

### 1. Configurar o Backend

Abra um terminal **na pasta `backend`** (`cd /caminho/para/horizons_final_package/backend`).

   a. **Instale as dependências:**
      ```bash
      npm install
      ```

   b. **Inicie o servidor backend:**
      ```bash
      node server.js
      ```
      O terminal deve indicar que o servidor está rodando (geralmente na porta 3001) e que o banco de dados SQLite (`horizons.db`) foi criado/conectado.
      **Mantenha este terminal aberto** enquanto usa a aplicação.

### 2. Configurar o Frontend

Abra **outro terminal** na pasta `frontend` (`cd /caminho/para/horizons_final_package/frontend`).

   a. **Instale as dependências:**
      ```bash
      npm install
      ```

   b. **Inicie o servidor de desenvolvimento do frontend:**
      ```bash
      npm run dev
      ```
      O terminal mostrará o endereço local onde a aplicação frontend está rodando (geralmente `http://localhost:5173` ou similar).

### 3. Acessar a Aplicação

Abra o endereço fornecido pelo terminal do frontend (ex: `http://localhost:5173`) no seu navegador.

## Observações

-   O banco de dados SQLite (`horizons.db`) será criado automaticamente dentro da pasta `backend` na primeira vez que o servidor backend for iniciado.
-   O frontend está configurado para se comunicar com o backend em `http://localhost:3001`. Se você precisar rodar o backend em outra porta, ajuste a constante `API_URL` no arquivo `frontend/src/contexts/AuthContext.jsx`.
-   As correções implementadas incluem a resolução dos bugs originais e a migração do armazenamento de dados do `localStorage` para o banco de dados SQLite via backend.

Por favor, teste esta versão completa e me informe se tudo está funcionando conforme o esperado.

