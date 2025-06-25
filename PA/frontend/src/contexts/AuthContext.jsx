
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// URL base da API backend
const API_URL = 'http://localhost:3001/api'; // Ajuste se o backend rodar em outra porta/endereço

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Armazena dados do usuário logado (incluindo energyData)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carregamento inicial

  // Função para buscar dados completos do usuário (incluindo energyData)
  const fetchUserData = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_URL}/energy/${userId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de energia do usuário');
      }
      const energyData = await response.json();
      // Combina os dados básicos do usuário (do login) com os dados de energia
      setUser(prevUser => ({
        ...prevUser, // Mantém dados como id, username, email, role
        energyData: energyData // Adiciona/atualiza os dados de energia
      }));
    } catch (error) {
      console.error("Erro ao buscar dados de energia:", error);
      // Tratar erro? Deslogar? Por enquanto, apenas loga.
    }
  }, []);

  // Tenta carregar o usuário da sessão/token ao iniciar (simplificado)
  // Uma implementação real usaria tokens (JWT)
  useEffect(() => {
    // Por enquanto, não temos persistência real entre sessões via token.
    // Apenas definimos loading como false.
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      if (data.success && data.user) {
        // Armazena dados básicos do usuário retornados pelo login
        setUser(data.user);
        setIsAuthenticated(true);
        // Após login básico, busca dados completos de energia
        await fetchUserData(data.user.id);
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error || 'Login falhou');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setLoading(false);
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Limpar token/session se implementado
  };

  // Função para criar usuário (Admin ou User)
  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Envia todos os dados do formulário
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar usuário');
      }

      // Retorna sucesso e os dados básicos do usuário criado
      return { success: true, user: data };

    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: error.message || 'Erro ao criar usuário' };
    }
  };

  // Função para o ADMIN atualizar dados de energia de QUALQUER usuário
  const updateEnergyDataByAdmin = async (userId, energyDataPayload) => {
     // energyDataPayload deve conter: panelsInstalled, totalProduced, totalConsumed, totalSaved, moneySaved, treesSaved
    try {
      const response = await fetch(`${API_URL}/energy/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(energyDataPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar dados de energia');
      }

      // Se a atualização foi no usuário logado, atualiza o estado local
      if (user?.id === userId) {
         await fetchUserData(userId); // Rebusca os dados atualizados
      }

      return { success: true, message: data.message };

    } catch (error) {
      console.error("Erro ao atualizar dados de energia (Admin):", error);
      return { success: false, error: error.message || 'Erro ao atualizar dados' };
    }
  };

  // Função para o USUÁRIO LOGADO registrar seu próprio consumo mensal
  const registerMonthlyConsumption = async (consumptionData) => {
    // consumptionData deve conter: month, year, monthlyConsumption
    if (!user) return { success: false, error: 'Usuário não logado' };

    const payload = {
      userId: user.id,
      ...consumptionData
    };

    try {
      const response = await fetch(`${API_URL}/consumption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao registrar consumo');
      }

      // Após registrar, atualiza os dados do usuário logado (que incluem os totais recalculados)
      await fetchUserData(user.id);

      return { success: true, message: data.message };

    } catch (error) {
      console.error("Erro ao registrar consumo mensal:", error);
      return { success: false, error: error.message || 'Erro ao registrar consumo' };
    }
  };

  // Função para buscar todos os usuários (usado pelo Admin)
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error('Falha ao buscar usuários');
      }
      const users = await response.json();
      return { success: true, users };
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      return { success: false, error: error.message || 'Erro ao buscar usuários' };
    }
  };


  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    registerUser, // Substitui createUser e createAdmin
    updateEnergyDataByAdmin, // Específico para admin atualizar qualquer user
    registerMonthlyConsumption, // Específico para user logado registrar seu consumo
    fetchAllUsers, // Para admin listar usuários
    fetchUserData // Para buscar/atualizar dados do user logado
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
