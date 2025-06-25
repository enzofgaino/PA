
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, ArrowLeft, Zap, DollarSign, TreePine, Loader2 } from 'lucide-react';
// Importar useAuth para acessar funções da API
import { useAuth } from '@/contexts/AuthContext';
// Importar função de cálculo (se ainda necessária)
import { calculateSolarMetrics } from '@/utils/solarCalculations';

// URL base da API backend (deve ser consistente com AuthContext)
const API_URL = 'http://localhost:3001/api';

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Obter a função correta do contexto para atualizar dados pelo admin
  const { updateEnergyDataByAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Armazena dados básicos do usuário
  const [energyData, setEnergyData] = useState(null); // Armazena dados de energia

  // Estado local para os campos do formulário
  const [formData, setFormData] = useState({
    // Usaremos esses campos para *calcular* e *salvar* os totais,
    // não necessariamente para exibir o consumo histórico.
    // O admin define o consumo base e painéis para recalcular.
    monthlyConsumption: '', // Consumo base para cálculo
    panelsInstalled: ''
  });

  // Função para buscar dados do usuário específico (incluindo energyData)
  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Buscar dados básicos do usuário (se necessário, ou assumir que já temos via lista)
      // Por simplicidade, vamos buscar os dados de energia diretamente.
      // Uma API GET /api/users/:userId seria ideal para dados básicos.

      // 2. Buscar dados de energia
      const energyResponse = await fetch(`${API_URL}/energy/${userId}`);
      if (!energyResponse.ok) {
        const errorData = await energyResponse.json();
        throw new Error(errorData.error || 'Falha ao buscar dados de energia');
      }
      const fetchedEnergyData = await energyResponse.json();
      setEnergyData(fetchedEnergyData);

      // 3. Buscar dados básicos do usuário (simulado aqui, idealmente viria de outra rota)
      // Precisamos buscar a lista para pegar nome, email etc.
      const usersResponse = await fetch(`${API_URL}/users`);
      if (!usersResponse.ok) throw new Error('Falha ao buscar lista de usuários');
      const allUsers = await usersResponse.json();
      const foundUser = allUsers.find(u => u.id === parseInt(userId));

      if (!foundUser) {
          throw new Error('Usuário não encontrado na lista');
      }
      setUser(foundUser); // Define dados básicos

      // Inicializar formulário com dados atuais, se disponíveis
      setFormData({
        monthlyConsumption: '', // Deixar em branco para admin definir novo cálculo
        panelsInstalled: fetchedEnergyData?.panelsInstalled?.toString() || ''
      });

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados do usuário",
        variant: "destructive"
      });
      // navigate('/admin/users'); // Considerar redirecionar
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]); // Usar loadUserData como dependência

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.monthlyConsumption || !formData.panelsInstalled) {
        toast({
            title: "Campos obrigatórios",
            description: "Preencha o consumo mensal base e painéis instalados para calcular e salvar.",
            variant: "destructive"
        });
        return;
    }

    setLoading(true); // Indicar carregamento durante o save

    try {
      // Obter valores do formulário
      const monthlyConsumptionBase = parseFloat(formData.monthlyConsumption);
      const panelsInstalled = parseInt(formData.panelsInstalled);

      // Calcular produção estimada com base nos painéis
      // TODO: Mover essa lógica para o backend ou uma função utilitária mais robusta
      const avgProductionPerPanel = 30; // Exemplo: kWh por mês por painel
      const estimatedTotalProduced = panelsInstalled * avgProductionPerPanel;

      // Calcular métricas com base na produção estimada e consumo base informado
      const metrics = calculateSolarMetrics(estimatedTotalProduced, monthlyConsumptionBase);

      // Preparar o payload para a API
      const updatedEnergyDataPayload = {
        panelsInstalled: panelsInstalled,
        totalProduced: estimatedTotalProduced,
        totalConsumed: monthlyConsumptionBase, // O admin está definindo o consumo base
        totalSaved: metrics.energySaved,
        moneySaved: metrics.moneySaved,
        treesSaved: metrics.treesSaved
      };

      // Usar a função do contexto para salvar via API
      const result = await updateEnergyDataByAdmin(parseInt(userId), updatedEnergyDataPayload);

      if (result && result.success) {
         // Atualizar o estado local de energyData para refletir as mudanças na UI imediatamente
         setEnergyData(prev => ({ ...prev, ...updatedEnergyDataPayload }));

         toast({
           title: "Sucesso",
           description: "Dados de energia atualizados para o usuário."
         });
         // Opcional: Limpar campos do formulário após salvar?
         // setFormData({ monthlyConsumption: '', panelsInstalled: panelsInstalled.toString() });
      } else {
          throw new Error(result?.error || "Falha ao atualizar dados de energia via API.");
      }

    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar dados de energia.",
        variant: "destructive"
      });
    } finally {
        setLoading(false);
    }
  };

  if (loading && !user) { // Mostrar loading inicial
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!user) {
     // Se o usuário não foi encontrado após o carregamento
     return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
          <Header />
          <div className="container mx-auto px-4 py-8 text-center">
             <p className="text-red-600 font-semibold">Usuário não encontrado.</p>
             <Button onClick={() => navigate('/admin/users')} className="mt-4 bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
             </Button>
          </div>
        </div>
     );
  }

  // Dados para exibição no resumo (usando estado `energyData`)
  const displayMetrics = {
      totalProduced: energyData?.totalProduced || 0,
      totalConsumed: energyData?.totalConsumed || 0,
      moneySaved: energyData?.moneySaved || 0,
      treesSaved: energyData?.treesSaved || 0
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
          <Button
            variant="outline"
            onClick={() => navigate('/admin/users')}
            className="mb-4 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciamento
          </Button>

          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <User className="w-8 h-8 mr-3 text-green-600" />
            Detalhes do Usuário: {user.username}
          </h1>
          <p className="text-gray-600">Visualize e edite informações e dados de energia do usuário.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Usuário (Somente Leitura) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome de Usuário</Label>
                  <Input value={user.username || ''} disabled className="bg-gray-100 mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <Input value={user.email || ''} disabled className="bg-gray-100 mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                  <Input value={`${user.address || ''}, ${user.number || ''} - ${user.neighborhood || ''}, ${user.city || ''}/${user.state || ''}`} disabled className="bg-gray-100 mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Registro</Label>
                  <Input value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'} disabled className="bg-gray-100 mt-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edição de Dados de Energia */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Editar Dados de Energia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="monthlyConsumption" className="text-sm font-medium text-gray-600">Consumo Mensal Base (kWh)</Label>
                    <Input
                      id="monthlyConsumption"
                      name="monthlyConsumption"
                      type="number"
                      value={formData.monthlyConsumption}
                      onChange={handleFormChange}
                      placeholder="Ex: 300"
                      min="0"
                      step="0.01"
                      required
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 mt-1"
                    />
                     <p className="text-xs text-gray-500 mt-1">Informe o consumo base para recalcular as métricas.</p>
                  </div>

                  <div>
                    <Label htmlFor="panelsInstalled" className="text-sm font-medium text-gray-600">Painéis Instalados</Label>
                    <Input
                      id="panelsInstalled"
                      name="panelsInstalled"
                      type="number"
                      value={formData.panelsInstalled}
                      onChange={handleFormChange}
                      placeholder="Ex: 10"
                      min="0"
                      required
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 mt-1"
                    />
                     <p className="text-xs text-gray-500 mt-1">Número de painéis solares instalados.</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Alterações de Energia'}
                  </Button>
                </form>

                {/* Exibição das Métricas Atuais (lidas do estado `energyData`) */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-4">Resumo Energético Atual do Usuário</h4>
                  {energyData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600 flex items-center"><Zap className="w-4 h-4 mr-1 text-blue-600"/>Produção Total</p>
                        <p className="text-lg font-semibold text-blue-700">
                          {displayMetrics.totalProduced.toFixed(2)} kWh
                        </p>
                      </div>
                       <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-gray-600 flex items-center"><Zap className="w-4 h-4 mr-1 text-orange-600"/>Consumo Total</p>
                        <p className="text-lg font-semibold text-orange-700">
                          {displayMetrics.totalConsumed.toFixed(2)} kWh
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 flex items-center"><DollarSign className="w-4 h-4 mr-1 text-green-600"/>Economia Financeira</p>
                        <p className="text-lg font-semibold text-green-700">
                          R$ {displayMetrics.moneySaved.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-600 flex items-center"><TreePine className="w-4 h-4 mr-1 text-emerald-600"/>Árvores Salvas</p>
                        <p className="text-lg font-semibold text-emerald-700">
                          {displayMetrics.treesSaved.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Carregando dados de energia...</p>
                  )}
                   <p className="text-xs text-gray-500 mt-3">Estes valores refletem o estado atual salvo para o usuário no banco de dados.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default UserDetails;
