
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, DollarSign, TreePine, Calendar, Plus, TrendingUp } from 'lucide-react';

function UserDashboard() {
  const { user } = useAuth();
  const [energyData, setEnergyData] = useState({
    totalProduced: 0,
    totalConsumed: 0,
    totalSaved: 0,
    financialSavings: 0,
    treesSaved: 0
  });
  const [monthlyConsumption, setMonthlyConsumption] = useState({
    annual: 0,
    monthly: 0,
    daily: 0
  });

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = () => {
    const energyRecords = JSON.parse(localStorage.getItem('energy_records') || '[]');
    const userRecords = energyRecords.filter(record => record.userId === user?.id);
    
    const totals = userRecords.reduce((acc, record) => {
      acc.totalProduced += record.energyProduced || 0;
      acc.totalConsumed += record.energyConsumed || 0;
      acc.totalSaved += record.energySaved || 0;
      acc.financialSavings += record.financialSavings || 0;
      acc.treesSaved += record.treesSaved || 0;
      return acc;
    }, {
      totalProduced: 0,
      totalConsumed: 0,
      totalSaved: 0,
      financialSavings: 0,
      treesSaved: 0
    });

    setEnergyData(totals);

    // Carregar dados de consumo mensal
    const consumptionData = JSON.parse(localStorage.getItem('monthly_consumption') || '[]');
    const userConsumption = consumptionData.filter(data => data.userId === user?.id);
    
    if (userConsumption.length > 0) {
      const latestConsumption = userConsumption[userConsumption.length - 1];
      setMonthlyConsumption({
        annual: latestConsumption.monthlyConsumption * 12,
        monthly: latestConsumption.monthlyConsumption,
        daily: latestConsumption.monthlyConsumption / 30
      });
    }
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
            <Zap className="w-8 h-8 mr-3 text-green-600" />
            Dashboard do Usuário
          </h1>
          <p className="text-gray-600">Acompanhe seu consumo de energia, economia e impacto ambiental.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Resumo de Energia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{energyData.totalProduced.toFixed(2)} kWh</p>
                  <p className="text-green-100 text-sm">Energia Produzida</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{energyData.totalConsumed.toFixed(2)} kWh</p>
                  <p className="text-green-100 text-sm">Energia Consumida</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{energyData.totalSaved.toFixed(2)} kWh</p>
                  <p className="text-green-100 text-sm">Energia Economizada</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Economia Financeira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">R$ {energyData.financialSavings.toFixed(2)}</p>
                <p className="text-emerald-100 text-sm">Economia acumulada</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-teal-400 to-teal-600 text-white border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center">
                  <TreePine className="w-5 h-5 mr-2" />
                  Árvores Salvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{energyData.treesSaved.toFixed(1)}</p>
                <p className="text-teal-100 text-sm">Impacto ambiental</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Consumo Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{monthlyConsumption.annual.toFixed(0)} kWh</p>
                    <p className="text-sm text-blue-700">Consumo Anual</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{monthlyConsumption.monthly.toFixed(0)} kWh</p>
                    <p className="text-sm text-indigo-700">Média Mensal</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{monthlyConsumption.daily.toFixed(1)} kWh</p>
                    <p className="text-sm text-purple-700">Média Diária</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/user/consumption">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Consumo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Link to="/user/history">
                    <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-green-200 hover:bg-green-50">
                      <div>
                        <p className="font-medium text-gray-800">Ver Histórico Completo</p>
                        <p className="text-sm text-gray-600">Analise seus dados de energia detalhadamente</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/user/profile">
                    <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-blue-200 hover:bg-blue-50">
                      <div>
                        <p className="font-medium text-gray-800">Gerenciar Perfil</p>
                        <p className="text-sm text-gray-600">Atualize suas informações e conquistas</p>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default UserDashboard;
