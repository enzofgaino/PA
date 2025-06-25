
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Calculator, TreePine, Zap, DollarSign } from 'lucide-react';
// Importar a função de cálculo se necessário para árvores salvas
import { calculateSolarMetrics } from '@/utils/solarCalculations';

function AdminDashboard() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalEnergyProduced: 0,
    totalEnergyConsumed: 0, // Adicionado para consistência, embora não exibido diretamente
    totalEnergySaved: 0,
    totalTreesSaved: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = () => {
    // Corrigido para ler de 'solarUsers'
    const users = JSON.parse(localStorage.getItem('solarUsers') || '[]');
    const regularUsers = users.filter(u => u.role === 'user');

    // Calcular totais a partir dos dados de energia de cada usuário
    const totals = regularUsers.reduce((acc, user) => {
      // Verificar se energyData existe e é um objeto
      if (user.energyData && typeof user.energyData === 'object') {
        acc.totalEnergyProduced += user.energyData.totalProduced || 0;
        acc.totalEnergyConsumed += user.energyData.totalConsumed || 0;
        acc.totalEnergySaved += user.energyData.totalSaved || 0;
        // Calcular árvores salvas com base na produção total do usuário
        // Usando a mesma lógica de calculateSolarMetrics (0.02 por kWh produzido)
        acc.totalTreesSaved += (user.energyData.totalProduced || 0) * 0.02;
      }
      return acc;
    }, {
      totalEnergyProduced: 0,
      totalEnergyConsumed: 0,
      totalEnergySaved: 0,
      totalTreesSaved: 0
    });

    setSystemStats({
      totalUsers: regularUsers.length,
      totalEnergyProduced: totals.totalEnergyProduced,
      totalEnergyConsumed: totals.totalEnergyConsumed,
      totalEnergySaved: totals.totalEnergySaved,
      totalTreesSaved: totals.totalTreesSaved
    });

    // Atualizar usuários recentes com base nos usuários regulares de 'solarUsers'
    // Ordenar por data de criação (se disponível) ou pegar os últimos N
    const sortedUsers = regularUsers.sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    setRecentUsers(sortedUsers.slice(0, 5)); // Pegar os 5 mais recentes
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-green-600" />
            Dashboard do Administrador
          </h1>
          <p className="text-gray-600">Gerencie usuários, visualize estatísticas e configure o sistema.</p>
        </motion.div>

        {/* Seção de Ações Rápidas (mantida como estava) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculadora de Painéis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-100 mb-4">
                  Calcule o número de painéis solares necessários com base no consumo.
                </p>
                <Link to="/admin/calculator">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    Acessar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-100 mb-4">
                  Gerencie perfis de usuários e visualize dados de consumo.
                </p>
                <Link to="/admin/users">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    Ver Usuários
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Planos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-100 mb-4">
                  Gerencie planos residenciais e empresariais.
                </p>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Gerenciar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Seção de Estatísticas e Usuários Recentes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Card Resumo do Sistema (com dados corrigidos) */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-green-600" />
                  Resumo do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-3xl font-bold text-green-600">{systemStats.totalUsers}</p>
                    <p className="text-sm text-green-700">Usuários Ativos</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    {/* Exibir energia produzida */}
                    <p className="text-3xl font-bold text-blue-600">{systemStats.totalEnergyProduced.toFixed(2)} kWh</p>
                    <p className="text-sm text-blue-700">Energia Total Produzida</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                    {/* Exibir energia economizada */}
                    <p className="text-3xl font-bold text-emerald-600">{systemStats.totalEnergySaved.toFixed(2)} kWh</p>
                    <p className="text-sm text-emerald-700">Energia Total Economizada</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                    {/* Exibir árvores salvas */}
                    <p className="text-3xl font-bold text-teal-600">{systemStats.totalTreesSaved.toFixed(1)}</p>
                    <p className="text-sm text-teal-700">Árvores Salvas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Usuários do Sistema (com dados corrigidos) */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Usuários Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {recentUsers.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-600 border-b">
                            <th className="pb-2">Nome de Usuário</th>
                            <th className="pb-2">Email</th>
                            <th className="pb-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {/* Exibir até 3 usuários recentes */}
                          {recentUsers.slice(0, 3).map((user) => (
                            <tr key={user.id} className="border-b border-gray-100">
                              <td className="py-3 font-medium">{user.username}</td>
                              <td className="py-3 text-gray-600">{user.email}</td>
                              <td className="py-3">
                                <Link to={`/admin/user/${user.id}`}>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    Ver
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pt-4">
                      <Link to="/admin/users">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                          Ver Todos os Usuários
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nenhum usuário cadastrado ainda</p>
                    <Link to="/admin/users/create">
                      <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                        Criar Primeiro Usuário
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default AdminDashboard;
