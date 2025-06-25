
const sqlite3 = require("sqlite3").verbose();

// Define o caminho do arquivo do banco de dados
const DBSOURCE = "./horizons.db";

// Conecta ao banco de dados SQLite. O arquivo será criado se não existir.
const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Não foi possível conectar ao banco
    console.error("Erro ao conectar ao banco de dados SQLite:", err.message);
    throw err;
  } else {
    console.log("Conectado ao banco de dados SQLite.");
    // Habilitar chaves estrangeiras
    db.run("PRAGMA foreign_keys = ON;", (pragmaErr) => {
      if (pragmaErr) {
        console.error("Erro ao habilitar chaves estrangeiras:", pragmaErr.message);
      } else {
        console.log("Chaves estrangeiras habilitadas.");
        // Cria as tabelas se elas não existirem
        createTables();
      }
    });
  }
});

// Função para criar as tabelas
const createTables = () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL, -- Armazenará o hash da senha
      role TEXT NOT NULL DEFAULT 'user', -- 'user' ou 'admin'
      address TEXT,
      number TEXT,
      complement TEXT,
      neighborhood TEXT,
      city TEXT,
      state TEXT,
      cep TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createEnergyDataTable = `
    CREATE TABLE IF NOT EXISTS energy_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE, -- Chave estrangeira para users.id
      panelsInstalled INTEGER DEFAULT 0,
      totalProduced REAL DEFAULT 0.0,
      totalConsumed REAL DEFAULT 0.0,
      totalSaved REAL DEFAULT 0.0, -- Energia economizada (kWh)
      moneySaved REAL DEFAULT 0.0, -- Economia financeira (R$)
      treesSaved REAL DEFAULT 0.0,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    );
  `;

  const createMonthlyConsumptionTable = `
    CREATE TABLE IF NOT EXISTS monthly_consumption_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL, -- Chave estrangeira para users.id
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      monthlyConsumption REAL NOT NULL,
      recordedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE (userId, month, year) -- Garante um registro por usuário/mês/ano
    );
  `;

  db.serialize(() => {
    db.run(createUsersTable, (err) => {
      if (err) {
        console.error("Erro ao criar tabela users:", err.message);
      } else {
        console.log("Tabela users criada ou já existente.");
      }
    });

    db.run(createEnergyDataTable, (err) => {
      if (err) {
        console.error("Erro ao criar tabela energy_data:", err.message);
      } else {
        console.log("Tabela energy_data criada ou já existente.");
      }
    });

    db.run(createMonthlyConsumptionTable, (err) => {
      if (err) {
        console.error("Erro ao criar tabela monthly_consumption_records:", err.message);
      } else {
        console.log("Tabela monthly_consumption_records criada ou já existente.");
      }
    });
  });
};

module.exports = db;
