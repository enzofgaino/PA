
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database.js"); // Importa a conexão com o banco
// Importar a função de cálculo (precisa estar no backend agora)
const { calculateSolarMetrics } = require("./utils/solarCalculations.js"); // Ajuste o caminho se necessário

const app = express();
const PORT = process.env.PORT || 3001; // Porta para o backend
const saltRounds = 10; // Fator de custo para o bcrypt

// Middlewares
app.use(cors()); // Habilita CORS para permitir requisições do frontend
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// --- Rotas da API ---

// Rota de Teste
app.get("/api", (req, res) => {
  res.json({ message: "Backend Horizons Solar conectado!" });
});

// Rota para Registrar Novo Usuário (POST /api/users/register)
app.post("/api/users/register", async (req, res) => {
  const { username, email, password, role = 'user', address, number, complement, neighborhood, city, state, cep } = req.body;

  // Validação básica
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Nome de usuário, email e senha são obrigatórios." });
  }

  try {
    // Verificar se email ou username já existem
    const checkUserSql = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.get(checkUserSql, [email, username], async (err, row) => {
      if (err) {
        console.error("Erro ao verificar usuário existente:", err.message);
        return res.status(500).json({ error: "Erro interno ao verificar usuário." });
      }
      if (row) {
        return res.status(409).json({ error: "Email ou nome de usuário já cadastrado." });
      }

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserir novo usuário
      const insertUserSql = `
        INSERT INTO users (username, email, password, role, address, number, complement, neighborhood, city, state, cep, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(insertUserSql, [username, email, hashedPassword, role, address, number, complement, neighborhood, city, state, cep], function (err) {
        if (err) {
          console.error("Erro ao inserir usuário:", err.message);
          return res.status(500).json({ error: "Erro interno ao registrar usuário." });
        }

        const newUserId = this.lastID;
        console.log(`Usuário ${username} registrado com ID: ${newUserId}`);

        // Criar entrada inicial em energy_data para o novo usuário
        const insertEnergyDataSql = `INSERT INTO energy_data (userId, updatedAt) VALUES (?, CURRENT_TIMESTAMP)`;
        db.run(insertEnergyDataSql, [newUserId], (energyErr) => {
          if (energyErr) {
            console.error("Erro ao criar energy_data inicial:", energyErr.message);
            // Continuar mesmo se isso falhar? Ou retornar erro?
            // Por enquanto, vamos logar e retornar sucesso no registro do usuário.
          }
          console.log(`Energy_data inicial criado para userId: ${newUserId}`);
          // Retornar sucesso (sem a senha)
          res.status(201).json({ id: newUserId, username, email, role });
        });
      });
    });
  } catch (error) {
    console.error("Erro no processo de registro:", error);
    res.status(500).json({ error: "Erro inesperado no servidor durante o registro." });
  }
});

// Rota para Login de Usuário (POST /api/users/login)
app.post("/api/users/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Nome de usuário e senha são obrigatórios." });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username], async (err, user) => {
    if (err) {
      console.error("Erro ao buscar usuário para login:", err.message);
      return res.status(500).json({ error: "Erro interno ao tentar fazer login." });
    }

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." }); // Usuário não encontrado
    }

    // Comparar a senha fornecida com o hash armazenado
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Senha correta - Login bem-sucedido
      console.log(`Usuário ${username} logado com sucesso.`);
      // Retornar dados do usuário (sem a senha)
      const { password, ...userData } = user;
      res.status(200).json({ success: true, user: userData });
    } else {
      // Senha incorreta
      res.status(401).json({ error: "Credenciais inválidas." });
    }
  });
});

// --- Rotas para Energy Data e Consumption Records ---

// Rota para buscar dados de energia de um usuário (GET /api/energy/:userId)
app.get("/api/energy/:userId", (req, res) => {
    const { userId } = req.params;
    // Usar COALESCE para garantir que mesmo sem registros mensais, a query retorne o energy_data
    const sql = `
        SELECT
            ed.*,
            COALESCE(
                (
                    SELECT GROUP_CONCAT(mcr.id || ':' || mcr.month || ':' || mcr.year || ':' || mcr.monthlyConsumption || ':' || mcr.recordedAt || ':' || mcr.updatedAt)
                    FROM monthly_consumption_records mcr
                    WHERE mcr.userId = ed.userId
                ), ''
            ) as monthlyRecordsRaw
        FROM energy_data ed
        WHERE ed.userId = ?
    `;

    db.get(sql, [userId], (err, row) => {
        if (err) {
            console.error("Erro ao buscar dados de energia:", err.message);
            return res.status(500).json({ error: "Erro interno ao buscar dados de energia." });
        }
        if (!row) {
            // Retornar um objeto padrão se não houver energy_data
            return res.status(200).json({
                userId: parseInt(userId),
                panelsInstalled: 0,
                totalProduced: 0,
                totalConsumed: 0,
                totalSaved: 0,
                moneySaved: 0,
                treesSaved: 0,
                monthlyRecords: []
            });
        }

        // Processar monthlyRecordsRaw
        let monthlyRecords = [];
        if (row.monthlyRecordsRaw) {
            monthlyRecords = row.monthlyRecordsRaw.split(',').map(recordStr => {
                const [id, month, year, monthlyConsumption, recordedAt, updatedAt] = recordStr.split(':');
                return {
                    id: parseInt(id),
                    month: parseInt(month),
                    year: parseInt(year),
                    monthlyConsumption: parseFloat(monthlyConsumption),
                    recordedAt,
                    updatedAt
                };
            });
        }

        const { monthlyRecordsRaw, ...energyData } = row;
        res.status(200).json({ ...energyData, monthlyRecords });
    });
});


// Rota para atualizar dados de energia (PUT /api/energy/:userId)
// Usada pelo Admin (UserDetails) - Recebe apenas inputs, calcula e salva tudo
app.put("/api/energy/:userId", (req, res) => {
    const { userId } = req.params;
    // Receber apenas os inputs do admin
    const { panelsInstalled, monthlyConsumptionBase } = req.body;

    // Validação dos inputs recebidos
    if (panelsInstalled === undefined || monthlyConsumptionBase === undefined) {
        return res.status(400).json({ error: "Painéis instalados e consumo mensal base são obrigatórios." });
    }

    const parsedPanels = parseInt(panelsInstalled);
    const parsedConsumptionBase = parseFloat(monthlyConsumptionBase);

    if (isNaN(parsedPanels) || isNaN(parsedConsumptionBase) || parsedPanels < 0 || parsedConsumptionBase < 0) {
         return res.status(400).json({ error: "Valores inválidos para painéis ou consumo base." });
    }

    // Calcular produção estimada e métricas AQUI no backend
    const avgProductionPerPanel = 30; // Exemplo: kWh/mês/painel (idealmente configurável)
    const estimatedTotalProduced = parsedPanels * avgProductionPerPanel;
    const metrics = calculateSolarMetrics(estimatedTotalProduced, parsedConsumptionBase);

    // Dados completos a serem salvos
    const dataToSave = {
        panelsInstalled: parsedPanels,
        totalProduced: estimatedTotalProduced,
        totalConsumed: parsedConsumptionBase, // Admin define o consumo base
        totalSaved: metrics.energySaved,
        moneySaved: metrics.moneySaved,
        treesSaved: metrics.treesSaved
    };

    // Usar INSERT OR REPLACE (UPSERT) para simplificar: cria se não existe, atualiza se existe
    const upsertSql = `
        INSERT INTO energy_data (userId, panelsInstalled, totalProduced, totalConsumed, totalSaved, moneySaved, treesSaved, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(userId) DO UPDATE SET
            panelsInstalled = excluded.panelsInstalled,
            totalProduced = excluded.totalProduced,
            totalConsumed = excluded.totalConsumed,
            totalSaved = excluded.totalSaved,
            moneySaved = excluded.moneySaved,
            treesSaved = excluded.treesSaved,
            updatedAt = CURRENT_TIMESTAMP;
    `;

    db.run(upsertSql, [
        userId,
        dataToSave.panelsInstalled,
        dataToSave.totalProduced,
        dataToSave.totalConsumed,
        dataToSave.totalSaved,
        dataToSave.moneySaved,
        dataToSave.treesSaved
    ], function(err) {
        if (err) {
            console.error("Erro ao salvar (UPSERT) energy_data:", err.message);
            return res.status(500).json({ error: "Erro interno ao salvar dados de energia." });
        }
        console.log(`Energy_data salvo/atualizado para userId: ${userId}`);
        // Retornar os dados salvos para o frontend atualizar a UI
        res.status(200).json({ message: "Dados de energia salvos com sucesso.", savedData: dataToSave });
    });
});

// Rota para registrar/atualizar consumo mensal (POST /api/consumption)
app.post("/api/consumption", async (req, res) => {
    const { userId, month, year, monthlyConsumption } = req.body;

    if (!userId || !month || !year || monthlyConsumption === undefined) {
        return res.status(400).json({ error: "userId, month, year e monthlyConsumption são obrigatórios." });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    const parsedConsumption = parseFloat(monthlyConsumption);

     if (isNaN(parsedMonth) || isNaN(parsedYear) || isNaN(parsedConsumption) || parsedConsumption < 0) {
         return res.status(400).json({ error: "Valores inválidos para mês, ano ou consumo." });
    }

    // Usar INSERT OR REPLACE para simplificar
    const upsertSql = `
        INSERT INTO monthly_consumption_records (userId, month, year, monthlyConsumption, updatedAt)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(userId, month, year) DO UPDATE SET
        monthlyConsumption = excluded.monthlyConsumption,
        updatedAt = CURRENT_TIMESTAMP;
    `;

    db.run(upsertSql, [userId, parsedMonth, parsedYear, parsedConsumption], function(err) {
        if (err) {
            console.error("Erro ao registrar/atualizar consumo mensal:", err.message);
            return res.status(500).json({ error: "Erro interno ao salvar consumo mensal." });
        }

        console.log(`Consumo mensal registrado/atualizado para userId: ${userId}, Mês: ${month}, Ano: ${year}`);

        // Após registrar o consumo, recalcular e atualizar os totais em energy_data
        recalculateAndUpdateTotals(userId, (updateErr, updatedTotals) => {
            if (updateErr) {
                console.error("Erro ao recalcular totais após registro de consumo:", updateErr.message);
                // Retornar erro, pois a atualização dos totais falhou
                return res.status(500).json({ error: "Consumo registrado, mas falha ao atualizar totais gerais." });
            }
            // Retornar sucesso e os totais atualizados
            res.status(201).json({ message: "Consumo registrado e totais atualizados com sucesso.", updatedTotals });
        });
    });
});

// Função auxiliar para recalcular e atualizar totais em energy_data
// Chamada após registro de consumo mensal
const recalculateAndUpdateTotals = (userId, callback) => {
    // 1. Buscar todos os registros mensais do usuário
    const getRecordsSql = "SELECT monthlyConsumption FROM monthly_consumption_records WHERE userId = ?";
    db.all(getRecordsSql, [userId], (err, records) => {
        if (err) {
            console.error(`Erro ao buscar registros mensais para userId ${userId}:`, err.message);
            return callback(err);
        }

        // 2. Calcular o novo consumo total somando os registros mensais
        const newTotalConsumed = records.reduce((sum, record) => sum + (record.monthlyConsumption || 0), 0);

        // 3. Buscar a produção total atual e painéis instalados (pode ter sido definida pelo admin)
        const getEnergyDataSql = "SELECT totalProduced, panelsInstalled FROM energy_data WHERE userId = ?";
        db.get(getEnergyDataSql, [userId], (energyErr, energyData) => {
            if (energyErr) {
                 console.error(`Erro ao buscar energy_data para userId ${userId} ao recalcular totais:`, energyErr.message);
                return callback(energyErr);
            }
            if (!energyData) {
                 console.warn(`Energy_data não encontrado para userId ${userId} ao recalcular totais.`);
                 // Não podemos calcular sem a produção, retornar erro?
                 return callback(new Error("Dados de energia base não encontrados para recalcular totais."));
            }

            const totalProduced = energyData.totalProduced || 0;

            // 4. Recalcular métricas (economia, árvores) com base nos totais atualizados
            // Usar a mesma função de cálculo usada na rota PUT do admin
            const metrics = calculateSolarMetrics(totalProduced, newTotalConsumed);

            // 5. Atualizar a tabela energy_data com os novos totais calculados
            const updateTotalsSql = `
                UPDATE energy_data
                SET totalConsumed = ?, totalSaved = ?, moneySaved = ?, treesSaved = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE userId = ?
            `;
            db.run(updateTotalsSql, [
                newTotalConsumed,
                metrics.energySaved,
                metrics.moneySaved,
                metrics.treesSaved,
                userId
            ], function(updateErr) {
                if (updateErr) {
                     console.error(`Erro ao atualizar totais em energy_data para userId ${userId}:`, updateErr.message);
                    return callback(updateErr);
                }
                if (this.changes === 0) {
                    // Isso não deveria acontecer se energyData foi encontrado no passo 3
                     console.warn(`Atualização de totais não afetou linhas para userId ${userId}.`);
                     return callback(new Error("Falha inesperada ao atualizar totais."));
                }
                console.log(`Totais recalculados e atualizados para userId: ${userId}`);
                // Retornar os novos totais calculados
                callback(null, {
                    totalConsumed: newTotalConsumed,
                    totalSaved: metrics.energySaved,
                    moneySaved: metrics.moneySaved,
                    treesSaved: metrics.treesSaved
                });
            });
        });
    });
};

// Rota para buscar todos os usuários (para Admin)
app.get("/api/users", (req, res) => {
    const sql = `
        SELECT
            u.id, u.username, u.email, u.role, u.address, u.number, u.complement, u.neighborhood, u.city, u.state, u.cep, u.createdAt,
            ed.panelsInstalled, ed.totalProduced, ed.totalConsumed, ed.totalSaved, ed.moneySaved, ed.treesSaved
        FROM users u
        LEFT JOIN energy_data ed ON u.id = ed.userId
        ORDER BY u.createdAt DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar todos os usuários:", err.message);
            return res.status(500).json({ error: "Erro interno ao buscar usuários." });
        }
        // Mapear para garantir que os campos de energy_data sejam números ou padrão 0
        const usersWithEnergyData = rows.map(user => ({
            ...user,
            // Criar um objeto aninhado para clareza
            energyData: {
                panelsInstalled: user.panelsInstalled === null ? 0 : user.panelsInstalled,
                totalProduced: user.totalProduced === null ? 0.0 : user.totalProduced,
                totalConsumed: user.totalConsumed === null ? 0.0 : user.totalConsumed,
                totalSaved: user.totalSaved === null ? 0.0 : user.totalSaved,
                moneySaved: user.moneySaved === null ? 0.0 : user.moneySaved,
                treesSaved: user.treesSaved === null ? 0.0 : user.treesSaved
            },
            // Remover campos duplicados do join para evitar confusão
            panelsInstalled: undefined,
            totalProduced: undefined,
            totalConsumed: undefined,
            totalSaved: undefined,
            moneySaved: undefined,
            treesSaved: undefined
        }));
        res.status(200).json(usersWithEnergyData);
    });
});

// Rota para deletar usuário (DELETE /api/users/:userId)
app.delete("/api/users/:userId", (req, res) => {
    const { userId } = req.params;

    // O SQLite com foreign_keys = ON e ON DELETE CASCADE deve remover
    // automaticamente os registros em energy_data e monthly_consumption_records
    const sql = 'DELETE FROM users WHERE id = ?';

    db.run(sql, userId, function(err) {
        if (err) {
            console.error(`Erro ao deletar usuário ${userId}:`, err.message);
            return res.status(500).json({ error: "Erro interno ao deletar usuário." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Usuário não encontrado para deletar." });
        }
        console.log(`Usuário ${userId} deletado com sucesso.`);
        res.status(200).json({ message: "Usuário deletado com sucesso." });
    });
});


// --- Arquivo de Utilitários (Exemplo) ---
// Criar um arquivo separado para isso: /utils/solarCalculations.js
/*
function calculateSolarMetrics(totalProduced, totalConsumed) {
    const KWH_PRICE = 0.75; // Exemplo: R$ 0,75 por kWh
    const TREES_SAVED_FACTOR = 0.02; // Exemplo: árvores salvas por kWh produzido

    const energySaved = Math.max(0, totalProduced - totalConsumed);
    const moneySaved = energySaved * KWH_PRICE;
    const treesSaved = totalProduced * TREES_SAVED_FACTOR;

    return {
        energySaved: parseFloat(energySaved.toFixed(2)),
        moneySaved: parseFloat(moneySaved.toFixed(2)),
        treesSaved: parseFloat(treesSaved.toFixed(1))
    };
}
module.exports = { calculateSolarMetrics };
*/

// --- Criação do arquivo de utilitários --- (Deve ser feito separadamente)
const fs = require('fs');
const path = require('path');
const utilsDir = path.join(__dirname, 'utils');
const calculationsFile = path.join(utilsDir, 'solarCalculations.js');
const calculationsCode = `
function calculateSolarMetrics(totalProduced, totalConsumed) {
    const KWH_PRICE = 0.75; // Exemplo: R$ 0,75 por kWh
    const TREES_SAVED_FACTOR = 0.02; // Exemplo: árvores salvas por kWh produzido

    // Garantir que os inputs são números
    const produced = Number(totalProduced) || 0;
    const consumed = Number(totalConsumed) || 0;

    const energySaved = Math.max(0, produced - consumed);
    const moneySaved = energySaved * KWH_PRICE;
    // Árvores salvas geralmente são calculadas com base na energia *produzida* (evitando emissões)
    const treesSaved = produced * TREES_SAVED_FACTOR;

    return {
        energySaved: parseFloat(energySaved.toFixed(2)),
        moneySaved: parseFloat(moneySaved.toFixed(2)),
        treesSaved: parseFloat(treesSaved.toFixed(1))
    };
}

module.exports = { calculateSolarMetrics };
`;

// Cria o diretório utils se não existir
if (!fs.existsSync(utilsDir)){
    fs.mkdirSync(utilsDir);
}
// Escreve o arquivo de cálculos
fs.writeFileSync(calculationsFile, calculationsCode);
console.log("Arquivo utils/solarCalculations.js criado/atualizado.");


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
