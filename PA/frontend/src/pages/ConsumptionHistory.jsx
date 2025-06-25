
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { History, Download, Zap, DollarSign, TreePine } from 'lucide-react';
// Importar a função de cálculo para métricas se necessário
import { calculateSolarMetrics } from '@/utils/solarCalculations';

function ConsumptionHistory() {
  const { user } = useAuth(); // Obter usuário logado do contexto
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [totals, setTotals] = useState({
    totalProduced: 0,
    totalConsumed: 0,
    totalSaved: 0, // Energia economizada (kWh)
    moneySaved: 0, // Economia financeira (R$)
    treesSaved: 0
  });

  useEffect(() => {
    if (user && user.energyData) {
      loadEnergyData();
    }
  }, [user]); // Recarregar quando o usuário mudar

  const loadEnergyData = () => {
    // Acessar monthlyRecords diretamente do objeto energyData do usuário
    const records = user.energyData.monthlyRecords || [];
    
    // Ordenar por ano/mês (mais recente primeiro)
    const sortedRecords = [...records].sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
    setMonthlyRecords(sortedRecords);

    // Usar os totais já calculados e armazenados no energyData do usuário
    // Isso garante consistência com o UserDetails e AdminDashboard
    setTotals({
      totalProduced: user.energyData.totalProduced || 0,
      totalConsumed: user.energyData.totalConsumed || 0,
      totalSaved: user.energyData.totalSaved || 0,
      moneySaved: user.energyData.moneySaved || 0,
      treesSaved: user.energyData.treesSaved || 0
    });
  };

  const exportData = () => {
    // Usar monthlyRecords para o CSV
    const csvContent = [
      ['Ano', 'Mês', 'Consumo Registrado (kWh)'], // Cabeçalho
      ...monthlyRecords.map(record => [
        record.year,
        record.month,
        record.monthlyConsumption?.toFixed(2) || '0.00'
        // Adicionar mais colunas se monthlyRecords tiver mais dados (produção, economia, etc.)
        // No momento, parece que só tem 'monthlyConsumption'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Adicionar BOM para Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_consumo_${user?.username}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preparar dados para o gráfico usando monthlyRecords
  // Exibir os últimos 12 meses, por exemplo
  const chartData = monthlyRecords.slice(0, 12).reverse().map(record => ({
    // Criar uma label legível para o eixo X
    monthYear: `${String(record.month).padStart(2, '0')}/${record.year}`,
    Consumo: record.monthlyConsumption || 0,
    // Adicionar Produção/Economia se esses dados existirem em monthlyRecords
  }));

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
            <History className="w-8 h-8 mr-3 text-green-600" />
            Histórico de Consumo e Métricas
          </h1>
          <p className="text-gray-600">Visualize seu histórico de consumo mensal e as métricas totais acumuladas.</p>
        </motion.div>

        {/* Cards de Totais (usando estado 'totals' preenchido com user.energyData) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0 shadow-xl h-full">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100">Energia Total Produzida</p>
                  <Zap className="w-8 h-8 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{totals.totalProduced.toFixed(2)} kWh</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white border-0 shadow-xl h-full">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                 <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100">Economia Financeira Total</p>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
                <p className="text-3xl font-bold">R$ {totals.moneySaved.toFixed(2)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-0 shadow-xl h-full">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                 <div className="flex items-center justify-between mb-2">
                  <p className="text-emerald-100">Árvores Salvas (Equivalente)</p>
                  <TreePine className="w-8 h-8 text-emerald-200" />
                </div>
                <p className="text-3xl font-bold">{totals.treesSaved.toFixed(1)}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráfico de Consumo Mensal */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Consumo Mensal Registrado - Últimos 12 Meses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="monthYear" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#1f2937' }}
                        labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                      <Line 
                        type="monotone" 
                        dataKey="Consumo" 
                        stroke="#ef4444" // Vermelho para consumo
                        strokeWidth={2}
                        name="Consumo (kWh)"
                        dot={{ fill: '#ef4444', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      {/* Adicionar outras linhas (Produção, Economia) se disponíveis em monthlyRecords */}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabela de Registros Detalhados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-gray-800">Registros Mensais Detalhados</CardTitle>
                {monthlyRecords.length > 0 && (
                  <Button
                    onClick={exportData}
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {monthlyRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <th className="py-3 px-4">Ano</th>
                        <th className="py-3 px-4">Mês</th>
                        <th className="py-3 px-4">Consumo Registrado (kWh)</th>
                        <th className="py-3 px-4">Registrado em</th>
                        {/* Adicionar mais colunas se necessário */}
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      {monthlyRecords.map((record, index) => (
                        <tr key={`${record.year}-${record.month}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{record.year}</td>
                          <td className="py-3 px-4">{String(record.month).padStart(2, '0')}</td>
                          <td className="py-3 px-4 font-medium text-red-600">
                            {record.monthlyConsumption?.toFixed(2) || 'N/A'}
                          </td>
                           <td className="py-3 px-4 text-gray-500">
                            {record.recordedAt ? new Date(record.recordedAt).toLocaleString('pt-BR') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum registro mensal encontrado</h3>
                  <p className="text-gray-500">Seus registros de consumo mensal aparecerão aqui.</p>
                  <Button onClick={() => navigate('/consumption-registration')} className="mt-4 bg-green-600 hover:bg-green-700">
                     Registrar Consumo Agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default ConsumptionHistory;
