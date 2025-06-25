
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Corrigido: Importar Select correto (provavelmente de @radix-ui/react-select ou similar se estiver usando Shadcn)
// Assumindo que você tem um componente Select wrapper em ui/select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext'; // Importar o contexto atualizado
import { useToast } from '@/components/ui/use-toast';
import { Zap, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar

function ConsumptionRegistration() {
  // Usar a função correta do contexto atualizado
  const { user, registerMonthlyConsumption } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Usar strings para valores de Select em Shadcn
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    monthlyConsumption: ''
  });
  const [loading, setLoading] = useState(false);

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
        toast({
            title: 'Erro',
            description: 'Você precisa estar logado para registrar o consumo.',
            variant: 'destructive',
        });
        navigate('/login'); // Redireciona para login se não estiver logado
        return;
    }

    if (!formData.monthlyConsumption || parseFloat(formData.monthlyConsumption) <= 0) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, insira um valor válido para o consumo mensal.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const consumptionData = {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        monthlyConsumption: parseFloat(formData.monthlyConsumption)
    };

    try {
      // Chamar a função do contexto para registrar via API
      const result = await registerMonthlyConsumption(consumptionData);

      if (!result || !result.success) {
        throw new Error(result?.error || 'Falha ao registrar consumo via API.');
      }

      toast({
        title: 'Consumo registrado com sucesso!',
        description: `Consumo de ${formData.monthlyConsumption} kWh registrado para ${months.find(m => m.value === formData.month)?.label}/${formData.year}. Os totais foram atualizados.`,
      });

      // Limpar o formulário
      setFormData({
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        monthlyConsumption: ''
      });

    } catch (error) {
      console.error("Erro ao registrar consumo:", error);
      toast({
        title: 'Erro ao registrar consumo',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler para Select do Shadcn
  const handleSelectChange = (name, value) => {
     setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler para Input normal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            Registrar Consumo Mensal
          </h1>
          <p className="text-gray-600">Informe o seu consumo mensal de energia para acompanhar sua economia e impacto ambiental.</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
                  <Calendar className="w-6 h-6 mr-2 text-green-600" />
                  Adicionar Consumo Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Alert variant="info" className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Registre seu consumo mensal de energia. Isso atualizará seu histórico e as métricas totais.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month" className="text-gray-700 font-medium">Mês:</Label>
                      <Select name="month" value={formData.month} onValueChange={(value) => handleSelectChange('month', value)}>
                        <SelectTrigger className="w-full border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-gray-700 font-medium">Ano:</Label>
                       <Select name="year" value={formData.year} onValueChange={(value) => handleSelectChange('year', value)}>
                        <SelectTrigger className="w-full border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyConsumption" className="text-gray-700 font-medium">Consumo (kWh):</Label>
                    <Input
                      id="monthlyConsumption"
                      name="monthlyConsumption"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.monthlyConsumption}
                      onChange={handleInputChange} // Usar handler de input normal
                      placeholder="Ex: 150.5"
                      className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                    />
                    <p className="text-sm text-gray-500">
                      Informe o consumo total de energia em kWh para o mês selecionado.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Registrando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Registrar Consumo
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Remover seção "Como Funciona" que não pertence a esta página */}
        </div>
      </main>
    </div>
  );
}

export default ConsumptionRegistration;
